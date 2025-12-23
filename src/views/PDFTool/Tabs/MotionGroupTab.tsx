import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useTranslation } from 'react-i18next'
import { WsFlex, WsTag, WsCard, WsText, WsIcon, LlPDFMotionGroupCard001 } from '@/components'
import $color from '@/__reactnative_stone/global/color'

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
  mode: 'default' | 'dragSort'
  data: Group[]
  onEnterSort: () => void
  onCancelSort: () => void
  onConfirmSort: () => void
  onDragEnd: (data: Group[]) => void
  setAddMotionModalVisible: (v: boolean) => void
  setAddMotionGroupModalVisible: (v: boolean) => void
  setPopupDeleteMotionGroup: (v: boolean) => void
}

const MotionGroupTab: React.FC<MotionGroupTabProps> = ({
  mode,
  data,
  onEnterSort,
  onCancelSort,
  onConfirmSort,
  onDragEnd,
  setAddMotionModalVisible,
  setAddMotionGroupModalVisible,
  setPopupDeleteMotionGroup,
}) => {
  const { t } = useTranslation()

  const renderListHeader = () => (
    <WsFlex
      style={{
        paddingTop: 8,
        marginVertical: 8,
        paddingHorizontal: 16,
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
            if (mode === 'default') setAddMotionGroupModalVisible(true)
            else onConfirmSort()
          }}
        >
          <WsTag>{mode === 'default' ? t('新增') : t('確定')}</WsTag>
        </TouchableOpacity>
      </WsFlex>
    </WsFlex>
  )

  return (
    <DraggableFlatList
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={() => <View style={{ height: 50 }} />}
      renderItem={({ item, drag, getIndex }) => {
        if (mode === 'default') {
          return (
            <LlPDFMotionGroupCard001
              key={item.id}
              item={item}
              onPressAddGroup={() => setAddMotionModalVisible(true)}
              onPressEditGroup={() => setAddMotionGroupModalVisible(true)}
              onPressDeleteGroup={() => setPopupDeleteMotionGroup(true)}
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
        if (mode === 'dragSort') onDragEnd(data as Group[])
      }}
    />
  )
}

export default MotionGroupTab
