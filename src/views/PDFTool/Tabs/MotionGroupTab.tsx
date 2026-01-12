import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { View, TouchableOpacity, FlatList } from 'react-native'
import { useTranslation } from 'react-i18next'
import { WsFlex, WsTag, WsCard, WsText, WsIcon, LlPDFMotionGroupCard001, WsSkeleton, WsModal, WsEmpty } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import PDFToolDraggableList, { PDFToolDraggableListRef } from '@/views/PDFTool/PDFToolDraggableList'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

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

const normalizeMeetingItemsByGroup = (payload: any) => {
  const groupsMap: Record<string, any[]> = {}
  const data = payload?.data ?? payload
  if (!Array.isArray(data)) return groupsMap

  const looksLikeGroup = (item: any) =>
    item?.meeting_items || item?.meetingItems || item?.articles

  if (data.some(looksLikeGroup)) {
    data.forEach((group: any) => {
      const groupId = group?.id ?? group?.meeting_item_group_id ?? null
      if (!groupId) return
      const meetingItems =
        group?.meeting_items ??
        group?.meetingItems ??
        group?.articles ??
        []
      groupsMap[groupId] = Array.isArray(meetingItems) ? meetingItems : []
    })
    return groupsMap
  }

  data.forEach((item: any) => {
    const groupId =
      item?.meeting_item_group?.id ??
      item?.meeting_item_group_id ??
      item?.meetingItemGroupId ??
      null
    if (!groupId) return
    if (!groupsMap[groupId]) groupsMap[groupId] = []
    groupsMap[groupId].push(item)
  })

  return groupsMap
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
  const navigation = useNavigation()
  const [loading, setLoading] = useState(true)
  const [meetingItemGroups, setMeetingItemGroups] = useState<Group[]>(data)
  const [meetingItemListByGroup, setMeetingItemListByGroup] = useState<Record<string, any[]>>({})
  const [meetingItemStatusByGroup, setMeetingItemStatusByGroup] = useState<Record<string, any[]>>({})
  const [loadingMeetingItems, setLoadingMeetingItems] = useState(false)
  const draggableListRef = useRef<PDFToolDraggableListRef | null>(null)
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const meetingItemsSignature = useMemo(() => {
    const parts: string[] = []
    meetingItemGroups.forEach(group => {
      parts.push(String(group.id ?? ''))
      const groupItems =
        meetingItemListByGroup[group.id] ??
        (Array.isArray((group as any).meeting_items)
          ? (group as any).meeting_items
          : Array.isArray((group as any).meetingItems)
            ? (group as any).meetingItems
            : Array.isArray((group as any).articles)
              ? (group as any).articles
              : [])
      groupItems.forEach((item: any) => {
        parts.push(String(item?.id ?? ''))
      })
    })
    return parts.join('|')
  }, [meetingItemGroups, meetingItemListByGroup])

  const $_fetchMeetingItemGroups = async (meetingId: string, isMounted: () => boolean) => {
    setLoading(true)
    console.log(meetingId, 'meetingId')
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

  useFocusEffect(
    useCallback(() => {
      if (!meeting?.id) return
      if (!meetingItemGroups.length || mode === 'dragSort') return
      let active = true

      const getStatusValue = (value: any) =>
        String(value?.name ?? value ?? '').toUpperCase()

      const hasProcessingStatus = (items: any[]) =>
        items.some(item => {
          const parseStatus = getStatusValue(item?.parse_status)
          const convertStatus = getStatusValue(item?.convert_status)
          return parseStatus === 'PROCESSING' || convertStatus === 'PROCESSING'
        })

      const collectItems = (payload: any) => {
        if (!payload) return []
        const list = Array.isArray(payload) ? payload : [payload]
        const items: any[] = []
        list.forEach(entry => {
          const groupItems =
            entry?.meeting_items ?? entry?.meetingItems ?? entry?.articles
          if (Array.isArray(groupItems)) {
            items.push(...groupItems)
          } else {
            items.push(entry)
          }
        })
        return items
      }

      const syncPolling = (shouldPoll: boolean) => {
        if (!active) return
        if (shouldPoll) {
          if (!pollingTimerRef.current) {
            pollingTimerRef.current = setInterval(fetchMeetingItemsAll, 10000)
          }
        } else if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current)
          pollingTimerRef.current = null
        }
      }

      const fetchMeetingItemsAll = async () => {
        console.log(meeting?.id, 'meetingIndexAll')

        try {
          const res = await S_MeetingItem.meetingIndexAll({
            params: {
              meetingId: meeting.id,
            }
          })
          if (!active) return
          const data = res?.data ?? res
          const flatItems = collectItems(data)
          const shouldPoll = hasProcessingStatus(flatItems)
          const looksLikeGroup = (item: any) =>
            item?.meeting_items || item?.meetingItems || item?.articles
          if (Array.isArray(data) && data.length > 0 && !data.some(looksLikeGroup)) {
            const idToGroupId = new Map<string, string>()
            meetingItemGroups.forEach(group => {
              const groupItems =
                meetingItemListByGroup[group.id] ??
                (Array.isArray((group as any).meeting_items)
                  ? (group as any).meeting_items
                  : Array.isArray((group as any).meetingItems)
                    ? (group as any).meetingItems
                    : Array.isArray((group as any).articles)
                      ? (group as any).articles
                      : [])
              groupItems.forEach((item: any) => {
                if (item?.id) idToGroupId.set(item.id, group.id)
              })
            })
            const nextMap: Record<string, any[]> = {}
            data.forEach((item: any) => {
              const groupId = idToGroupId.get(item?.id)
              if (!groupId) return
              if (!nextMap[groupId]) nextMap[groupId] = []
              nextMap[groupId].push(item)
            })
            setMeetingItemStatusByGroup(nextMap)
            syncPolling(shouldPoll)
            return
          }
          const nextMap = normalizeMeetingItemsByGroup(data)
          setMeetingItemStatusByGroup(nextMap)
          syncPolling(shouldPoll)
        } catch (err) {
          if (!active) return
          console.log('S_MeetingItem.meetingIndexAll error', err)
        }
      }

      fetchMeetingItemsAll()

      return () => {
        active = false
        if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current)
          pollingTimerRef.current = null
        }
      }
    }, [meeting?.id, meetingItemGroups.length, meetingItemsSignature, mode])
  )

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

  const handleConfirmSort = () => {
    const payload = draggableListRef.current?.getPayload()
    if (payload) {
      const updated = applyPayloadToGroups(payload)
      setMeetingItemGroups(updated as Group[])
      onConfirmSort(payload)
    } else {
      onConfirmSort({ meeting_item_groups: [] })
    }
  }

  const renderListHeader = () => (
    <WsFlex
      style={{
        marginVertical: 16,
        paddingHorizontal: 8,
      }}
      justifyContent="space-between"
    >

      {/* <View /> */}
      {!!meetingItemGroups.length ? (
        <TouchableOpacity
          style={{ alignItems: 'flex-start', marginRight: 8 }}
          onPress={() => {
            if (!meeting?.id) return
            navigation.navigate('RoutesPDFTool', {
              screen: 'PDFToolAdminBatchEditMeetingItemGroup',
              params: { id: meeting.id }
            })
          }}
        >
          <WsTag>{t('批次編輯議案群組')}</WsTag>
        </TouchableOpacity>
      ) : (
        <View></View>
      )}

      <WsFlex style={{ marginRight: 4 }}>
        {mode === 'default' && (
          <>
            {!!meetingItemGroups.length && (
              <TouchableOpacity
                style={{ alignItems: 'flex-end', marginRight: 8 }}
                onPress={() => {
                  onEnterSort()
                }}
              >
                <WsTag>{t('排序')}</WsTag>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ alignItems: 'flex-end', marginRight: 8 }}
              onPress={() => {
                onOpenAddGroup()
              }}
            >
              <WsTag>{t('新增')}</WsTag>
            </TouchableOpacity>
          </>
        )}
      </WsFlex>
    </WsFlex>
  )

  return (
    <>
      <FlatList
        data={meetingItemGroups}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={() => <View style={{ height: 50 }} />}
        ListEmptyComponent={() => (
          <WsEmpty></WsEmpty>
        )}
        renderItem={({ item }) => (
          <LlPDFMotionGroupCard001
            key={item.id}
            item={item}
            meeting={meeting}
            refreshKey={refreshKey}
            meetingItemListByGroupExternal={meetingItemStatusByGroup}
            onPressAddGroup={onOpenAddMotion}
            onPressEditGroup={onOpenEditGroup}
            onPressDeleteMeetingItem={onOpenDeleteMeetingItem}
            onPressDeleteGroup={onOpenDeleteGroup}
          />
        )}
      />

      <WsModal
        title={t('排序')}
        visible={mode === 'dragSort'}
        headerLeftOnPress={() => onCancelSort()}
        onBackButtonPress={() => onCancelSort()}
        headerRightText={t('確定')}
        headerRightOnPress={handleConfirmSort}
        childrenScroll={false}
      >
        {loadingMeetingItems ? (
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <WsSkeleton />
          </View>
        ) : (
          <PDFToolDraggableList
            ref={draggableListRef}
            items={toFlatItems()}
          />
        )}
      </WsModal>
    </>
  )
}

export default MotionGroupTab
