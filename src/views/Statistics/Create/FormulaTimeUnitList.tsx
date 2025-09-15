import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
  Platform,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';

export type FormulaRule = {
  id: string;
  expression: string; // 例如: "sum(result)"
};

type Props = {
  title?: string;                   // 預設：點檢表名稱
  subtitle?: string;                // 預設：單位時間內的關係公式
  rules: FormulaRule[];
  onPreview?: (rule: FormulaRule) => void;
  onDelete?: (rule: FormulaRule) => void;
  onCreate?: (expression: string) => void; // 按新增時回傳新字串，外層可決定是否接手存檔
  onEditFormula?: (rule: FormulaRule) => void;
  style?: ViewStyle;
  pillTextStyle?: TextStyle;
  expressionBoxStyle?: ViewStyle;
};

const MONO_FONT =
  Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) || undefined;

export default function FormulaTimeUnitList({
  title = '點檢表名稱',
  subtitle = '單位時間內的關係公式',
  rules,
  onPreview,
  onDelete,
  onCreate,
  onEditFormula,
  style,
  pillTextStyle,
  expressionBoxStyle,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(''); // 新增輸入

  const canSubmit = draft.trim().length > 0;

  const handleAddPress = useCallback(() => {
    setAdding(true);
    setDraft('');
  }, []);

  const handleCreate = useCallback(() => {
    if (!canSubmit) return;
    onCreate?.(draft.trim());
    setAdding(false);
    setDraft('');
  }, [canSubmit, draft, onCreate]);

  const handleCancel = useCallback(() => {
    setAdding(false);
    setDraft('');
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FormulaRule }) => (
      <View style={styles.row}>
        {/* 公式方塊 */}
        <TouchableOpacity
          style={[styles.exprBox, expressionBoxStyle]}
          onPress={() => onEditFormula?.(item)}
        >
          <Text style={styles.exprText} numberOfLines={1}>
            {item.expression}
          </Text>
        </TouchableOpacity>

        {/* 操作按鈕 */}
        <View style={styles.actions}>
          <Pill onPress={() => onPreview?.(item)} label="預覽" />
          <Pill onPress={() => onDelete?.(item)} label="刪除" danger />
        </View>
      </View>
    ),
    [expressionBoxStyle, onDelete, onPreview]
  );

  const keyExtractor = useCallback((r: FormulaRule) => r.id, []);

  return (
    <View style={[styles.container, style]}>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <FlatList
        data={rules}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 新增區域 */}
      {adding ? (
        <View style={styles.addRow}>
          <View style={[styles.exprBox, expressionBoxStyle, { flex: 1 }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="輸入公式，如：sum(result)"
              placeholderTextColor="#9aa0a6"
              style={[styles.exprText, styles.input]}
              autoFocus
            />
          </View>
          <View style={styles.actions}>
            <Pill label="新增" onPress={handleCreate} disabled={!canSubmit} />
            <Pill label="取消" onPress={handleCancel} />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="新增公式"
          onPress={handleAddPress}
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.plus}>＋</Text>
        </Pressable>
      )}
    </View>
  );
}

function Pill({
  label,
  onPress,
  danger,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  danger?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.pill,
        danger && styles.pillDanger,
        disabled && styles.pillDisabled,
        pressed && !disabled && { opacity: 0.75, transform: [{ scale: 0.98 }] },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.pillText,
          danger && styles.pillTextDanger,
          disabled && styles.pillTextDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderColor: '#111',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // 斜虛線
  diagonal: {
    position: 'absolute',
    top: -40,
    right: -120,
    width: 320,
    height: 0,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#9aa0a6',
    transform: [{ rotate: '25deg' }],
    opacity: 0.5,
  },
  diagonal2: {
    top: 24,
    right: -160,
  },

  title: {
    fontSize: 20,
    color: '#111',
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#4f5561',
    marginBottom: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },

  exprBox: {
    minWidth: 160,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#111',
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  exprText: {
    color: '#111',
    fontSize: 15,
    fontFamily: MONO_FONT,
  },
  input: {
    paddingVertical: 0,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  pillDanger: {
    borderColor: '#111',
  },
  pillDisabled: {
    opacity: 0.45,
  },
  pillText: {
    fontSize: 13,
    color: '#111',
    fontWeight: '600',
  },
  pillTextDanger: {
    color: '#111',
  },
  pillTextDisabled: {
    color: '#555',
  },

  addButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  plus: {
    fontSize: 20,
    lineHeight: 20,
    color: '#111',
    fontWeight: '800',
  },
});
