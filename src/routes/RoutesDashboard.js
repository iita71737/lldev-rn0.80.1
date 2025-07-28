import React from 'react'
import { View, Alert } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsBtn, LlSOSBtn001 } from '@/components'
import ViewDashboardFactory from '@/views/DashboardFactory/Index'

import $option from '@/__reactnative_stone/global/option'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import { useSelector, connect } from 'react-redux'

const StackSetting = createStackNavigator()

const RoutesDashboard = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // REDUX
  const currentUserScope = useSelector(state => state.data.userScopes)

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false
      }}>
    </StackSetting.Navigator>
  )
}

export default RoutesDashboard
