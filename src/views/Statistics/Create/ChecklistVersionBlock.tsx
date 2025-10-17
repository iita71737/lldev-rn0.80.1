import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native';
import {
  WsPaddingContainer,
  LlStatisticsQuestionCard001
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { RAW_QUESTIONS } from './mock/questions';
import FormulaRelationsMobileDemo from './RelationshipFormulaBlock';

export type ChipItem = { key: string; label: string; withInput?: boolean };

type Version3BlockProps = {
  /** 0：題目清單；1：公式區塊 */
  step?: number;

  /** 已選題目（受控/不受控） */
  chips?: ChipItem[];
  onChipsChange?: (next: ChipItem[]) => void;

  /** Chip 行為 */
  onRemoveChip?: (key: string) => void;
  onChipInputChange?: (key: string, value: string) => void;

  /** 公式編輯彈窗（父層開關） */
  setModalVisibleSourceData?: () => void;

  /** 標題文案 */
  selectedTitle?: string;
};

export default function Version3Block({
  step,
  chips: cChips,
  onChipsChange,
  onRemoveChip,
  onChipInputChange,
  setModalVisibleSourceData,
  selectedTitle = '已選擇的題目',
}: Version3BlockProps) {
  /** 內部不受控 chips（外部沒給時使用） */
  const [uChips, setUChips] = React.useState<ChipItem[]>([]);

  /** 受控 / 不受控合併 */
  const chips = cChips ?? uChips;

  /** 共用更新工具 */
  const updateChips = (next: ChipItem[]) => {
    onChipsChange ? onChipsChange(next) : setUChips(next);
  };

  /** 刪除 chip（可被父層接管） */
  const removeChip = (k: string) => {
    if (onRemoveChip) return onRemoveChip(k);
    updateChips(chips.filter(c => c.key !== k));
  };

  /** 判斷是否已在 chips 內 */
  const hasChip = React.useCallback((key: string) => {
    return chips.some(c => c.key === key);
  }, [chips]);

  /** 勾選題目後：加入/移除 chips */
  const handleToggleQuestion = React.useCallback((payloadOrItem) => {
    // 來自卡片的 checkboxOnPress 會回傳 {...answer, checked}
    const item = payloadOrItem?.id ? payloadOrItem : null;
    const isChecked = !!payloadOrItem?.checked;

    // 從 RAW_QUESTIONS 查資料（或直接用回傳的 item）
    const id = item?.id ?? payloadOrItem?.id;
    if (!id) return;

    const src = RAW_QUESTIONS.find(q => q.id === id) || item;
    if (!src) return;

    const key = src.id;
    const label = src.title ?? '';

    if (isChecked) {
      // 勾選：加入（去重）
      if (!hasChip(key)) {
        updateChips([...chips, { key, label }]);
      }
    } else {
      // 取消勾選：移除
      if (hasChip(key)) {
        updateChips(chips.filter(c => c.key !== key));
      }
    }
  }, [chips, hasChip, updateChips]);

  return (
    <View style={styles.root}>
      {/* 已選擇的題目 */}
      <Text style={[styles.sectionTitle, { marginTop: 4 }]}>{selectedTitle}</Text>
      <View style={styles.chipsWrap}>
        {chips.map((c, idx) => (
          <Chip
            key={c.key}
            prefix={String.fromCharCode(65 + idx)} // A/B/C...
            label={c.label}
            onRemove={() => removeChip(c.key)}
            onInputChange={(v) => onChipInputChange?.(c.key, v)}
          />
        ))}
      </View>

      {/* step=0 顯示題目清單 */}
      {step === 0 && (
        <FlatList
          data={RAW_QUESTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LlStatisticsQuestionCard001
              key={item.id}
              checkboxVisible={true}
              // 讓卡片知道目前是否已選（受控）
              checked={hasChip(item.id)}
              // 勾/取消勾 → 同步 chips
              checkboxOnPress={handleToggleQuestion}
              onPress={() => {}}
              style={{ marginTop: 8 }}
              no={index + 1}
              answer={item}
              title={item.title}
              score={item.score}
            />
          )}
        />
      )}

      {/* step=1 顯示公式區塊 */}
      {step === 1 && (
        <WsPaddingContainer
          padding={0}
          style={{
            marginTop: 8,
            backgroundColor: $color.white,
            borderRadius: 10,
          }}
        >
          <FormulaRelationsMobileDemo
            onEdit={() => {
              setModalVisibleSourceData?.();
            }}
            onPreviewAndDeleteData={() => {}}
            onDelete={() => {}}
          />
        </WsPaddingContainer>
      )}
    </View>
  );
}

/* ===== 小元件：Chip ===== */
function Chip({
  prefix,
  label,
  onRemove,
  withInput,
  onInputChange,
}: {
  prefix?: string;
  label: string;
  withInput?: boolean;
  onRemove?: () => void;
  onInputChange?: (v: string) => void;
}) {
  return (
    <View style={styles.chip}>
      {!!prefix && (
        <View style={styles.chipPrefix}>
          <Text style={styles.chipPrefixTxt}>{prefix}</Text>
        </View>
      )}
      <Text style={styles.chipLabel} numberOfLines={2}>{label}</Text>
      {withInput && (
        <View style={styles.chipSmallInput}>
          <TextInput
            style={styles.chipSmallInputTxt}
            placeholder=""
            onChangeText={onInputChange}
          />
        </View>
      )}
      <TouchableOpacity onPress={onRemove} style={styles.chipClose}>
        <Text style={styles.chipCloseTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===== 樣式 ===== */
const styles = StyleSheet.create({
  root: { paddingTop: 2 },
  sectionTitle: { fontSize: 16, color: '#111', marginBottom: 6 },

  /* Chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f9fb', borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6,
    marginRight: 8, marginTop: 8,
  },
  chipPrefix: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e6eef6', alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  chipPrefixTxt: { color: '#0b5aaa', fontSize: 12 },
  chipLabel: { color: '#111', maxWidth: 160 },
  chipSmallInput: {
    marginLeft: 6, borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, minWidth: 40, backgroundColor: '#fff',
  },
  chipSmallInputTxt: { padding: 0, margin: 0, minWidth: 32, color: '#111' },
  chipClose: {
    marginLeft: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#e9edf2', alignItems: 'center', justifyContent: 'center',
  },
  chipCloseTxt: { color: '#111', fontSize: 14, lineHeight: 18 },
});
