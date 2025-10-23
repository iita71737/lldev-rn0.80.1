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
  Alert, // ⭐ 新增
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
  step
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

  /** 正規化 previewResults 的每列 → { created_at, value } */
  const normalizePreviewRow = (row: any) => {
    if (!row || typeof row !== 'object') return null;
    const created = row.created_at || row.time || row.紀錄時間 || row.日期;
    const val = Number(row?.['公式結果']);
    if (!created || !Number.isFinite(val)) return null;
    return { created_at: String(created), value: val };
  };

  /** 一次載入所有 section 的所有公式，把 params/records 建好（以 formula.id 當 key） */
  const loadAllForBuilder = useCallback(async () => {
    if (statisticsId == null || !sections.length) {
      setParamsForBuilder([]);
      setRecordsForBuilder([]);
      return;
    }
    setLoading(true);

    try {
      const params: Array<{ key: string; label: string }> = [];
      const timeSet: Set<string> = new Set();

      // formulaId -> Map<created_at, value>
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
          if (Number.isFinite(v as number)) row[fid] = v;
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
                // 本來就沒有 => 清空畫面即可
                setTimeUnitRules([]);
                return;
              }
              let obj: any = {};
              try { obj = JSON.parse(raw) ?? {}; } catch { obj = {}; }

              // 只刪除 formula_builder，其它欄位不動
              if ('formula_builder' in obj) {
                delete obj.formula_builder;
                await AsyncStorage.setItem(key, JSON.stringify(obj));
              }

              setTimeUnitRules([]);

              // 如果需要對外通知：
              onDelete?.({ id: 'timeUnit', expression: '' });
            } catch (e) {
              console.warn('刪除 timeUnit 失敗：', e);
            }
          },
        },
      ]
    );
  }, [statisticsId, t, onDelete]);

  useEffect(() => {
    loadAllForBuilder();
  }, [loadAllForBuilder]);

  useEffect(() => {
    loadTimeUnitRules();
  }, [loadTimeUnitRules]);

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
            {/* 若要開放編輯，可打開下一段 */}
            {/* <WsIconBtn
              padding={0}
              size={28}
              name="md-create"
              label="編輯"
              onPress={() => onEditFormula?.(ruleLike)}
            /> */}
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
              onPress={handleDeleteTimeUnit} // ⭐ 改為呼叫內建刪除
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
      await Promise.all([loadTimeUnitRules(), loadAllForBuilder()]);
    } catch (e) {
      console.warn('refreshNow failed:', e);
    }
  }, [loadTimeUnitRules, loadAllForBuilder]);

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

        {/* 開啟公式編輯 Modal（把 paramsForBuilder / recordsForBuilder 餵給 WsFormulaBuilder002） */}
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
           setTimeout(() => { refreshNow(); }, 0); 
        }}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>
            {/* 直接把合併好的 A/B 傳給 WsFormulaBuilder002 */}
            <WsState
              type="formula"
              style={{ marginVertical: 8 }}
              label={t('公式​')}
              placeholder={t('輸入')}
              value={formulaData?.expression}
              params={paramsForBuilder}
              records={recordsForBuilder}
              uniqueKey={'created_at'}
              onChange={(p) => setFormulaData(p)}
              statisticsId={statisticsId}
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
