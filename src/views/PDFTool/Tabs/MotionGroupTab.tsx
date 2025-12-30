import React, { useEffect, useState, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useTranslation } from 'react-i18next'
import { WsFlex, WsTag, WsCard, WsText, WsIcon, LlPDFMotionGroupCard001, WsSkeleton } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import PDFToolDraggableList, { PDFToolDraggableListRef } from '@/views/PDFTool/PDFToolDraggableList'

export type FileInfo = {
  id: string
  name: string
  fileType: string
  url: string
}

export type Motion = {
  id: string
  name: string
  sequence: number
  proposerDept: string
  reporterName: string
  attendees: string
  content: string
  attaches: FileInfo[]
  proposalFile: FileInfo | null
  decisionSummary: string
  decisionDetail: string
  updatedAt: string
}

export type Group = {
  id: string
  name: string
  sequence: number
  articles: Motion[]
}

export type MotionGroupTabProps = {
  meeting: any
  refreshKey?: number
  mode: 'default' | 'dragSort'
  data: Group[]
  onEnterSort: () => void
  onCancelSort: () => void
  onConfirmSort: (payload: { meeting_item_groups: any[] }) => void
  onDragEnd: (data: Group[]) => void
  onOpenAddMotion: (group: Group) => void
  onOpenAddGroup: () => void
  onOpenEditGroup: (group: Group) => void
  onOpenDeleteMeetingItem: (group: Group, meetingItem: Motion) => void
  onOpenDeleteGroup: (group: Group) => void
}

const MotionGroupTab: React.FC<MotionGroupTabProps> = ({
  meeting,
  refreshKey,
  mode,
  data,
  onEnterSort,
  onCancelSort,
  onConfirmSort,
  onDragEnd,
  onOpenAddMotion,
  onOpenAddGroup,
  onOpenEditGroup,
  onOpenDeleteMeetingItem,
  onOpenDeleteGroup,
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [meetingItemGroups, setMeetingItemGroups] = useState<Group[]>(data)
  const [meetingItemListByGroup, setMeetingItemListByGroup] = useState<Record<string, any[]>>({})
  const [loadingMeetingItems, setLoadingMeetingItems] = useState(false)
  const draggableListRef = useRef<PDFToolDraggableListRef | null>(null)

  const $_fetchMeetingItemGroups = async (meetingId: string, isMounted: () => boolean) => {
    console.log(meetingId,'=meetingId=')
    setLoading(true)
    try {
      const res = await S_MeetingItemGroup.index({ params: { meetingId } })
      if (!isMounted()) return
      setMeetingItemGroups(res?.data ?? [])
    } catch (err) {
      if (!isMounted()) return
      console.log('S_MeetingItemGroup.index error', err)
      setMeetingItemGroups([])
    } finally {
      if (!isMounted()) return
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!meeting?.id) {
      setLoading(false)
      return
    }
    let mounted = true
    const isMounted = () => mounted
    $_fetchMeetingItemGroups(meeting.id, isMounted)
    return () => {
      mounted = false
    }
  }, [meeting?.id, refreshKey])

  useEffect(() => {
    if (mode !== 'dragSort') return
    if (!meetingItemGroups.length) return
    let mounted = true
    const fetchAllMeetingItems = async () => {
      setLoadingMeetingItems(true)
      try {
        const results = await Promise.all(
          meetingItemGroups.map(group =>
            S_MeetingItem.index({ params: { meeting_item_group_id: group.id } })
          )
        )
        if (!mounted) return
        const nextMap: Record<string, any[]> = {}
        meetingItemGroups.forEach((group, index) => {
          nextMap[group.id] = results[index]?.data ?? []
        })
        setMeetingItemListByGroup(nextMap)
      } catch (err) {
        if (!mounted) return
        console.log('S_MeetingItem.index error', err)
        setMeetingItemListByGroup({})
      } finally {
        if (!mounted) return
        setLoadingMeetingItems(false)
      }
    }
    fetchAllMeetingItems()
    return () => {
      mounted = false
    }
  }, [mode, meetingItemGroups])

  useEffect(() => {
    if (!meeting?.id) {
      setMeetingItemGroups(data)
    }
  }, [data, meeting?.id])

  if (loading) {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <WsSkeleton />
      </View>
    )
  }

  const toFlatItems = () => {
    return meetingItemGroups.flatMap(group => {
      const meetingItems =
        meetingItemListByGroup[group.id] ??
        (Array.isArray((group as any).meeting_items)
          ? (group as any).meeting_items
          : Array.isArray((group as any).meetingItems)
            ? (group as any).meetingItems
            : Array.isArray((group as any).articles)
              ? (group as any).articles
              : [])
      const groupItem = {
        id: group.id,
        name: group.name,
      }
      const itemEntries = meetingItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        item_label: item?.item_label?.name ?? item?.item_label ?? item?.name ?? '',
        meeting_item_group: group.id,
      }))
      return [groupItem, ...itemEntries]
    })
  }

  const applyPayloadToGroups = (payload: { meeting_item_groups: any[] }) => {
    const payloadGroups = payload.meeting_item_groups || []
    const groupMap = new Map(payloadGroups.map(pg => [pg.id, pg]))
    return meetingItemGroups
      .map(group => {
        const pg = groupMap.get(group.id)
        if (!pg) return group
        const currentItems = Array.isArray((group as any).meeting_items)
          ? (group as any).meeting_items
          : Array.isArray((group as any).meetingItems)
            ? (group as any).meetingItems
            : Array.isArray((group as any).articles)
              ? (group as any).articles
              : []
        const itemMap = new Map(currentItems.map((item: any) => [item.id, item]))
        const nextItems = (pg.meeting_items || [])
          .map((pItem: any) => itemMap.get(pItem.id))
          .filter(Boolean)
        return {
          ...group,
          sequence: pg.sequence ?? group.sequence,
          meeting_items: nextItems,
        }
      })
      .sort((a: any, b: any) => (a.sequence || '').localeCompare(b.sequence || ''))
  }

  const renderListHeader = () => (
    <WsFlex
      style={{
        marginVertical: 16,
        paddingHorizontal: 8,
      }}
      justifyContent="space-between"
    >
      <View />

      <WsFlex style={{ marginRight: 4 }}>
        {mode === 'default' ? (
          <>
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginRight: 8 }}
              onPress={() => {
                onEnterSort()
              }}
            >
              <WsTag>{t('排序')}</WsTag>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginRight: 8 }}
              onPress={() => {
                onOpenAddGroup()
              }}
            >
              <WsTag>{t('新增')}</WsTag>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginRight: 8 }}
              onPress={() => {
                const payload = draggableListRef.current?.getPayload()
                if (payload) {
                  const updated = applyPayloadToGroups(payload)
                  setMeetingItemGroups(updated as Group[])
                  onConfirmSort(payload)
                } else {
                  onConfirmSort({ meeting_item_groups: [] })
                }
              }}
            >
              <WsTag>{t('確定')}</WsTag>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginRight: 8 }}
              onPress={() => {
                onCancelSort()
              }}
            >
              <WsTag>{t('取消')}</WsTag>
            </TouchableOpacity>
          </>
        )}
      </WsFlex>
    </WsFlex>
  )

  if (mode === 'dragSort') {
    const flatItems = toFlatItems()
    return (
      <View style={{ flex: 1 }}>
        {renderListHeader()}
        {loadingMeetingItems ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <WsSkeleton />
          </View>
        ) : (
          <PDFToolDraggableList
            ref={draggableListRef}
            items={flatItems}
          />
        )}
      </View>
    )
  }

  return (
    <DraggableFlatList
      data={meetingItemGroups}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={() => <View style={{ height: 50 }} />}
      renderItem={({ item, drag, getIndex }) => {
        if (mode === 'default') {
          return (
            <LlPDFMotionGroupCard001
              key={item.id}
              item={item}
              refreshKey={refreshKey}
              onPressAddGroup={onOpenAddMotion}
              onPressEditGroup={onOpenEditGroup}
              onPressDeleteMeetingItem={onOpenDeleteMeetingItem}
              onPressDeleteGroup={onOpenDeleteGroup}
            />
          )
        }

        const order = (getIndex?.() ?? 0) + 1
        return (
          <TouchableOpacity onPressIn={drag} onLongPress={drag}>
            <WsCard
              borderRadius={10}
              style={{
                backgroundColor: $color.primary10l,
                marginTop: 8,
                marginHorizontal: 16,
              }}
            >
              <WsFlex justifyContent="space-between">
                <WsText>{`${order}  ${item.name}`}</WsText>
                <WsIcon name="ws-outline-drag-horizontal" size={24} style={{ marginRight: 8 }} />
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        )
      }}
      onDragEnd={({ data }) => {
        if (mode === 'dragSort') {
          setMeetingItemGroups(data as Group[])
          onDragEnd(data as Group[])
        }
      }}
    />
  )
}

export default MotionGroupTab
