import {
  DndProvider,
  Draggable,
  Droppable,
  DndProviderProps,
} from "@mgcrea/react-native-dnd";
import React, { type FunctionComponent, useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Dimensions,
  ScrollView,
  Pressable
} from "react-native";
import {
  GestureHandlerRootView,
  State,
  PanGestureHandler
} from "react-native-gesture-handler";
import $color from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon
} from '@/components'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedRef,
  useAnimatedScrollHandler,
  scrollTo,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next'

type ItemProps = {
  id: string;
  name: string;
  sequence: string;
  parent_article_version_id: string | null
};

export const DraggableList: FunctionComponent<{ items: ItemProps[], setInitSequencePayload: (payload: any) => void }> = ({ items, setInitSequencePayload }) => {
  const { height: screenHeight, width } = Dimensions.get("window");
  const { t, i18n } = useTranslation()

  const itemLayouts = useRef<{ [id: string]: number }>({}).current;
  const onItemLayout = (id: string) => (e: LayoutChangeEvent) => {
    itemLayouts[id] = e.nativeEvent.layout.y;
  };


  // STATES：使用 _items 存放目前最新的排序資料
  const [_items, setItems] = useState<ItemProps[]>(items);
  const [selectedItems, setSelectedItems] = useState<ItemProps[]>([]);
  const [hoverItem, setHoverItem] = useState<string | null>(null);

  const itemsSV = useSharedValue<ItemProps[]>(items);
  const [listKey, setListKey] = useState(Date.now()); // refresh

  const [hoverPositionState, setHoverPositionState] = useState<'child' | 'sibling' | null>(null);
  const hoverPosition = useSharedValue<'child' | 'sibling' | null>(null);


  // 使用 SharedValue 來控制拖曳動畫
  const isDragging = useSharedValue(false);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: dragX.value,
    top: dragY.value,
    opacity: isDragging.value ? 1 : 0,
    transform: [{ translateX: 0 }, { translateY: -100 }],
  }));

  // 建立 Animated ScrollView ref 與滾動偏移的 shared value
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);

  // 使用 useAnimatedScrollHandler 監控 ScrollView 的滾動
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });
  // 持續監控拖曳的 dragY 值，當接近邊界時自動滾動
  useAnimatedReaction(
    () => dragY.value,
    (currentDragY) => {
      const threshold = 80; // 當拖曳物件距離螢幕邊緣小於 80 像素時觸發
      const headerHeight = 100
      const scrollSpeed = 5; // 每次滾動的距離（可依需求調整）
      // 向上滾動（拖曳物件接近上邊緣）
      if (currentDragY - headerHeight < threshold) {
        scrollOffset.value = Math.max(scrollOffset.value - scrollSpeed, 0);
        scrollTo(scrollViewRef, 0, scrollOffset.value, false);
      }
      // 向下滾動（拖曳物件接近下邊緣）
      else if (currentDragY > screenHeight - threshold) {
        scrollOffset.value = scrollOffset.value + scrollSpeed;
        scrollTo(scrollViewRef, 0, scrollOffset.value, false);
      }
    }
  );


  // 排序用函式，邏輯保持不變
  const sortOrderPayload = (payload: { order: any[] }) => {
    const originalOrder = payload.order;
    const childrenMap: { [key: string]: any[] } = {};
    originalOrder.forEach(item => {
      const p = item.parentId; // 父層 id (null 表示頂層)
      if (!childrenMap[p]) {
        childrenMap[p] = [];
      }
      childrenMap[p].push(item);
    });
    const assignSequences = (parentId: any, parentSequence: string) => {
      const children = childrenMap[parentId] || [];
      children.forEach((child, index) => {
        const newSeq = parentSequence
          ? `${parentSequence}-${(index + 1).toString().padStart(4, '0')}`
          : (index + 1).toString().padStart(4, '0');
        child.sequence = newSeq;
        assignSequences(child.id, newSeq);
      });
    };
    assignSequences(null, '');
    return { order: originalOrder };
  };

  // helper：重新排序，修改後使用 item.id 作為查找依據
  const reorderItemWithMode = (
    activeId: string,
    targetId: string,
    mode: ReorderMode
  ) => {
    setItems(prevItems => {
      if (activeId === targetId) return prevItems;

      const modelsCopy = JSON.parse(JSON.stringify(prevItems));
      const selectedItem = modelsCopy.find(item => item.id === activeId);
      const targetItem = modelsCopy.find(item => item.id === targetId);
      if (!selectedItem || !targetItem) return prevItems;

      // 防止把 item 拖到自己的子樹中
      if (
        targetItem.sequence.startsWith(selectedItem.sequence) &&
        targetItem.sequence !== selectedItem.sequence
      ) {
        return prevItems;
      }

      const subtreeItems = modelsCopy.filter(item =>
        item.sequence.startsWith(selectedItem.sequence)
      );
      const remaining = modelsCopy.filter(
        item => !item.sequence.startsWith(selectedItem.sequence)
      );

      // 設定父層 ID
      if (mode === 'child') {
        subtreeItems.forEach(item => {
          if (item.id === selectedItem.id) {
            item.parent_article_version_id = targetItem.id;
          }
        });
      } else if (mode === 'sibling') {
        const targetParentId = targetItem.parent_article_version_id || null;
        subtreeItems.forEach(item => {
          if (item.id === selectedItem.id) {
            item.parent_article_version_id = targetParentId;
          }
        });
      }

      // 插入到目標項目後方
      const targetIndex = remaining.findIndex(item => item.id === targetItem.id);
      if (targetIndex === -1) {
        remaining.push(...subtreeItems);
      } else {
        remaining.splice(targetIndex + 1, 0, ...subtreeItems);
      }

      // API 格式轉換並重排 sequence
      const transformToApiFormat = (data: any[]) => ({
        order: data.map(item => ({
          id: item.id,
          sequence: item.sequence,
          parentId: item.parent_article_version_id || null,
          type: item.type
        })),
      });
      const apiPayload = transformToApiFormat(remaining);
      const newPayload = sortOrderPayload(apiPayload);
      setInitSequencePayload(newPayload);

      newPayload.order.forEach(orderItem => {
        const target = modelsCopy.find(item => item.id === orderItem.id);
        if (target) {
          target.sequence = orderItem.sequence;
          target.parent_article_version_id = orderItem.parentId;
        }
      });

      modelsCopy.sort((a, b) => a.sequence.localeCompare(b.sequence));
      setListKey(Date.now());
      return modelsCopy;
    });
  };

  // handleDragEnd 保持不變，改用新的 id（字串形式）
  const handleDragEnd: DndProviderProps["onDragEnd"] = ({ active, over }) => {
    "worklet";
    if (over) {
      isDragging.value = false; // 確保動畫結束
      runOnJS(reorderItemWithMode)(active.id, over.id, hoverPosition.value);
    }
  };

  // handleBegin：使用 _items 取得最新狀態，並根據拖曳項目的 sequence 過濾所有子層（包含自己）
  const handleBegin: DndProviderProps["onBegin"] = (event, meta) => {
    "worklet";;
    isDragging.value = true;
    dragX.value = withSpring(event.absoluteX + 10);
    dragY.value = withSpring(event.absoluteY);

    // 🔁 改用 _items 而不是 SharedValue
    const latestItems = JSON.parse(JSON.stringify(itemsSV.value));

    // 📦 避免錯誤的 sequence
    const draggedItem = latestItems.find(item => item.id === meta.activeId);
    if (!draggedItem) return;

    // 🧠 用 sequence 精準抓子項
    const selectedList = latestItems.filter(item =>
      item.sequence?.startsWith(draggedItem.sequence)
    );
    selectedList.sort((a, b) => a.sequence.localeCompare(b.sequence));
    runOnJS(setSelectedItems)(selectedList);
  };


  // handleUpdate 保持不變
  const handleUpdate: DndProviderProps["onUpdate"] = (event, meta) => {
    "worklet";
    dragX.value = withSpring(event.absoluteX);
    dragY.value = withSpring(event.absoluteY);

    const isMoveAsChild = meta?.activeLayout?.x > 0;
    const isMoveAsSibling = meta?.activeLayout?.x <= 0;

    hoverPosition.value = isMoveAsChild ? 'child' : 'sibling';

    runOnJS(setHoverItem)(meta?.droppableActiveId ?? null);
    runOnJS(setHoverPositionState)(hoverPosition.value);
  };

  // handleFinalize：拖曳完成後清空選取與拖曳狀態
  const handleFinalize: DndProviderProps["onFinalize"] = ({ state }, event) => {
    "worklet";
    isDragging.value = false;
    dragX.value = 0;
    dragY.value = 0;
    runOnJS(setSelectedItems)([]);
    runOnJS(setHoverItem)(null);
    if (state !== State.FAILED) {
    }
  };

  React.useEffect(() => {
    itemsSV.value = _items;
  }, [_items]);

  return (
    <SafeAreaView style={{ flex: 1 }}>

      <WsFlex
        style={{
          backgroundColor: $color.white2d,
        }}
        justifyContent="space-around"
      >
        <WsFlex>
          <View
            style={{
              height: 16,
              width: 16,
              backgroundColor: $color.yellow11l,
              borderRadius: 16,
              marginRight: 4
            }}>
          </View>
          <WsText>{t('移至同層級')}</WsText>
        </WsFlex>
        <WsFlex>
          <View
            style={{
              height: 16,
              width: 16,
              backgroundColor: 'pink',
              borderRadius: 16,
              marginRight: 4
            }}>
          </View>
          <WsText>{t('移至子層級')}</WsText>
        </WsFlex>
      </WsFlex>

      <Animated.ScrollView
        key={listKey} // 250605-refresh
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <DndProvider
            onBegin={handleBegin}
            onUpdate={handleUpdate}
            onFinalize={handleFinalize}
            onDragEnd={handleDragEnd}
          >
            {_items.map((item) => (
              <Droppable
                key={item.id}
                id={item.id}
                data={item}
                style={{
                }}
              >
                <View onLayout={onItemLayout(item.id)}>
                  <Draggable
                    key={item.id}
                    id={item.id}
                    data={item}
                    disabled={selectedItems.some(sel => sel.id === item.id)}
                    style={{
                    }}
                  >
                    <WsCard
                      borderRadius={10}
                      style={{
                        marginHorizontal: 8,
                        padding: 16,
                        borderWidth: 0.3,
                        // backgroundColor: $color.primary10l,
                        marginTop: 4,
                        marginLeft: (item.sequence?.split("-").length - 1) * 16 + 8,
                        borderBottomWidth: 5,
                        borderBottomColor:
                          item.id === hoverItem
                            ? hoverPositionState === 'child'
                              ? 'pink'
                              : hoverPositionState === 'sibling'
                                ? $color.yellow11l
                                : 'transparent'
                            : 'transparent',
                        backgroundColor:
                          item.id === hoverItem && (!selectedItems.some(sel => sel.id === item.id))
                            ? hoverPositionState === 'child'
                              ? 'pink'
                              : hoverPositionState === 'sibling'
                                ? $color.yellow11l
                                : 'transparent'
                            : $color.primary10l,
                      }}
                    >
                      {/* for debugging */}
                      {/* <WsText color={$color.gray} size={14}>{item.id}</WsText> */}

                      <WsFlex justifyContent='space-between'>
                        <WsText
                          style={{
                            maxWidth: width * 0.8
                          }}
                          color={$color.black}
                          size={14}>{item.name}
                        </WsText>
                        <WsIcon
                          name="ws-outline-drag-horizontal"
                          size={24}
                          style={{ marginRight: 8 }}
                        />
                      </WsFlex>
                    </WsCard>
                  </Draggable>
                </View>
              </Droppable>
            ))}
          </DndProvider>
        </GestureHandlerRootView>
      </Animated.ScrollView>

      {/* 顯示的組合視圖 */}
      <Animated.View
        style={[
          {
            backgroundColor: 'transparent',
            padding: 10,
            borderRadius: 8,
          },
          animatedStyle
        ]}
        pointerEvents="none"
      >
        {selectedItems.map((item) => (
          <View
            key={item.id}
            style={{
              marginLeft: item.sequence?.split("-").length * 16,
              minWidth: width * 0.5
            }}
          >
            <WsCard
              borderRadius={10}
              style={{
                marginHorizontal: 8,
                padding: 16,
                borderWidth: 0.3,
                backgroundColor: $color.primary11l,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              <WsText color={$color.white6d} size={14}>{item.name}</WsText>
            </WsCard>
          </View>
        ))}
      </Animated.View>
    </SafeAreaView >
  );
};

export default DraggableList;
