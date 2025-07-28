import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, FlatList, Clipboard, TouchableOpacity } from 'react-native'
import {
  LlCheckListCard005,
  WsPaddingContainer,
  WsInfiniteScroll,
  LlToggleTabBar001,
  WsTabView,
  WsIconBtn,
  WsLoading,
  WsInfo
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
import {
  setPreloadChecklistAssignment
} from '@/store/data'
import store from '@/store'

const CheckListAssignmentListTabToday = props => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const navigation = useNavigation()

  const {
    checklistId
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentConnectionState = useSelector(state => state.data.connectionState)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      checklist: checklistId ? checklistId : undefined,
      time_field: 'record_at',
      start_time: moment().format('YYYY-MM-DD'),
      end_time: moment().format('YYYY-MM-DD'),
      page: 1
    }
    return params
  }, [currentRefreshCounter, checklistId, currentConnectionState, navigation]);


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
                  navigation.push('RoutesCheckList', {
                    screen: 'CheckListAssignmentIntroduction',
                    params: {
                      id: item.assignment.id,
                      index: index
                    }
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
      {currentConnectionState === false
        ? renderEmptyList()
        : (
          <WsInfiniteScroll
            service={S_ChecklistAssignment}
            serviceIndexKey={'indexAuth'}
            params={_params}
            padding={16}
            renderItem={({ item, index }) => {
              return (
                <View key={item.id}>
                  <LlCheckListCard005
                    testID={`LlCheckListCard005-${index}`}
                    index={item.id}
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
                        index: index
                      })
                    }}
                  />
                </View>
              )
            }}
            emptyTitle={t('目前尚無資料')}
            emptyText={t('目前尚無資料')}
            ListFooterComponent={() => {
              return (
                <>
                  <View
                    style={{
                      height: 60,
                    }}
                  >
                  </View>
                </>
              )
            }}
          />
        )}
    </>
  )
}

export default CheckListAssignmentListTabToday
