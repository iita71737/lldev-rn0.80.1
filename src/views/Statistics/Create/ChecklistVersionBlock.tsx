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
  section?: { id?: string };            // ← 依使用方式調整為物件
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
  selectedTitle = '已選擇的題目',
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
  // ===== /MultiToggle =====

  // 本地 chips：給穩定初始值，避免 unmount 之後變 undefined
  const [uChips, setUChips] = React.useState<ChipsData>({ selected_questions: [] });
  const chips = cChips ?? uChips;

  // ✅ 支援物件與函式型更新（受控/不受控兩相宜）
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

  // ✅ 是否已選
  const hasChip = React.useCallback((key: string) => {
    return chips?.selected_questions?.some(c => String(c.key) === String(key));
  }, [chips]);

  // ✅ 移除 chip
  const removeChip = (k: string) => {
    if (onRemoveChip) return onRemoveChip(k);
    updateChips(prev => ({
      selected_questions: (prev?.selected_questions ?? []).filter(c => String(c.key) !== String(k))
    }));
  };

  // ✅ 防守型 Toggle：兼容 id 來源、checked/value；內部一律存 { key, label }
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
        nextList = exists ? list : [...list, { key, label }];
      } else {
        nextList = list.filter(c => String(c.key) !== key);
      }
      return { ...prev, selected_questions: nextList };
    });
  }, [section?.id, updateChips]);

  // ✅ 多層選單題目：已選則移除；未選則開 modal
  const handleMultiToggleQuestion = React.useCallback((payloadOrItem: any) => {
    const item = payloadOrItem?.id
      ? payloadOrItem
      : RAW_QUESTIONS.find((q: any) => q.id === payloadOrItem?.id);

    if (!item) return;

    const key = String(item.id);

    if (hasChip(key)) {
      updateChips(prev => ({
        selected_questions: (prev?.selected_questions ?? []).filter(c => String(c.key) !== key)
      }));
      return;
    }

    const tree = item?.last_version?.question_setting_items ?? [];
    setPendingQuestion(item);
    setMultiToggleTree(tree);
    setMultiToggleOpen(true);
  }, [hasChip, updateChips]);

  React.useEffect(() => {
    // 只在 Step 0 進行判斷
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

    // 👇 新增：上一個 step 也要是 0，才可能清空
    const stillInStep0 = prevStepRef.current === 0;

    const shouldClear =
      stillInStep0 &&           // 連續停留在 Step 0
      typeChanged &&
      bothTruthy &&
      inSameSection;

    if (shouldClear) {
      updateChips({ selected_questions: [] });
      setMultiToggleOpen(false);
      setPendingQuestion(null);
      setMultiToggleTree([]);
    }

    // 只在 Step 0 更新 ref，且忽略 undefined/null 的過渡值
    if (nextType) prevTypeRef.current = nextType;
    if (nextSectionId) prevSectionIdRef.current = nextSectionId;

    prevStepRef.current = 0;    // 標記：當前是 Step 0
  }, [selectedQuesType, section?.id, step, updateChips]);


  // ✅ 傳給公式區：此時才轉成 question_id
  const chipsForFormula = React.useMemo(() => ({
    selected_questions: (chips?.selected_questions ?? []).map(c => ({
      question_id: c.key,
      label: c.label,
    }))
  }), [chips]);

  // React.useEffect(() => { console.log('ChecklistVersionBlock MOUNT'); return () => console.log('ChecklistVersionBlock UNMOUNT'); }, []);
  // React.useEffect(() => { console.log('step changed =>', step); }, [step]);


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
          <Text style={{ color: '#999', marginTop: 8 }}>尚未選擇題目</Text>
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
                  checked={hasChip(String(item.id))}
                  checkboxOnPress={(e: any) => {
                    if (e.last_version?.question_type_setting?.value === 'single-choice') {
                      handleMultiToggleQuestion(e);
                    } else {
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
              visible={multiToggleOpen}
              title={pendingQuestion?.title || '選擇選項'}
              items={multiToggleTree}
              requireLeafSelect={true}
              autoConfirmOnLeaf={false}
              onCancel={() => {
                setMultiToggleOpen(false);
                setPendingQuestion(null);
                setMultiToggleTree([]);
              }}
              onConfirm={({ selectedItem, path, pathIds }) => {
                if (!pendingQuestion || !selectedItem) {
                  setMultiToggleOpen(false);
                  return;
                }
                const ids = path ?? pathIds ?? [selectedItem.id];
                const labels = pathLabels(multiToggleTree, ids);

                const key = String(pendingQuestion.id);
                const label = `${pendingQuestion.title}：${labels.join(' / ')}`;

                updateChips(prev => {
                  const list = (prev?.selected_questions ?? []).filter(c => String(c.key) !== key);
                  return { selected_questions: [...list, { key, label }] };
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
