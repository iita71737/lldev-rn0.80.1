import React from 'react'
import { StyleSheet, View, Linking, Text, Dimensions, Alert, Button } from 'react-native'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsBtn, WsIconBtn, LlSOSBtn001, LlqrcodeScanner, WsFlex, WsHeaderBackBtn } from '@/components'
import ViewMenu from '@/views/Menu'
import ViewChangePassword from '@/views/ChangePassword'
import ViewFactoryAndOrganization from '@/views/FactoryAndOrganization'
import ViewMyAccountSetting from '@/views/MyAccountSettings'
import ViewSettingLanguage from '@/views/SettingLanguage'
import ViewSettingTranslation from '@/views/SettingTranslation'
import ViewBroadCast from '@/views/BroadCast/Index'
import ViewBroadCastShow from '@/views/BroadCast/Show'
import ViewFeedBack from '@/views/FeedBack'
import RoutesSetting from '@/routes/RoutesSetting'
import RoutesCheckList from '@/routes/RoutesCheckList'
import RoutesEvent from '@/routes/RoutesEvent'
import ViewSystemVersion from '@/views/ViewSystemVersion'
import ViewDeviceInfo from '@/views/ViewDeviceInfo'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import gOption from '@/__reactnative_stone/global/option'
import { scopeFilterScreen } from '@/__reactnative_stone/global/scopes'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import ViewUISpec from '@/views/ViewUISpec'
import ViewQRcodeScanner from '@/views/ViewQRcodeScanner'
const StackSetting = createStackNavigator()
import ViewSOS from '@/views/SOS'
import ViewSOSSubmit from '@/views/SosSubmit'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import ViewCheckListShow from '@/views/CheckList/Show'
import ViewCheckListAssignmentIntroductionTemp from '@/views/CheckListAssignment/Update/IntroductionTemp'
import ViewFileStore from '@/views/File/FileStore'
import ViewFileStoreSubLayer from '@/views/File/FileStoreSubLayer'
import ViewFileStoreShow from '@/views/File/Show'
import $color from '@/__reactnative_stone/global/color'

const RoutesMenu = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // REDUX
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentUser = useSelector(state => state.data.currentUser)

  const hideHeaderRoutes = [
    'RoutesAudit'
  ]
  const isHeaderVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    if (!routeName) {
      return true
    }
    return hideHeaderRoutes.includes(routeName)
  }

  const setRoutesMenuTabBarVisible = route => {
    const routeName = getFocusedRouteNameFromRoute(route)
    const hideOnScreens = []
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
        tabBarVisible: setRoutesMenuTabBarVisible(route)
      })}
      initialRouteName="Menu">
      <StackSetting.Screen
        name="Menu"
        component={ViewMenu}
        options={{
          title: t('選單'),
          ...gOption.headerOption,
          headerRight: () => (
            <>
              <WsFlex
                style={{
                  marginRight: 4
                }}>
                <WsIconBtn
                  name="qr_code_scanner_FILL0_wght400_GRAD0_opsz24"
                  color={'white'}
                  size={28}
                  onPress={(e) => {
                    if (!scopePermission('qrcode-read', currentUserScope)) {
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
                    } else if (scopePermission('qrcode-read', currentUserScope)) {
                      navigation.navigate('ViewQRcodeScanner')
                    }
                  }}
                />
                <LlSOSBtn001
                  onPress={(e) => {
                    if (!scopePermission('sos-create', currentUserScope)) {
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
                    } else if (scopePermission('sos-create', currentUserScope)) {
                      navigation.navigate('SOS')
                    }
                  }}
                />
              </WsFlex>
            </>
          )
        }}
      />
      <StackSetting.Screen
        name="MyAccountSetting"
        component={ViewMyAccountSetting}
        options={({ navigation }) => ({
          title: t('個人帳號設定'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="ViewFactoryAndOrganization"
        component={ViewFactoryAndOrganization}
        options={({ navigation }) => ({
          title: t('切換單位'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="SettingLanguage"
        component={ViewSettingLanguage}
        options={({ navigation }) => ({
          title: t('語言'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="SettingTranslation"
        component={ViewSettingTranslation}
        options={({ navigation }) => ({
          title: t('自設文案管理'),
          ...gOption.headerOption
        })}
      />

      <StackSetting.Screen
        name="RoutesSetting"
        component={RoutesSetting}
        options={({ navigation }) => ({
          title: t('設定'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="SystemVersion"
        component={ViewSystemVersion}
        options={({ navigation }) => ({
          title: t('系統版本'),
          ...gOption.headerOption
        })}
      />

      <StackSetting.Screen
        name="DeviceInfo"
        component={ViewDeviceInfo}
        options={({ navigation }) => ({
          title: t('登入資訊'),
          ...gOption.headerOption
        })}
      />

      <StackSetting.Screen
        name="ChangePassword"
        component={ViewChangePassword}
        options={({ navigation }) => ({
          title: t('變更密碼'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="ViewFeedBack"
        component={ViewFeedBack}
        options={({ navigation }) => ({
          title: t('意見回饋'),
          ...gOption.headerOption
        })}
      />
      <StackSetting.Screen
        name="ViewUISpec"
        component={ViewUISpec}
        options={({ navigation }) => ({
          title: t('ViewUISpec'),
          ...gOption.headerOption
        })}
      />

      <StackSetting.Screen
        name="SOS"
        component={ViewSOS}
        options={{
          title: t('SOS'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      <StackSetting.Screen
        name="SOSSubmit"
        component={ViewSOSSubmit}
        options={{
          title: t('SOS'),
          ...gOption.headerOption,
          headerTitleAlign: 'center',
          animationEnabled: false
        }}
      />
      {/* <StackSetting.Screen
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
      /> */}
    </StackSetting.Navigator>
  )
}

export default RoutesMenu
