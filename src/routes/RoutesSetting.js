import React from 'react'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsHeaderBackBtn } from '@/components'
import { WsBtn, WsIconBtn } from '@/components'
import ViewSettingIndex from '@/views/Setting/Index'
import RoutesUsers from '@/routes/RoutesUsers'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import gOption from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'

const StackSetting = createStackNavigator()

const RoutesSetting = () => {
  const { t, i18n } = useTranslation()

  const hideHeaderRoutes = ['RoutesAudit']
  const isHeaderVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    if (!routeName) {
      return true
    }
    return hideHeaderRoutes.includes(routeName)
  }

  const setRoutesSettingTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    const hideOnScreens = ['AuditShow', 'AuditCreate', 'AuditRecordsShow']
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true
    }
  }

  return (
    <StackSetting.Navigator
      screenOptions={({ route }) => ({
        headerShown: isHeaderVisible(route),
        tabBarVisible: setRoutesSettingTabBarVisible(route)
      })}
      // initialRouteName="Setting"
    >
      <StackSetting.Screen
        name="SettingIndex"
        component={ViewSettingIndex}
        options={{
          title: t('設定'),
          ...gOption.headerOption
        }}
      />
      <StackSetting.Screen
        name="RoutesUsers"
        component={scopeFilterScreen('user-factory-manage', RoutesUsers)}
        options={{
          ...gOption.headerOption,
          headerShown: false,
        }}
      />
    </StackSetting.Navigator>
  )
}

export default RoutesSetting
