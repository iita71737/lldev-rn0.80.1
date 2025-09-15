// WsTimeRangePicker.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';
import $color from '@/__reactnative_stone/global/color';
import { WsText, WsStateRadioItem } from '@/components';

export type TimeUnit = 'days' | 'weeks' | 'months' | 'year';

export type PickerItem = {
  value: TimeUnit | string;
  hasInput?: boolean;
  unitLabel?: string;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  defaultChecked?: boolean;
};

export type PickerState = {
  unit: string | number;
  amountByUnit: Record<string | number, number | undefined>;
  amountForUnit?: number;
  valid: true;
};

type Props = {
  items?: PickerItem[];
  value?: { unit: string | number; amountByUnit?: Record<string | number, number | undefined> };
  onChange?: (s?: PickerState) => void;
  disabled?: boolean;
  style?: any;
  rowStyle?: any;
  isError?: boolean;
  borderColorError?: string;
  clearOnSwitch?: boolean;          // 清空新選項（預設 true）
  clearPreviousOnSwitch?: boolean;  // 清空舊選項（預設 true）
};

const DEFAULT_ITEMS: PickerItem[] = [
  { value: 'days',   hasInput: true, unitLabel: '天內',  placeholder: '輸入', maxLength: 2, defaultChecked: true },
  { value: 'weeks',  hasInput: true, unitLabel: '周內',  placeholder: '輸入', maxLength: 2 },
  { value: 'months', hasInput: true, unitLabel: '月內',  placeholder: '輸入', maxLength: 2 },
  { value: 'year',   hasInput: true, unitLabel: '年內',  placeholder: '輸入', maxLength: 1 },
];

export default function WsTimeRangePicker({
  items = DEFAULT_ITEMS,
  value,
  onChange,
  disabled,
  style,
  rowStyle,
  isError,
  borderColorError = $color.danger,
  clearOnSwitch = true,
  clearPreviousOnSwitch = true,
}: Props) {
  const finalItems = useMemo(() => (items.length ? items : DEFAULT_ITEMS), [items]);

  const initialUnit = useMemo(() => {
    if (value?.unit !== undefined) return value.unit;
    const found = finalItems.find(i => i.defaultChecked);
    return found?.value ?? finalItems[0]?.value;
  }, [value?.unit, finalItems]);

  const isControlled = value?.unit !== undefined;

  // 內部狀態
  const [selectedUnit, setSelectedUnit] = useState<string | number>(initialUnit);
  const [amountByUnit, setAmountByUnit] = useState<Record<string | number, number | undefined>>(value?.amountByUnit ?? {});
  const [textMap, setTextMap] = useState<Record<string | number, string>>({});
  const [clearedKeys, setClearedKeys] = useState<Record<string | number, boolean>>({});
  const [tempUnit, setTempUnit] = useState<string | number | undefined>(undefined); // ⭐ 暫存選取（讓 UI 立即反應）

  // 受控 → 追隨外部
  useEffect(() => {
    if (isControlled && value) {
      setSelectedUnit(value.unit);
      setAmountByUnit(value.amountByUnit ?? {});
    }
  }, [isControlled, value?.unit, value?.amountByUnit]);

  // 目前用來渲染的選取（UI 立即切）
  const activeUnitUI = tempUnit ?? (isControlled ? (value?.unit ?? selectedUnit) : selectedUnit);

  const setText = (key: string | number, s: string) => {
    setTextMap(prev => ({ ...prev, [key]: s }));
  };

  const parseNumber = (s?: string, min?: number, max?: number) => {
    const str = String(s ?? '').trim();
    if (str === '') return undefined;
    const raw = parseInt(str, 10);
    if (Number.isNaN(raw)) return undefined;
    let out = raw;
    if (typeof min === 'number') out = Math.max(min, out);
    if (typeof max === 'number') out = Math.min(max, out);
    return out;
  };

  // 顯示文字：若該 key 在 clearedKeys=true，優先顯示 textMap（空字串）
  const getText = (key: string | number) => {
    if (clearedKeys[key]) return textMap[key] ?? '';
    const src = isControlled ? value?.amountByUnit?.[key] : amountByUnit[key];
    if (typeof src === 'number') return String(src);
    return textMap[key] ?? '';
  };

  // 只在有效時送 payload；否則回傳 undefined
  const emit = (nextUnit: string | number, nextAmountByUnit: Record<string | number, number | undefined>) => {
    const item = finalItems.find(i => i.value === nextUnit);
    const need = !!item?.hasInput;
    const amountForUnit = nextAmountByUnit[nextUnit];

    if (need && typeof amountForUnit !== 'number') {
      onChange?.(undefined);
      return;
    }
    onChange?.({ unit: nextUnit, amountByUnit: nextAmountByUnit, amountForUnit, valid: true });
    // 一旦有效，交棒給父層，清掉暫存
    setTempUnit(undefined);
    setClearedKeys(prev => ({ ...prev, [nextUnit]: false }));
  };

  // 切換（只讓 WsStateRadioItem 可點）
  const select = (opt: PickerItem) => {
    if (disabled) return;
    Keyboard.dismiss();

    const unit = opt.value;
    const prevUnit = String(activeUnitUI);

    // 立刻切換 UI（避免「要點兩下」）
    setTempUnit(unit);
    if (!isControlled) setSelectedUnit(unit);

    const base = isControlled ? (value?.amountByUnit ?? {}) : amountByUnit;
    let next: Record<string | number, number | undefined> = { ...base };

    // 清空上一個選項
    if (clearPreviousOnSwitch && prevUnit !== String(unit)) {
      setText(prevUnit, '');
      setClearedKeys(prev => ({ ...prev, [prevUnit]: true }));
      next[prevUnit] = undefined;
    }

    if (opt.hasInput) {
      // 清空新選中的值
      if (clearOnSwitch) {
        setText(unit, '');
        setClearedKeys(prev => ({ ...prev, [unit]: true }));
        next[unit] = undefined;
      } else {
        next[unit] = base[unit];
      }
      if (!isControlled) setAmountByUnit(next);
      emit(unit, next); // 未輸入 ⇒ onChange(undefined)
    } else {
      // 不需輸入 ⇒ 直接有效
      setClearedKeys(prev => ({ ...prev, [unit]: false }));
      if (!isControlled) setAmountByUnit(next);
      emit(unit, next);
      if (!isControlled) setTempUnit(undefined);
    }
  };

  const onChangeText = (opt: PickerItem, s: string) => {
    const clean = s.replace(/[^\d]/g, '');
    setText(opt.value, clean);

    // 只有在目前選中的單位才送出
    if (String(activeUnitUI) === String(opt.value)) {
      const n = parseNumber(clean, opt.min, opt.max);
      const next = { ...(isControlled ? (value?.amountByUnit ?? {}) : amountByUnit), [opt.value]: n };
      if (!isControlled) setAmountByUnit(next);

      // 有輸入 ⇒ 不再以 cleared 覆蓋
      setClearedKeys(prev => ({ ...prev, [opt.value]: false }));
      emit(opt.value, next); // 空字串 ⇒ n=undefined ⇒ onChange(undefined)
    }
  };

  return (
    <View style={[styles.wrap, style, isError && { borderRadius: 5, borderWidth: 1, borderColor: borderColorError }]}>
      {finalItems.map((opt) => {
        const active = String(activeUnitUI) === String(opt.value);
        const needInput = !!opt.hasInput;
        const text = getText(opt.value);
        const showError = active && needInput && !disabled && text.trim() === '';

        return (
          <View key={String(opt.value)} style={[styles.row, rowStyle]}>
            <WsStateRadioItem
              disabled={disabled}
              isActive={active}
              label={''}
              onPress={() => select(opt)}   // 用 WsStateRadioItem 自己的 Touchable
            />

            {needInput ? (
              <View style={styles.inline}>
                <TextInput
                  editable={active && !disabled}
                  keyboardType="number-pad"
                  placeholder={opt.placeholder ?? '數字'}
                  placeholderTextColor={$color.gray9d}
                  maxLength={opt.maxLength}
                  value={text}
                  onChangeText={(s) => onChangeText(opt, s)}
                  style={[
                    styles.input,
                    active ? styles.inputActive : styles.inputDisabled,
                    showError && styles.inputError,
                  ]}
                />
                {!!opt.unitLabel && <WsText color={$color.gray} style={styles.unit}>{opt.unitLabel}</WsText>}
                {showError && <WsText size={12} color={$color.danger} style={{ marginLeft: 8 }}>必填</WsText>}
              </View>
            ) : (
              <WsText size={14} color={$color.black}>{opt.label ?? opt.unitLabel ?? String(opt.value)}</WsText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  input: {
    minWidth: 96,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
  },
  inputActive:   { borderColor: $color.gray3d, backgroundColor: $color.white },
  inputDisabled: { borderColor: $color.gray9d, backgroundColor: $color.white },
  inputError:    { borderColor: $color.danger, backgroundColor: ($color.danger11l ?? '#FFF5F5') },
  unit: { marginLeft: 8 },
});
