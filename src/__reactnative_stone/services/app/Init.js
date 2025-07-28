import messaging from '@react-native-firebase/messaging'
import { Platform, Alert } from 'react-native'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import S_DeviceToken from '@/__reactnative_stone/services/api/v1/device_token'
import S_Notification from '@/services/app/notification'
import S_API_Notification from '@/services/api/v1/notification'
import store from '@/store'
import { setCurrentFactory } from '@/store/data'
import config from '@/__config'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import { useNavigationState } from '@react-navigation/native';
import S_Factory from '@/services/api/v1/factory'

export default {
  async authCheck() {
    const res = await S_Auth.check()
    return res
  },
  async notificationSet(navigation, currentFactory) {
    // Storage
    const $_setStorage = async token => {
      const _value = JSON.stringify(token)
      await AsyncStorage.setItem('fcmToken', _value)
    }
    // ROUTES
    const _stack = navigation.getState().routes
    // CHECKOUT UNIT
    const $_checkoutFactory = async (id) => {
      const _factory = await S_Factory.show({ modelId: id })
      store.dispatch(setCurrentFactory(_factory))
    }
    // 可暫時關閉 防止後端測試影響開發
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
          $_setStorage(token)
          try {
            await S_DeviceToken.active({
              deviceToken: token
            }).then(
              // Alert.alert(token, '設備註冊成功 init')
            )
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
      // Foreground state messages
      messaging().onMessage(async remoteMessage => {
        console.log(remoteMessage, '------remoteMessage----')
        const _title = remoteMessage.notification.title.replace(/['"]+/g, '')
        const _content = remoteMessage.notification.body.replace(/['"]+/g, '')
        const title = S_Notification.setTitle(_title)
        const content = S_Notification.setContent(_content)
        Alert.alert(title, content, [
          {
            text: 'Cancel',
            // onPress: () => console.log('Cancel Pressed'),
            style: 'cancel'
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
      })
      messaging().onTokenRefresh(token => {
        console.log(token, '--onTokenRefresh token--')
      })
      // Background & Quit state messages
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log(remoteMessage, '---Message handled in the background!---')
      })
      messaging()
        .getInitialNotification(remoteMessage => {
          console.log(remoteMessage, '---getInitialNotification---')
        })
        .then(remoteMessage => {
          if (remoteMessage) {
            S_Notification.redirectFromMessage(remoteMessage, navigation)
          }
        })
      messaging().onNotificationOpenedApp(async (remoteMessage) => {
        console.log(remoteMessage, '---onNotificationOpenedApp---')
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
      })
    } else {
      console.log('=======User has notification permissions disabled=========')
    }
  },
  async routeSet(navigation, isAuthPass) {
    if (!isAuthPass) {
      navigation.replace('RoutesAuth')
    } else {
      navigation.replace('RoutesApp')
    }
  },
}
