import React from 'react'
import {
  ScrollView,
  Pressable,
  View,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
  Platform
} from 'react-native'
import {
  WsCard,
  WsIcon,
  WsText,
  WsFlex,
  WsDes,
  WsPaddingContainer,
  WsCircle,
  WsLoading,
  WsPopup,
  WsGradientButton
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import App_Notification from '@/services/app/notification'
import S_Notification from '@/services/api/v1/notification'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentViewMode
} from '@/store/data'
import config from '@/__config'
import { useTranslation } from 'react-i18next'
import { useNavigationState } from '@react-navigation/native';
import S_Factory from '@/services/api/v1/factory'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import RNPushNotification from 'react-native-push-notification';
import { debounce, throttle } from 'lodash';
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage';

const LlNotificationCard = props => {
  const { t, i18n } = useTranslation()
  const navigationState = useNavigationState(state => state);
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    style,
    notification,
    navigation,
    testID
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // State
  const [popupActive, setPopupActive] = React.useState(false)
  const [readAt, setReadAt] = React.useState(notification.read_at)
  const [redirectLoading, setRedirectLoading] = React.useState(false)
  const [notificationName, setNotificationName] = React.useState()

  const $_identifyUnit = () => {
    if (notification &&
      notification.data &&
      notification.data.factory_id &&
      currentFactory &&
      currentFactory.id !== notification.data.factory_id) {
      setPopupActive(true)
    } else {
      const navigateWithDebounce = throttle(() => {
        $_readAndRedirect()
      }, 500);
      navigateWithDebounce()
    }
  }

  // Local Storage
  const $_setLocalStorage = async (item, mode) => {
    if (mode === 'factory') {
      try {
        await AsyncStorage.setItem('factory', JSON.stringify(item))
        await AsyncStorage.removeItem('organization');
      }
      catch (exception) {
        console.log(exception)
      }
    }
    if (mode === 'organization') {
      try {
        await AsyncStorage.setItem('organization', JSON.stringify(item))
        await AsyncStorage.removeItem('factory');
      }
      catch (exception) {
        console.log(exception)
      }
    }
  }

  // SERVICE
  const $_readAndRedirect = async () => {
    setReadAt(true)
    // 不同廠的系統通知則切換工廠
    if (notification &&
      notification.data &&
      notification.data.factory_id &&
      currentFactory &&
      currentFactory.id !== notification.data.factory_id) {
      if (notification.data?.factory_name?.includes('集團')) {
        console.log('11111A');
        $_checkoutOrganization(notification.data.factory_id)
        setTimeout(() => {
          App_Notification.redirectFromMessage(notification, navigation)
        }, 1000)
      } else {
        console.log('22222A');
        try {
          setRedirectLoading(true)
          await $_checkoutFactory(notification.data.factory_id)
          $_UnReadAllNotification()
          const res = await S_Notification.read(notification.id)
          App_Notification.redirectFromMessage(notification, navigation)
        } catch (e) {
          setRedirectLoading(false)
          Alert.alert(t('您無此單位內相關權限，請聯絡系統管理員'))
          return
        }
        setRedirectLoading(false)
      }
    } else {
      $_UnReadAllNotification()
      const res = await S_Notification.read(notification.id)
      App_Notification.redirectFromMessage(notification, navigation)
    }
  }

  const $_checkoutOrganization = async (id) => {
    const _factory = await S_Factory.show({ modelId: notification.data.factory_id })
    store.dispatch(setCurrentFactory(_factory))
    store.dispatch(setCurrentOrganization(_factory))
    store.dispatch(setCurrentViewMode('organization'))
  }

  const $_checkoutFactory = async (id) => {
    try {
      const _factory = await S_Factory.show({ modelId: notification.data.factory_id })
      $_setLocalStorage(_factory, 'factory')
      store.dispatch(setCurrentFactory(_factory))
      store.dispatch(setCurrentViewMode('factory'))
    } catch (e) {
      console.error(e);
    }
  }

  const $_setNotificationName = () => {
    const _title = App_Notification.getNoticeTitle(notification)
    if (_title) {
      setNotificationName(_title)
    }
  }

  const $_getTimeFormat = (date) => {
    if (!date) return "";
    const today = moment().startOf("day").format("YYYY-MM-DD");
    const eventDate = moment(date).format("YYYY-MM-DD");
    if (today === eventDate) {
      // today
      return `${t('今天')} ${moment(date).format("YYYY-MM-DD HH:mm:ss")}`
    } else if (
      moment(today).subtract(1, "days").format("YYYY-MM-DD") ===
      eventDate
    ) {
      // yesterday
      return `${t('昨天')} ${moment(date).format("YYYY-MM-DD HH:mm:ss")}`
    } else if (
      moment(today).subtract(2, "days").format("YYYY-MM-DD") === eventDate
    ) {
      // the day before yesterday
      return `${t('前天')} ${moment(date).format("YYYY-MM-DD HH:mm:ss")}`
    } else {
      return moment(date).format("YYYY-MM-DD HH:mm:ss");
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
    $_setNotificationName()
  }, [])

  // Render
  return (
    <>
      {redirectLoading && (
        <Modal visible={redirectLoading} transparent={true}>
          <View style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: $color.white1d,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}>
            <WsLoading type="default"></WsLoading>
          </View>
        </Modal>
      )}
      <TouchableOpacity
        testID={testID}
        onPress={() => $_identifyUnit()}
      >
        <WsPaddingContainer style={[{ backgroundColor: $color.white }, style]}>
          <WsFlex>
            <WsFlex alignItems="center">
              <View
                style={{ width: 22 }}
                testID={`${testID}紅點`}
              >
                {!readAt && !notification.read_at && (
                  <WsCircle size={6} color={$color.danger} style={{ margin: 8 }} />
                )}
              </View>
              <View
                style={{
                  marginLeft: 16,
                  flex: 1
                }}>
                <WsText>{notificationName}</WsText>
                <WsFlex
                  justifyContent="space-between"
                >
                  <WsDes
                    style={{
                      marginTop: 4
                    }}
                    size={14}>
                    {$_getTimeFormat(notification.created_at)}
                  </WsDes>
                  <WsDes
                    style={{
                      marginTop: 4
                    }}
                    size={12}>
                    {notification?.data?.factory_name}
                  </WsDes>
                </WsFlex>
              </View>
            </WsFlex>
            <WsIcon />
          </WsFlex>
        </WsPaddingContainer>
      </TouchableOpacity>

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 16,
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              flexWrap: 'wrap',
            }}
          >{t(`即將前往{text}，若尚未儲存資料請先儲存`, { text: notification?.data?.factory_name })}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                height: 48,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              testID={'繼續前往'}
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupActive(false)
                $_readAndRedirect()
              }}>
              {t('前往')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default LlNotificationCard
