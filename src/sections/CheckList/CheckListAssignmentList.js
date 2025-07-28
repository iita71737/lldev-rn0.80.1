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

import CheckListAssignmentListTabToday from '@/sections/CheckList/CheckListAssignmentListTabToday'
import CheckListAssignmentHasDraftList from '@/sections/CheckList/CheckListAssignmentHasDraftList'
import CheckListAssignmentListTabTodayDone from '@/sections/CheckList/CheckListAssignmentListTabTodayDone'
import CheckListAssignmentListTabIncoming from '@/sections/CheckList/CheckListAssignmentListTabIncoming'
import CheckListAssignmentListTabExpired from '@/sections/CheckList/CheckListAssignmentListTabExpired'

const CheckListAssignmentList = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    checklistId,
    subTabIndex
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [tabIndex, settabIndex] = React.useState(0);
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'today',
      label: t('今日'),
      view: CheckListAssignmentListTabToday,
      props: {
        checklistId: checklistId
      }
    },
    {
      value: 'CheckListAssignmentHasDraftList',
      label: t('草稿'),
      view: CheckListAssignmentHasDraftList,
      props: {
        record_draft: 'not_null',
      }
    },
    {
      value: 'todayCompleted',
      label: t('今日已完成'),
      view: CheckListAssignmentListTabTodayDone,
      props: {
        checklistId: checklistId
      }
    },
    {
      value: 'incoming',
      label: t('預定'),
      view: CheckListAssignmentListTabIncoming,
      props: {
        checklistId: checklistId
      }
    },
    {
      value: 'expired',
      label: t('逾期'),
      view: CheckListAssignmentListTabExpired,
      props: {
        checklistId: checklistId
      }
    },
  ])

  const [params, setParams] = useState({
    order_by: 'created_at',
    order_way: 'desc',
    checklist: checklistId ? checklistId : undefined,
    time_field: 'record_at',
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD')
  })

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'today',
        label: t('今日'),
        view: CheckListAssignmentListTabToday,
        props: {
          checklistId: checklistId,

          subTabIndex: tabIndex ? tabIndex : 0
        }
      },
      {
        value: 'CheckListAssignmentHasDraftList',
        label: t('草稿'),
        view: CheckListAssignmentHasDraftList,
        props: {
          record_draft: 'not_null',

          subTabIndex: tabIndex ? tabIndex : 0
        }
      },
      {
        value: 'todayCompleted',
        label: t('今日已完成'),
        view: CheckListAssignmentListTabTodayDone,
        props: {
          checklistId: checklistId,

          subTabIndex: tabIndex ? tabIndex : 0
        }
      },
      {
        value: 'incoming',
        label: t('預定'),
        view: CheckListAssignmentListTabIncoming,
        props: {
          checklistId: checklistId,

          subTabIndex: tabIndex ? tabIndex : 0
        }
      },
      {
        value: 'expired',
        label: t('逾期'),
        view: CheckListAssignmentListTabExpired,
        props: {
          checklistId: checklistId,

          subTabIndex: tabIndex ? tabIndex : 0
        }
      },
    ])
  }

  React.useEffect(() => {
    if (subTabIndex) {
      settabIndex(subTabIndex)
    }
  }, [subTabIndex])

  React.useEffect(() => {
    $_setTabItems()
  }, [tabIndex, checklistId])

  return (
    <>
      <WsTabView
        isAutoWidth={true}
        scrollEnabled={true}
        fixedTabWidth={92}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
        pointerVisible={true}
      />
    </>
  )
}

export default CheckListAssignmentList
