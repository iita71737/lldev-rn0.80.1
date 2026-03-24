import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { View, TouchableOpacity, FlatList, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  WsFlex,
  WsTag, WsText, WsIcon, LlPDFMotionGroupCard001, WsSkeleton, WsModal, WsEmpty, WsDialog, WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import S_Meeting from '@/services/api/v1/meeting'
import PDFToolDraggableList, { PDFToolDraggableListRef } from '@/views/PDFTool/PDFToolDraggableList'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useSelector } from 'react-redux'

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
  meetingItemsAllRefreshKey?: number
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

  const sortBySequence = (items: any[]) =>
    [...items].sort((a, b) =>
      String(a?.sequence ?? '').localeCompare(String(b?.sequence ?? ''))
    )

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
      const list = Array.isArray(meetingItems) ? meetingItems : []
      groupsMap[groupId] = sortBySequence(list)
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

  Object.keys(groupsMap).forEach(groupId => {
    groupsMap[groupId] = sortBySequence(groupsMap[groupId])
  })

  return groupsMap
}

const MotionGroupTab: React.FC<MotionGroupTabProps> = ({
  meeting,
  refreshKey,
  meetingItemsAllRefreshKey,
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
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const isMeetingOwner =
    !!meeting?.owner?.id && meeting?.owner?.id === currentUser?.id
  const canUpdateMeeting =
    Array.isArray(currentUserScope) &&
    (currentUserScope.includes('meeting-update') ||
      (currentUserScope.includes('meeting-update-owner') && isMeetingOwner))

  const [loading, setLoading] = useState(true)
  const [meetingItemGroups, setMeetingItemGroups] = useState<Group[]>(data)
  const [meetingItemListByGroup, setMeetingItemListByGroup] = useState<Record<string, any[]>>({})
  const [meetingItemStatusByGroup, setMeetingItemStatusByGroup] = useState<Record<string, any[]>>({})
  const [loadingMeetingItems, setLoadingMeetingItems] = useState(false)
  const [meetingItemsAllRefreshKeyState, setMeetingItemsAllRefreshKeyState] = useState(0)
  const [reParseLoading, setReParseLoading] = useState(false)
  const draggableListRef = useRef<PDFToolDraggableListRef | null>(null)
  const pollingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const didFinalRefreshRef = useRef(false)

  const requestMeetingItemsAllRefresh = useCallback(() => {
    setMeetingItemsAllRefreshKeyState(prev => prev + 1)
  }, [meetingItemsAllRefreshKeyState])

  useEffect(() => {
    if (meetingItemsAllRefreshKey === undefined) return
    setMeetingItemsAllRefreshKeyState(prev => prev + 1)
  }, [meetingItemsAllRefreshKey])

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

  const getStatusValue = useCallback((value: any) => {
    return String(value?.name ?? value ?? '').toUpperCase()
  }, [])

  const isProcessingStatus = useCallback((value: any) => {
    const normalized = getStatusValue(value)
    return normalized === 'PROCESSING' || normalized === 'PENDING'
  }, [getStatusValue])

  const hasAnyProcessingStatus = useMemo(() => {
    return meetingItemGroups.some(group => {
      const groupItems =
        meetingItemStatusByGroup[group.id] ??
        meetingItemListByGroup[group.id] ??
        (Array.isArray((group as any).meeting_items)
          ? (group as any).meeting_items
          : Array.isArray((group as any).meetingItems)
            ? (group as any).meetingItems
            : Array.isArray((group as any).articles)
              ? (group as any).articles
              : [])
      if (!Array.isArray(groupItems)) return false
      return groupItems.some(item =>
        isProcessingStatus(item?.parse_status) || isProcessingStatus(item?.convert_status)
      )
    })
  }, [meetingItemGroups, meetingItemStatusByGroup, meetingItemListByGroup, isProcessingStatus])

  const actionButtonsDisabled = reParseLoading || hasAnyProcessingStatus

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
            S_MeetingItem.index({
              params: {
                meeting_item_group_id: group.id,
                order_way: 'asc',
                order_by: 'sequence',
              }
            })
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

      const hasProcessingStatus = (items: any[]) =>
        items.some(item => {
          return isProcessingStatus(item?.parse_status) || isProcessingStatus(item?.convert_status)
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
          didFinalRefreshRef.current = false
          if (!pollingTimerRef.current) {
            pollingTimerRef.current = setInterval(fetchMeetingItemsAll, 10000)
          }
        } else if (pollingTimerRef.current) {
          clearInterval(pollingTimerRef.current)
          pollingTimerRef.current = null
        }
      }

      const refreshMeetingItemsOnce = async (baseMap: Record<string, any[]>) => {
        if (!active) return
        const nextMap: Record<string, any[]> = {}
        Object.keys(baseMap).forEach(groupId => {
          nextMap[groupId] = Array.isArray(baseMap[groupId]) ? [...baseMap[groupId]] : []
        })
        const tasks: Promise<void>[] = []
        Object.entries(baseMap).forEach(([groupId, items]) => {
          if (!Array.isArray(items)) return
          items.forEach((item: any) => {
            if (!item?.id) return
            tasks.push(
              S_MeetingItem.show({ modelId: item.id })
                .then(res => {
                  if (!active) return
                  const detail = res?.data ?? res
                  if (!detail) return
                  const list = nextMap[groupId] ?? []
                  const index = list.findIndex((entry: any) => entry?.id === item.id)
                  if (index >= 0) {
                    list[index] = { ...list[index], ...detail }
                  }
                })
                .catch(err => {
                  console.log('S_MeetingItem.show error', err)
                })
            )
          })
        })
        await Promise.all(tasks)
        if (!active) return
        setMeetingItemStatusByGroup(nextMap)
      }

      const fetchMeetingItemsAll = async () => {
        console.log(meeting?.id, 'meetingIndexAll')

        try {
          const res = await S_MeetingItem.meetingIndexAll({
            params: {
              meetingId: meeting.id,
              order_way: 'asc',
              order_by: 'sequence',
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
            if (!shouldPoll && !didFinalRefreshRef.current) {
              didFinalRefreshRef.current = true
              refreshMeetingItemsOnce(nextMap)
            }
            return
          }
          const nextMap = normalizeMeetingItemsByGroup(data)
          setMeetingItemStatusByGroup(nextMap)
          syncPolling(shouldPoll)
          if (!shouldPoll && !didFinalRefreshRef.current) {
            didFinalRefreshRef.current = true
            refreshMeetingItemsOnce(nextMap)
          }
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
    }, [meeting?.id, meetingItemGroups.length, meetingItemsSignature, mode, meetingItemsAllRefreshKeyState, isProcessingStatus])
  )

  const shouldShowRemind = useMemo(() => {
    const getStatusValue = (value: any) =>
      String(value?.name ?? value ?? '').toUpperCase()
    const isFailed = (item: any) => {
      const parseStatus = getStatusValue(item?.parse_status)
      const convertStatus = getStatusValue(item?.convert_status)
      return parseStatus === 'FAILED' || convertStatus === 'FAILED'
    }
    const statusMap = meetingItemStatusByGroup
    const listMap = meetingItemListByGroup
    const groupIds = meetingItemGroups.map(group => group.id)
    return groupIds.some(groupId => {
      const items = statusMap[groupId] ?? listMap[groupId] ?? []
      return Array.isArray(items) && items.some(isFailed)
    })
  }, [meetingItemGroups, meetingItemListByGroup, meetingItemStatusByGroup])

  if (loading) {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <WsSkeleton />
      </View>
    )
  }

  const toFlatItems = () => {
    const orderedGroups = [...meetingItemGroups].sort((a: any, b: any) =>
      String(a?.sequence ?? '').localeCompare(String(b?.sequence ?? ''))
    )
    return orderedGroups.flatMap(group => {
      const meetingItemsRaw =
        meetingItemListByGroup[group.id] ??
        (Array.isArray((group as any).meeting_items)
          ? (group as any).meeting_items
          : Array.isArray((group as any).meetingItems)
            ? (group as any).meetingItems
            : Array.isArray((group as any).articles)
              ? (group as any).articles
              : []) ??
        []
      const meetingItems = [...meetingItemsRaw].sort((a: any, b: any) =>
        String(a?.sequence ?? '').localeCompare(String(b?.sequence ?? ''))
      )
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

  const handleReParseMeeting = async () => {
    if (!meeting?.id) return
    if (actionButtonsDisabled) return
    try {
      setReParseLoading(true)
      await S_Meeting.reParse({
        data: {
          meeting_id: meeting.id,
        }
      })
      requestMeetingItemsAllRefresh()
      Alert.alert(t('已送出重新解析'))
    } catch (err) {
      console.log('S_Meeting.reParse error', err)
      Alert.alert(t('重新解析失敗，請稍後再試'))
    } finally {
      setReParseLoading(false)
    }
  }

  const renderListHeader = () => (
    <>
      <WsFlex
        style={{
          marginVertical: 12,
          paddingHorizontal: 8,
        }}
        justifyContent="space-between"
      >

        {!!meetingItemGroups.length && canUpdateMeeting ? (
          <TouchableOpacity
            disabled={actionButtonsDisabled}
            style={{ alignItems: 'flex-start', marginRight: 0 }}
            onPress={() => {
              if (actionButtonsDisabled) return
              if (!meeting?.id) return
              navigation.navigate('RoutesPDFTool', {
                screen: 'PDFToolAdminBatchEditMeetingItemGroup',
                params: { id: meeting.id }
              })
            }}
          >
            <WsTag
              textColor={actionButtonsDisabled ? $color.white5d : undefined}
            >
              {t('批次編輯議案群組')}
            </WsTag>
          </TouchableOpacity>
        ) : (
          <View></View>
        )}

        {canUpdateMeeting && (
          <TouchableOpacity
            disabled={actionButtonsDisabled}
            style={{ alignItems: 'flex-start', marginRight: 0 }}
            onPress={handleReParseMeeting}
          >
            <WsTag
              textColor={actionButtonsDisabled ? $color.white5d : undefined}
            >
              {t('重新解析提案單')}
            </WsTag>
          </TouchableOpacity>
        )}

        <WsFlex style={{ marginRight: 4 }}>
          {mode === 'default' && canUpdateMeeting && (
            <>
              {!!meetingItemGroups.length && (
                <TouchableOpacity
                  disabled={actionButtonsDisabled}
                  style={{ alignItems: 'flex-end', marginRight: 8 }}
                  onPress={() => {
                    if (actionButtonsDisabled) return
                    onEnterSort()
                  }}
                >
                  <WsTag
                    textColor={actionButtonsDisabled ? $color.white5d : undefined}
                  >
                    {t('排序')}
                  </WsTag>
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
    </>
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
            onRequestMeetingItemsAll={requestMeetingItemsAllRefresh}
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
          <>
            {true && (
              <TouchableOpacity
                disabled={true}
                style={{
                  paddingHorizontal: 16
                }}
              >
                <WsFlex
                  style={[false ? null : { marginTop: 4 }]}
                >
                  <WsIcon
                    name="md-info-outline"
                    color={$color.danger}
                    style={{
                      marginRight: 6
                    }}
                    size={18}
                  />
                  <WsText
                    style={{
                      paddingRight: 16
                    }}
                    size={12}
                    color={$color.danger}>
                    {t('注意，排序將重新產生全部的調整檔 (DOCX)')}
                  </WsText>
                </WsFlex>
              </TouchableOpacity>
            )}
            <PDFToolDraggableList
              ref={draggableListRef}
              items={toFlatItems()}
            />
          </>
        )}
      </WsModal>
    </>
  )
}

export default MotionGroupTab
