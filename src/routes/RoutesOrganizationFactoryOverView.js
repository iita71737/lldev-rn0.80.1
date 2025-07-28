import React from 'react'
import { View } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsBtn, LlSOSBtn001 } from '@/components'
import ViewSOS from '@/views/SOS'
import ViewSOSSubmit from '@/views/SosSubmit'

import ViewDashboardEvent from '@/views/DashboardFactory/Event'
import ViewDashboardLicenseExpired from '@/views/DashboardFactory/LicenseExpired'
import ViewDashboardAlert from '@/views/DashboardFactory/Alert'
import ViewDashboardChange from '@/views/DashboardFactory/Change'
import ViewDashboardTask from '@/views/DashboardFactory/Task'

import ViewDashboardContractorEnter from '@/views/DashboardFactory/ContractorEnter'
import ViewDashboardAlertList from '@/views/DashboardFactory/DashboardAlertListTab'
import ViewDashboardEventList from '@/views/DashboardFactory/DashboardEventListTab'
import ViewDashboardTaskList from '@/views/DashboardFactory/DashboardTaskListTab'
import ViewDashboardLicenseExpiredList from '@/views/DashboardFactory/DashboardLicenseExpiredListTab'
import ViewDashboardChangeList from '@/views/DashboardFactory/DashboardChangeListTab'
import ViewDashboardFactory from '@/views/DashboardFactory/Index'

import gOption from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'

const StackSetting = createStackNavigator()

const RoutesDashboard = () => {
  const { t, i18n } = useTranslation()

  return (
    <StackSetting.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
      }}
      initialRouteName={'MyIndex'}
    >
      <StackSetting.Screen
        name="DashboardFactory"
        component={scopeFilterScreen(['organization-dashboard-read', 'factory-dashboard-read'], ViewDashboardFactory)}
        options={({ navigation }) => ({
          headerBackTitle:'',
          title: t('各單位概況'),
          ...gOption.headerOption,
          headerRight: () => (
            <LlSOSBtn001
              style={{
                marginRight: 6
              }}
            />
          )
        })}
      />
      <StackSetting.Screen
        name="SOS"
        component={ViewSOS}
        options={{
          title: t('SOS緊急求助'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="SOSSubmit"
        component={ViewSOSSubmit}
        options={{
          title: t('SOS緊急求助'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardEvent"
        component={ViewDashboardEvent}
        options={{
          title: t('風險事件處理中'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardLicenseExpired"
        component={ViewDashboardLicenseExpired}
        options={{
          title: t('證照即將到期'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardAlert"
        component={ViewDashboardAlert}
        options={{
          title: t('警示未排除'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardTask"
        component={ViewDashboardTask}
        options={{
          title: t('任務處理中'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardChange"
        component={ViewDashboardChange}
        options={{
          title: t('變動評估中'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardContractorEnter"
        component={ViewDashboardContractorEnter}
        options={{
          title: t('今日進場'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardAlertList"
        component={ViewDashboardAlertList}
        options={{
          title: t('警示未排除'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardEventList"
        component={ViewDashboardEventList}
        options={{
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardTaskList"
        component={ViewDashboardTaskList}
        options={{
          title: t('任務處理中'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardLicenseExpiredList"
        component={ViewDashboardLicenseExpiredList}
        options={{
          title: t('證照即將到期'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="DashboardChangeList"
        component={ViewDashboardChangeList}
        options={{
          title: t('證照即將到期'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesDashboard
