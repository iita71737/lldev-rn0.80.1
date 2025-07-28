import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView } from 'react-native'
import {
  LlCheckListCard005,
  WsPaddingContainer,
  WsInfiniteScroll,
  LlToggleTabBar001,
  WsTabView
} from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import S_CheckList from '@/services/api/v1/checklist'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

import CheckListAssignmentQuestionSort from '@/sections/CheckList/CheckListAssignmentQuestionSort'
import CheckListAssignmentResultSort from '@/sections/CheckList/CheckListAssignmentResultSort'

const CheckListAssignmentListTabIncoming = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    checklistId
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [params, setParams] = useState({
    order_by: 'created_at',
    order_way: 'desc',
    checklist: checklistId ? checklistId : undefined,
    time_field: 'record_at',
    start_time: moment().add(1, 'days').format('YYYY-MM-DD') ,
    end_time: undefined
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_ChecklistAssignment}
        serviceIndexKey={'indexAuth'}
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <View key={item.id}>
              <LlCheckListCard005
                key={item.id}
                item={item}
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
                  item.record_at ? moment(item.record_at).format('YYYY-MM-DD') : '無期限'
                }
                disabled={item.record_at && moment().isSameOrAfter(moment(item.record_at), 'day') ? false : true}
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

export default CheckListAssignmentListTabIncoming
