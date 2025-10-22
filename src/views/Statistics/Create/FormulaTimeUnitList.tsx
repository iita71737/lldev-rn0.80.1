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
  ScrollView
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
}: Props) {
  const { t } = useTranslation();

  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)
  const [formulaData, setFormulaData] = useState<any>(null);

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
    ({ item, index }: { item: FormulaRule; index: number }) => (
      <View style={styles.item}>
        {/* 上：公式名稱 + 表達式（整塊可點進編輯） */}
        <TouchableOpacity
          style={[styles.exprBox, expressionBoxStyle]}
          onPress={() => onEditFormula?.(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.exprText} numberOfLines={2}>
            公式名稱 {index + 1} {item.expression}
          </Text>
        </TouchableOpacity>

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
              onPress={() => { }}
            />
            <WsIconBtn
              padding={0}
              style={{ marginLeft: 8 }}
              size={28}
              color={$color.danger}
              name="md-delete"
              label="刪除"
              onPress={() => { }}
            />
          </View>
        </WsFlex>

      </View>
    ),
    [expressionBoxStyle, onDelete, onPreview, onEditFormula]
  );



  const keyExtractor = useCallback((r: FormulaRule) => r.id, []);

  return (
    <>
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
        <WsIconBtn
          padding={0}
          name="md-add"
          size={24}
          style={{
          }}
          onPress={() => {
            setModalActiveFormula(!modalActiveFormula)
          }}
        />

      </View>

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
              params={[]}
              records={[]}
              uniqueKey={'key'}
              onChange={(p) =>
                setFormulaData(p)
              }
              statisticsId={statisticsId}
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

    </>
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
  item: {
    paddingVertical: 10,
    paddingHorizontal: 0,     // 視你的列表外距調整
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
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',         // 夠窄時自動換行
    alignItems: 'center',
    gap: 8,                   // RN 0.71+ 可用；若舊版改用 marginRight
    alignSelf: 'flex-start',
  },
  actionBar: { flexDirection: "row", flexWrap: "wrap" },
});
