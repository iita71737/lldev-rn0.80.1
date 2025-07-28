import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View, Dimensions, TouchableOpacity } from 'react-native'
import moment from 'moment'
import {
  WsInfiniteScroll,
  WsText,
  LlCheckListCard003,
  LlCheckListResultCard,
  WsInfo,
  WsFlex,
  WsTag,
  LlChecklistSampleRecordCard001,
  WsBottomSheet
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_GeneralRecord from '@/services/api/v1/general_record'

const CheckListSampleRecordList = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    id,

    setIsBottomSheetActive,
    setSelectedId,
    setSelectedMode,

    setReviewContent,
    setReviewScore,
    setReviewUploadFileURL,
    setReviewUploadFileURLIds,

    setSampleContent,
    setSampleScore,
    setSampleUploadFileURL,
    setSampleUploadFileURLIds,
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      order_by: 'record_at',
      order_way: 'desc',
      checklist_id: id,
      type: 'sample',
      model: 'checklist_record'
    }
    return params
  }, [currentRefreshCounter]);

  return (
    <>
      <WsInfiniteScroll
        service={S_GeneralRecord}
        serviceIndexKey={"indexByChecklist"}
        params={_params}
        keyExtractor={item => item.id}
        emptyTitle={t('目前尚無資料')}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlChecklistSampleRecordCard001
                item={item}
                setIsBottomSheetActive={setIsBottomSheetActive}
                setSelectedId={setSelectedId}
                setSelectedMode={setSelectedMode}

                setReviewContent={setReviewContent}
                setReviewScore={setReviewScore}
                setReviewUploadFileURL={setReviewUploadFileURL}

                setSampleContent={setSampleContent}
                setSampleScore={setSampleScore}
                setSampleUploadFileURL={setSampleUploadFileURL}
              >
              </LlChecklistSampleRecordCard001 >
            </>
          )
        }}
      />
    </>
  )
}

export default CheckListSampleRecordList
