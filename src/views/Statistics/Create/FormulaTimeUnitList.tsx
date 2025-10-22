import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  WsState,
  WsModal,
  WsPaddingContainer,
  WsFlex,
  WsIconBtn
} from "@/components";
import { useTranslation } from "react-i18next";
import $color from "@/__reactnative_stone/global/color";
import AsyncStorage from '@react-native-community/async-storage';

export type FormulaRule = {
  id: string;
  expression: string; // 例如: "sum(result)"
};

type SectionLike = {
  id: string | number;          // 例如 'v1' | 'v2' | 'v3'
  title?: string | React.ReactNode;
};

type Props = {
  title?: string;                   // 預設：點檢表名稱
  subtitle?: string;                // 預設：單位時間內的關係公式
  rules: FormulaRule[];
  onPreview?: (rule: FormulaRule) => void;
  onDelete?: (rule: FormulaRule) => void;
  onCreate?: (expression: string) => void;
  onEditFormula?: (rule: FormulaRule) => void;
  style?: ViewStyle;
  pillTextStyle?: TextStyle;
  expressionBoxStyle?: ViewStyle;

  /** 讀取 localstorage key 用：`${statisticsId}-${sectionId}-@dataSet` */
  statisticsId?: string | number;

  /** 從外層傳入所有 sections（至少要有 id） */
  sections?: SectionLike[];
};

export default function FormulaTimeUnitList({
  title = '點檢表名稱',
  subtitle = '單位時間內的關係公式',
  rules,
  onPreview,
  onDelete,
  onCreate,
  onEditFormula,
  style,
  expressionBoxStyle,
  statisticsId,
  sections = [],
}: Props) {
  const { t } = useTranslation();

  const [modalActiveFormula, setModalActiveFormula] = useState(false);
  const [formulaData, setFormulaData] = useState<any>(null);

  /** ✅ 每個 section 的 A / B 結果 */
  const [perSectionParams, setPerSectionParams] = useState<Record<string, Array<{ key: string; label: string }>>>({});
  const [perSectionRecords, setPerSectionRecords] = useState<Record<string, Array<{ created_at: string; 公式結果: number }>>>({});

  /** ✅ 合併給 WsFormulaBuilder002 用 */
  const paramsForBuilder = useMemo(
    () => sections.flatMap(s => perSectionParams[String(s.id)] ?? []),
    [sections, perSectionParams]
  );
  const recordsForBuilder = useMemo(
    () => sections.flatMap(s => perSectionRecords[String(s.id)] ?? []),
    [sections, perSectionRecords]
  );

  const [loading, setLoading] = useState(false);

  /** 產生儲存鍵 */
  const buildDatasetKey = useCallback(
    (statisticsId?: string | number, sectionId?: string | number) =>
      `${statisticsId}-${sectionId}-@dataSet`,
    []
  );

  /** 正規化一列 previewResult → { created_at, 公式結果 }，不變更時區、不截斷 */
  const normalizePreviewRow = (row: any) => {
    const t = row?.created_at || row?.time || row?.紀錄時間 || row?.日期 || null;
    const v = Number(row?.['公式結果']);
    if (!t || !Number.isFinite(v)) return null;
    return { created_at: String(t), 公式結果: v };
  };

  /** 讀一個 section，做出該 section 的 A / B */
  const readOneSectionAB = useCallback(async (sectionId: string | number) => {
    if (statisticsId == null || sectionId == null) return { A: [], B: [] as any[] };

    const key = buildDatasetKey(statisticsId, sectionId);
    const raw = await AsyncStorage.getItem(key);
    const ds = raw ? JSON.parse(raw) : null;

    const formulas: any[] = Array.isArray(ds?.formulas) ? ds.formulas : [];

    // A：[{ key: formula.id, label: `[v1] Summmm` }]
    const A = formulas
      .filter(f => f?.id)
      .map(f => ({
        key: String(f.id),
        label: `[${String(sectionId)}] ${String(f?.name ?? f.id)}`
      }));

    // B：攤平所有 formulas 的 previewResults → { created_at, 公式結果 }（不聚合、不截斷時間）
    const B: Array<{ created_at: string; 公式結果: number }> = [];
    for (const f of formulas) {
      const list: any[] = Array.isArray(f?.previewResults) ? f.previewResults : [];
      for (const row of list) {
        const norm = normalizePreviewRow(row);
        if (norm) B.push(norm);
      }
    }

    return { A, B };
  }, [statisticsId, buildDatasetKey]);

  /** 載入所有 sections 的 A / B，並填入 perSection 狀態與合併結果 */
  const loadAllSectionsAB = useCallback(async () => {
    if (statisticsId == null || !sections.length) {
      setPerSectionParams({});
      setPerSectionRecords({});
      return;
    }
    setLoading(true);
    try {
      const paramsMap: Record<string, Array<{ key: string; label: string }>> = {};
      const recordsMap: Record<string, Array<{ created_at: string; 公式結果: number }>> = {};

      for (const s of sections) {
        const { A, B } = await readOneSectionAB(s.id);
        paramsMap[String(s.id)] = A;
        recordsMap[String(s.id)] = B;
      }

      setPerSectionParams(paramsMap);
      setPerSectionRecords(recordsMap);

      // 🔍 debug
      console.log('[FormulaTimeUnitList] perSectionParams:', JSON.stringify(paramsMap));
      console.log('[FormulaTimeUnitList] perSectionRecords:', JSON.stringify(recordsMap));
      console.log('[FormulaTimeUnitList] paramsForBuilder:', JSON.stringify(sections.flatMap(s => paramsMap[String(s.id)] ?? [])));
      console.log('[FormulaTimeUnitList] recordsForBuilder:', JSON.stringify(sections.flatMap(s => recordsMap[String(s.id)] ?? [])));
    } catch (err) {
      console.warn('載入 sections A/B 失敗：', err);
      setPerSectionParams({});
      setPerSectionRecords({});
    } finally {
      setLoading(false);
    }
  }, [sections, statisticsId, readOneSectionAB]);

  useEffect(() => {
    loadAllSectionsAB();
  }, [loadAllSectionsAB]);

  /** 單列渲染（操作按鈕放在公式名稱下方） */
  const renderItem = useCallback(
    ({ item, index }: { item: FormulaRule; index: number }) => (
      <View style={styles.item}>
        <TouchableOpacity
          style={[styles.exprBox, expressionBoxStyle]}
          onPress={() => onEditFormula?.(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.exprText} numberOfLines={2}>
            公式名稱 {index + 1} {item.expression}
          </Text>
        </TouchableOpacity>

        <WsFlex justifyContent="flex-start" style={styles.actionsBar}>
          <WsIconBtn
            padding={0}
            size={28}
            name="md-create"
            label="編輯"
            onPress={() => onEditFormula?.(item)}
          />
          <WsIconBtn
            padding={0}
            size={28}
            style={{ marginLeft: 8 }}
            name="ws-outline-filter-outline"
            label="預覽"
            onPress={() => onPreview?.(item)}
          />
          <WsIconBtn
            padding={0}
            size={28}
            style={{ marginLeft: 8 }}
            color={$color.danger}
            name="md-delete"
            label="刪除"
            onPress={() => onDelete?.(item)}
          />
        </WsFlex>
      </View>
    ),
    [expressionBoxStyle, onDelete, onPreview, onEditFormula]
  );

  const keyExtractor = useCallback((r: FormulaRule) => r.id, []);

  return (
    <>
      <View style={[styles.container, style]}>
        {/* 標題區 */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle}
          {loading ? '（讀取中…）' : ''}
          {!!recordsForBuilder.length && `（已彙整 ${recordsForBuilder.length} 筆 previewResults）`}
        </Text>

        {/* 快速工具列 */}
        <WsFlex style={{ marginBottom: 8, flexWrap: 'wrap' }}>
          <WsIconBtn
            padding={0}
            size={24}
            name="md-refresh"
            label="重讀所有區塊"
            onPress={loadAllSectionsAB}
          />
        </WsFlex>

        {/* 你的 rules 清單 */}
        <FlatList
          data={rules}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        />

        {/* 開啟公式編輯 Modal（會把 paramsForBuilder / recordsForBuilder 餵給 WsFormulaBuilder002） */}
        <WsIconBtn
          padding={0}
          name="md-add"
          size={24}
          onPress={() => {
            setModalActiveFormula(true);
          }}
        />
      </View>

      {/* 編輯公式與其屬性（Modal） */}
      <WsModal
        visible={modalActiveFormula}
        onBackButtonPress={() => setModalActiveFormula(false)}
        headerLeftOnPress={() => setModalActiveFormula(false)}
        headerRightOnPress={() => {
          setModalActiveFormula(false);
        }}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>
            {/* ⬇️ 直接把合併好的 A/B 傳給 WsFormulaBuilder002 */}
            <WsState
              type="formula"
              style={{ marginVertical: 8 }}
              label={t('公式​')}
              placeholder={t('輸入')}
              value={formulaData?.expression}
              params={paramsForBuilder}          // 例：[{ key: '176110...', label: '[v1] Summmm' }, ...]
              records={recordsForBuilder}        // 例：[{ created_at:'2025-08-01T01:00:00+08:00', 公式結果:21 }, ...]
              uniqueKey={'created_at'}
              onChange={(p) => setFormulaData(p)}
              statisticsId={statisticsId}
            />

            <WsState
              style={{ marginVertical: 8 }}
              label={t('公式名稱')}
              placeholder={t('輸入')}
              value={formulaData?.name}
              onChange={(name: string) =>
                setFormulaData((prev: any) => ({ ...prev, name }))
              }
            />

            <WsState
              style={{ marginVertical: 8 }}
              label={t('結果欄位名稱')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldName}
              onChange={(resultFieldName: string) =>
                setFormulaData((prev: any) => ({ ...prev, resultFieldName }))
              }
            />

            <WsState
              style={{ marginVertical: 8 }}
              label={t('結果單位')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldUnit}
              onChange={(resultFieldUnit: string) =>
                setFormulaData((prev: any) => ({ ...prev, resultFieldUnit }))
              }
            />

            <WsState
              label={t('備註')}
              multiline={true}
              placeholder={t('輸入')}
              value={formulaData?.remark}
              onChange={(remark: string) =>
                setFormulaData((prev: any) => ({ ...prev, remark }))
              }
            />

            <WsState
              style={{ marginTop: 8 }}
              modelName="checklist_record_answer"
              type="Ll_filesAndImages"
              label={t('附件')}
              value={formulaData?.images}
              onChange={() => {}}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
  },

  title: {
    fontSize: 18,
    color: '#111',
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#4f5561',
    marginBottom: 10,
  },

  item: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  exprBox: {
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  exprText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },

  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});
