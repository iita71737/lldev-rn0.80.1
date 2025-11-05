import React from 'react'
import { StatusBar, Text, Alert, SafeAreaView, View } from 'react-native'
import { useSelector, connect } from 'react-redux'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  WsIcon,
  LlApiFail,
  LlSOSBtn001,
  WsSkeleton
} from '@/components'
import RoutesMenu from '@/routes/RoutesMenu'
import ViewsFactoryDashboardIndex from '@/routes/RoutesOrganizationDashboard'
import ViewsFactoryDashboardShow from '@/routes/RoutesOrganizationFactoryOverView'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import RoutesAct from '@/routes/RoutesAct'
import RoutesMy from '@/routes/RoutesMy'
import RoutesAlert from '@/routes/RoutesAlert'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import ViewMy from '@/views/My'
import ViewAlertIndex from '@/views/Alert/Index'
import ViewAct from '@/views/Act/Index'
import messaging from '@react-native-firebase/messaging'
import Homepage from '@/views/Homepage';

const RoutesOrganization = () => {
  const { t, i18n } = useTranslation()
  const Tab = createBottomTabNavigator()

  // REDUX
  const isMounted = useSelector(state => state.stone_app.isMounted)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(state => state.data.currentOrganization)

  // 1) 依 currentFactory 決定 initialRoute，只在 factory 變動時重算
  const initialRouteName = React.useMemo(() => {
    if (!currentFactory) return null;
    if (currentFactory.is_alliance_home_page == 1) return 'Homepage';
    return scopeSubscriptions(currentFactory, 'board') ? 'MyIndex' : 'RoutesMenu';
  }, [
    currentFactory?.id,
    currentFactory?.is_alliance_home_page,
    currentUserScope
  ]);

  // ====== 延遲渲染 Tab：純 JS 寫法（無型別）======
  const [gateReady, setGateReady] = React.useState(false);
  const delayRef = React.useRef(null);
  const lastFactoryRef = React.useRef(null);
  const DELAY_MS = 1000; // 想延遲多久，自己改（毫秒）

  React.useEffect(() => {
    setGateReady(false);
    if (delayRef.current) clearTimeout(delayRef.current);

    const currId = currentFactory?.id ?? null;
    lastFactoryRef.current = currId;

    if (!currId || !initialRouteName) return;

    delayRef.current = setTimeout(() => {
      if (lastFactoryRef.current === currId) {
        setGateReady(true);
      }
    }, DELAY_MS);

    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
    };
  }, [currentFactory?.id, initialRouteName]);
  // ===============================================

  // STATE
  const [deviceToken, setDeviceToken] = React.useState()
  const [initFirebaseMessage, setInitFirebaseMessage] = React.useState(false);

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

  // 延遲期間顯示 Skeleton（避免舊畫面閃一下）
  if (!gateReady || !initialRouteName || !currentFactory) {
    return (
      <SafeAreaView>
        <WsSkeleton style={{ flex: 1 }} />
      </SafeAreaView>
    )
  }

  return (
    <>
      <Tab.Navigator
        key={`${currentFactory?.id}-${initialRouteName}`}
        // lazy={false}
        optimizationsEnabled={true}
        unmountOnBlur={true}
        initialRouteName={initialRouteName}
        screenOptions={({ route }) => ({
          headerShown: false,
          activeTintColor: $color.primary,
          tabBarShowLabel: false,
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
        })}
      >

        <Tab.Screen
          name="Homepage"
          component={Homepage}
          options={{
            tabBarButton: currentFactory?.is_alliance_home_page == 1
              ? undefined
              : () => null,
            unmountOnBlur: true,
            tabBarIcon: ({ focused, color, size }) => (
              <WsIcon
                name={focused ? 'md-home' : 'md-home'}
                color={color}
                size={32}
              />
            ),
          }}
          backBehavior={'history'}
        />

        {/* 集團概況 */}
        <Tab.Screen
          name="FactoryDashboardIndex"
          component={ViewsFactoryDashboardIndex}
          options={{
            tabBarButton: scopeSubscriptions(currentFactory, 'organization-dashboard-read')
              ? undefined
              : () => null,
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
          name="FactoryDashboardShow"
          component={ViewsFactoryDashboardShow}
          options={({ navigation, route }) => ({
            tabBarButton: scopeSubscriptions(currentFactory, 'factory-dashboard-read')
              ? undefined
              : () => null,
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
          name="MyIndex"
          component={ViewMy}
          options={{
            tabBarButton: scopeSubscriptions(currentFactory, 'board')
              ? undefined
              : () => null,
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
            tabBarButton: scopeSubscriptions(currentFactory, 'alert')
              ? undefined
              : () => null,
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
            tabBarButton: scopeSubscriptions(currentFactory, 'act')
              ? undefined
              : () => null,
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
