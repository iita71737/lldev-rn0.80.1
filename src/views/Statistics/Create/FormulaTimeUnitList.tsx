import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
  Alert,
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
  expression: string;
};

type SectionLike = {
  id: string | number;          // 例如 'v1' | 'v2' | 'v3'
  title?: string | React.ReactNode;
};

type Props = {
  title?: string;
  subtitle?: string;
  rules: FormulaRule[]; // (保留，但 FlatList 現在改以 timeUnitRules)
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
  step?: string | number;

  /** 時間單位（例如 'day'）；若為 'day' 會依日期聚合 */
  timeUnit?: string;
};

/** timeUnit-@dataSet 專用的顯示型別（轉成 FlatList 用） */
type TimeUnitRule = {
  id: string;                          // 固定 'timeUnit'
  name: string;                        // 顯示名稱
  expression: string;                  // displayExpression (顯示給使用者)
  realExpression?: string;             // realExpression（備用）
  previewResults?: Array<Record<string, any>>; // 可選（備用顯示/除錯）
};

export default function FormulaTimeUnitList({
  title = '點檢表名稱',
  subtitle = '單位時間內的關係公式',
  rules, // 保留，但不再用於 FlatList
  onPreview,
  onDelete,
  onCreate,
  onEditFormula,
  style,
  expressionBoxStyle,
  statisticsId,
  sections = [],
  step,
  timeUnit,
}: Props) {
  const { t } = useTranslation();

  // === timeUnit 清單（實務上通常只有 1 筆）===
  const [timeUnitRules, setTimeUnitRules] = useState<TimeUnitRule[]>([]);

  const [modalActiveFormula, setModalActiveFormula] = useState(false);
  const [formulaData, setFormulaData] = useState<any>(null);

  /** Builder 需要的兩個陣列（從各 section 的 formulas 蒐集） */
  const [paramsForBuilder, setParamsForBuilder] = useState<Array<{ key: string; label: string }>>([]);
  const [recordsForBuilder, setRecordsForBuilder] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(false);

  /** 產生儲存鍵 */
  const buildDatasetKey = useCallback(
    (statisticsId?: string | number, sectionId?: string | number) =>
      `${statisticsId}-${sectionId}-@dataSet`,
    []
  );

  /** 去除所有空白（含 NBSP）後再 trim，避免 Builder 對 label 顯示含奇怪空白 */
  const sanitizeLabel = (s: any): string =>
    String(s ?? '')
      .replace(/\u00A0/g, '')
      .replace(/\s+/g, '')
      .trim();

  /** 正規化 previewResults 的每列 → { created_at, value }（預設逐筆 scalar 模式用） */
  const normalizePreviewRow = (row: any) => {
    if (!row || typeof row !== 'object') return null;
    const created = row.created_at || row.time || row.紀錄時間 || row.日期;
    const val = Number(row?.['公式結果']);
    if (!created || !Number.isFinite(val)) return null;
    return { created_at: String(created), value: val };
  };

  /** 讀取 `${statisticsId}-timeUnit-@dataSet`，並轉為 timeUnitRules */
  const loadTimeUnitRules = useCallback(async () => {
    if (statisticsId == null) {
      setTimeUnitRules([]);
      return;
    }
    try {
      const key = `${statisticsId}-timeUnit-@dataSet`;
      const raw = await AsyncStorage.getItem(key);
      const ds = raw ? JSON.parse(raw) : null;

      // 預期格式：{ formula_builder: { displayExpression, realExpression, previewResults, ... } }
      const fb = ds?.formula_builder;
      if (fb && (typeof fb.displayExpression === 'string' || typeof fb.realExpression === 'string')) {
        const one: TimeUnitRule = {
          id: 'timeUnit',
          name: '公式名稱',
          expression: String(fb.displayExpression ?? ''),
          realExpression: String(fb.realExpression ?? ''),
          previewResults: Array.isArray(fb.previewResults) ? fb.previewResults : [],
        };
        setTimeUnitRules([one]);
      } else {
        setTimeUnitRules([]);
      }
    } catch (err) {
      console.warn('讀取 timeUnit @dataSet 失敗：', err);
      setTimeUnitRules([]);
    }
  }, [statisticsId]);

  /** 依「天」做聚合：把各 section 的 formulas.previewResults 以 YYYY-MM-DD 分組，組出 params/records */
  const preprocessAllSectionsByDay = useCallback(async () => {
    if (statisticsId == null || !sections.length) {
      setParamsForBuilder([]);
      setRecordsForBuilder([]);
      return;
    }

    setLoading(true);
    try {
      // 先把所有 section 的 formulas 與其 rows 讀出來
      type F = { id: string; name: string; rows: Array<Record<string, any>> };
      const allFormulas: F[] = [];

      for (const s of sections) {
        const sid = String(s.id);
        const key = buildDatasetKey(statisticsId, sid);
        const raw = await AsyncStorage.getItem(key);
        const ds = raw ? JSON.parse(raw) : null;
        const formulas: any[] = Array.isArray(ds?.formulas) ? ds.formulas : [];
        if (!formulas.length) continue;

        for (const f of formulas) {
          const fid = String(f?.id ?? '');
          if (!fid) continue;
          const name = sanitizeLabel(f?.name ?? f?.displayText ?? fid);
          const rows: any[] = Array.isArray(f?.previewResults) ? f.previewResults : [];
          allFormulas.push({ id: fid, name, rows });
        }
      }

      // params：所有公式（id/name）
      const params = allFormulas.map(f => ({ key: f.id, label: f.name }));

      // 用 dayKey => 每天一筆 record
      const dayMap: Map<string, Record<string, any>> = new Map();

      // 走過每條公式，把該公式 rows 依天整理成陣列
      for (const f of allFormulas) {
        for (const r of f.rows) {
          const createdAt = String(r?.created_at ?? r?.time ?? '');
          if (!createdAt) continue;
          const dayKey = createdAt.slice(0, 10); // 'YYYY-MM-DD'

          // 取出此列的「數值欄位」，排除 created_at 和 公式結果
          const values: number[] = [];
          for (const [k, v] of Object.entries(r)) {
            if (k === 'created_at' || k === '公式結果') continue;
            const num = Number(v);
            if (Number.isFinite(num)) values.push(num);
          }

          // 取/設此天的聚合物件
          const rec = dayMap.get(dayKey) ?? { created_at: dayKey };
          // 把該天、該 formula.id 的數值 push（同一天可能有多列）
          const existed = Array.isArray((rec as any)[f.id]) ? (rec as any)[f.id] : [];
          (rec as any)[f.id] = existed.concat(values);
          dayMap.set(dayKey, rec);
        }
      }

      // 排序天數（字串排序 YYYY-MM-DD 可用）
      const records = Array.from(dayMap.keys())
        .sort((a, b) => a.localeCompare(b))
        .map(day => dayMap.get(day)!);

      setParamsForBuilder(params);
      setRecordsForBuilder(records);
    } catch (err) {
      console.warn('以天聚合 sections/formulas 失敗：', err);
      setParamsForBuilder([]);
      setRecordsForBuilder([]);
    } finally {
      setLoading(false);
    }
  }, [statisticsId, sections, buildDatasetKey]);

  /** 舊的逐時序（每列一筆 scalar 值）合併：非 day 時使用 */
  const preprocessAllSectionsDefault = useCallback(async () => {
    if (statisticsId == null || !sections.length) {
      setParamsForBuilder([]);
      setRecordsForBuilder([]);
      return;
    }
    setLoading(true);

    try {
      const params: Array<{ key: string; label: string }> = [];
      const timeSet: Set<string> = new Set();
      const mapByFormulaId: Record<string, Map<string, number>> = {};

      for (const s of sections) {
        const sid = String(s.id);
        const key = buildDatasetKey(statisticsId, sid);
        const raw = await AsyncStorage.getItem(key);
        const ds = raw ? JSON.parse(raw) : null;
        const formulas: any[] = Array.isArray(ds?.formulas) ? ds.formulas : [];
        if (!formulas.length) continue;

        for (const f of formulas) {
          const fid = String(f?.id ?? '');
          if (!fid) continue;

          const nameOnly = sanitizeLabel(f?.name ?? f?.displayText ?? fid);
          params.push({ key: fid, label: nameOnly });

          const list: any[] = Array.isArray(f?.previewResults) ? f.previewResults : [];
          const m = new Map<string, number>();
          for (const row of list) {
            const norm = normalizePreviewRow(row);
            if (!norm) continue;
            m.set(norm.created_at, norm.value);
            timeSet.add(norm.created_at);
          }
          mapByFormulaId[fid] = m;
        }
      }

      const timeArr = Array.from(timeSet).sort((a, b) => a.localeCompare(b));

      const records = timeArr.map(created_at => {
        const row: Record<string, any> = { created_at };
        Object.entries(mapByFormulaId).forEach(([fid, m]) => {
          const v = m.get(created_at);
          if (Number.isFinite(v as number)) (row as any)[fid] = v;
        });
        return row;
      });

      setParamsForBuilder(params);
      setRecordsForBuilder(records);
    } catch (err) {
      console.warn('載入 sections/formulas 失敗：', err);
      setParamsForBuilder([]);
      setRecordsForBuilder([]);
    } finally {
      setLoading(false);
    }
  }, [sections, statisticsId, buildDatasetKey]);

  /** 刪除 `${statisticsId}-timeUnit-@dataSet` 裡的 formula_builder */
  const handleDeleteTimeUnit = useCallback(() => {
    if (statisticsId == null) return;

    Alert.alert(
      t('刪除確認'),
      t('確定要刪除這個單位時間公式嗎？此操作無法復原。'),
      [
        { text: t('取消'), style: 'cancel' },
        {
          text: t('刪除'),
          style: 'destructive',
          onPress: async () => {
            try {
              const key = `${statisticsId}-timeUnit-@dataSet`;
              const raw = await AsyncStorage.getItem(key);
              if (!raw) {
                setTimeUnitRules([]);
                return;
              }
              let obj: any = {};
              try { obj = JSON.parse(raw) ?? {}; } catch { obj = {}; }

              if ('formula_builder' in obj) {
                delete obj.formula_builder;
                await AsyncStorage.setItem(key, JSON.stringify(obj));
              }

              setTimeUnitRules([]);
              onDelete?.({ id: 'timeUnit', expression: '' });
            } catch (e) {
              console.warn('刪除 timeUnit 失敗：', e);
            }
          },
        },
      ]
    );
  }, [statisticsId, t, onDelete]);

  // === 載入 ===
  useEffect(() => {
    // 1) timeUnit rule（單位時間公式本身）
    loadTimeUnitRules();

    // 2) 參數 & 資料預處理
    if (String(timeUnit).toLowerCase() === 'day') {
      preprocessAllSectionsByDay();
    } else {
      preprocessAllSectionsDefault();
    }
  }, [loadTimeUnitRules, preprocessAllSectionsByDay, preprocessAllSectionsDefault, timeUnit]);

  /** 單列渲染 timeUnit（操作按鈕放在公式名稱下方） */
  const renderTimeUnitItem = useCallback(
    ({ item, index }: { item: TimeUnitRule; index: number }) => {
      const ruleLike: FormulaRule = { id: item.id, expression: item.expression ?? '' };
      return (
        <View style={styles.item}>
          <TouchableOpacity
            style={[styles.exprBox, expressionBoxStyle]}
            onPress={() => onEditFormula?.(ruleLike)}
            activeOpacity={0.8}
          >
            <Text style={styles.exprText} numberOfLines={2}>
              {item.name} {index + 1}：{item.expression || '(尚未設定)'}
            </Text>
          </TouchableOpacity>

          <WsFlex justifyContent="flex-start" style={styles.actionsBar}>
            <WsIconBtn
              padding={0}
              size={28}
              style={{ marginLeft: 8 }}
              name="ws-outline-filter-outline"
              label="預覽"
              onPress={() => onPreview?.(ruleLike)}
            />
            <WsIconBtn
              padding={0}
              size={28}
              style={{ marginLeft: 8 }}
              color={$color.danger}
              name="md-delete"
              label="刪除"
              onPress={handleDeleteTimeUnit}
            />
          </WsFlex>
        </View>
      );
    },
    [expressionBoxStyle, onPreview, onEditFormula, handleDeleteTimeUnit]
  );

  const timeUnitKeyExtractor = useCallback((r: TimeUnitRule) => r.id, []);

  const refreshNow = useCallback(async () => {
    try {
      await loadTimeUnitRules();
      if (String(timeUnit).toLowerCase() === 'day') {
        await preprocessAllSectionsByDay();
      } else {
        await preprocessAllSectionsDefault();
      }
    } catch (e) {
      console.warn('refreshNow failed:', e);
    }
  }, [loadTimeUnitRules, preprocessAllSectionsByDay, preprocessAllSectionsDefault, timeUnit]);

  return (
    <>
      <View style={[styles.container, style]}>
        {/* 標題區 */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle}
          {loading ? '（讀取中…）' : ''}
          {!!paramsForBuilder.length && `（已彙整 ${paramsForBuilder.length} 筆）`}
        </Text>

        {/* 顯示 timeUnit 清單（通常 1 筆） */}
        <FlatList
          data={timeUnitRules}
          keyExtractor={timeUnitKeyExtractor}
          renderItem={renderTimeUnitItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        />

        {/* 開啟公式編輯 Modal（把預處理好的 params/records 餵給 WsFormulaBuilder002） */}
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
          // 外層「送出」只關閉與重整；真正寫入請在內層編輯器點「套用並關閉」
          setModalActiveFormula(false);
          setTimeout(() => { refreshNow(); }, 0);
        }}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>
            {/* 直接把預處理好的 params/records 傳給 WsFormulaBuilder002 */}
            <WsState
              type="formula"
              style={{ marginVertical: 8 }}
              label={t('公式​')}
              placeholder={t('輸入')}
              value={formulaData?.expression}
              // params={paramsForBuilder}
              // records={recordsForBuilder}
              params={
                [
                  { key: "1761199127297", label: "Summmm" },
                  { key: "1761111578360", label: "平均值值" },
                  { key: "1761111896201", label: "最大值" },
                ]}
              records={
                [
                  {
                    created_at: "2025-08-01T01:00:00+08:00",
                    "1761111578360": [1, 2, 3, 4, 5],
                    "1761111896201": [2, 3, 4, 5, 6],
                    "1761199127297": [3, 4, 5, 6, 7],
                  }
                ]}
              uniqueKey={'created_at'}
              onChange={(p) => setFormulaData(p)}
              statisticsId={statisticsId}
              sectionId="timeUnit"   // ★★★ 關鍵：統一寫入 ${statisticsId}-timeUnit-@dataSet
              step={step}
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
              onChange={() => { }}
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
