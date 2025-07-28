import React from 'react'
import {
  View,
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import {
  WsStepRoutesCreate,
  WsStepRoutesUpdate,
  WsText,
  WsDes,
  WsIcon,
  WsFlex,
  LlApiFail,
  WsLoading,
  WsBtn,
  WsHeaderBackBtn,
  WsSubtaskCard,
  WsStepCreatePage001,
  WsStepRoutesCreate001
} from '@/components'
import moment from 'moment'
import $option from '@/__reactnative_stone/global/option'
import $color from '@/__reactnative_stone/global/color'
import ViewMy from '@/views/My'
import ViewBoardCalendar from '@/views/BoardCalendar'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import ViewEventPickTypeTemplate from '@/views/Event/Create/PickTypeTemplate'
import { useSelector, connect } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import i18next from 'i18next'
import S_Init from '@/__reactnative_stone/services/app/Init'
import S_Event from '@/services/api/v1/event'
import S_Task from '@/services/api/v1/task'
import M_Task from '@/models/task'

const TaskStepRoutesCreateFromAlert = () => {

  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  return (
    <WsStepRoutesCreate001
      name={'TaskCreate'}
      title={i18next.t('建立任務')}
      modelName={'task'}
      fields={M_Task.fieldsCreateFromAlert()}
      stepSettings={M_Task.stepSettingsForTaskCreate()}
      submitFunction={M_Task.submitForCreate}
      currentUserId={currentUser && currentUser.id ? currentUser.id : undefined}
      parentId={currentFactory && currentFactory.id ? currentFactory.id : undefined}
    >
    </WsStepRoutesCreate001>
  )
}

export default TaskStepRoutesCreateFromAlert