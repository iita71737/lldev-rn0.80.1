import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
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
import { Portal, Modal as PaperModal } from 'react-native-paper';

const WsDetectIdle002 = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes
  const appState = useRef(AppState.currentState);
  const rnBiometrics = new ReactNativeBiometrics()

  // props
  const {
    active,
    setActive
  } = props


  const activeRef = useRef(active); // 用來追蹤 active 變化
  const backgroundTimestampRef = useRef(null)
  const alreadyLockedRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // 閒置倒數器相關
  const initCount = 300 //初始秒數
  // const initCount = 5  // test issue

  const [countdownEnded, setCountdownEnded] = useState(false);
  const [countdown, setCountdown] = useState();
  const countdownInterval = useRef(null); // 閒置後計數器
  const idleTimeoutId = useRef(null); // 背景閒置計數器

  // 閒置倒數視窗
  const [idleAlertVisible, setIdleAlertVisible] = React.useState(false)
  // 鎖屏登入視窗
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
          Alert.alert(t('錯誤'));
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
          setCountdown(initCount)
          alreadyLockedRef.current = false;
          await S_Keychain.storeCredentials(email, password);
          await AsyncStorage.removeItem('screenLock')
          setTimeout(() => setActive(true), 2000);
        } else {
          console.log('No API loginRes');
          Alert.alert(t('錯誤'))
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
      console.log(error);
      Alert.alert(t('錯誤'))
      setTopErrorMessage(zh_tw[error])
    } finally {
      setIsLoading(false)
    }
  }

  const startCountdown = () => {
    if (countdownInterval.current) return; // 確保只啟動一次
    if (requestLoginVisible) {
      return
    }
    // 顯示用讀秒
    setCountdown(initCount)
    setIdleAlertVisible(true);
    countdownInterval.current = setInterval(() => {
      setCountdown((prevTime) => {
        if (prevTime > 1) {
          return prevTime - 1;
        } else {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
          if (!countdownEnded && !alreadyLockedRef.current) {
            alreadyLockedRef.current = true;
            setCountdownEnded(true);
            setIdleAlertVisible(false);
            // setTimeout(() => {
            //   setRequestLoginVisible(true);
            // }, 300);
            setRequestLoginVisible(true);
            console.log("Session Locked");
          }
          return 0;
        }
      });
    }, 1000);
  };

  // 監聽 active 變化，只有當 active 變 false 時才啟動計時器
  useEffect(() => {
    const checkActiveChange = () => {
      if (!activeRef.current) {
        startCountdown();
      } else {
        // 如果 active 變回 true，清除計時器
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
        setIdleAlertVisible(false);
        setCountdownEnded(false);
      }
    };
    checkActiveChange();

    return () => {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    };
  }, [active]);

  React.useEffect(() => {
    $_getStorage()
  }, []);

  // DETECT FOREGROUND OR BACKGROUND
  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
      console.log('App goes to background');

      // 👉 記錄進入背景的時間（毫秒）
      backgroundTimestampRef.current = Date.now();
    }

    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App returns to foreground');

      if (backgroundTimestampRef.current) {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - backgroundTimestampRef.current) / 1000);

        // ⚠️ 根據實際剩餘時間調整倒數
        setCountdown(prev => {
          const updated = Math.max(prev - diffInSeconds, 0);
          // 如果倒數完了，跳轉至鎖定畫面
          if (updated === 0 && !countdownEnded && !alreadyLockedRef.current) {
            alreadyLockedRef.current = true;
            setCountdownEnded(true);
            setIdleAlertVisible(false);
            // setTimeout(() => {
            //   setRequestLoginVisible(true);
            // }, 500);
            setRequestLoginVisible(true);
          }
          return updated;
        });

        backgroundTimestampRef.current = null;
      }
    }

    appState.current = nextAppState;
  };


  // 在組件掛載時監聽 AppState 的變更
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    // 在組件卸載時移除監聽器
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <>
      <Portal>
        <PaperModal
          visible={idleAlertVisible}
          onDismiss={() => { }}
          dismissable={false} // 原本 onClose 是空的，避免點背景就關掉
          contentContainerStyle={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            alignSelf: 'center',
          }}
        >
          <View>
            <WsText size={24} color={$color.black} style={{ padding: 16 }}>
              {t('已閒置一段時間未瀏覽')}
            </WsText>

            <WsText size={18} color={$color.black} style={{ paddingHorizontal: 16 }}>
              {t('是否要繼續使用此平台，否則在{{name}}秒後將自動登出。', { name: countdown })}
            </WsText>

            <WsFlex style={{ margin: 16, alignSelf: 'flex-end' }}>
              <TouchableOpacity
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderWidth: 1,
                  borderColor: $color.gray,
                  borderRadius: 25,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 128,
                  backgroundColor: $color.white,
                  height: 48,
                  marginRight: 12,
                }}
                onPress={() => {
                  clearInterval(countdownInterval.current)
                  setCountdown(initCount)
                  setIdleAlertVisible(false)
                  setRequestLoginVisible(false)
                  setCountdownEnded(false)
                  alreadyLockedRef.current = false
                }}
              >
                <WsText size={14} color={$color.gray}>{t('繼續使用')}</WsText>
              </TouchableOpacity>

              <WsGradientButton style={{ width: 128 }} onPress={$_logout}>
                {t('登出')}
              </WsGradientButton>
            </WsFlex>
          </View>
        </PaperModal>
      </Portal>

      <Portal>
        <PaperModal
          visible={requestLoginVisible}
          onDismiss={() => { }}
          dismissable={false}
          contentContainerStyle={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 8,
            padding: 16,
            alignSelf: 'center',
            maxHeight: height * 0.8, // 讓內容可滾
          }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <View style={{ maxHeight: height * 0.55 }}>
                  <ScrollView>
                    {topErrorMessage ? (
                      <WsErrorMessage style={{ marginVertical: 8, marginLeft: -8 }}>
                        {topErrorMessage}
                      </WsErrorMessage>
                    ) : (
                      <>
                        <WsText size={24} color={$color.black} style={{ marginBottom: 8 }}>
                          {t('已閒置過久')}
                        </WsText>
                        <WsText size={18} color={$color.black} style={{ marginBottom: 8 }}>
                          {t('為了保護您的資料安全，本系統已鎖定，請重新登入。')}
                        </WsText>
                      </>
                    )}

                    <WsState
                      style={{ marginTop: 16 }}
                      type="email"
                      label={i18next.t('帳號')}
                      placeholder={i18next.t('輸入')}
                      value={email}
                      autoFocus
                      placeholderTextColor={$color.gray}
                      onChange={setEmail}
                    />

                    <WsState
                      style={{ marginTop: 16 }}
                      ref={passwordInput}
                      type="password"
                      label={i18next.t('密碼')}
                      placeholder={i18next.t('輸入')}
                      placeholderTextColor={$color.gray}
                      value={password}
                      autoCompleteType="password"
                      textContentType="password"
                      onSubmitEditing={() => $_onSubmit(email, password)}
                      onChange={setPassword}
                    />

                    <WsGradientButton
                      style={{ marginTop: 30 }}
                      isLoading={isLoading}
                      isDisabled={!isSubmittable}
                      onPress={() => $_onSubmit(email, password)}
                      borderRadius={30}
                    >
                      {i18next.t('登入解鎖')}
                    </WsGradientButton>

                    {Platform.OS === 'ios' && (
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity
                          style={{ alignItems: 'center', marginTop: 16 }}
                          onPress={$_onFocus}
                        >
                          <Image
                            style={{ width: 72, height: 72 }}
                            source={require('@/__reactnative_stone/assets/img/face-id.png')}
                          />
                          <WsText size={14} color={$color.primary}>{'Face ID'}</WsText>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </PaperModal>
      </Portal>

    </>
  );
}

export default WsDetectIdle002

