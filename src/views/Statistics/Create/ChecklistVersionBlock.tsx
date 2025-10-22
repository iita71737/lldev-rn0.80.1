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
import RelationshipFormulaBlock from './RelationshipFormulaBlock';
import AsyncStorage from '@react-native-community/async-storage';

export type ChipItem = { key: string; label: string; withInput?: boolean };
export type ChipsData = { selected_questions: ChipItem[] };

type Version3BlockProps = {
  step?: number;
  chips?: ChipsData;
  onChipsChange?: (next: ChipsData) => void;
  onRemoveChip?: (key: string) => void;
  onChipInputChange?: (key: string, value: string) => void;
  setModalVisibleSourceData?: () => void;
  selectedTitle?: string;
  section?: string;
  statisticsId?: string;
};

export default function ChecklistVersionBlock({
  isOpen,
  step,
  chips: cChips,
  onChipsChange,
  onRemoveChip,
  onChipInputChange,
  setModalVisibleSourceData,
  selectedTitle = '已選擇的題目',
  section,
  statisticsId,
}: Version3BlockProps) {

  /** ✅ 不受控 chips 預設結構 */
  const [uChips, setUChips] = React.useState<ChipsData>();
  /** ✅ 受控 / 不受控合併 */
  const chips = cChips ?? uChips;

  /** ✅ 更新 chips（確保結構不破壞） */
  const updateChips = (next: ChipsData) => {
    onChipsChange ? onChipsChange(next) : setUChips(next);
  };

  /** ✅ 判斷是否已在 chips 內 */
  const hasChip = React.useCallback((key: string) => {
    return chips?.selected_questions?.some(c => c.key === key);
  }, [chips]);

  /** ✅ 刪除單一 chip */
  const removeChip = (k: string) => {
    if (onRemoveChip) return onRemoveChip(k);
    const filtered = chips.selected_questions.filter(c => c.key !== k);
    updateChips({ selected_questions: filtered });
  };

  /** ✅ 勾選題目後：加入 / 移除 chips */
  const handleToggleQuestion = React.useCallback(async (payloadOrItem) => {
    const item = payloadOrItem?.id ? payloadOrItem : null;
    const isChecked = !!payloadOrItem?.checked;
    const id = item?.id ?? payloadOrItem?.id;
    if (!id) return;

    const src = RAW_QUESTIONS.find(q => q.id === id) || item;
    if (!src) return;

    const key = src.id;
    const label = `${src.title} ${section?.id}` ?? '';

    let nextQuestions = [...(chips.selected_questions || [])];

    if (isChecked) {
      // 勾選：加入（去重）
      if (!hasChip(key)) {
        nextQuestions.push({ key, label });
      }
    } else {
      // 取消勾選：移除
      nextQuestions = nextQuestions.filter(c => c.key !== key);
    }

    const nextChips = { selected_questions: nextQuestions };
    updateChips(nextChips);

    // ✅ 同步存到 AsyncStorage
    try {
      await AsyncStorage.setItem(`${statisticsId}-${section?.id}-@dataSet`, JSON.stringify(nextChips));
    } catch (err) {
      console.warn('儲存已選題目失敗：', err);
    }

  }, [chips, hasChip, updateChips, section?.id, statisticsId, isOpen]);

  /** ✅ 初始讀取 AsyncStorage */
  React.useEffect(() => {
    const loadSavedChips = async () => {
      try {
        const saved = await AsyncStorage.getItem(`${statisticsId}-${section?.id}-@dataSet`);
        if (saved) {
          const parsed: ChipsData = JSON.parse(saved);
          if (parsed?.selected_questions) {
            updateChips(parsed);
          }
          console.log(parsed,'parsed---')
        }
      } catch (err) {
        console.warn('載入已選題目失敗：', err);
      }
    };
    loadSavedChips();
  }, [section?.id, statisticsId, isOpen]);

  return (
    <View style={styles.root}>
      <Text style={[styles.sectionTitle, { marginTop: 4 }]}>{selectedTitle}</Text>

      {/* ✅ 顯示 chips */}
      <View style={styles.chipsWrap}>
        {chips?.selected_questions?.length > 0 ? (
          chips.selected_questions.map((c, idx) => (
            <Chip
              key={c.key}
              label={c.label}
              onRemove={() => removeChip(c.key)}
              onInputChange={(v) => onChipInputChange?.(c.key, v)}
            />
          ))
        ) : (
          <Text style={{ color: '#999', marginTop: 8 }}>尚未選擇題目</Text>
        )}
      </View>

      {/* ✅ 題目清單 */}
      {step === 0 && (
        <FlatList
          data={RAW_QUESTIONS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <LlStatisticsQuestionCard001
              key={item.id}
              checkboxVisible={true}
              checked={hasChip(item.id)}
              checkboxOnPress={handleToggleQuestion}
              onPress={() => { }}
              style={{ marginTop: 8 }}
              no={index + 1}
              answer={item}
              title={`${item.title} ${section?.id}`}
              score={item.score}
            />
          )}
        />
      )}

      {/* ✅ 公式區塊 */}
      {step === 1 && (
        <WsPaddingContainer
          padding={0}
          style={{
            marginTop: 8,
            backgroundColor: $color.white,
            borderRadius: 10,
          }}
        >
          <RelationshipFormulaBlock
            onEdit={() => setModalVisibleSourceData?.()}
            onPreviewAndDeleteData={() => { }}
            onDelete={() => { }}
            chips={chips}
            statisticsId={statisticsId}
            sectionId={section?.id}
          />
        </WsPaddingContainer>
      )}
    </View>
  );
}

/* ===== Chip 元件 ===== */
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
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f9fb', borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6,
    marginRight: 8, marginTop: 8
  },
  chipPrefix: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e6eef6', alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  chipPrefixTxt: { color: '#0b5aaa', fontSize: 12 },
  chipLabel: { color: '#111', maxWidth: 160, paddingHorizontal: 8 },
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
