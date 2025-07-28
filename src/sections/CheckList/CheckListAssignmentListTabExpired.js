import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, FlatList } from 'react-native'
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

const CheckListAssignmentListTabExpired = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    checklistId
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentConnectionState = useSelector(state => state.data.connectionState)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)

  // States
  const [params, setParams] = useState({
    order_by: 'record_at',
    order_way: 'desc',
    checklist: checklistId ? checklistId : undefined,
    time_field: 'record_at',
    start_time: undefined,
    end_time: moment().subtract(1, 'days').format('YYYY-MM-DD')
  })

  // 逾期且我已完成作答
  const $_hasChecked = (checkers) => {
    if (currentUser && checkers && checkers.length > 0) {
      return checkers.some(checker => checker.id === currentUser.id && checker.checklist_record_answer != null);
    }
  }

  // 已下載的離線作業
  const renderEmptyList = () => {
    return (
      <FlatList
        data={currentPreloadChecklistAssignment}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          return (
            <View key={item.assignment?.id}>
              <LlCheckListCard005
                key={item.assignment?.id}
                item={item.assignment}
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12
                    }
                ]}
                todayDone={$_hasChecked(item.assignment?.checkers)}
                name={item.assignment?.checklist ? item.assignment?.checklist.name : ''}
                tagIcon={item.assignment?.tagIcon}
                tagText={item.assignment?.tagText}
                checkers={item.assignment?.checkers ? item.assignment?.checkers : ''}
                reviewers={item.assignment?.reviewers ? item.assignment?.reviewers : t('無')}
                deadline={
                  item.assignment?.record_at ? moment(item.assignment?.record_at).format('YYYY-MM-DD') : '無期限'
                }
                disabled={item.assignment?.record_at && moment().isSameOrAfter(moment(item.assignment?.record_at), 'day') ? false : true}
                onPress={() => {
                  navigation.push('CheckListAssignmentIntroduction', {
                    id: item.assignment?.id,
                    todayDone: $_hasChecked(item.assignment?.checkers),
                    subTabIndex: 4,
                    index: index
                  })
                }}
              />
            </View>
          )
        }}
      />
    )
  }

  return (
    <>
      {currentConnectionState === false ?
        renderEmptyList() : (
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
                    todayDone={$_hasChecked(item.checkers)}
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
                        todayDone: $_hasChecked(item.checkers),
                        subTabIndex: 4
                      })
                    }}
                  />
                </View>
              )
            }}
          />
        )}


    </>
  )
}

export default CheckListAssignmentListTabExpired
