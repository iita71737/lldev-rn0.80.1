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

const FactoryDashboardIndex = ({ navigation }) => {
  const StackSetting = createStackNavigator()
  const { t, i18n } = useTranslation()

  return (
    <>
      <StackSetting.Navigator>
        <StackSetting.Screen
          name="OrganizationDashboardIndex"
          component={ViewOrganizationDashboardIndex}
          options={{
            title: t('集團概況'),
            ...gOption.headerOption,
          }}
        />
        <StackSetting.Screen
          name="OrganizationTodayResult"
          component={ViewOrganizationTodayResult}
          options={{
            title: t('本日概況'),
            ...gOption.headerOption
          }}
        />
        <StackSetting.Screen
          name="EachFactoryIndexingData"
          component={ViewEachFactoryIndexingData}
          options={{
            title: t('各廠指標數據'),
            ...gOption.headerOption
          }}
        />
      </StackSetting.Navigator>
    </>
  )
}

export default FactoryDashboardIndex
