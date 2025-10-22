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

// Android 啟用 LayoutAnimation
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
}: Props) {
  const { t } = useTranslation();

  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)
  const [formulaData, setFormulaData] = useState<any>(null);
  const [list, setList] = useState<FormulaItem[]>(() => {
    return [
      // {
      //   id: "f1",
      //   name: "公式名稱 1",
      //   formulaString: "A-B",
      //   chips,
      //   expanded: true,
      // },
      // {
      //   id: "f2",
      //   name: "公式名稱 2",
      //   formulaString: "A+B",
      //   chips,
      //   expanded: true,
      // },
      // {
      //   id: "f3",
      //   name: "公式名稱 3",
      //   formulaString: "A/B",
      //   chips,
      //   expanded: false,
      // },
    ];
  });

  // 🔹 模擬答題紀錄
  const records = useMemo(
    () => [
      {
        "紀錄時間": "2025/08/01 01:00:00",
        "調勻池pH值 v1": 7.2, // 調勻池pH值 v1
        "初級沉澱池pH值 v1": 6.8, // 初級沉澱池pH值 v1
        "混凝池（快混）-pH值 v1": 7.0, // 混凝池（快混）-pH值 v1
      },
      {
        "紀錄時間": "2025/08/01 02:00:00",
        "調勻池pH值 v1": 7.1,
        "初級沉澱池pH值 v1": 6.9,
        "混凝池（快混）-pH值 v1": 7.1,
      },
      {
        "紀錄時間": "2025/08/01 03:00:00",
        "調勻池pH值 v1": 7.3,
        "初級沉澱池pH值 v1": 7.0,
        "混凝池（快混）-pH值 v1": 7.2,
      },
    ],
    []
  );

  const renderItem = ({ item }: { item: FormulaItem }) => {
    return (
      <View style={styles.card}>
        {/* 標題列 */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {item.name}
          </Text>

          <WsFlex justifyContent={"space-between"}>
            <View style={styles.actionBar}>
              <WsIconBtn
                padding={0}
                style={{
                }}
                size={28}
                name="md-edit"
                label="編輯"
                onPress={() =>
                  // onEdit?.(item)
                  setModalActiveFormula(true)
                }
              />
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                name="ws-outline-filter-outline"
                label="瀏覽並刪除資料"
                onPress={() => onPreviewAndDeleteData?.(item)}
              />
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                color={$color.danger}
                name="md-delete"
                label="刪除"
                onPress={() => onDelete?.(item)}
              />
            </View>
          </WsFlex>
        </View>

        <View style={styles.formulaRow}>
          <Text style={styles.formula} numberOfLines={2}>
            {item.formulaString}
          </Text>
        </View>

        {/* 內容（收合） */}
        {item.expanded && (
          <View style={styles.body}>
            {/* 題目方塊 */}
            {item.chips?.selected_questions?.length > 0 ? (
              <FlatList
                data={[]}
                keyExtractor={(item, index) => item.id}
                renderItem={({ item, index }) => {
                  return (
                    <LlCheckListQuestionCard005
                      key={item.id}
                      checkboxVisible={true}
                      checkboxOnPress={(answer) => {
                      }}
                      onPress={() => {
                      }}
                      style={{
                        marginTop: 8
                      }}
                      no={index + 1}
                      answer={item}
                      title={item.title}
                      score={item.score}
                    />
                  )
                }}
                ListHeaderComponent={() => {
                  return (
                    <>
                    </>
                  )
                }}
                ListFooterComponent={
                  () => {
                    return (
                      <></>
                    )
                  }
                }
              />
            ) : (
              <Text style={styles.emptyText}>尚未選擇題目</Text>
            )}
          </View>
        )}

      </View>
    );
  };

  console.log(chips?.selected_questions, 'chips?.selected_questions--')

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
          // $_submit()
          setModalActiveFormula(false)
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
              // labelIcon={'ws-outline-edit-pencil'}
              multiline={true}
              style={{
              }}
              placeholder={t('輸入')}
              value={formulaData?.remark}
              onChange={() => { }}
            />

            <WsState
              style={{
                marginTop: 8
              }}
              modelName="checklist_record_answer"
              type="Ll_filesAndImages"
              label={t('附件')}
              // labelIcon={'md-photo'}
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
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    paddingRight: 8,
  },
  body: { paddingHorizontal: 14, paddingVertical: 12 },
  emptyText: { color: "#999", fontSize: 14, paddingVertical: 4 },
  actionBar: { flexDirection: "row", flexWrap: "wrap" },
});
