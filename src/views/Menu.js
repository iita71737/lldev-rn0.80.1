import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableHighlight,
  Image,
  StyleSheet,
  Alert,
  Linking
} from 'react-native'
import {
  WsGrid,
  WsPaddingContainer,
  WsCard,
  WsUserSection,
  WsBtn,
  WsImageBtn,
  WsIconTitle,
  LlSOSBtn002,
  WsText
} from '@/components'
import { WsMangeButtons } from '@/components/seed'
import { useSelector } from 'react-redux'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import gColor from '@/__reactnative_stone/global/color'
import LlNavButton001 from '@/components/LlNavButton001'
import { useTranslation } from 'react-i18next'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import config from '@/__config'
import AsyncStorage from '@react-native-community/async-storage'
import S_DeviceToken from '@/__reactnative_stone/services/api/v1/device_token'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import $color from '@/__reactnative_stone/global/color'
import S_QRcode from '@/services/api/v1/qrcode'
import store from '@/store'
import {
  setIdleCounter
} from '@/store/data';
import Config from "react-native-config";
import axios from 'axios'
import S_Factory from '@/services/api/v1/factory'
import S_Task from '@/services/api/v1/task'
import VersionCheck from 'react-native-version-check';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Menu = ({ navigation }) => {
  // 不要把翻譯結果存到 state，直接在 render 裡呼叫 t('key')
  const { t, i18n } = useTranslation()

  // States
  const [deviceToken, setDeviceToken] = React.useState()
  // console.log(deviceToken, '=deviceToken-=');
  // console.log(Config.API_URL,'Config.API_URL--');

  // VersionCheck.getCountry()
  // .then(country => console.log(country));          // KR
  // console.log(VersionCheck.getPackageName());        // com.reactnative.app
  // console.log(VersionCheck.getCurrentBuildNumber()); // 10
  // console.log(VersionCheck.getCurrentVersion());

  // VersionCheck.getLatestVersion({
  //   provider: 'appStore'  // for iOS
  // })
  // .then(latestVersion => {
  //   console.log(latestVersion);    // 0.1.2
  // });

  // Redux
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)


  // States
  const [manageList, setManageList] = React.useState([])

  // Function
  const $_initManageList = () => {
    // 以目前視角 (organization / factory) 取對應訂閱來源
    const subject = currentViewMode === 'organization' ? currentOrganization : currentFactory

    // 訂閱檢查：直接用 key 判斷
    const isSubscribed = (key) => {
      if (key === true) return true
      if (!key) return false
      return scopeSubscriptions(subject, key)
    }

    // 權限檢查：可傳字串 / 陣列 / true
    const hasPerm = (perm) => {
      if (perm === true) return true
      if (Array.isArray(perm)) return perm.some(p => scopePermission(p, currentUserScope))
      if (typeof perm === 'string') return scopePermission(perm, currentUserScope)
      return false
    }

    const FEATURE_CONFIG = [
      {
        key: 'checklist',
        title: t('日常自檢'),
        bg: require('@/assets/img/checklist-management.jpg'),
        perm: 'checklist-read',
        nav: () => navigation.push('RoutesCheckList', { screen: 'CheckList' }),
      },
      {
        key: 'change',
        title: t('變動管理'),
        bg: require('@/assets/img/change-management.jpg'),
        perm: ['change-record', 'change-read'],
        nav: () => navigation.push('RoutesChange', { screen: 'ChangeIndex' }),
      },
      {
        key: 'license',
        title: t('證照管理'),
        bg: require('@/assets/img/license-management.jpg'),
        perm: 'license-read',
        nav: () => navigation.push('RoutesLicense', { screen: 'LicenseIndex' }),
      },
      {
        key: 'training',
        title: t('教育訓練'),
        bg: require('@/assets/img/training.jpg'),
        perm: 'internal-training-read',
        nav: () => navigation.push('RoutesTraining', { screen: 'TrainingIndex' }),
      },
      {
        key: 'event',
        title: t('風險事件'),
        bg: require('@/assets/img/event-management.jpg'),
        perm: 'event-read',
        nav: () => navigation.push('RoutesEvent', { screen: 'EventIndex' }),
      },
      {
        key: 'audit',
        title: t('稽核管理'),
        bg: require('@/assets/img/audit-management.jpg'),
        perm: 'audit-read',
        nav: () => navigation.push('RoutesAudit', { screen: 'AuditIndex' }),
      },
      {
        key: 'contractor',
        title: t('承攬商管理'),
        bg: require('@/assets/img/contractor-management.jpg'),
        perm: 'contractor-read',
        nav: () => navigation.push('RoutesContractors', { screen: 'ContractorsIndex' }),
      },
      {
        key: 'contractor',
        title: t('進場管理'),
        bg: require('@/assets/img/contractor-operation-management.jpg'),
        perm: 'contractor-enter-record-read',
        nav: () => navigation.push('RoutesContractorEnter', { screen: 'ContractorEnter' }),
      },
      {
        key: 'file',
        title: t('文件檔案庫'),
        bg: require('@/assets/img/file-store-management.jpg'),
        perm: 'system-file-read',
        nav: () => navigation.navigate('RoutesApp', { screen: 'FileStore' }),
      },
      {
        key: 'meeting',
        title: t('議事'),
        bg: require('@/assets/img/file-store-management.jpg'),
        perm: 'meeting-read',
        nav: () => navigation.navigate('RoutesPDFTool', { screen: 'PDFToolAdminIndex' }),
      },
      // {
      //   key: 'factory-statistic',
      //   title: t('數量統計管理'),
      //   bg: require('@/assets/img/audit-management.jpg'),
      //   perm: true,
      //   nav: () => navigation.push('RoutesStatistics', { screen: 'StatisticsIndex' }),
      // },
    ]

    const list = FEATURE_CONFIG
      .filter(item => isSubscribed(item.key)) // ✅ 未訂閱不顯示
      .map(item => {
        const permitted = hasPerm(item.perm)
        return {
          title: item.title,
          backgroundImg: item.bg,
          onPress: permitted ? item.nav : () => { },
          permission: permitted,                 // 供 WsImageBtn 判斷禁用
          icon: permitted ? null : 'ws-outline-lock', // 需要就露出鎖頭
        }
      })

    setManageList(list)
  }


  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('fcmToken')
    const _value = JSON.parse(_item)
    setDeviceToken(_value)
  }

  const $_cleanStorage = async () => {
    try {
      await AsyncStorage.removeItem('fcmToken');
    } catch (error) {
      console.error('Error removing fcmToken');
    }
  }

  const $_logout = async () => {
    // DEACTIVATE DEVICE TOKEN
    if (deviceToken != null) {
      try {
        const res = await S_DeviceToken.deactive({
          deviceToken: deviceToken
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
      }
    }
    // LOGOUT
    try {
      await S_Auth.logout()
      // await AsyncStorage.clear();
      Alert.alert(t('登出成功'))
    } catch (error) {
      console.error(error, 'logout error')
      Alert.alert(t('登出失敗'))
    }
  }

  // IDLE
  const handleScroll = (event) => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  };

  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    $_initManageList()
  }, [currentFactory, currentOrganization, currentRefreshCounter])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入 Menu 頁面');
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('離開 Menu 頁面');
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  return (
    <>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        <ScrollView
          testID={'ScrollView'}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {currentUser && (
            <>
              <WsUserSection
                isAvatar={true}
                userName={currentUser.name}
                userEmail={currentUser.email}
                avatar={currentUser.avatar}
                onPress={() => {
                  navigation.navigate('MyAccountSetting')
                }}
              />

              {scopePermission('sos-create', currentUserScope) && (
                <WsPaddingContainer>
                  <LlSOSBtn002
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
                </WsPaddingContainer>
              )}

              <LlNavButton001
                testID={`切換單位鈕`}
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="ll-risk-shutdown"
                subTitle={
                  currentViewMode === 'factory' && currentFactory
                    ? currentFactory.name
                    : currentOrganization && currentOrganization.name ? currentOrganization.name : null
                }
                onPress={() => {
                  navigation.navigate('ViewFactoryAndOrganization')
                }}>
                {`${t('切換單位')}`}
              </LlNavButton001>

              {scopeSubscriptions(currentFactory, 'announcement') && (
                <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="ll-esh-fairtrade"
                  onPress={(e) => {
                    if (!scopePermission('llbroadcast-read', currentUserScope)) {
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
                    } else if (scopePermission('llbroadcast-read', currentUserScope)) {
                      navigation.push('ViewAnnouncement')
                    }

                  }}
                >
                  {t('新訊')}
                </LlNavButton001>
              )}


              {scopeSubscriptions(currentFactory, 'task') && (
                <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="ll-nav-assignment-outline"
                  onPress={(e) => {
                    if (!scopePermission('task-read', currentUserScope)) {
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
                    } else if (scopePermission('task-read', currentUserScope)) {
                      navigation.navigate('RoutesTask', { screen: 'TaskIndex' })
                    }
                  }}>
                  {t('任務')}
                </LlNavButton001>
              )}


              {(
                scopeSubscriptions(currentFactory, 'checklist') ||
                scopeSubscriptions(currentFactory, 'change') ||
                scopeSubscriptions(currentFactory, 'license') ||
                scopeSubscriptions(currentFactory, 'training') ||
                scopeSubscriptions(currentFactory, 'event') ||
                scopeSubscriptions(currentFactory, 'audit') ||
                scopeSubscriptions(currentFactory, 'contractor') ||
                scopeSubscriptions(currentFactory, 'contractor')
              ) && (
                  <>
                    <LlNavButton001
                      style={{
                        backgroundColor: $color.white
                      }}
                      iconLeft="ll-nav-filemanage"
                    >
                      {t('管理')}
                    </LlNavButton001>
                    <WsPaddingContainer
                      style={{
                        backgroundColor: gColor.white,
                      }}>
                      <WsGrid
                        style={{}}
                        numColumns={2}
                        spacing={4}
                        keyExtractor={item => item.title}
                        data={manageList}
                        renderItem={({ item, itemIndex }) => (
                          <>
                            <WsImageBtn
                              key={item.title}
                              backgroundImg={item.backgroundImg}
                              title={item.title}
                              style={{}}
                              icon={
                                (item.permission === false || item && item.permission === null) ? 'ws-outline-lock' : null
                              }
                              LinearGradientColors={
                                item.permission === false
                                  ? [
                                    'rgba(6, 34, 46, 1)',
                                    'rgba(0, 24, 57, .8)',
                                    'rgba(6, 34, 46, 1)'
                                  ]
                                  : undefined
                              }
                              disable={(item && item.permission === false || item && item.permission === null) ? true : false}
                              onPress={
                                item.permission === true ? item.onPress : () => { }
                              }
                            />
                          </>
                        )}
                      />
                    </WsPaddingContainer>
                  </>
                )}

              {scopePermission('meeting-read', currentUserScope) &&
                scopeSubscriptions(currentFactory, 'meeting') && (
                  <LlNavButton001
                    style={{
                      backgroundColor: $color.white
                    }}
                    iconLeft="ll-esh-file"
                    onPress={(e) => {
                      if (!scopePermission('meeting-read', currentUserScope)) {
                        Alert.alert(
                          t('您無此單位內相關權限，請聯絡系統管理員'),
                          "",
                          [
                            {
                              text: t("確定"),
                              onPress: () => {
                                navigation.navigate('RoutesMenu')
                              }
                            }
                          ]
                        )
                        e.preventDefault();
                      } else if (scopePermission('meeting-read', currentUserScope)) {
                        navigation.navigate('RoutesPDFTool', { screen: 'PDFToolAdminIndex' })
                      }
                    }}>
                    {t('議事')}
                  </LlNavButton001>
                )}


              {scopePermission('guideline-read', currentUserScope) &&
                scopeSubscriptions(currentFactory, 'guideline') && (
                  <LlNavButton001
                    style={{
                      backgroundColor: $color.white
                    }}
                    iconLeft="ll-nav-internalegulations-outline"
                    onPress={(e) => {
                      if (!scopePermission('guideline-read', currentUserScope)) {
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
                      } else if (scopePermission('guideline-read', currentUserScope)) {
                        navigation.navigate('RoutesAct',
                          {
                            screen: 'GuidelineIndex'
                          })
                      }
                    }}>
                    {t('內規')}
                  </LlNavButton001>
                )}


              {scopePermission('guideline-admin-read', currentUserScope) &&
                scopeSubscriptions(currentFactory, 'guideline') && (
                  <LlNavButton001
                    style={{
                      backgroundColor: $color.white
                    }}
                    iconLeft="ll-nav-internalegulationsmanage-outline"
                    onPress={(e) => {
                      if (!scopePermission('guideline-admin-read', currentUserScope)) {
                        Alert.alert(
                          t('您無此單位內相關權限，請聯絡系統管理員'),
                          "",
                          [
                            {
                              text: t("確定"),
                              onPress: () => {
                                navigation.navigate('RoutesMenu')
                              }
                            }
                          ]
                        )
                        e.preventDefault();
                      } else if (scopePermission('guideline-admin-read', currentUserScope)) {
                        navigation.navigate('RoutesAct', { screen: 'GuidelineAdminIndex' })
                      }
                    }}>
                    {t('內規管理')}
                  </LlNavButton001>
                )}

              {scopeSubscriptions(currentFactory, 'broadcast') && (
                <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="ll-nav-news-outline"
                  onPress={(e) => {
                    if (!scopePermission('llbroadcast-read', currentUserScope)) {
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
                    } else if (scopePermission('llbroadcast-read', currentUserScope)) {
                      navigation.push('ViewBroadCast')
                    }

                  }}
                >
                  {t('ESGoal快報')}
                </LlNavButton001>
              )}


              <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="ws-outline-settings-outline"
                onPress={() => {
                  navigation.navigate('RoutesSetting', { screen: 'SettingIndex' })
                }}>
                {t('設定')}
              </LlNavButton001>

              <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="md-phone-iphone"
                onPress={() => {
                  navigation.navigate('RoutesMenu', { screen: 'SystemVersion' })
                }}>
                {t('系統版本')}
              </LlNavButton001>

              <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="ws-outline-lock"
                onPress={() => {
                  navigation.navigate({
                    name: 'ChangePassword'
                  })
                }}>
                {t('變更密碼')}
              </LlNavButton001>

              <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="md-system-update"
                onPress={() => {
                  navigation.navigate('RoutesMenu', { screen: 'DeviceInfo' })
                }}>
                {t('登入資訊')}
              </LlNavButton001>

              <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="ws-filled-logout"
                onPress={() => {
                  $_logout()
                }}>
                {t('登出')}
              </LlNavButton001>

              <>
                {/* <LlNavButton001
                style={{
                  backgroundColor: $color.white
                }}
                iconLeft="ws-outline-opinion">
                {t('常見問題')}
              </LlNavButton001> */}

                <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="md-info-outline"
                  onPress={() => {
                    Linking.openURL('https://www.esgoal.com.tw/en')
                  }}
                >
                  {t('關於我們')}
                </LlNavButton001>

                {/* <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="ll-nav-filemanage"
                  onPress={() => {
                    navigation.navigate('ViewFeedBack')
                  }}>
                  {t('意見回饋')}
                </LlNavButton001> */}

                <LlNavButton001
                  style={{
                    backgroundColor: $color.white
                  }}
                  iconLeft="ws-outline-risk-low"
                  onPress={() => {
                    Linking.openURL('https://www.esgoal.com.tw/privacy')
                  }}
                >
                  {t('條款政策')}
                </LlNavButton001>

                {currentUser && currentUser.id &&
                  (currentUser.id === 1 || currentUser.id === 86) && (
                    <LlNavButton001
                      style={{
                        backgroundColor: $color.white
                      }}
                      iconLeft="ll-nav-filemanage"
                      onPress={() => {
                        navigation.navigate('ViewUISpec')
                      }}>
                      {t('UI Components')}
                    </LlNavButton001>
                  )}
              </>

            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}
export default Menu
