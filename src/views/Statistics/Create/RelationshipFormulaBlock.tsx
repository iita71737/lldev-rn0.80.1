import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  UIManager,
  ScrollView,
} from "react-native";
import {
  WsIconBtn,
  WsFlex,
  LlCheckListQuestionCard005,
  WsState,
  WsModal,
  WsPaddingContainer
} from "@/components";
import $color from "@/__reactnative_stone/global/color";
import { useTranslation } from "react-i18next";
import { records } from "./mock/records";
import AsyncStorage from '@react-native-community/async-storage';

/** ==== 型別 ==== */
type FormulaItem = {
  id: string;
  name: string;
  formulaString: string;
  chips: {
    question_id: string;
    label: string;
    title?: string;
    score?: number;
  }[];
  expanded?: boolean;
  formula_used_params?: Array<{ key: string; label?: string; customLabel?: string }>;
};

type Props = {
  data?: FormulaItem[];
  onEdit?: (f: FormulaItem) => void;
  onPreviewAndDeleteData?: (f: FormulaItem) => void;
  onDelete?: (f: FormulaItem) => void;
  chips?: {
    question_id: string;
    label: string;
    title?: string;
    score?: number;
  }[];
};

/** ==== 主元件 ==== */
export default function FormulaRelationsMobileDemo({
  data,
  onEdit,
  onPreviewAndDeleteData,
  onDelete,
  chips,
  statisticsId,
  sectionId
}: Props) {
  const { t } = useTranslation();

  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)
  const [formulaData, setFormulaData] = useState<any>(null);
  const [list, setList] = useState<FormulaItem[]>(() => {
    return [
    ];
  });

  // console.log(JSON.stringify(list),'list--')

  // 取代你的 $_submit
  const $_submit = async () => {
    if (!statisticsId || !sectionId) {
      console.warn("缺少 statisticsId 或 sectionId，無法儲存。");
      return;
    }

    const storageKey = `${statisticsId}-${sectionId}-@dataSet`;
    const nowIso = new Date().toISOString();

    try {
      // 1) 取出同一把 key 的整個物件
      const raw = await AsyncStorage.getItem(storageKey);
      let obj: any = {};
      if (raw) {
        try { obj = JSON.parse(raw) ?? {}; } catch { obj = {}; }
      }

      // 2) 從 formula_builder 取出 display/real/preview
      const FORMULA_FIELD = "formula_builder";
      const fb = obj?.[FORMULA_FIELD];
      const displayText = typeof fb?.displayExpression === "string" ? fb.displayExpression : "";
      const expression = typeof fb?.realExpression === "string" ? fb.realExpression : "";
      const previewResultsFromFB = Array.isArray(fb?.previewResults) ? fb.previewResults : [];
      const usedParamsFromFB = Array.isArray(fb?.formula_used_params) ? fb.formula_used_params : [];

      // 3) 用本步頁面的欄位 + 公式欄位，組成一筆要追加/覆蓋的 formula
      const newFormula = {
        id: formulaData?.id ?? `${Date.now()}`,
        name: formulaData?.name ?? "",
        expression,
        displayText,
        previewResults: previewResultsFromFB,
        resultFieldName: formulaData?.resultFieldName ?? "",
        resultFieldUnit: formulaData?.resultFieldUnit ?? "",
        remark: formulaData?.remark ?? "",
        images: formulaData?.images ?? [],
        createdAt: formulaData?.createdAt ?? nowIso,
        updatedAt: nowIso,
        // ★ 關鍵：把用到的參數直接存進每一筆 formula
        formula_used_params: usedParamsFromFB,
      };

      // 4) 讀出既有 formulas（若沒有就空陣列），同 id 覆蓋、否則追加
      const prevFormulas: any[] = Array.isArray(obj.formulas) ? obj.formulas : [];
      const idx = prevFormulas.findIndex(f => f?.id === newFormula.id);
      let nextFormulas: any[];
      if (idx >= 0) {
        nextFormulas = [...prevFormulas];
        nextFormulas[idx] = { ...prevFormulas[idx], ...newFormula };
      } else {
        nextFormulas = [...prevFormulas, newFormula];
      }

      // 5) 合併回去（保留 selected_questions 等其餘欄位）
      const next = { ...obj, formulas: nextFormulas };
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));

      console.log("✅ 已追加/更新公式：", JSON.stringify(next));

      // 6) （可選）即時更新列表 UI
      setList(curr => {
        const pos = curr.findIndex(it => it.id === newFormula.id);
        if (pos >= 0) {
          const cloned = [...curr];
          cloned[pos] = {
            ...cloned[pos],
            name: newFormula.name,
            formulaString: newFormula.displayText || newFormula.expression,
            // ★ 這裡改成用 newFormula 上的欄位
            formula_used_params: newFormula.formula_used_params || [],
          };
          return cloned;
        }
        return [
          ...curr,
          {
            id: newFormula.id,
            name: newFormula.name || `公式 ${nextFormulas.length}`,
            formulaString: newFormula.displayText || newFormula.expression,
            chips: [],
            expanded: false,
            // ★ 新增
            formula_used_params: newFormula.formula_used_params || [],
          }
        ];
      });

      // 關閉編輯 Modal
      setModalActiveFormula(false);
    } catch (err) {
      console.warn("❌ 儲存公式失敗：", err);
    }
  };

  // 刪除
  const handleDelete = async (target: FormulaItem) => {
    // 先刪除畫面上的列表
    setList(curr => curr.filter(it => it.id !== target.id));

    // （可選）同步刪掉 localStorage 裡的那筆公式
    try {
      if (!statisticsId || !sectionId) return;
      const storageKey = `${statisticsId}-${sectionId}-@dataSet`;
      const raw = await AsyncStorage.getItem(storageKey);
      const obj = raw ? JSON.parse(raw) : {};
      const prevFormulas: any[] = Array.isArray(obj.formulas) ? obj.formulas : [];
      const nextFormulas = prevFormulas.filter(f => f?.id !== target.id);
      await AsyncStorage.setItem(storageKey, JSON.stringify({ ...obj, formulas: nextFormulas }));
    } catch (err) {
      console.warn("刪除公式（localStorage）失敗：", err);
    }
  };



  const renderItem = ({ item }: { item: FormulaItem }) => {
    return (
      <View style={styles.card}>
        {/* 標題列 */}
        <Text
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
          }}
        >
          {`公式名稱:`}
        </Text>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {`${item.name}`}
          </Text>

          <WsFlex justifyContent={"space-between"}>
            <View style={styles.actionBar}>
              {/* <WsIconBtn
                padding={0}
                style={{
                }}
                size={28}
                name="md-edit"
                label="編輯"
                onPress={() =>
                  setModalActiveFormula(true)
                }
              /> */}
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                name="ws-outline-filter-outline"
                label="瀏覽並刪除資料"
                onPress={() => onPreviewAndDeleteData(true)}
              />
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                color={$color.danger}
                name="md-delete"
                label="刪除"
                onPress={() => handleDelete(item)}
              />
            </View>
          </WsFlex>
        </View>


        <Text
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
          }}
        >
          {`公式:`}
        </Text>
        <View style={styles.formulaRow}>
          <Text style={styles.formula} numberOfLines={2}>
            {item.formulaString}
          </Text>
        </View>

        {/* 內容（收合） */}
        {Array.isArray(item.formula_used_params) && item.formula_used_params.length > 0 && (
          <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={{ color: "#0d0d0dff", marginBottom: 4 }}>使用的參數：</Text>
            {item.formula_used_params.map((p, i) => (
              <Text key={`${item.id}-p-${p.key}-${i}`} style={{ fontSize: 12, color: "#333" }}>
                • {p.customLabel || p.label}
              </Text>
            ))}
          </View>
        )}

      </View>
    );
  };


  React.useEffect(() => {
    (async () => {
      if (!statisticsId || !sectionId) return;
      const storageKey = `${statisticsId}-${sectionId}-@dataSet`;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        const obj = raw ? JSON.parse(raw) : {};
        const arr: any[] = Array.isArray(obj.formulas) ? obj.formulas : [];
        setList(arr.map(f => ({
          id: String(f.id),
          name: String(f.name || ""),
          formulaString: String(f.displayText || f.expression || ""),
          chips: [],
          expanded: false,
          formula_used_params: Array.isArray(f.formula_used_params) ? f.formula_used_params : [],
        })));
      } catch (e) {
        console.warn("載入 formulas 失敗：", e);
      }
    })();
  }, [statisticsId, sectionId]);


  // console.log('qs : ',chips?.selected_questions)
  // console.log('records: ', records)


  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 12 }}
    >
      <WsFlex
        justifyContent={"space-between"}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Text style={styles.screenTitle}>題目之間的關係公式</Text>
      </WsFlex>

      <FlatList
        data={list}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        scrollEnabled={false}
      />

      <WsIconBtn
        name="md-add"
        size={24}
        style={{
        }}
        onPress={() => {
          setModalActiveFormula(!modalActiveFormula)
        }}
      />

      {/* 編輯公式語公式名稱 */}
      <WsModal
        visible={modalActiveFormula}
        onBackButtonPress={() => {
          setModalActiveFormula(false)
        }}
        headerLeftOnPress={() => {
          setModalActiveFormula(false)
        }}
        headerRightOnPress={() => {
          $_submit()
          // setModalActiveFormula(false)
        }}
        // RightOnPressIsDisabled={$_validation()}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>

            <WsState
              type="formula"
              style={{
                marginVertical: 8,
              }}
              label={t('公式​')}
              placeholder={t('輸入')}
              value={formulaData?.expression}
              params={chips?.selected_questions}
              records={records}
              uniqueKey={'key'}
              onChange={(p) =>
                setFormulaData(p)
              }
              statisticsId={statisticsId}
              sectionId={sectionId}
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('公式名稱')}
              placeholder={t('輸入')}
              value={formulaData?.name}
              onChange={
                (name: string) => setFormulaData((prev) => ({ ...prev, name }))
              }
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('結果欄位名稱')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldName}
              onChange={(resultFieldName: string) => {
                setFormulaData((prev) => ({ ...prev, resultFieldName }))
              }}
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('結果單位')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldUnit}
              onChange={(resultFieldUnit: string) => {
                setFormulaData((prev) => ({ ...prev, resultFieldUnit }))
              }}
            />

            <WsState
              label={t('備註')}
              multiline={true}
              style={{
              }}
              placeholder={t('輸入')}
              value={formulaData?.remark}
              onChange={(remark: string) => {
                setFormulaData((prev) => ({ ...prev, remark }))
              }}
            />

            <WsState
              style={{
                marginTop: 8
              }}
              modelName="checklist_record_answer"
              type="Ll_filesAndImages"
              label={t('附件')}
              value={formulaData?.images}
              onChange={() => {
              }}
            />

          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

    </ScrollView>
  );
}

/** ==== 樣式 ==== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 14, fontWeight: "500" },
  card: {
    marginHorizontal: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E6E8",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  formula: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    paddingRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    paddingRight: 8,
  },
  body: { paddingHorizontal: 14, paddingVertical: 12 },
  emptyText: { color: "#999", fontSize: 14, paddingVertical: 4 },
  actionBar: { flexDirection: "row", flexWrap: "wrap" },
});
