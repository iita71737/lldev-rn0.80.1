import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Platform,
  StyleSheet,
  Dimensions,
  AppState,
  PanResponder,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  WsAvatar,
  WsText,
  WsTag,
  WsFlex,
  WsIcon,
  WsBtn,
  WsIconBtn,
  WsPopup,
  WsState,
  WsGradientButton,
  WsErrorMessage
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import DeviceInfo from 'react-native-device-info';
import S_DeviceToken from '@/__reactnative_stone/services/api/v1/device_token'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import AsyncStorage from '@react-native-community/async-storage'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setIdleCounter,
  setInitUrlFromQRcode
} from '@/store/data'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import ViewAuthLoginEmailPassword from '@/__reactnative_stone/views/Auth/LoginEmailPassword'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import zh_tw from '@/__reactnative_stone/messages/zh_tw'
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'
import S_Notification from '@/services/api/v1/notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import RNPushNotification from 'react-native-push-notification';

const WsDetectIdle = () => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes
  const appState = useRef(AppState.currentState);
  const rnBiometrics = new ReactNativeBiometrics()

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // 閒置倒數器相關
  const initCount = 300 // 單位1000ms
  const [countdownEnded, setCountdownEnded] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [countdown, setCountdown] = useState();
  const countdownInterval = useRef(null); // 閒置後計數器
  const idleTimeoutId = useRef(null); // 背景閒置計數器

  // 鎖屏與登入視窗顯示
  const [idleAlertVisible, setIdleAlertVisible] = React.useState(false)
  const [requestLoginVisible, setRequestLoginVisible] = useState(false);

  // 客製化鎖屏與登入邏輯
  const [isSubmittable, setIsSubmittable] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [topErrorMessage, setTopErrorMessage] = React.useState()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const passwordInput = React.createRef()
  const [deviceToken, setDeviceToken] = React.useState()

  // BIO LOGIN
  const $_onFocus = () => {
    isBiometricSupport()
  }
  const isBiometricSupport = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (available) {
        switch (biometryType) {
          case BiometryTypes.TouchID:
            console.log('TouchID is supported');
            break;
          case BiometryTypes.FaceID:
            console.log('FaceID is supported');
            break;
          case BiometryTypes.Biometrics:
            console.log('Biometrics is supported');
            break;
          default:
            console.log('Unknown biometrics type supported');
        }

        try {
          const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' });
          if (success) {
            const { email, password } = await $_getPasswordFromKeyChain();
            if (email && password) {
              $_onSubmit(email, password)
            }
          } else {
            console.log('User cancelled biometric prompt');
          }
        } catch (error) {
          console.log('Biometrics prompt failed', error);
        }
      } else {
        console.log('Biometrics not supported');
      }
    } catch (error) {
      console.log('Failed to check biometric sensor availability', error);
    }
  };

  const $_getPasswordFromKeyChain = async () => {
    try {
      const res = await S_Keychain.retrieveCredentials()
      if (res?.username && res?.password) {
        setEmail(res?.username)
        setPassword(res?.password)
        return {
          email: res?.username,
          password: res?.password
        }
      }
    } catch (error) {
      console.error(error);
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

  // DETECT FOREGROUND OR BACKGROUND
  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/active/) && nextAppState === 'active') {
      console.log('active -> active');
    }
    else if (appState.current.match(/active/) && nextAppState === 'inactive') {
      console.log('active -> inactive');
      $_UnReadAllNotification()
    }
    else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('inactive|background -> active');
    }
    else if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
      console.log('active -> inactive|background');
    }
  };

  // STORAGE
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('fcmToken')
    const _lock = await AsyncStorage.getItem('screenLock')
    const _value = JSON.parse(_item)
    setDeviceToken(_value)
    if (_lock == 'locked') {
      setRequestLoginVisible(true)
    }
  }
  const $_setStorage = async (status) => {
    await AsyncStorage.setItem('screenLock', status)
  }

  // LOGOUT
  const $_logout = async () => {
    if (deviceToken != null) {
      try {
        const res = await S_DeviceToken.deactive({
          deviceToken: deviceToken
        });
      } catch (error) {
        console.error(error, '-deactive err-');
      } finally {
        try {
          await S_Auth.logout();
          Alert.alert(t('登出成功'));
          setIdleAlertVisible(false);
          setRequestLoginVisible(false);
          await AsyncStorage.removeItem('screenLock');
        } catch (error) {
          console.error(error, 'logout error');
          Alert.alert(t('登出失敗'));
        }
      }
    } else {
      try {
        await S_Auth.logout();
        Alert.alert(t('登出成功'));
        setIdleAlertVisible(false);
        setRequestLoginVisible(false);
        await AsyncStorage.removeItem('screenLock');
      } catch (error) {
        console.error(error, 'logout error');
        Alert.alert(t('登出失敗'));
      }
    }
  };

  const $_onSubmit = async (email, password) => {
    try {
      setIsSubmittable(false)
      setTopErrorMessage()
      setIsLoading(true)
      if (email && password) {
        const loginRes = await S_API_Auth.check({
          email: email,
          password: password,
        })
        if (loginRes && loginRes.message && loginRes.message === 'success') {
          setCountdownEnded(false)
          setRequestLoginVisible(false)
          setEmail('')
          setPassword('')
          setIsActive(true)
          setCountdown(initCount)
          await S_Keychain.storeCredentials(email, password);
          await AsyncStorage.removeItem('screenLock')
        } else {
          Alert.alert('No API loginRes')
        }
      }
    } catch (error) {
      if (error.response) {
        console.log("Error data", error.response.data);
      } else if (error.request) {
        console.log("Error request", error.request);
      } else {
        console.log('Error', error.message);
      }
      Alert.alert(JSON.stringify(error))
      setTopErrorMessage(zh_tw[error])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    clearTimeout(idleTimeoutId.current);
    clearInterval(countdownInterval.current);
    // 顯示用讀秒
    setCountdown(initCount)
    countdownInterval.current = setInterval(() => {
      setCountdown((prevTime) => {
        if (prevTime > 1) {
          // console.log(prevTime, 'prevTime');
          return prevTime - 1;
        } else {
          // 倒數計時結束時的操作
          clearInterval(countdownInterval.current); // 停止倒數計時
          if (!countdownEnded) {
            setCountdownEnded(true); // 設置倒數已結束狀態，避免重複操作
            setIdleAlertVisible(false);
            setRequestLoginVisible(true);
            $_setStorage('locked');
            clearTimeout(idleTimeoutId.current);
          }
        }
      });
    }, 1000);
    // 以下為偵測用讀秒
    idleTimeoutId.current = setTimeout(() => {
      if (!idleAlertVisible) {
        setIdleAlertVisible(true)
      }
    }, 1000 * initCount);
  }, [idleAlertVisible, countdownEnded, isActive, _stack, currentIdleCounter]);

  React.useEffect(() => {
    $_getStorage()
  }, []);

  return (
    <>
       <WsPopup
        active={idleAlertVisible}
        onClose={() => {
        }}>
        <View
          style={{
            width: width * 0.9,
            height: 256,
            backgroundColor: $color.white,
            borderRadius: 10,
          }}>
          <WsText
            size={24}
            color={$color.black}
            style={{
              padding: 16
            }}
          >{t('已閒置一段時間未瀏覽')}
          </WsText>
          <WsText
            size={18}
            color={$color.black}
            style={{
              paddingHorizontal: 16
            }}
          >{t('是否要繼續使用此平台，\n否則在{name}秒後將自動登出。', { name: countdown })}
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
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: $color.gray,
                borderRadius: 25,
                alignItems: 'center',
                width: 108,
              }}
              onPress={() => {
                clearInterval(countdownInterval.current)
                setCountdown(initCount)
                setIdleAlertVisible(false)
                setRequestLoginVisible(false)
                setCountdownEnded(false)
              }}>
              <WsText
                size={14}
                color={$color.gray}
              >{t('繼續使用')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 108,
              }}
              onPress={() => {
                $_logout()
              }}>
              {t('登出')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
      <WsPopup
        active={requestLoginVisible}
        onClose={() => {
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          style={{
          }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{
              minWidth: width * 0.9,
              margin: 16,
              padding: 16,
              borderRadius: 8,
              backgroundColor: $color.white,
            }}>
              <View
                style={{
                  maxHeight: height * 0.55
                }}
              >
                <ScrollView>
                  {topErrorMessage ? (
                    <WsErrorMessage
                      style={{
                        marginVertical: 8,
                        marginLeft: -8
                      }}>
                      {topErrorMessage}
                    </WsErrorMessage>
                  ) : (
                    <>
                      <WsText
                        size={24}
                        color={$color.black}
                        style={{
                          marginBottom: 8
                        }}
                      >{t(`已閒置過久`)}
                      </WsText>
                      <WsText
                        size={18}
                        color={$color.black}
                        style={{
                          marginBottom: 8
                        }}
                      >{t('為了保護您的資料安全，本系統已鎖定，請重新登入。')}
                      </WsText>
                    </>
                  )}

                  <WsState
                    style={{
                      marginTop: 16,
                    }}
                    type="email"
                    label={i18next.t('帳號')}
                    placeholder={i18next.t('輸入')}
                    value={email}
                    autoFocus={true}
                    placeholderTextColor={$color.gray}
                    onChange={setEmail}
                  />
                  <WsState
                    style={{
                      marginTop: 16,
                    }}
                    ref={passwordInput}
                    type="password"
                    label={i18next.t('密碼')}
                    placeholder={i18next.t('輸入')}
                    placeholderTextColor={$color.gray}
                    value={password}
                    autoCompleteType="password"
                    textContentType="password"
                    onSubmitEditing={
                      () => $_onSubmit(email, password)
                    }
                    onChange={setPassword}
                  />
                  <WsGradientButton
                    style={{
                      marginTop: 30
                    }}
                    isLoading={isLoading}
                    isDisabled={!isSubmittable}
                    onPress={
                      () => $_onSubmit(email, password)
                    }
                    borderRadius={30}>
                    {i18next.t('登入解鎖')}
                  </WsGradientButton>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        marginTop: 16,
                      }}
                      onPress={() => {
                        $_onFocus()
                      }}
                    >
                      <Image
                        style={{
                          width: 72,
                          height: 72,
                        }}
                        source={require('@/__reactnative_stone/assets/img/face-id.png')}
                      />
                      <WsText size={14} color={$color.primary}>
                        {'Face ID'}
                      </WsText>
                    </TouchableOpacity>
                  </View>

                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </WsPopup>
    </>
  );
}

export default WsDetectIdle

