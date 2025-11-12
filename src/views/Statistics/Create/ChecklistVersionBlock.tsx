import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  Dimensions
} from 'react-native';
import {
  WsPaddingContainer,
  LlStatisticsQuestionCard001,
  WsStateMultiLevelToggle
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { RAW_QUESTIONS } from './mock/questions';
import RelationshipFormulaBlock from './RelationshipFormulaBlock';
import { useTranslation } from 'react-i18next';

export type ChipItem = {
  key: string;              // ✅ 只存「選項(葉) id」
  label: string;
  withInput?: boolean;
  question_id?: string;     // ✅ 額外欄位：此 chip 所屬「題目 id」
};
export type ChipsData = { selected_questions: ChipItem[] };

type Version3BlockProps = {
  step?: number;
  chips?: ChipsData;
  onChipsChange?: (next: ChipsData) => void;
  onRemoveChip?: (key: string) => void;
  onChipInputChange?: (key: string, value: string) => void;
  setModalVisibleSourceData?: () => void;
  selectedTitle?: string;
  section?: { id?: string };
  statisticsId?: string;
  selectedQuesType?: string;
  isOpen?: boolean;
  onPreview?: () => void;
};

export default function ChecklistVersionBlock({
  isOpen,
  onPreview,
  step,
  chips: cChips,
  onChipsChange,
  onRemoveChip,
  onChipInputChange,
  setModalVisibleSourceData,
  selectedTitle = '已選擇',
  section,
  statisticsId,
  selectedQuesType,
}: Version3BlockProps) {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window');

  const prevStepRef = React.useRef<number | undefined>(undefined);
  const prevTypeRef = React.useRef<string | undefined>(undefined);
  const prevSectionIdRef = React.useRef<string | undefined>(undefined);

  // ===== MultiToggle 內部狀態 =====
  const [multiToggleOpen, setMultiToggleOpen] = React.useState(false);
  const [multiToggleTree, setMultiToggleTree] = React.useState<any[]>([]);
  const [pendingQuestion, setPendingQuestion] = React.useState<any>(null);

  // 記住每題(questionId)被勾選的「葉節點 id 陣列」
  const [choiceIdsByQuestion, setChoiceIdsByQuestion] = React.useState<Record<string, string[]>>({});

  const findNodeById = React.useCallback((nodes: any[], id: string) => {
    for (const n of nodes || []) {
      if (n.id === id) return n;
      if (Array.isArray(n.question_setting_items) && n.question_setting_items.length) {
        const hit = findNodeById(n.question_setting_items, id);
        if (hit) return hit;
      }
    }
    return null;
  }, []);

  const pathLabels = React.useCallback((tree: any[], pathIds: string[] = []) => {
    const labels: string[] = [];
    for (const id of pathIds) {
      const node = findNodeById(tree, id);
      if (node?.name) labels.push(node.name);
    }
    return labels;
  }, [findNodeById]);

  // === 本地 chips（非受控回退） ===
  const [uChips, setUChips] = React.useState<ChipsData>({ selected_questions: [] });
  const chips = cChips ?? uChips;

  const updateChips = React.useCallback((
    next: ChipsData | ((prev: ChipsData) => ChipsData)
  ) => {
    const compute = (prev: ChipsData) =>
      typeof next === 'function' ? (next as any)(prev) : next;

    if (onChipsChange) {
      onChipsChange(compute(chips ?? { selected_questions: [] }));
    } else {
      setUChips(prev => compute(prev ?? { selected_questions: [] }));
    }
  }, [onChipsChange, chips]);

  // 某題是否已有任一（葉）chip：用 choiceIdsByQuestion 與 chips 交集判定
  const hasAnyChipUnderQuestion = React.useCallback((qid: string) => {
    const leafIds = choiceIdsByQuestion[qid] ?? [];
    if (leafIds.length === 0) return false;
    const set = new Set(leafIds.map(String));
    return (chips?.selected_questions ?? []).some(c => set.has(String(c.key)) || c.question_id === qid);
  }, [choiceIdsByQuestion, chips]);

  // 移除單顆 chip（key=leafId）；同步把該 leafId 自題目的集合中移除
  const removeChip = (k: string) => {
    if (onRemoveChip) return onRemoveChip(k);

    const removed = (chips?.selected_questions ?? []).find(c => String(c.key) === String(k));

    updateChips(prev => ({
      selected_questions: (prev?.selected_questions ?? []).filter(c => String(c.key) !== String(k))
    }));

    setChoiceIdsByQuestion(prev => {
      const qid = removed?.question_id || Object.keys(prev).find(id =>
        (prev[id] ?? []).some(leaf => String(leaf) === String(k))
      );
      if (!qid) return prev;

      const remain = (prev[qid] ?? []).filter(id => String(id) !== String(k));
      const next = { ...prev };
      if (remain.length === 0) delete next[qid]; else next[qid] = remain;
      return next;
    });
  };

  // 單層題目：開/關（此類 chip.key = questionId，沿用舊有單顆行為）
  const handleToggleQuestion = React.useCallback((payloadOrItem: any) => {
    const id =
      payloadOrItem?.id ??
      payloadOrItem?.question_id ??
      payloadOrItem?.key ??
      payloadOrItem?.item?.id ??
      payloadOrItem?.item?.question_id ??
      payloadOrItem?.item?.key;

    if (id == null) return;

    const explicitChecked =
      payloadOrItem?.checked ??
      payloadOrItem?.value ??
      payloadOrItem?.target?.checked;

    const same = (a: any, b: any) => String(a) === String(b);
    const src =
      (Array.isArray(RAW_QUESTIONS)
        ? RAW_QUESTIONS.find((q: any) => same(q?.id ?? q?.question_id ?? q?.key, id))
        : null) || payloadOrItem?.item || payloadOrItem;

    if (!src) return;

    const questionId = src?.question_id ?? src?.id ?? src?.key ?? id;
    const key = String(questionId);
    const label = [src?.title, section?.id].filter(Boolean).join(' ');

    updateChips((prev) => {
      const list = prev?.selected_questions ?? [];
      const exists = list.some(c => String(c.key) === key);

      const shouldCheck =
        explicitChecked === true ? true :
          explicitChecked === false ? false :
            !exists;

      let nextList: ChipItem[];
      if (shouldCheck) {
        nextList = exists ? list : [...list, { key, label, question_id: String(questionId) }];
      } else {
        nextList = list.filter(c => String(c.key) !== key);
      }
      return { ...prev, selected_questions: nextList };
    });
  }, [section?.id, updateChips]);

  // 多層題目：開啟多選 modal（不在這裡增刪 chip）
  const handleMultiToggleQuestion = React.useCallback((payloadOrItem: any) => {
    const item =
      payloadOrItem?.id
        ? payloadOrItem
        : RAW_QUESTIONS.find((q: any) => String(q.id) === String(payloadOrItem?.id));

    if (!item) return;

    const tree = item?.last_version?.question_setting_items ?? [];
    setPendingQuestion(item);
    setMultiToggleTree(tree);
    setMultiToggleOpen(true);
  }, []);

  // Step0 類型/Section 切換清理
  React.useEffect(() => {
    if (step !== 0) {
      prevStepRef.current = step;
      return;
    }

    const prevType = prevTypeRef.current;
    const nextType = selectedQuesType;

    const prevSectionId = prevSectionIdRef.current;
    const nextSectionId = section?.id;

    const bothTruthy = !!prevType && !!nextType;
    const typeChanged = prevType !== undefined && prevType !== nextType;
    const inSameSection = prevSectionId === nextSectionId;
    const stillInStep0 = prevStepRef.current === 0;

    const shouldClear =
      stillInStep0 &&
      typeChanged &&
      bothTruthy &&
      inSameSection;

    if (shouldClear) {
      updateChips({ selected_questions: [] });
      setChoiceIdsByQuestion({});
      setMultiToggleOpen(false);
      setPendingQuestion(null);
      setMultiToggleTree([]);
    }

    if (nextType) prevTypeRef.current = nextType;
    if (nextSectionId) prevSectionIdRef.current = nextSectionId;
    prevStepRef.current = 0;
  }, [selectedQuesType, section?.id, step, updateChips]);

  // 傳給公式區：question_id 使用 chip.key（多層選單為葉 id；單層仍為題目 id）
  const chipsForFormula = React.useMemo(() => ({
    selected_questions: (chips?.selected_questions ?? []).map(c => ({
      question_id: c.question_id ?? null,  // ← 用 chip 內的題目 id
      option_id: c.key,                    // ← 選項(leaf) id，如不需要可刪掉這行
      label: c.label,
    }))
  }), [chips]);

  return (
    <View style={styles.root}>
      <Text style={[styles.sectionTitle, { marginTop: 4 }]}>{selectedTitle}</Text>

      {/* 選擇結果 chips */}
      <View style={styles.chipsWrap}>
        {chips?.selected_questions?.length > 0 ? (
          chips.selected_questions.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              onRemove={() => removeChip(c.key)}
              onInputChange={(v) => onChipInputChange?.(c.key, v)}
            />
          ))
        ) : (
          <Text style={{ color: '#999', marginTop: 8 }}>尚未選擇題目/選項</Text>
        )}
      </View>

      {/* Step 0：題目清單 */}
      <View
        style={{ display: step === 0 ? 'flex' : 'none' }}
        pointerEvents={step === 0 ? 'auto' : 'none'}
      >
        <>
          <FlatList
            data={RAW_QUESTIONS}
            keyExtractor={(item: any) => String(item.id)}
            renderItem={({ item, index }) => {
              if (item?.last_version?.question_type_setting?.value !== selectedQuesType) {
                return null;
              }
              return (
                <LlStatisticsQuestionCard001
                  key={item.id}
                  checkboxVisible={true}
                  checked={hasAnyChipUnderQuestion(String(item.id))}
                  checkboxOnPress={(e: any) => {
                    // 「single-choice」為多層選單 → 進入多選
                    if (e.last_version?.question_type_setting?.value === 'single-choice') {
                      handleMultiToggleQuestion(e);
                    } else {
                      // 其他型別（數值/日期…）仍為「題目級」單顆 chip
                      handleToggleQuestion(e);
                    }
                  }}
                  onPress={() => { }}
                  style={{ marginTop: 8 }}
                  no={index + 1}
                  answer={item}
                  title={`${item.title} ${section?.id}`}
                  score={item.score}
                />
              );
            }}
          />

          {multiToggleOpen && (
            <WsStateMultiLevelToggle
              multiple
              visible={multiToggleOpen}
              title={pendingQuestion?.title || '選擇選項'}
              items={multiToggleTree}
              requireLeafSelect={true}
              autoConfirmOnLeaf={false}
              // 不受控預選，避免沒 onChange 時無法互動
              defaultValue={choiceIdsByQuestion[String(pendingQuestion?.id)] ?? []}
              onCancel={() => {
                setMultiToggleOpen(false);
                setPendingQuestion(null);
                setMultiToggleTree([]);
              }}
              onConfirm={({ selectedIds = [], pathIdsList = [] }) => {
                if (!pendingQuestion) {
                  setMultiToggleOpen(false);
                  return;
                }
                const qid = String(pendingQuestion.id);

                // 記住此題目前勾選的葉節點（純 option/leaf ids）
                setChoiceIdsByQuestion(prev => ({ ...prev, [qid]: selectedIds }));

                updateChips(prev => {
                  // 先移除「上一輪此題」的 chips（question_id === qid 或 key 在上一輪 leafIds 中）
                  const prevLeafIds = new Set((choiceIdsByQuestion[qid] ?? []).map(String));
                  const base = (prev?.selected_questions ?? []).filter(c =>
                    c.question_id !== qid && !prevLeafIds.has(String(c.key))
                  );

                  // 清空 → 返回 base（等於刪光這題 chips）
                  if (selectedIds.length === 0) {
                    return { selected_questions: base };
                  }

                  // 逐個葉節點生成 chip：key=leafId，另存 question_id
                  const nextChips: ChipItem[] = selectedIds.map((leafId, idx) => {
                    const idsPath = pathIdsList[idx] ?? [leafId];
                    const text = pathLabels(multiToggleTree, idsPath).join(' / ');
                    return {
                      key: String(leafId),                        // ✅ 只放葉 id
                      label: `${pendingQuestion.title}：${text}`,
                      question_id: qid,                           // ✅ 題目 id 另存欄位
                    };
                  });

                  return { selected_questions: [...base, ...nextChips] };
                });

                setMultiToggleOpen(false);
                setPendingQuestion(null);
                setMultiToggleTree([]);
              }}
            />
          )}
        </>
      </View>

      {/* Step 1：公式區 */}
      <View
        style={{ display: step === 1 ? 'flex' : 'none' }}
        pointerEvents={step === 1 ? 'auto' : 'none'}
      >
        <WsPaddingContainer
          padding={0}
          style={{
            marginTop: 8,
            backgroundColor: $color.white,
            borderRadius: 10,
          }}
        >
          <RelationshipFormulaBlock
            onPreviewAndDeleteData={setModalVisibleSourceData}
            onEdit={() => { }}
            onDelete={() => { }}
            chips={chipsForFormula}
            statisticsId={statisticsId}
            sectionId={section?.id}
          />
        </WsPaddingContainer>
      </View>
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#d9dbe2',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 8
  },
  chipPrefix: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e6eef6', alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  chipPrefixTxt: { color: '#0b5aaa', fontSize: 12 },
  chipLabel: {
    color: '#111',
    maxWidth: Dimensions.get('window').width * 0.7,
    paddingHorizontal: 8
  },
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
