import React from 'react'
import { View, Text } from 'react-native'
import {
  WsAnalyzeCard,
  WsBtn,
  WsText,
  WsFlex,
  WsStatePicker,
  WsState,
  WsGrid,
  WsPaddingContainer,
  WsCharts,
  WsChartsModels,
  LlSOSBtn001
} from '@/components'
import { createStackNavigator } from '@react-navigation/stack'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import gOption from '@/__reactnative_stone/global/option'
import ViewOrganizationDashboardIndex from '@/views/Organization/OrganizationDashboard/Index'
import ViewOrganizationTodayResult from '@/views/Organization/OrganizationDashboard/TodayResult/Index'
import ViewEachFactoryIndexingData from '@/views/Organization/OrganizationDashboard/EachFactoryIndexingData/Index'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import ViewBroadCast from '@/views/BroadCast/Index'
import ViewBroadCastShow from '@/views/BroadCast/Show'

const RoutesOrganizationBroadcast = ({ navigation }) => {
  const StackSetting = createStackNavigator()
  const { t, i18n } = useTranslation()

  return (
    <>
      <StackSetting.Navigator>
        <StackSetting.Screen
          name="OrganizationBroadcast"
          component={ViewBroadCast}
          options={{
            headerShown: false,
            title: t('ESGoal快報'),
            ...gOption.headerOption,
            headerRight: () => (
              <LlSOSBtn001
                style={{
                  marginRight: 4
                }}
              />
            )
          }}
        />
        <StackSetting.Screen
          name="BroadCastShow"
          component={ViewBroadCastShow}
          options={{
            title: t('ESGoal快報'),
            ...gOption.headerOption
          }}
        />
      </StackSetting.Navigator>
    </>
  )
}

export default RoutesOrganizationBroadcast
