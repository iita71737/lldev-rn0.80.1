import React from 'react'
import { StatusBar, Text, Alert, SafeAreaView, View } from 'react-native'
import { useSelector, connect } from 'react-redux'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { WsIcon, LlApiFail, LlSOSBtn001 } from '@/components'
import RoutesMenu from '@/routes/RoutesMenu'
import ViewsFactoryDashboardIndex from '@/routes/RoutesOrganizationDashboard'
import ViewsFactoryDashboardShow from '@/routes/RoutesOrganizationFactoryOverView'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import ViewBroadCast from '@/routes/RoutesOrganizationBroadcast'
import ViewBroadCastShow from '@/views/BroadCast/Show'
import RoutesAct from '@/routes/RoutesAct'
import RoutesMy from '@/routes/RoutesMy'
import RoutesAlert from '@/routes/RoutesAlert'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import ViewMy from '@/views/My'
import ViewAlertIndex from '@/views/Alert/Index'
import ViewAct from '@/views/Act/Index'

const RoutesOrganization = () => {
  const Tab = createBottomTabNavigator()
  const { t, i18n } = useTranslation()

  // REDUX
  const currentUserScope = useSelector(state => state.data.userScopes)

  const setRoutesMenuTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    const hideOnScreens = [
      'SOS',
      'ViewFactoryAndOrganization',
      'DashboardLicenseExpiredList',
      'DashboardTaskList',
      'DashboardEventList',
      'DashboardAlertList',
      'DashboardContractorEnterList',
      'DashboardChange',
      'DashboardTask',
      'DashboardAlert',
      'DashboardLicenseExpired',
      'DashboardEvent',
      'DashboardChangeList'
    ]
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true
    }
  }

  const tabBarListeners = ({ navigation, route }) => ({
    tabPress: () => navigation.navigate(route.name),
  });

  return (
    <>
      <Tab.Navigator
        // lazy={false}
        initialRouteName={'RoutesMenu'}
        screenOptions={({ route }) => ({
          headerShown: false,
          activeTintColor: $color.primary,
          showLabel: false,
          tabBarVisible: setRoutesMenuTabBarVisible(route),
          tabBarButton: [
            'ViewsOrganizationDashboard',
            'OrganizationTodayResult',
            "RoutesCheckList",
            "RoutesAudit",
            'RoutesContractorEnter',
            'RoutesTask',
            'RoutesTraining',
            'RoutesLicense',
            'RoutesEvent',
            'RoutesChange',
            'RoutesContractors',
            'BroadCastShow',
            'SOS'
          ].includes(route.name)
            ? () => {
              return null
            }
            : undefined
        })}>
        {/* 集團概況 */}
        <Tab.Screen
          name="FactoryDashboardIndex"
          component={ViewsFactoryDashboardIndex}
          options={{
            headerBackTitleVisible: false,
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'ws-filled-earth' : 'ws-outline-earth'}
                color={color}
                size={32}
              />
            )
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (!scopePermission('factory-dashboard-read', currentUserScope)) {
                Alert.alert(
                  t('您無此單位內相關權限，請聯絡系統管理員'),
                  "",
                  [
                    {
                      text: "我知道了",
                      onPress: () => {
                        navigation.navigate('RoutesMenu')
                      }
                    }
                  ]
                )
                e.preventDefault();
              }
            },
          })}
        />
        <Tab.Screen
          name="FactoryDashboardShow"
          component={ViewsFactoryDashboardShow}
          options={({ navigation, route }) => ({
            headerBackTitleVisible: false,
            unmountOnBlur: false,
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-pie-filled' : 'll-nav-pie-outline'}
                color={color}
                size={32}
              />
            )
          })}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (!scopePermission('organization-dashboard-read', currentUserScope)) {
                Alert.alert(
                  t('您無此單位內相關權限，請聯絡系統管理員'),
                  "",
                  [
                    {
                      text: "我知道了",
                      onPress: () => {
                        navigation.navigate('RoutesMenu')
                      }
                    }
                  ]
                )
                e.preventDefault();
              }
            },
          })}
        />

        <Tab.Screen
          name="MyIndex"
          // component={RoutesMy}
          component={ViewMy}
          options={{
            headerBackTitleVisible: false,
            tabBarLabel: t('看板'),
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-board' : 'll-nav-board-outline'}
                color={color}
                size={32}
              />
            )
          }}
        />

        <Tab.Screen
          name="RoutesAlert"
          component={ViewAlertIndex}
          options={{
            headerBackTitleVisible: false,
            ...gOption.headerOption,
            tabBarLabel: t('警示'),
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-alert-filled' : 'll-nav-alert-outline'}
                color={color}
                size={32}
              />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (!scopePermission('alert-read', currentUserScope)) {
                Alert.alert(
                  t('您無此單位內相關權限，請聯絡系統管理員'),
                  "",
                  [
                    {
                      text: "我知道了",
                      onPress: () => {
                        navigation.navigate('RoutesMenu')
                      }
                    }
                  ]
                )
                e.preventDefault();
              }
            },
          })}
        />

        <Tab.Screen
          name="Act"
          component={scopeFilterScreen('act-read', ViewAct)}
          options={{
            headerBackTitleVisible: false,
            tabBarLabel: t('法規'),
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-law-filled' : 'll-nav-law-outline'}
                color={color}
                size={32}
              />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (!scopePermission('act-read', currentUserScope)) {
                Alert.alert(
                  t('您無此單位內相關權限，請聯絡系統管理員'),
                  "",
                  [
                    {
                      text: "我知道了",
                      onPress: () => {
                        navigation.navigate('RoutesMenu')
                      }
                    }
                  ]
                )
                e.preventDefault();
              }
            },
            blur: (e) => {
              // console.log(e, 'blur');
            }
          })}
          backBehavior={'history'}
        />

        <Tab.Screen
          name="RoutesMenu"
          component={RoutesMenu}
          options={({ route }) => ({
            headerBackTitleVisible: false,
            tabBarLabel: t('設定'),
            tabBarIcon: ({ color, size }) => (
              <WsIcon name="ll-nav-app-menu" color={color} size={32} />
            ),
            tabBarVisible: setRoutesMenuTabBarVisible(route)
          })}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ screen: undefined }),
          })}
          backBehavior={'history'}
        />
      </Tab.Navigator>
    </>
  )
}

export default RoutesOrganization
