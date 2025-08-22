import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WsStateRadioItem, WsFlex, WsIcon, WsText } from '@/components';
import $color from '@/__reactnative_stone/global/color';

type WsRadioChangePayload = {
  value: string | number;   // 被選中的 radio value
  n?: number;               // 使用者輸入的數字 (undefined = 尚未輸入)
};

type ItemBase = {
  value: string | number;
  // label: string;
  style?: any;
  showRemind?: { remind: string; remindColor?: string };
  defaultChecked?: boolean;
};

type NumberItem = ItemBase & {
  hasInput: true;
  unit?: string;
  placeholder?: string; // 顯示用 placeholder
  defaultN?: number;    // 建議值，只做 placeholder 用
  min?: number;
  max?: number;
  maxLength?: number;
};

type PlainItem = ItemBase & {
  hasInput?: false;
};

export type RadioNumberItem = NumberItem | PlainItem;

const DEFAULT_ITEMS: RadioNumberItem[] = [
  {
    value: 'days',
    hasInput: true,
    unit: '天內',
    defaultN: 7,
    defaultChecked: true,
    // showRemind: { remind: '預設查近 7 天', remindColor: $color.primary }
    maxLength: 2,
  },
  {
    value: 'weeks',
    hasInput: true,
    unit: '周內',
    defaultN: 4,
    maxLength: 2,
  },
  {
    value: 'months',
    hasInput: true,
    unit: '月內',
    defaultN: 3,
    maxLength: 2,
  },
  {
    value: 'year',
    hasInput: true,
    unit: '年內',
    defaultN: 1,
    maxLength: 1,
  },
];

export default function WsStateRadioWithInput({
  value,
  nMap = {},
  onChange,
  items = [],
  disabled,
  isError,
  borderColorError = $color.danger,
  style,
  testID,
  autoFocus = false,
}: {
  value?: string | number;
  nMap?: Record<string | number, number | undefined>;
  onChange: (payload: WsRadioChangePayload) => void;
  items?: RadioNumberItem[];
  disabled?: boolean;
  isError?: boolean;
  borderColorError?: string;
  style?: any;
  testID?: string;
  autoFocus?: boolean;
}) {
  const finalItems = React.useMemo<RadioNumberItem[]>(
    () => (items && items.length > 0 ? items : DEFAULT_ITEMS),
    [items]
  );

  // 初始不再帶入 defaultN，僅保留空字串；若外部有 nMap（受控），仍會顯示外部值
  const [localN, setLocalN] = React.useState<Record<string | number, string>>(
    () => {
      const init: Record<string | number, string> = {};
      finalItems.forEach(it => {
        if ((it as NumberItem).hasInput) {
          init[it.value] = '';
        }
      });
      return init;
    }
  );

  const initialValue = React.useMemo<string | number | undefined>(() => {
    if (value !== undefined) return value;
    const found = finalItems.find(it => (it as ItemBase).defaultChecked);
    return found?.value ?? finalItems[0]?.value;
  }, [value, finalItems]);

  // 初次掛載：若外層沒給 value，只同步選中的 value，且 nextN 不帶入 defaultN
  React.useEffect(() => {
    if (value === undefined && initialValue !== undefined) {
      const it = finalItems.find(i => i.value === initialValue);
      if (it) {
        if ((it as NumberItem).hasInput) {
          onChange({ value: it.value });
        } else {
          onChange({ value: it.value });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getNString = (key: string | number) => {
    const external = nMap[key];
    if (typeof external === 'number') return String(external); // 受控時顯示外部值
    return localN[key] ?? '';
  };

  const setNString = (key: string | number, s: string) => {
    setLocalN(prev => ({ ...prev, [key]: s }));
  };

  const activeValue = value !== undefined ? value : initialValue;
  const isActive = (v: string | number) => activeValue === v;

  const handlePress = (it: RadioNumberItem) => {
    if (disabled) return;
    if (it.hasInput) {
      const s = getNString(it.value);
      const n = safeParseClampToNumber(s, it.min, it.max);
      onChange({ value: it.value, n });
    } else {
      onChange({ value: it.value });
    }
  };

  const handleTextChange = (it: NumberItem, s: string) => {
    // 僅允許數字
    const clean = s.replace(/[^\d]/g, '');
    setNString(it.value, clean);

    if (isActive(it.value)) {
      const n = safeParseClampToNumber(clean, it.min, it.max);
      onChange({ value: it.value, n });
    }
  };

  const remind = React.useMemo(() => {
    const current = finalItems.find(i => i.value === activeValue);
    return current?.showRemind?.remind;
  }, [finalItems, activeValue]);

  const remindColor = React.useMemo(() => {
    const current = finalItems.find(i => i.value === activeValue);
    return current?.showRemind?.remindColor ?? $color.primary;
  }, [finalItems, activeValue]);

  const isEmptyN = (key: string | number) => {
    const s = getNString(key);
    return String(s ?? '').trim() === '';
  };

  return (
    <>
      <WsFlex
        style={[
          {
            flexWrap: 'wrap',
            paddingHorizontal: 16,
          },
          style,
          isError && {
            borderRadius: 5,
            borderWidth: 1,
            borderColor: borderColorError,
          },
        ]}
      >
        {finalItems.map((item) => {
          const active = isActive(item.value);
          const isNumber = (item as NumberItem).hasInput === true;

          // ✅ 只有「數字輸入型 + 已選中 + 尚未輸入 + 未 disabled」才反紅
          const showActiveEmptyWarn =
            isNumber && active && isEmptyN(item.value) && !disabled;

          return (
            <View
              testID={testID}
              key={String(item.value)}
              style={[
                { flexDirection: 'row', alignItems: 'center', marginRight: 20, marginBottom: 8 },
                item.style || null,
              ]}
            >
              <WsStateRadioItem
                testID={item.label}
                disabled={disabled}
                label={item.label}
                isActive={active}
                onPress={() => handlePress(item)}
              />

              {isNumber && (
                <View style={styles.inline}>
                  <TextInput
                    editable={!disabled && active}
                    keyboardType="number-pad"
                    placeholder={
                      String(
                        (item as NumberItem).placeholder ??
                        (item as NumberItem).defaultN ??
                        '數字'
                      )
                    }
                    placeholderTextColor={$color.white5d}
                    maxLength={(item as NumberItem).maxLength}
                    value={getNString(item.value)}
                    onChangeText={(s) => handleTextChange(item as NumberItem, s)}
                    style={[
                      styles.input,
                      {
                        // ✅ 有錯就紅框＋淡紅底；有選中但不錯誤則正常；未選中用灰框白底
                        borderColor: showActiveEmptyWarn
                          ? $color.danger
                          : (active ? $color.gray3d : $color.gray9d),
                        backgroundColor: showActiveEmptyWarn
                          ? ($color.danger11l ?? '#FFF1F1') // 你的紅色淡底，沒有就用 #FFF1F1
                          : $color.white,
                        color: $color.black,
                        opacity: !active || disabled ? 0.5 : 1,
                      },
                    ]}
                  />
                  {(item as NumberItem).unit && (
                    <WsText color={$color.gray} style={{ marginLeft: 6 }}>
                      {(item as NumberItem).unit}
                    </WsText>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </WsFlex>

      {!!remind && (
        <TouchableOpacity onPress={() => { }}>
          <WsFlex style={[autoFocus ? null : { marginTop: 12 }]}>
            <WsIcon
              name="md-info-outline"
              color={remindColor}
              style={{ marginRight: 6 }}
              size={16}
            />
            <WsText size={12} color={remindColor} style={{ paddingRight: 16 }}>
              {remind}
            </WsText>
          </WsFlex>
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  input: {
    minWidth: 72,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
});

// 文字 -> 數字；空字串回傳 undefined；帶 min/max 夾限
function safeParseClampToNumber(s?: string, min?: number, max?: number): number | undefined {
  const str = String(s ?? '');
  if (str.trim() === '') return undefined;
  const raw = parseInt(str, 10);
  if (Number.isNaN(raw)) return undefined;
  let out = Math.max(0, raw);
  if (typeof min === 'number') out = Math.max(min, out);
  if (typeof max === 'number') out = Math.min(max, out);
  return out;
}
