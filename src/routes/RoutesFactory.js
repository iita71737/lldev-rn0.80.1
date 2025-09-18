
import React from 'react';
import { 
  StatusBar, 
  Text, 
  Alert, 
  SafeAreaView, 
  View 
} from 'react-native'
import { useSelector, connect } from 'react-redux'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  WsIcon,
  LlApiFail,
  WsIconBtn,
  LlSOSBtn001,
  WsFlex
} from '@/components'
import RoutesDashboard from '@/routes/RoutesDashboard'
import RoutesMy from '@/routes/RoutesMy'
import RoutesAlert from '@/routes/RoutesAlert'
import RoutesAct from '@/routes/RoutesAct'
import RoutesAudit from '@/routes/RoutesAudit'
import RoutesCheckList from '@/routes/RoutesCheckList'
import RoutesEvent from '@/routes/RoutesEvent'
import RoutesLicense from '@/routes/RoutesLicense'
import RoutesTraining from '@/routes/RoutesTraining'
import RoutesTask from '@/routes/RoutesTask'
import RoutesContractorEnter from '@/routes/RoutesContractorEnter'
import RoutesChange from '@/routes/RoutesChange'
import RoutesMenu from '@/routes/RoutesMenu'
import RoutesContractors from '@/routes/RoutesContractors'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import $color from '@/__reactnative_stone/global/color'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import $config from '@/__config'
import { CommonActions } from '@react-navigation/native';
import S_Init from '@/__reactnative_stone/services/app/Init'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import ViewAct from '@/views/Act/Index'
import ViewDashboardFactory from '@/views/DashboardFactory/Index'
import ViewMenu from '@/views/Menu'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import S_Task from '@/services/api/v1/task'
import messaging from '@react-native-firebase/messaging'
import S_Notification from '@/services/app/notification'
import S_Factory from '@/services/api/v1/factory'
import store from '@/store'
import { setCurrentFactory } from '@/store/data'
import S_DeviceToken from '@/__reactnative_stone/services/api/v1/device_token'
import AsyncStorage from '@react-native-community/async-storage'
import ViewAlertIndex from '@/views/Alert/Index'
import ViewMy from '@/views/My'

const RoutesFactory = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const Tab = createBottomTabNavigator();

  // Redux
  const isMounted = useSelector(state => state.stone_app.isMounted)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // STATE
  const [deviceToken, setDeviceToken] = React.useState()
  const [initFirebaseMessage, setInitFirebaseMessage] = React.useState(false);

  const setRoutesMenuTabBarVisible = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    const hideOnScreens = [
      'SOS',
      'AuditRecordsShow',
      'AlertShow',
      'CheckListShow',
      'LicenseShow',
      'ChangeShow',
      'EventShow',
      'ContractorEnterShow',
      'ActShow',
      'RolesShow',
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
      'DashboardChangeList',
      'TaskShow',
      'CheckListPickTemplate',
      'CheckListCreate',
      'CustomizeCheckListCreate',
      'CheckListAssignmentUpdate',
      'CheckListAssignmentProcedure',
      // 'CheckListReviewResultShow',
      'CheckListReviewShow',
      'CheckListAssignmentShow',
      'ViewCheckListReviewed',
      'AuditAssignmentProcedure',
      'CheckListAssignmentPreview',
      'ChangeAssignmentPreview',
      'ChangeAssignmentProcedure'
    ];
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true;
    }
  }

  const $_checkoutFactory = async (id) => {
    const _factory = await S_Factory.show({ modelId: id })
    store.dispatch(setCurrentFactory(_factory))
  }

  // Storage
  const $_setStorage = async token => {
    const _value = JSON.stringify(token)
    await AsyncStorage.setItem('fcmToken', _value)
    setDeviceToken(_value)
  }

  // FCM TOKEN SIGNUP TO BACK_END
  const signupDevice = async () => {
    const authorizationStatus = await messaging().requestPermission()
    if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      console.log('User has notification permissions enabled.')
    } else if (
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      console.log('User has provisional notification permissions.')
    } else {
      console.log('User has notification permissions disabled')
    }
    if (
      authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL
    ) {
      messaging()
        .getToken()
        .then(async token => {
          console.log('-------fcm-------', token)
          await $_setStorage(token)
          // 註冊設備
          try {
            await S_DeviceToken.active({
              deviceToken: token
            }).then(res => {
            })
          } catch (error) {
            if (error.response) {
              console.log("Error data", error.response.data);
            } else if (error.request) {
              console.log("Error request", error.request);
            } else {
              console.log('Error', error.message);
            }
            console.error(error, 'deactive err-')
            Alert.alert('設備註冊失敗')
          }
        })
    }
  }

  // FIREBASE LISTENER SIGNUP
  const handleFCMMessage = async (remoteMessage) => {
    console.log(remoteMessage, 'remoteMessage handleFCMMessage');
    const _title = remoteMessage.notification.title.replace(/['"]+/g, '')
    const _content = remoteMessage.notification.body.replace(/['"]+/g, '')
    const title = S_Notification.setTitle(_title)
    const content = S_Notification.getNoticeTitle(remoteMessage)
    Alert.alert(title, content, [
      {
        text: 'Cancel',
        onPress: () => console.log('handleFCMMessage Cancel'),
      },
      {
        text: 'OK',
        onPress: async () => {
          if (
            remoteMessage &&
            remoteMessage.data &&
            remoteMessage.data.factory_id
            && currentFactory &&
            (currentFactory.id !== remoteMessage.data.factory_id)
          ) {
            await $_checkoutFactory(remoteMessage.data.factory_id)
          }
          S_Notification.redirectFromMessage(remoteMessage, navigation)
        }
      }
    ])
  };

  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(handleFCMMessage);
    if (currentFactory && !initFirebaseMessage) {
      setInitFirebaseMessage(true)
      unsubscribe()
    }
    return () => {
      if (isMounted) {
        signupDevice()
      }
      unsubscribe()
    };
  }, [currentFactory, initFirebaseMessage])

  return (
    <>
      <Tab.Navigator
        // lazy={false}
        optimizationsEnabled={true}
        unmountOnBlur={true}
        initialRouteName={'MyIndex'}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          activeTintColor: $color.primary,
          showLabel: false,
          tabBarVisible: setRoutesMenuTabBarVisible(route),
          tabBarButton: [
            "RoutesCheckList",
            "RoutesAudit",
            'RoutesContractorEnter',
            'RoutesTask',
            'RoutesTraining',
            'RoutesLicense',
            'RoutesEvent',
            'RoutesChange',
            'RoutesContractors',
            'Menu',
          ].includes(route.name)
            ? () => {
              return null;
            }
            : undefined,
        })}
      >
        <Tab.Screen
          name="DashboardFactory"
          component={ViewDashboardFactory}
          options={{
            tabBarTestID: 'DashboardFactory',
            unmountOnBlur: false,
            tabBarLabel: t('概況'),
            headerBackTitleVisible: false,
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-pie-filled' : 'll-nav-pie-outline'}
                color={color}
                size={32}
              />
            ),
          }}
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {
              if (currentViewMode === 'factory') {
                if (!scopePermission(['dashboard-read'], currentUserScope)) {
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
              } else if (currentViewMode === 'organization') {
                if (!scopePermission(['organization-dashboard-read'], currentUserScope)) {
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
              }
            },
          })}
        />
        <Tab.Screen
          name="MyIndex"
          component={ViewMy}
          options={{
            tabBarTestID: 'MyIndex',
            unmountOnBlur: true,
            tabBarLabel: t('看板'),
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'll-nav-board' : 'll-nav-board-outline'}
                color={color}
                size={32}
              />
            ),
          }}
          backBehavior={'history'}
        />
        <Tab.Screen
          name="RoutesAlert"
          component={ViewAlertIndex}
          options={{
            tabBarTestID: 'RoutesAlert',
            unmountOnBlur: true,
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
          initialParams={{
            title: t('警示')
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
          backBehavior={'history'}
        />
        <Tab.Screen
          name="Act"
          component={scopeFilterScreen('act-read', ViewAct)}
          options={{
            tabBarTestID: 'Act',
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
            }
          })}
          backBehavior={'history'}
        />
        <Tab.Screen
          name="RoutesMenu"
          component={RoutesMenu}
          options={({ route }) => ({
            tabBarTestID: 'RoutesMenu',
            tabBarLabel: t('選單'),
            tabBarIcon: ({ color, size }) => (
              <WsIcon
                name="ll-nav-app-menu"
                color={color}
                size={32}
              />
            ),
            tabBarVisible: setRoutesMenuTabBarVisible(route)
          })}
          listeners={({ navigation }) => ({
            blur: () => navigation.setParams({ screen: undefined }),
          })}
          backBehavior={'history'}
        />
      </Tab.Navigator >
    </>
  )
}

export default RoutesFactory