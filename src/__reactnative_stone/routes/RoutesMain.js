import React, { useState, useEffect, useRef } from 'react'
import {
  StatusBar,
  Text,
  Alert,
  // SafeAreaView,
  View,
  Modal,
  Platform,
  Linking,
  ActivityIndicator,
  useColorScheme
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsIcon,
  WsDialog,
  WsCameraPage,
  WsIconBtn
} from '@/components'
import { useSelector } from 'react-redux'
import ViewInit from '@/views/Init'
import RoutesApp from '@/routes/RoutesApp'
import RoutesAuth from '@/routes/RoutesAuth'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import $config from '@/__config'
import { useTranslation } from 'react-i18next'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import $ws from '@/__reactnative_stone'
import store from '@/store'
import {
  setSystemClasses,
  setEffect,
  setActType,
  setCollectIds,
  setCurrentFactory,
  setUserSubTasks,
  setUserScopes,
  setCurrentOrganization,
  setContractorTypes,
  setContractorCustomTypes,
  setAllContractorTypes,
  setActStatus,
  setFactoryTags,
  setContractor,
  setLicenseType,
  setEventTypes,
  setCurrentViewMode,
  setInitUrlFromQRcode,
  setConstantData,
  setCurrentLocales,
  setCurrentLatLng
} from '@/store/data'
import AsyncStorage from '@react-native-community/async-storage'
import S_Init from '@/__reactnative_stone/services/app/Init'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import S_Contractor from '@/services/api/v1/contractor'
import S_LicenseType from '@/services/api/v1/license_type'
import S_EventType from '@/services/api/v1/event_type'
import S_Effect from '@/services/api/v1/effects'
import S_ActType from '@/services/api/v1/act_type'
import S_ActStatus from '@/services/api/v1/act_status'
import S_SystemClass from '@/services/api/v1/system_class'
import S_ContractorType from '@/services/api/v1/contractor_type'
import S_CustomContractorType from '@/services/api/v1/contractor_customized_type'
import G_i18n from '@/__reactnative_stone/global/i18n'
import i18next from 'i18next'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import S_Notification from '@/services/api/v1/notification'
import RNPushNotification from 'react-native-push-notification';
import S_Factory from '@/services/api/v1/factory'
import axios from 'axios'
import S_QRcode from '@/services/api/v1/qrcode'
import ViewQRcodeSection from '@/views/ViewQRcodeSection'
import gOption from '@/__reactnative_stone/global/option'
const Stack = createStackNavigator()
import { useNavigation } from '@react-navigation/native';
import S_ConstantData from '@/services/api/v1/constant_data'
import BootSplash from "react-native-bootsplash";
import S_FactoryEffect from '@/services/api/v1/factory_effects'
import S_Locale from '@/services/api/v1/locale'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings'
import { getLocation, getGeocode } from '@/__reactnative_stone/global/location'
import { getDistance } from 'geolib';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import S_factoryHelper from '@/helpers/factory'
import { CopilotProvider } from 'react-native-copilot';

const RoutesMain = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const scheme = useColorScheme();
  const state = store.getState()

  const MyThemes = {
    light: {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: $color.primary11l
      }
    },
    dark: {
      ...DarkTheme,
      colors: {
        ...DefaultTheme.colors,
        background: $color.primary11l
      }
    }
  };

  // Redux
  const isMounted = useSelector(state => state.stone_app.isMounted)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // States
  const [initFactory, setInitFactory] = React.useState()
  const [initOrganization, setInitOrganization] = React.useState()
  const [modalVisible, setModalVisible] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(true)

  // Storage
  const $_getStorage = async () => {
    const _factory = await AsyncStorage.getItem('factory')
    if (_factory) {
      setInitFactory(JSON.parse(_factory))
    }
    const _organization = await AsyncStorage.getItem('organization')
    if (_organization) {
      setInitOrganization(JSON.parse(_organization))
    }
  }

  // SERVICES
  const $_checkoutFactory = async (current_factory) => {
    try {
      const _id = current_factory?.id
      const _factory = await S_Factory.show({ modelId: _id })
      store.dispatch(setCurrentFactory(_factory))
    } catch (e) {
      console.error(e);
    }
  }

  const $_currentFactorySet = () => {
    // Sorted
    const s_user_factory_roles = currentUser.user_factory_roles.sort((a, b) => {
      if (a.factory.id < b.factory.id) {
        return -1
      }
      if (b.factory.id < a.factory.id) {
        return 1
      }
    })
    const s_user_factory_scopes = currentUser.user_factory_scopes.sort(
      (a, b) => {
        if (a.factory.id < b.factory.id) {
          return -1
        }
        if (b.factory.id < a.factory.id) {
          return 1
        }
      }
    )
    const s_user_factory_role_template = currentUser.user_factory_role_templates.sort(
      (a, b) => {
        if (a.factory_id < b.factory_id) {
          return -1
        }
        if (b.factory_id < a.factory_id) {
          return 1
        }
      })
    const _allScopesUnit = s_user_factory_roles.concat(s_user_factory_scopes, s_user_factory_role_template)
    const hasMatch = _allScopesUnit.some(unit => unit.factory?.id === initFactory?.id) //250624-issue
    if (initFactory && _allScopesUnit && hasMatch) {
      const _initScope = _allScopesUnit.find(unit => {
        if (unit.factory && unit.factory.scope && unit.factory.scope.includes('app-apply')) {
          return unit.factory.id == initFactory.id
        }
      })
      const _initUnit = currentUser.factories.forEach(unit => {
        // 如果廠在第一層級
        if (unit.id == initFactory.id) {
          store.dispatch(setCurrentFactory(unit))
          $_checkoutFactory(_unit)
        }
        // 如果廠在第二層級
        else if (unit.child_factories && unit.child_factories.length > 0) {
          unit.child_factories.forEach(_unit => {
            if (_unit.id === initFactory.id) {
              store.dispatch(setCurrentFactory(_unit))
              $_checkoutFactory(_unit)
            }
          })
        }
      })
    } else if (initOrganization && currentUser) {
      store.dispatch(setCurrentViewMode('organization'))
      store.dispatch(setCurrentOrganization(initOrganization))
      if (initOrganization?.child_factories?.length > 0) {
        const _factory = initOrganization.child_factories[0]
        store.dispatch(setCurrentFactory(_factory))
      }
    }
    else if (currentUser && currentUser?.current_factory && currentUser?.current_factory?.id) {
      // 確認使用者上次登入的單位現在是否有權限-250731-issue
      const hasMatch2 = _allScopesUnit.some(unit => unit.factory?.id === currentUser?.current_factory?.id) //250731-issue
      if (hasMatch2) {
        $_checkoutFactory(currentUser?.current_factory)
      } else {
        $_checkoutFactory(_allScopesUnit[0]?.factory)
      }
    }
    else {
      const hasCommonFactory = currentUser.factories.find(factory => s_user_factory_scopes.some(scope => factory.id == scope.factory.id && scope.scopes.includes('app-apply')));
      if (hasCommonFactory) {
        store.dispatch(setCurrentFactory(hasCommonFactory))
      } else {
        const filteredFactories = currentUser.factories.filter(_unit => {
          return _allScopesUnit.some(targetFactory => targetFactory.factory.id === _unit.id);
        });
        const found = filteredFactories.find(item => item.name.includes('廠'));
        if (found) {
          store.dispatch(setCurrentFactory(found))
        }
      }
    }
  }
  const $_currentOrganizationSet = () => {
    if (initOrganization) {
      store.dispatch(setCurrentOrganization(initOrganization))
    }
  }
  const $_userSubTasksSet = () => {
    const subTasks = currentUser.sub_tasks
    store.dispatch(setUserSubTasks(subTasks))
  }
  const $_collectSet = () => {
    store.dispatch(setCollectIds(currentUser.act_ids))
  }

  // LatLng
  const $_requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    const result = await check(permission);
    if (result === RESULTS.GRANTED) return true;

    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const requestResult = await request(permission);
      return requestResult === RESULTS.GRANTED;
    }

    if (result === RESULTS.BLOCKED) {
      if (!hasPromptedOpenSettings) {
        setHasPromptedOpenSettings(true)
        Alert.alert(
          t('需要定位權限'),
          t('請選擇「位置」\n> 選擇「使用App期間」。'),
          [
            { text: t('取消'), style: 'cancel' },
            {
              text: t('前往設定'),
              onPress: () => {
                Platform.OS === 'android'
                  ? AndroidOpenSettings.locationSourceSettings()
                  : openSettings()
              }
            }
          ]
        );
      }
      return false;
    }
    return false;
  }

  const $_getLocation = async () => {
    const granted = await $_requestLocationPermission();
    if (!granted) {
      console.log('使用者未授權定位');
      return;
    }
    try {
      const myLocation = await getLocation()
      store.dispatch(setCurrentLatLng(myLocation))
      if (currentFactory?.lat && currentFactory?.lng) {
        const targetLocation = {
          latitude: currentFactory?.lat,
          longitude: currentFactory?.lng,
        };
        const distance = getDistance(myLocation, targetLocation);
        console.log(`距離目前單位約 ${distance} 公尺`);
      }
    } catch (e) {
      console.log(e, 'e');
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
    }
  }
  const $_contractorTypeSet = async () => {
    let _params = {
      get_all: 1,
      order_by: 'sequence',
      order_way: 'asc',
    }
    // 承攬商類別
    const contractorTypes = await S_ContractorType.index({ params: _params })
    // 自定義承攬商類別
    const customizedContractorTypes = await S_CustomContractorType.index({ params: _params })
    let allContractorTypes = []
    Promise.all([
      contractorTypes,
      customizedContractorTypes
    ]).then(res => {
      // 把以上三個合併成一個陣列
      store.dispatch(setContractorTypes(res[0].data))
      store.dispatch(setContractorCustomTypes(res[1].data))
      allContractorTypes = res[0].data.concat(res[1].data)
      store.dispatch(setAllContractorTypes(allContractorTypes))
    })
  }
  const $_systemClassSet = async () => {
    try {
      const _params = {
        order_by: 'sequence',
        order_way: 'asc'
      }
      const systemClasses = await S_SystemClass.index({
        params: _params
      })
      store.dispatch(setSystemClasses(systemClasses.data))
    } catch (e) {
      console.error(e);
      store.dispatch(setSystemClasses(null))
    }
  }
  const $_setI18nResources = async () => {
    try {
      // const apiLocal = await G_i18n.langWithApiAndLocal()
      const apiLocal = await G_i18n.langWithApiAndLocal002()
      // 把每一個語系（key），連同對應的 translation 物件，註冊到 i18next
      // addResourceBundle 的參數：
      // 第一個：語系 code 或語系陣列（namespace：這裡把 key 放進 array 裡）
      // 第二個：namespace（這裡都是 'translation'）
      // 第三個：要加載的字串物件
      // 第四個：deepMerge（true 表示如果已經有相同 namespace，會做深度合併，而不是覆蓋）
      // 第五個：overwrite（true 表示就算已經有相同 key，也會被覆蓋）
      for (let key in apiLocal) {
        // console.log(key, 'key');
        i18next.addResourceBundle(
          [key],
          'translation',
          apiLocal[key].translation,
          true,
          true
        )
      }
      // 初始化上次LOCALE
      const userRes = await S_API_Auth.getUser()
      if (userRes && userRes.locale) {
        const _locale = userRes.locale
        if (_locale.code === 'us') {
          _locale.code = 'en'
        }
        try {
          i18n.changeLanguage(_locale.code)
            .then(_res => {
              // console.log(_res, '_res');
            });
        } catch (e) {
          console.error(e, 'e')
        }
      }
    } catch (error) {
      console.log(error, '$_setI18nResources error')
    }
  }

  const $_userScopesSet = () => {
    const _scopes = []
    // Roles
    currentUser.user_factory_roles.forEach(role => {
      if (role.factory.id == currentFactory.id) {
        role.scopes.forEach(roleScope => {
          if (!_scopes.includes(roleScope)) {
            _scopes.push(roleScope)
          }
        })
      }
    })
    // Factory scopes
    currentUser.user_factory_scopes.forEach(factory => {
      if (factory.factory.id == currentFactory.id) {
        factory.scopes.forEach(factoryScope => {
          if (!_scopes.includes(factoryScope)) {
            _scopes.push(factoryScope)
          }
        })
      }
    })
    // Factory Template Scopes
    currentUser.user_factory_role_templates.forEach(factory => {
      if (factory.factory_id == currentFactory.id) {
        factory.scopes.forEach(factoryScope => {
          if (!_scopes.includes(factoryScope)) {
            _scopes.push(factoryScope)
          }
        })
      }
    })
    store.dispatch(setUserScopes(_scopes))
    // administrator
    if (currentUser.is_administrator) {
      store.dispatch(setUserScopes(currentUser.scopes))
    }
  }
  // INIT EFFECT
  const $_effectSet = async () => {
    try {
      const [res, res1] = await Promise.all([
        S_Effect.index({
          factory: currentFactory.id,
          lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
        }),
        S_FactoryEffect.index({
          factory: currentFactory.id,
          lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
        })
      ]);
      // 合併兩個資料
      const combinedData = [...res.data, ...res1.data];
      // 儲存合併後的資料
      store.dispatch(setEffect(combinedData));
    } catch (error) {
      // 如果出錯，設定為空陣列
      store.dispatch(setEffect([]));
      console.log(error, '$_effectSet');
    }
  };
  // INIT ACT_TYPE
  const $_actTypeSet = async () => {
    let _params = {
      order_by: 'sequence',
      order_way: 'asc'
    }
    if (currentFactory && currentFactory.id) {
      _params.factory = currentFactory.id
    }
    try {
      const actTypes = await S_ActType.index({ params: _params })
      store.dispatch(setActType(actTypes.data))
    } catch (error) {
      console.log(error, '$_actTypeSet')
    }
  }
  // INIT ACT_STATUS
  const $_actStatus = async () => {
    let _params = {}
    if (currentFactory && currentFactory.id) {
      _params.factory = currentFactory.id
    }
    try {
      const actStatus = await S_ActStatus.index({ params: _params })
      store.dispatch(setActStatus(actStatus.data))
    } catch (error) {
      console.log(error, '$_actStatus')
    }
  }
  // INIT LICENSE TYPE
  const $_licenseTypes = async () => {
    try {
      const _params = {
        order_by: 'sequence',
        order_way: 'asc'
      }
      const res = await S_LicenseType.index({
        params: _params
      })
      store.dispatch(setLicenseType(res.data))
    } catch (e) {
      console.error(e, '$_licenseTypes');
    }
  }
  // INIT EVENT TYPES
  const $_eventTypes = async () => {
    try {
      const _params = {
        // lang: currentLang,
        order_by: 'sequence',
        order_way: 'asc',
      }
      const res = await S_EventType.index({ params: _params })
      store.dispatch(setEventTypes(res.data))
    } catch (e) {
      console.error(e, '$_eventTypes');
      store.dispatch(setEventTypes(null))
    }
  }
  // INIT FACTORY_TAGS
  const $_factoryTags = async () => {
    let _params = {
      order_by: "sequence",
      order_way: "asc",
      get_all: 1,
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    }
    try {
      const _res = await S_FactoryTag.indexV2({ params: _params })
      store.dispatch(setFactoryTags(_res.data))
    } catch (error) {
      console.log(error, '$_factoryTags')
    }
  }
  // INIT CONTRACTOR
  const $_fetchContractor = async () => {
    try {
      const res = await S_Contractor.index({
        params: currentFactory.id
      })
      if (res) {
        store.dispatch(setContractor(res.data))
      } else {
        store.dispatch(setContractor([]))
      }
    } catch (error) {
      console.log(error, '$_fetchContractor')
    }
  }
  // INIT constant data
  const $_fetchConstantData = async () => {
    try {
      const res = await S_ConstantData.index({})
      if (res) {
        store.dispatch(setConstantData(res.data))
      }
    } catch (error) {
      console.log(error, '$_fetchConstantData')
    }
  }
  // INIT constant data
  const $_fetchLocaleIndex = async () => {
    try {
      const res = await S_Locale.index()
      if (res) {
        store.dispatch(setCurrentLocales(res.data))
      }
    } catch (error) {
      console.log(error, '$_fetchConstantData')
    }
  }

  // APP BADGE
  const $_UnReadAllNotification = async () => {
    const res = await S_Notification.indexUnread({
      params: {
        order_by: 'created_at',
        order_way: 'desc',
        time_field: 'created_at'
      }
    })
    if (res && res.meta && res.meta.total) {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(res.meta.total);
      } else {
        RNPushNotification.setApplicationIconBadgeNumber(res.meta.total);
      }
    }
  }

  React.useEffect(() => {
    $_getStorage()
    $_UnReadAllNotification()
  }, [currentFactory])

  React.useEffect(() => {
    if (currentUser && currentUser.id) {
      $_currentFactorySet()
      const timer = setTimeout(() => {
        $_currentOrganizationSet()
        $_userSubTasksSet()
        $_collectSet()
        $_getLocation()
      }, 0)
      return () => clearTimeout(timer);
    }
  }, [currentUser?.id])

  React.useEffect(() => {
    if (currentFactory && currentUser) {
      $_userScopesSet()
      $_systemClassSet()

      const timer = setTimeout(() => {
        $_systemClassSet()
        $_contractorTypeSet()
        $_effectSet()
        $_actTypeSet()
        $_actStatus()
        $_licenseTypes()
        $_eventTypes()
        $_factoryTags()
        $_fetchContractor()
        $_fetchConstantData()
        $_fetchLocaleIndex()
        $_setI18nResources()
      }, 0)
      return () => clearTimeout(timer);
    }
  }, [currentFactory?.id, currentUser?.id])


  return (
    <>
      {modalVisible ? (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.')
            setModalVisible(!modalVisible)
          }}>
          {dialogVisible && (
            <WsDialog
              dialogVisible={dialogVisible}
              setDialogVisible={() => {
                setDialogVisible(true)
              }}
              title={
                Platform.OS === 'android'
                  ? t('本APP不支援您的Android版本')
                  : t('本APP不支援您的iOS版本')
              }
              contentStyle={{
                paddingBottom: 0,
                width: 310,
                alignItems: 'center',
                justifyContent: 'flex-start',
                paddingTop: 16,
                paddingBottom: 16,
                paddingLeft: 16,
                paddingRight: 16,
                backgroundColor: $color.white3d,
                borderRadius: 10,
                flexWrap: 'wrap'
              }}>
              <WsText color={$color.black}>
                {Platform.OS === 'android'
                  ? t(
                    '很抱歉，本APP已不再支援Android xx.x 以下的作業系統版本，若您需要使用本APP服務，請先進行軟體更新。'
                  )
                  : t(
                    '很抱歉，本APP已不再支援iOS xx.x 以下的作業系統版本，若您需要使用本APP服務，請先進行軟體更新。'
                  )}
              </WsText>
            </WsDialog>
          )}
        </Modal>
      ) : (
        <View
          style={{
            flex: 1,
            paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
            backgroundColor: $color.primary
          }}
        >
          <NavigationContainer
            theme={scheme === 'light' ? MyThemes.light : MyThemes.dark}
            linking={{
              prefixes: [
                'https://www.esgoal.com/',
                'https://ll-esh-app.wasateam.com/',
                'esgoal://',
                'https://ll-esgoal.dev.wasateam.com/'
              ],
              config: {
                screens: $ws.$h.route.getDeeplinks()
              },
              async getInitialURL() {
                const url = await Linking.getInitialURL();
                console.log('getInitialURL');
                // 這邊只有在未開啟APP時，第一次開啟時會比對。
                if (url) {
                  try {
                    const _url = await S_QRcode.redirectByScanUrl(url, navigation);
                  } catch (e) {
                    store.dispatch(setInitUrlFromQRcode(url))
                  }
                }
              },
            }}
            fallback={<ActivityIndicator color="blue" size="large" />}
          >
            <Stack.Navigator
              screenOptions={{
                headerBackTitleVisible: false
              }}
            >
              {!isMounted && (
                <Stack.Screen
                  name="Init"
                  options={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#FFFFFF' }
                  }}
                  component={ViewInit}
                />
              )}
              {!currentUser && (
                <>
                  <Stack.Screen
                    name="RoutesAuth"
                    options={{
                      headerShown: false,
                      cardStyle: { backgroundColor: '#FFFFFF' }
                    }}
                    component={RoutesAuth}
                    initialParams={{ autoFocus: modalVisible ? false : true }}
                  />
                </>
              )}
              {currentUser && (
                <>
                  <Stack.Screen
                    name="RoutesApp"
                    options={{
                      headerShown: false,
                      cardStyle: { backgroundColor: '#FFFFFF' }
                    }}
                    component={RoutesApp}
                  />
                  <Stack.Screen
                    name="CameraPage"
                    component={WsCameraPage}
                    options={{
                      headerShown: false,
                    }}
                  />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      )}
    </>
  )
}

export default RoutesMain
