// WsTimeRangePicker.tsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import $color from '@/__reactnative_stone/global/color';
import { WsText, WsStateRadioItem } from '@/components';

export type TimeUnit = 'days' | 'weeks' | 'months' | 'year';

export type PickerItem = {
  value: TimeUnit | string;
  hasInput?: boolean;        // true => 需要數字
  unitLabel?: string;        // 右側單位字：天內 / 周內 / ...
  label?: string;            // 無輸入框時顯示用
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  defaultChecked?: boolean;
};

export type PickerState = {
  unit: string | number;
  amountByUnit: Record<string | number, number | undefined>;
  amountForUnit?: number;    // 目前選中單位的值
  valid: true;               // 僅在有效時才回傳 payload ⇒ 永遠為 true
};

type Props = {
  items?: PickerItem[];
  /** 受控值（不傳則採不受控） */
  value?: { unit: string | number; amountByUnit?: Record<string | number, number | undefined> };
  /** 需要輸入但未輸入數字時，會回傳 undefined */
  onChange?: (s?: PickerState) => void;
  disabled?: boolean;
  style?: any;
  rowStyle?: any;
  isError?: boolean;
  borderColorError?: string;
  /** 切換單選時是否清空該選項輸入值（預設 true） */
  clearOnSwitch?: boolean;
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
}: Props) {
  const finalItems = useMemo(() => (items.length ? items : DEFAULT_ITEMS), [items]);

  const initialUnit = useMemo(() => {
    if (value?.unit !== undefined) return value.unit;
    const found = finalItems.find(i => i.defaultChecked);
    return found?.value ?? finalItems[0]?.value;
  }, [value?.unit, finalItems]);

  const isControlled = value?.unit !== undefined;

  const [selectedUnit, setSelectedUnit] = useState<string | number>(initialUnit);
  const [amountByUnit, setAmountByUnit] = useState<Record<string | number, number | undefined>>(value?.amountByUnit ?? {});
  const [textMap, setTextMap] = useState<Record<string | number, string>>({});
  const [clearedActiveUnit, setClearedActiveUnit] = useState<string | number | null>(null); // ⭐ 受控清空覆蓋旗標
  const inputRefs = useRef<Record<string | number, TextInput | null>>({});

  // 受控 → 追隨外部
  useEffect(() => {
    if (isControlled && value) {
      setSelectedUnit(value.unit);
      setAmountByUnit(value.amountByUnit ?? {});
      // 保留 textMap；若剛清空，getText 會優先用 textMap
    }
  }, [isControlled, value?.unit, value?.amountByUnit]);

  const activeUnit = isControlled ? (value?.unit ?? selectedUnit) : selectedUnit;

  const setText = (key: string | number, s: string) => {
    setTextMap(prev => ({ ...prev, [key]: s }));
  };

  // 轉數字（空字串/非數字回 undefined；夾限 min/max）
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

  // 顯示值來源：受控時若剛清空(active 且 cleared)，忽略父層舊值
  const getText = (key: string | number) => {
    const isActive = String(activeUnit) === String(key);
    const wasCleared = isActive && clearedActiveUnit !== null && String(clearedActiveUnit) === String(key);

    if (isControlled && !wasCleared) {
      const n = value?.amountByUnit?.[key];
      if (typeof n === 'number') return String(n);
    } else if (!isControlled) {
      const n = amountByUnit[key];
      if (typeof n === 'number') return String(n);
    }
    return textMap[key] ?? '';
  };

  // 只有在「有效有值」時才回傳 payload；否則 onChange(undefined)
  const emit = (nextUnit: string | number, nextAmountByUnit: Record<string | number, number | undefined>) => {
    const item = finalItems.find(i => i.value === nextUnit);
    const need = !!item?.hasInput;
    const amountForUnit = nextAmountByUnit[nextUnit];

    if (need && typeof amountForUnit !== 'number') {
      onChange?.(undefined);
      return;
    }
    onChange?.({
      unit: nextUnit,
      amountByUnit: nextAmountByUnit,
      amountForUnit,
      valid: true,
    });
  };

  // 點選切換
  const select = (opt: PickerItem) => {
    if (disabled) return;
    const unit = opt.value;

    if (!isControlled) setSelectedUnit(unit);

    if (opt.hasInput) {
      // 切換就清空選中單位
      if (clearOnSwitch) {
        setText(unit, '');
        setClearedActiveUnit(unit); // ⭐ 受控時也強制顯示為空
      } else {
        setClearedActiveUnit(null);
      }

      const next = {
        ...(isControlled ? (value?.amountByUnit ?? {}) : amountByUnit),
        [unit]: clearOnSwitch ? undefined : (isControlled ? value?.amountByUnit?.[unit] : amountByUnit[unit]),
      };
      if (!isControlled) setAmountByUnit(next);
      emit(unit, next);                  // 會回傳 undefined（未輸入）
    } else {
      setClearedActiveUnit(null);
      const next = { ...(isControlled ? (value?.amountByUnit ?? {}) : amountByUnit) };
      if (!isControlled) setAmountByUnit(next);
      emit(unit, next);                  // 不需輸入 ⇒ 直接有效
    }
  };

  // 輸入變更
  const onChangeText = (opt: PickerItem, s: string) => {
    const clean = s.replace(/[^\d]/g, '');
    setText(opt.value, clean);

    if (String(activeUnit) === String(opt.value)) {
      const n = parseNumber(clean, opt.min, opt.max);
      const next = { ...(isControlled ? (value?.amountByUnit ?? {}) : amountByUnit), [opt.value]: n };
      if (!isControlled) setAmountByUnit(next);

      // 只要使用者有輸入，就取消清空覆蓋
      if (clean !== '') setClearedActiveUnit(null);

      emit(opt.value, next); // 空字串 ⇒ n=undefined ⇒ onChange(undefined)
    }
  };

  return (
    <View
      style={[
        styles.wrap,
        style,
        isError && { borderRadius: 5, borderWidth: 1, borderColor: borderColorError },
      ]}
    >
      {finalItems.map((opt) => {
        const active = String(activeUnit) === String(opt.value);
        const needInput = !!opt.hasInput;
        const text = getText(opt.value);
        const showError = active && needInput && !disabled && text.trim() === '';

        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => select(opt)}
            disabled={disabled}
            style={[styles.row, rowStyle]}
            accessibilityRole="radio"
            accessibilityState={{ selected: active, disabled: !!disabled }}
          >
            <WsStateRadioItem
              disabled={disabled}
              isActive={active}
              label={''}
              onPress={() => select(opt)}
            />

            {needInput ? (
              <View style={styles.inline}>
                <TextInput
                  ref={r => (inputRefs.current[opt.value] = r)}
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
                {!!opt.unitLabel && (
                  <WsText color={$color.gray} style={styles.unit}>
                    {opt.unitLabel}
                  </WsText>
                )}
                {showError && (
                  <WsText size={12} color={$color.danger} style={{ marginLeft: 8 }}>
                    必填
                  </WsText>
                )}
              </View>
            ) : (
              <WsText size={14} color={$color.black}>
                {opt.label ?? opt.unitLabel ?? String(opt.value)}
              </WsText>
            )}
          </Pressable>
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
