import React, { useEffect, useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useTranslation } from 'react-i18next'
import { WsFlex, WsTag, WsCard, WsText, WsIcon, LlPDFMotionGroupCard001, WsSkeleton } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'

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
  onConfirmSort: () => void
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

  const $_fetchMeetingItemGroups = async (meetingId: string, isMounted: () => boolean) => {
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
    if (!meeting?.id) {
      setMeetingItemGroups(data)
    }
  }, [data, meeting?.id])

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
        <TouchableOpacity
          style={{ alignItems: 'flex-end', marginRight: 8 }}
          onPress={() => {
            if (mode === 'default') onEnterSort()
            else onCancelSort() 
          }}
        >
          <WsTag>{mode === 'default' ? t('排序') : t('取消')}</WsTag>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ alignItems: 'flex-end', marginRight: 8 }}
          onPress={() => {
            if (mode === 'default') onOpenAddGroup()
            else onConfirmSort()
          }}
        >
          <WsTag>{mode === 'default' ? t('新增') : t('確定')}</WsTag>
        </TouchableOpacity>
      </WsFlex>
    </WsFlex>
  )

  if (loading) {
    return (
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <WsSkeleton />
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
