import React, { useState, useRef } from 'react'
import {
  StatusBar,
  Text,
  Alert,
  SafeAreaView,
  View,
  Modal,
  Platform,
  Linking,
  ActivityIndicator
} from 'react-native'
import { useSelector, connect } from 'react-redux'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import {
  WsIcon,
  LlApiFail,
  WsDetectIdle,
  WsIconBtn,
  WsQRcodeDetect,
  WsDetectIdle002
} from '@/components'
import RoutesFactory from '@/routes/RoutesFactory'
import RoutesOrganization from '@/routes/RoutesOrganization'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import $option from '@/__reactnative_stone/global/option'
import gOption from '@/__reactnative_stone/global/option'
import { useTranslation } from 'react-i18next'
import S_Init from '@/__reactnative_stone/services/app/Init'
import { useNavigationState } from '@react-navigation/native';
const StackSetting = createStackNavigator()
import RoutesTask from '@/routes/RoutesTask'
import RoutesEvent from '@/routes/RoutesEvent'
import RoutesAlert from '@/routes/RoutesAlert'
import RoutesCheckList from '@/routes/RoutesCheckList'
import RoutesLicense from '@/routes/RoutesLicense'
import RoutesChange from '@/routes/RoutesChange'
import RoutesContractorEnter from '@/routes/RoutesContractorEnter'
import RoutesAudit from '@/routes/RoutesAudit'
import RoutesAct from '@/routes/RoutesAct'
import RoutesContractors from '@/routes/RoutesContractors'
import RoutesTraining from '@/routes/RoutesTraining'
import RoutesMenu from '@/routes/RoutesMenu'
import ViewBoardCalendar from '@/views/BoardCalendar'
import ViewBroadCast from '@/views/BroadCast/Index'
import ViewBroadCastShow from '@/views/BroadCast/Show'
import messaging from '@react-native-firebase/messaging';
import S_NotificationFCM from '@/services/app/notification'
import S_Factory from '@/services/api/v1/factory'
import store from '@/store'
import {
  setCurrentFactory,
  setInitUrlFromQRcode
} from '@/store/data'
import ViewQRcodeSection from '@/views/ViewQRcodeSection'
import ViewQRcodeScanner from '@/views/ViewQRcodeScanner'
import ViewFileStoreShow from '@/views/File/Show'
import UserInactivity from "react-native-user-inactivity";
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import ViewFileStore from '@/views/File/FileStore'
import ViewFileStoreSubLayer from '@/views/File/FileStoreSubLayer'

const RoutesApp = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Redux
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const navigationState = useNavigationState(state => state);
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATE
  const [active, setActive] = useState(true);  // global idle detect

  const setRoutesMenuTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    const hideOnScreens = [
      'SOS',
      'AuditRecordsShow',
      'AlertShow',
      'CheckListShow',
      'LicenseShow',
      'ChangeShow',
      'EventShow',
      'ContractorEnterShow',
      'TrainingShow',
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
      'DashboardChangeList'
    ]
    if (hideOnScreens.indexOf(routeName) > -1) {
      return false
    } else {
      return true
    }
  }

  // SERVICES
  const $_checkoutFactory = async (id) => {
    try {
      const _factory = await S_Factory.show({ modelId: id })
      store.dispatch(setCurrentFactory(_factory))
    } catch (e) {
      console.error(e, '切換單位失敗');
    }
  }

  // REDIRECTION FROM NOTIFICATION
  const handleNotification = async (remoteMessage) => {
    if (remoteMessage &&
      remoteMessage.data &&
      remoteMessage.data.factory_id &&
      currentFactory &&
      (currentFactory.id !== remoteMessage.data.factory_id)) {
      await $_checkoutFactory(remoteMessage.data.factory_id)
      setTimeout(() => {
        S_NotificationFCM.redirectFromMessage(remoteMessage, navigation);
      }, 1000);
    }
    else {
      S_NotificationFCM.redirectFromMessage(remoteMessage, navigation)
    }
  };

  React.useEffect(() => {
    messaging().onNotificationOpenedApp(remoteMessage => {
      // console.log('Notification caused app to open from background state');
      handleNotification(remoteMessage);
    });
    messaging().getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotification(remoteMessage);
        }
      });
  }, []);

  return (
    <>
      <UserInactivity
        isActive={active}
        timeForInactivity={300000} // 多少秒沒操作視為閒置 ms
        // timeForInactivity={5000} // debug用
        onAction={isActive => {
          setActive(isActive)
        }}
      >

        <StackSetting.Navigator
          screenOptions={({ route }) => ({
            activeTintColor: $color.primary,
            showLabel: false,
            tabBarVisible: setRoutesMenuTabBarVisible(route),
            tabBarButton: [
              'RoutesCheckList',
              'RoutesAudit',
              'RoutesContractorEnter',
              // 'RoutesTask',
              'RoutesTraining',
              'RoutesLicense',
              'RoutesEvent',
              'RoutesChange',
              'RoutesContractors'
            ].includes(route.name)
              ? () => {
                return null
              }
              : undefined
          })}>

          {currentViewMode == 'factory' && (
            <StackSetting.Screen
              name="RoutesFactory"
              component={RoutesFactory}
              options={{
                headerShown: false
              }}
            />
          )}
          {currentViewMode == 'organization' && (
            <StackSetting.Screen
              name="RoutesOrganization"
              component={RoutesOrganization}
              options={{
                headerShown: false
              }}
            />
          )}

          {/* 1 */}
          <StackSetting.Screen
            name="RoutesTask"
            component={RoutesTask}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />

          {/* 2 */}
          <StackSetting.Screen
            name="RoutesEvent"
            component={RoutesEvent}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />

          {/* 3 */}
          <StackSetting.Screen
            name="RoutesAlert"
            component={RoutesAlert}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 4 */}
          <StackSetting.Screen
            name="RoutesCheckList"
            component={RoutesCheckList}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 5 */}
          <StackSetting.Screen
            name="RoutesLicense"
            component={RoutesLicense}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 6 */}
          <StackSetting.Screen
            name="RoutesChange"
            component={RoutesChange}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 7 */}
          <StackSetting.Screen
            name="RoutesContractorEnter"
            component={RoutesContractorEnter}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 8 */}
          <StackSetting.Screen
            name="RoutesAudit"
            component={RoutesAudit}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 9 */}
          <StackSetting.Screen
            name="RoutesAct"
            component={RoutesAct}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 10 */}
          <StackSetting.Screen
            name="RoutesTraining"
            component={RoutesTraining}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />
          {/* 11 */}
          <StackSetting.Screen
            name="RoutesContractors"
            component={RoutesContractors}
            options={{
              ...$option.headerOption,
              gestureEnabled: false,
              headerShown: false
            }}
          />

          <StackSetting.Screen
            name="ViewBroadCast"
            component={ViewBroadCast}
            options={({ navigation }) => ({
              headerBackTitle: ' ',
              title: t('ESGoal快報'),
              ...$option.headerOption,
            })}
          />
          <StackSetting.Screen
            name="BroadCastShow"
            component={ViewBroadCastShow}
            options={({ navigation }) => ({
              title: t('ESGoal快報'),
              ...$option.headerOption,
            })}
          />
          <StackSetting.Screen
            name="BoardCalendar"
            component={ViewBoardCalendar}
            options={{
              title: t('本場行程'),
              ...$option.headerOption,
              animationEnabled: false,
              headerBackTitle: ' '
            }}
          />

          <StackSetting.Screen
            name="ViewQRcodeScanner"
            component={ViewQRcodeScanner}
            options={({ navigation }) => ({
              title: t('QRcode工具'),
              ...$option.headerOption,
              headerBackTitle: ' '
            })}
          />

          <StackSetting.Screen
            name="ViewQRcodeSection"
            component={ViewQRcodeSection}
            options={({ navigation }) => ({
              // headerShown: false,
              title: t('QRcode連結頁'),
              ...$option.headerOption,
              headerLeft: () => (
                <WsIconBtn
                  testID="backButton"
                  name="md-chevron-left"
                  color={$color.white}
                  size={32}
                  style={{
                  }}
                  onPress={async () => {
                    await store.dispatch(setInitUrlFromQRcode(null))
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.navigate('RoutesFactory'); // 跳轉到首頁或其他指定螢幕
                    }
                  }}
                />
              ),
            })}
          />

          {/* 文件檔案庫檔案內頁 */}
          <StackSetting.Screen
            name="FileStoreShow"
            component={scopeFilterScreen('system-file-read', ViewFileStoreShow)}
            options={({ route }) => ({
              title: route.params.name,
              ...gOption.headerOption,
              headerTitleAlign: 'center',
              animationEnabled: false,
              headerBackTitle: t('返回')
            })}
          />

          <StackSetting.Screen
            name="FileStore"
            component={scopeFilterScreen('system-file-read', ViewFileStore)}
            options={({ navigation }) => ({
              title: t('文件檔案庫'),
              ...gOption.headerOption,
              headerTitleAlign: 'center',
              animationEnabled: false,
              headerBackTitle: t('返回'),
              headerLeft: () => (
                <WsIconBtn
                  testID="backButton"
                  name="md-chevron-left"
                  color={$color.white}
                  size={32}
                  style={{
                  }}
                  onPress={() => {
                    navigation.goBack()
                  }}
                />
              ),
            })}
          />
          <StackSetting.Screen
            name="FileStoreSubLayer"
            component={scopeFilterScreen('system-file-read', ViewFileStoreSubLayer)}
            options={({ navigation, route }) => ({
              title: route.params.name,
              ...gOption.headerOption,
              headerTitleAlign: 'center',
              animationEnabled: false,
              headerBackTitle: t('返回'),
              headerLeft: () => (
                <WsIconBtn
                  testID="backButton"
                  name="md-chevron-left"
                  color={$color.white}
                  size={32}
                  style={{
                  }}
                  onPress={() => {
                    navigation.goBack()
                  }}
                />
              ),
            })}
          />



        </StackSetting.Navigator>
      </UserInactivity>

      <WsDetectIdle002
        active={active}
        setActive={setActive}
      ></WsDetectIdle002>

      <WsQRcodeDetect></WsQRcodeDetect>
    </>
  )
}

export default RoutesApp
