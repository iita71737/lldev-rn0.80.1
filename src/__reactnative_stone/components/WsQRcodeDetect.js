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
import { SafeAreaView } from 'react-native-safe-area-context';
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
import S_QRcode from '@/services/api/v1/qrcode'

const WsQRcodeDetect = () => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // 使用 Ref 來保存當前的 AppState
  const appState = useRef(AppState.currentState);

  // URL REDIRECT
  const $_redirect = async (url) => {
    if (url) {  // 防止重複處理相同的 URL
      try {
        await S_QRcode.redirectByScanUrl(url, navigation);
      } catch (e) {
        store.dispatch(setInitUrlFromQRcode(null));
      }
    }
  };

  // 當 AppState 改變時，觸發此函數
  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/active/) && nextAppState === 'active') {
      console.log('WsQRcodeDetect active -> active');
      // $_redirect()
    } else if (appState.current.match(/active/) && nextAppState === 'inactive') {
      console.log('WsQRcodeDetect active -> inactive');
    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('WsQRcodeDetect inactive|background -> active');
    } else if (appState.current.match(/active/) && nextAppState.match(/inactive|background/)) {
      console.log('WsQRcodeDetect active -> inactive|background');
    }
  };

  // 在組件掛載時監聽 AppState 的變更
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    // 在組件卸載時移除監聽器
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    // 監聽應用程式 URL 變化
    const urlListener = Linking.addEventListener('url', (event) => {
      const newUrl = event.url;
      console.log(newUrl,'newUrl222');
      // 這邊為已經開啟App且登入的狀態下，回到App時的比對。
      $_redirect(newUrl);
    });

    // 移除監聽器
    return () => {
      urlListener.remove();
    };
  }, []);

  return (
    <>
    </>
  );
};

export default WsQRcodeDetect;
