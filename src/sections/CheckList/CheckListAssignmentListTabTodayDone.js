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

const CheckListAssignmentListTabTodayDone = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const currentLang = i18n.language
  const _stack = navigation.getState().routes
  const offsetInMinutes = new Date().getTimezoneOffset();

  const {
    checklistId
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const _params = React.useMemo(() => {
    return {
      checklist: checklistId ? checklistId : undefined,
      time_field: 'record_at',
      start_time: moment().startOf('day').utcOffset(-offsetInMinutes).toISOString(),
      end_time: moment().endOf('day').utcOffset(-offsetInMinutes).toISOString(),
    }
  }, [checklistId]);


  return (
    <>
      <WsInfiniteScroll
        service={S_ChecklistAssignment}
        serviceIndexKey={'indexDoneAuth'}
        params={_params}
        padding={16}
        emptyTitle={t('目前尚無資料')}
        renderItem={({ item, index }) => {
          return (
            <View key={item.id}>
              <LlCheckListCard005
                todayDone={true}
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
                onPress={async () => {
                  // navigation.push('CheckListAssignmentIntroduction', {
                  //   id: item.id,
                  //   todayDone: true
                  // })
                  // console.log(JSON.stringify(item), 'item--');
                  try {
                    const _params = {
                      id: item.id,
                      lang: currentLang ? currentLang : undefined
                    }
                    const res = await S_ChecklistAssignment.show({
                      params: _params
                    })
                    // console.log(res,'res---');
                    if (res) {
                      navigation.navigate({
                        name: 'CheckListAssignmentShow',
                        params: {
                          id: res.checklist_record?.id,
                        }
                      })
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
              />
            </View>
          )
        }}
      />
    </>
  )
}

export default CheckListAssignmentListTabTodayDone
