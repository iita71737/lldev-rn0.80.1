import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';
import {
  WsIconBtn,
  WsFlex,
  LlCheckListQuestionCard005,
  WsAccordion,
  WsText
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { DEMO_CHECKLIST_QUESTIONS, ChecklistItem } from './mock/checklistQuestions';

// Android 啟用 LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** ==== 型別 ==== */
type FormulaItem = {
  id: string;
  name: string;
  formulaString: string;                // 公式名稱（例：公式名稱 1 (A - B) + (C - D) + E）
  chips: string[];               // 題目方塊（例：['A. 題目1','B. 題目2',...]）
  expanded?: boolean;            // 是否展開
};

type Props = {
  data?: FormulaItem[];
  onEdit?: (f: FormulaItem) => void;
  onPreviewAndDeleteData?: (f: FormulaItem) => void;
  onDelete?: (f: FormulaItem) => void;
};

/** ==== 假資料（可替換成你的 API 回傳） ==== */
const DEFAULT_DATA: FormulaItem[] = [
  {
    id: 'f1',
    name: '公式名稱 1',
    formulaString: '（A - B） +（C - D）+ E',
    chips: DEMO_CHECKLIST_QUESTIONS,
    expanded: true,
  },
  {
    id: 'f2',
    name: '公式名稱 2  ',
    formulaString: '（A + E)',
    chips: ['A. 題目 6', 'E. 題目 3'],
    expanded: true,
  },
  {
    id: 'f3',
    name: '公式名稱 3 ',
    formulaString: ' C + E',
    chips: [],
    expanded: false,
  },
];

/** ==== 主元件 ==== */
export default function FormulaRelationsMobileDemo({
  data = DEFAULT_DATA,
  onEdit,
  onPreviewAndDeleteData,
  onDelete,
}: Props) {
  const [list, setList] = useState<FormulaItem[]>(() => data);

  const toggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setList(prev =>
      prev.map(it => (it.id === id ? { ...it, expanded: !it.expanded } : it)),
    );
  }, []);

  const move = useCallback((id: string, dir: 'up' | 'down') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setList(prev => {
      const idx = prev.findIndex(x => x.id === id);
      if (idx < 0) return prev;
      const target = dir === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[idx];
      next[idx] = next[target];
      next[target] = tmp;
      return next;
    });
  }, []);

  const renderItem = ({ item, index }: { item: FormulaItem; index: number }) => {
    const isFirst = index === 0;
    const isLast = index === list.length - 1;

    return (
      <>

        <View style={styles.card}>
          {/* 標題列 */}
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              {item.name}
            </Text>

            <WsFlex
              justifyContent={'space-between'}
              style={{
              }}
            >
              {/* 功能列（在小螢幕自動換行） */}
              <View style={styles.actionBar}>
                <WsIconBtn
                  padding={0}
                  style={{
                  }}
                  size={28}
                  name="md-edit"
                  label="編輯"
                  onPress={() => onEdit?.(item)}
                />
                <WsIconBtn
                  padding={0}
                  style={{
                    marginLeft: 8
                  }}
                  size={28}
                  name="ws-outline-filter-outline"
                  label="瀏覽並刪除資料"
                  onPress={() => onPreviewAndDeleteData?.(item)}
                />
                <WsIconBtn
                  padding={0}
                  style={{
                    marginLeft: 8
                  }}
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
              {item.chips.length > 0 ? (
                <FlatList
                  data={DEMO_CHECKLIST_QUESTIONS}
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
      </>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 12 }}>

      <WsFlex
        justifyContent={'space-between'}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8
        }}
      >
        <Text style={styles.screenTitle}>題目之間的關係公式</Text>
      </WsFlex>



      <FlatList
        data={list}
        keyExtractor={it => it.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        scrollEnabled={false} // ScrollView 外層已可捲動
      />

    </ScrollView>
  );
}

/** ==== 樣式 ==== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E6E8',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    paddingRight: 8,
  },
  formula: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    paddingRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  triBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 6,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  triBtnDisabled: {
    opacity: 0.35,
  },
  triText: {
    fontSize: 12,
    color: '#E11',
    fontWeight: '700',
  },
  triTextLarge: {
    fontSize: 14,
    color: '#E11',
    fontWeight: '800',
  },
  body: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6, // 讓左右間距看起來平均
  },
  chip: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    marginVertical: 8,
    minWidth: 120,     // 手機寬也能一致外觀
  },
  chipText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    paddingVertical: 4,
  },
  actionBar: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9DDE2',
    backgroundColor: '#FFF',
    marginRight: 8,
    marginTop: 8,
  },
  actionBtnDanger: {
    borderColor: '#F4C7C7',
    backgroundColor: '#FFF5F5',
  },
  actionBtnText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBtnTextDanger: {
    color: '#C1121F',
  },
});
