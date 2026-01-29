import {
  DndProvider,
  Draggable,
  Droppable,
  DndProviderProps,
} from '@mgcrea/react-native-dnd'
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import {
  SafeAreaView,
  View,
  Dimensions,
} from 'react-native'
import {
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useAnimatedRef,
  useAnimatedScrollHandler,
  scrollTo,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'

type FlatItem = {
  id: string
  name?: string
  item_label?: string | { name?: string }
  meeting_item_group?: string
}

type SortItem = {
  id: string
  name?: string
  item_label?: string | { name?: string }
  type: 'group' | 'item'
  parentId: string | null
  sequence: string
}

type MeetingItem = {
  id: string
  sequence: string
  item_label: string
  meeting_item_group: string
}

type MeetingItemGroup = {
  id: string
  sequence: string
  meeting_items: MeetingItem[]
}

type Props = {
  items: FlatItem[]
}

export type PDFToolDraggableListRef = {
  getPayload: () => { meeting_item_groups: MeetingItemGroup[] }
}

const padSeq = (num: number) => String(num).padStart(4, '0')

const buildSortItems = (items: FlatItem[]): SortItem[] => {
  const groupOrder: string[] = []
  const groupNameMap = new Map<string, string | undefined>()
  items.forEach(item => {
    if (!item.meeting_item_group) {
      groupOrder.push(item.id)
      groupNameMap.set(item.id, item.name)
    }
  })
  const groupSeqMap = new Map<string, string>()
  groupOrder.forEach((groupId, index) => {
    groupSeqMap.set(groupId, padSeq(index + 1))
  })
  const itemCountByGroup = new Map<string, number>()

  let currentGroupId: string | null = null
  const result: SortItem[] = []
  items.forEach(item => {
    if (!item.meeting_item_group) {
      currentGroupId = item.id
      const groupSeq = groupSeqMap.get(item.id) ?? padSeq(groupOrder.length + 1)
      result.push({
        id: item.id,
        name: item.name ?? groupNameMap.get(item.id),
        type: 'group',
        parentId: null,
        sequence: groupSeq,
      })
      return
    }
    const groupId = item.meeting_item_group ?? currentGroupId
    if (!groupId) return
    const count = (itemCountByGroup.get(groupId) ?? 0) + 1
    itemCountByGroup.set(groupId, count)
    const groupSeq = groupSeqMap.get(groupId) ?? padSeq(groupOrder.length + 1)
    result.push({
      id: item.id,
      name: item.name,
      item_label: item.item_label,
      type: 'item',
      parentId: groupId,
      sequence: `${groupSeq}-${padSeq(count)}`,
    })
  })
  return result
}

const applySequences = (items: SortItem[]) => {
  const childrenMap: { [key: string]: SortItem[] } = {}
  items.forEach(item => {
    const parentKey = item.parentId ?? '__root__'
    if (!childrenMap[parentKey]) {
      childrenMap[parentKey] = []
    }
    childrenMap[parentKey].push(item)
  })

  const assignSequences = (parentId: string | null, parentSequence: string) => {
    const key = parentId ?? '__root__'
    const children = childrenMap[key] || []
    children.forEach((child, index) => {
      const newSeq = parentSequence
        ? `${parentSequence}-${padSeq(index + 1)}`
        : padSeq(index + 1)
      child.sequence = newSeq
      assignSequences(child.id, newSeq)
    })
  }

  assignSequences(null, '')
  return items
}

const buildPayload = (items: SortItem[]) => {
  const groups = items
    .filter(item => item.type === 'group')
    .sort((a, b) => a.sequence.localeCompare(b.sequence))
  const itemsByGroup = new Map<string, SortItem[]>()
  items
    .filter(item => item.type === 'item')
    .forEach(item => {
      const groupId = item.parentId
      if (!groupId) return
      if (!itemsByGroup.has(groupId)) itemsByGroup.set(groupId, [])
      itemsByGroup.get(groupId)!.push(item)
    })

  const meeting_item_groups: MeetingItemGroup[] = groups.map(group => {
    const children = (itemsByGroup.get(group.id) || [])
      .sort((a, b) => a.sequence.localeCompare(b.sequence))
    const meeting_items: MeetingItem[] = children.map((child, index) => {
      const itemLabel =
        typeof child.item_label === 'string'
          ? child.item_label
          : child.item_label?.name ?? child.name ?? ''
      return {
        id: child.id,
        sequence: padSeq(index + 1),
        item_label: itemLabel,
        meeting_item_group: group.id,
      }
    })
    return {
      id: group.id,
      sequence: group.sequence,
      meeting_items,
    }
  })

  return { meeting_item_groups }
}

const PDFToolDraggableList = forwardRef<PDFToolDraggableListRef, Props>(({ items }, ref) => {
  const { height: screenHeight, width } = Dimensions.get('window')
  const { t } = useTranslation()

  const [_items, setItems] = useState<SortItem[]>(() => applySequences(buildSortItems(items)))
  const [selectedItems, setSelectedItems] = useState<SortItem[]>([])
  const [hoverItem, setHoverItem] = useState<string | null>(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)

  const itemsSV = useSharedValue<SortItem[]>(_items)
  const [listKey, setListKey] = useState(Date.now())

  const [hoverPositionState, setHoverPositionState] = useState<'child' | 'sibling' | null>(null)
  const hoverPosition = useSharedValue<'child' | 'sibling' | null>(null)

  useEffect(() => {
    const next = applySequences(buildSortItems(items))
    setItems(next)
    itemsSV.value = next
    setListKey(Date.now())
  }, [items])

  useImperativeHandle(ref, () => ({
    getPayload: () => buildPayload(_items),
  }), [_items])

  const itemLayouts = useRef<{ [id: string]: number }>({}).current
  const onItemLayout = (id: string) => (e: any) => {
    itemLayouts[id] = e.nativeEvent.layout.y
  }

  const isDragging = useSharedValue(false)
  const dragX = useSharedValue(0)
  const dragY = useSharedValue(0)
  const dragAbsoluteY = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: dragX.value,
    top: dragY.value,
    opacity: isDragging.value ? 1 : 0,
    transform: [{ translateX: 0 }, { translateY: 0 }],
  }))

  const scrollViewRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useSharedValue(0)

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y
    },
  })

  useAnimatedReaction(
    () => ({ y: dragAbsoluteY.value, dragging: isDragging.value }),
    (cur) => {
      if (!cur.dragging) return

      const threshold = 80
      const headerHeight = 100
      const scrollSpeed = 8 // 你要更順可調
      const y = cur.y

      if (y - headerHeight < threshold) {
        scrollOffset.value = Math.max(scrollOffset.value - scrollSpeed, 0)
        scrollTo(scrollViewRef, 0, scrollOffset.value, false)
      } else if (y > screenHeight - threshold) {
        scrollOffset.value = scrollOffset.value + scrollSpeed
        scrollTo(scrollViewRef, 0, scrollOffset.value, false)
      }
    }
  )

  const reorderItemWithMode = (activeId: string, targetId: string, mode: 'child' | 'sibling' | null) => {
    const isSameId = (left: string | number, right: string | number) =>
      String(left) === String(right)
    setItems(prevItems => {
      if (isSameId(activeId, targetId)) return prevItems
      const modelsCopy: SortItem[] = JSON.parse(JSON.stringify(prevItems))
      const selectedItem = modelsCopy.find(item => isSameId(item.id, activeId))
      const targetItem = modelsCopy.find(item => isSameId(item.id, targetId))
      if (!selectedItem || !targetItem) return prevItems
      if (selectedItem.type === 'group') return prevItems

      const subtreeItems = selectedItem.type === 'group'
        ? modelsCopy.filter(item => item.sequence.startsWith(selectedItem.sequence))
        : modelsCopy.filter(item => isSameId(item.id, selectedItem.id))
      const remaining = modelsCopy.filter(
        item => !subtreeItems.some(sub => isSameId(sub.id, item.id))
      )

      let nextParentId: string | null = null
      if (targetItem.type === 'group') {
        nextParentId = targetItem.id
      } else if (mode === 'child') {
        nextParentId = targetItem.parentId
      } else {
        nextParentId = targetItem.parentId
      }

      subtreeItems.forEach(item => {
        if (item.id === selectedItem.id) {
          item.parentId = nextParentId ?? null
        }
      })

      const targetIndex = remaining.findIndex(item => isSameId(item.id, targetItem.id))
      if (targetIndex === -1) {
        remaining.push(...subtreeItems)
      } else {
        remaining.splice(targetIndex + 1, 0, ...subtreeItems)
      }

      const nextItems = applySequences(remaining)
      // setListKey(Date.now())
      return nextItems
    })
  }

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet'
    if (over) {
      isDragging.value = false
      runOnJS(reorderItemWithMode)(String(active.id), String(over.id), hoverPosition.value)
    }
  }

  const getDragPosition = (event: any, meta: any) => {
    'worklet'
    const layout = meta?.activeLayout
    const absX = event?.absoluteX
    const absY = event?.absoluteY
    const baseX = typeof absX === 'number' && isFinite(absX)
      ? absX
      : layout?.pageX ?? layout?.x ?? 0
    const baseY = typeof absY === 'number' && isFinite(absY)
      ? absY
      : layout?.pageY ?? layout?.y ?? 0
    return {
      x: baseX + 16,
      y: baseY + 16,
    }
  }

  const handleBegin: DndProviderProps['onBegin'] = (event, meta) => {
    'worklet'
    runOnJS(setScrollEnabled)(false)
    isDragging.value = true
    dragAbsoluteY.value = event?.absoluteY ?? 0
    const pos = getDragPosition(event, meta)
    dragX.value = withSpring(pos.x)
    dragY.value = withSpring(pos.y)

    const latestItems = JSON.parse(JSON.stringify(itemsSV.value))
    const activeId = meta?.activeId != null ? String(meta.activeId) : ''
    const draggedItem = latestItems.find((item: SortItem) => String(item.id) === activeId)
    if (!draggedItem) return

    const selectedList = draggedItem.type === 'group'
      ? latestItems.filter((item: SortItem) => item.sequence.startsWith(draggedItem.sequence))
      : latestItems.filter((item: SortItem) => String(item.id) === String(draggedItem.id))
    selectedList.sort((a: SortItem, b: SortItem) => a.sequence.localeCompare(b.sequence))
    runOnJS(setSelectedItems)(selectedList)
  }

  const handleUpdate: DndProviderProps['onUpdate'] = (event, meta) => {
    'worklet'
    isDragging.value = true
    dragAbsoluteY.value = event?.absoluteY ?? dragAbsoluteY.value
    const pos = getDragPosition(event, meta)
    dragX.value = withSpring(pos.x)
    dragY.value = withSpring(pos.y)
    const isMoveAsChild = meta?.activeLayout?.x > 0
    hoverPosition.value = isMoveAsChild ? 'child' : 'sibling'
    runOnJS(setHoverItem)(meta?.droppableActiveId != null ? String(meta.droppableActiveId) : null)
    runOnJS(setHoverPositionState)(hoverPosition.value)
  }

  const handleFinalize: DndProviderProps['onFinalize'] = ({ state }) => {
    'worklet'
    isDragging.value = false
    dragX.value = 0
    dragY.value = 0
    dragAbsoluteY.value = 0
    runOnJS(setSelectedItems)([])
    runOnJS(setHoverItem)(null)
    runOnJS(setScrollEnabled)(true)
    if (state !== State.FAILED) {
    }
  }

  useEffect(() => {
    itemsSV.value = _items
  }, [_items])

  const decodeFilename = (name: string) => {
    if (!name) return name
    // 先處理後端可能用 + 當空白
    const normalized = name.replace(/\+/g, ' ')

    try {
      // 只要包含 %xx 就試著 decode
      if (/%[0-9A-Fa-f]{2}/.test(normalized)) {
        return decodeURIComponent(normalized)
      }
      return normalized
    } catch {
      // 避免重複 decode 或破損字串造成 crash
      return normalized
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* <WsFlex
        style={{
          backgroundColor: $color.danger11l,
          paddingHorizontal: 12,
          marginBottom: 8,
        }}
        justifyContent="space-around"
      >
        <WsText color={$color.danger}>{t('變更順序將重新匯出檔案，預計需要較長時間，請耐心等候')}</WsText>
      </WsFlex>

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
          <WsText>{t('移至上方')}</WsText>
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
          <WsText>{t('移至下方')}</WsText>
        </WsFlex>
      </WsFlex> */}

      <Animated.ScrollView
        // key={listKey}
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        scrollEnabled={scrollEnabled}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <DndProvider
            onBegin={handleBegin}
            onUpdate={handleUpdate}
            onFinalize={handleFinalize}
            onDragEnd={handleDragEnd}
            activationDelay={300}
            minDistance={10}
          >
            {_items.map((item) => {
              const dragId = String(item.id)
              return (
                <Droppable
                  key={dragId}
                  id={dragId}
                  data={item}
                >
                  <View onLayout={onItemLayout(item.id)}>
                    <Draggable
                      key={dragId}
                      id={dragId}
                      data={item}
                      disabled={item.type === 'group' || selectedItems.some(sel => sel.id === item.id)}
                    >
                      <WsCard
                        borderRadius={10}
                        style={{
                          marginHorizontal: 8,
                          padding: 16,
                          borderWidth: 0.3,
                          marginTop: 4,
                          marginLeft: item.type === 'item' ? 24 : 8,
                          borderBottomWidth: 5,
                          borderBottomColor:
                            String(item.id) === hoverItem
                              ? hoverPositionState === 'child'
                                ? 'pink'
                                : hoverPositionState === 'sibling'
                                  ? $color.yellow11l
                                  : 'transparent'
                              : 'transparent',
                          backgroundColor:
                            String(item.id) === hoverItem && (!selectedItems.some(sel => sel.id === item.id))
                              ? hoverPositionState === 'child'
                                ? 'pink'
                                : hoverPositionState === 'sibling'
                                  ? $color.yellow11l
                                  : 'transparent'
                              : item.type === 'group'
                                ? $color.white5d
                                : $color.primary10l,
                        }}
                      >
                        <WsFlex justifyContent="space-between">
                          <WsText
                            style={{
                              maxWidth: width * 0.8
                            }}
                            color={$color.black}
                            size={14}
                          >
                            {item.type === 'group'
                              ? `${item.sequence}. ${item.name || t('議案群組')}`
                              : `${item.sequence.split('-').slice(-1)[0]}. ${decodeFilename(item.name) || t('項目名稱')}`}
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
              )
            })}
          </DndProvider>
        </GestureHandlerRootView>
      </Animated.ScrollView>

      <Animated.View
        style={[
          {
            backgroundColor: 'transparent',
            padding: 10,
            borderRadius: 8,
            zIndex: 999,
            elevation: 10,
          },
          animatedStyle
        ]}
        pointerEvents="none"
      >
        {selectedItems.map((item) => (
          <View
            key={item.id}
            style={{
              marginLeft: item.type === 'item' ? 24 : 8,
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
              <WsText color={$color.white6d} size={14}>
                {item.type === 'group'
                  ? item.name || t('議案群組')
                  : typeof item.item_label === 'string'
                    ? item.item_label
                    : item.item_label?.name ?? item.name ?? t('項目名稱')}
              </WsText>
            </WsCard>
          </View>
        ))}
      </Animated.View>
    </SafeAreaView>
  )
})

export default PDFToolDraggableList
