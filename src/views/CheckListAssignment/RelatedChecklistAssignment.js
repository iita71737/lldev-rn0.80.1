import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView } from 'react-native'
import {
  LlCheckListCard005,
  WsPaddingContainer,
  WsInfiniteScroll,
  WsGradientButton,
  WsText
} from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import S_CheckList from '@/services/api/v1/checklist'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import moment from 'moment'


const RelatedChecklistAssignment = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    id,
    checklistId,
    lastVersionId
  } = route.params

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [params, setParams] = useState({
    checklist: checklistId ? checklistId : undefined,
    get_all: 1,
    order_by: 'created_at',
    order_way: 'desc',
    checklist: checklistId ? checklistId : undefined,
    time_field: 'record_at',
  })

  return (
    <>
      <WsPaddingContainer>
        <WsText
          style={{
            paddingHorizontal: 16,
          }}
          size={12}
          fontWeight={700}
        >{t('這張點檢表已有以下點檢作業，若你仍需進行臨時點檢作業，請點擊 [開始臨時點檢] 按鈕')}
        </WsText>
        <WsGradientButton
          borderRadius={30}
          style={{
            marginTop: 16
          }}
          onPress={() => {
            navigation.push('RoutesCheckList', {
              screen: 'CheckListAssignmentIntroductionTemp',
              params: {
                id: id,
                checklistId: checklistId,
                versionId: lastVersionId
              }
            })
          }}>
          {t('開始臨時點檢')}
        </WsGradientButton>
      </WsPaddingContainer>

      <WsInfiniteScroll
        service={S_ChecklistAssignment}
        serviceIndexKey={'indexAuth'}
        params={params}
        padding={16}
        emptyTitle={t('目前尚無資料')}
        renderItem={({ item, index }) => {
          return (
            <View key={item.id}>
              <LlCheckListCard005
                key={item.id}
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12
                    }
                ]}
                name={item.checklist ? item.checklist.name : ''}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                checkers={item.checkers ? item.checkers : ''}
                reviewers={item.reviewers ? item.reviewers : t('無')}
                deadline={
                  item.record_at ? moment(item.record_at).local().format('YYYY-MM-DD') : undefined
                }
                time_period={
                  item.end_time && item.start_time ? `${moment(item.start_time).local().format('HH:mm')}-${moment(item.end_time).local().format('HH:mm')}` : undefined
                }
                onPress={() => {
                  navigation.push('CheckListAssignmentIntroduction', {
                    id: item.id,
                  })
                }}
              />
            </View>
          )
        }}
      />
    </>
  )
}

export default RelatedChecklistAssignment
