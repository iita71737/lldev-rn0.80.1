import React, { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  Image,
  View,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Clipboard,
  Linking,
  AppState,
  Button
} from 'react-native'
import {
  WsStepsTab,
  WsTabView,
  WsText,
  WsPaddingContainer,
  LlNavButton001,
  WsInfo,
  WsIconBtn,
  WsIcon,
  WsStateFormView,
  WsState,
  WsTag
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import DeviceInfo from 'react-native-device-info';
import { getLocation, getGeocode } from '@/__reactnative_stone/global/location'
import axios from 'axios'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import * as Sentry from "@sentry/react-native";
import { getDistance } from 'geolib';
import Geolocation from '@react-native-community/geolocation';
import AndroidOpenSettings from 'react-native-android-open-settings'

const ViewDeviceInfo = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // REDUX
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATES
  const [device, setDevice] = React.useState()
  const [address, setAddress] = React.useState();
  const [deviceToken, setDeviceToken] = React.useState()
  const [tokenExpiresAt, setTokenExpiresAt] = React.useState()
  const [appState, setAppState] = useState(AppState.currentState);

  const [latLng, setLatLng] = React.useState()
  const [unitDistant, setUnitDistant] = React.useState()

  // GET LOCATION
  const $_getLocation = async () => {
    try {
      const myLocation = await getLocation()
      setLatLng(myLocation)
      if (currentFactory?.lat && currentFactory?.lng) {
        const targetLocation = {
          latitude: currentFactory?.lat,
          longitude: currentFactory?.lng,
        };
        const distance = getDistance(myLocation, targetLocation);
        console.log(`距離目前單位約 ${distance} 公尺`);
        setUnitDistant(distance)
      }
    } catch (e) {
      console.log(e, 'e');
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
    }
  };

  // GET DEVICE INFO
  const $_getDeviceInfo = () => {
    const deviceModel = DeviceInfo.getModel();
    setDevice(deviceModel)
  }

  // GET DEVICE TOKEN
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('fcmToken')
    const _value = JSON.parse(_item)
    setDeviceToken(_value)
  }

  // GET EXPIRED_AT
  const $_getExpireAt = async () => {
    const value = await AsyncStorage.getItem('TokenExpireAt')
    const _value = JSON.parse(value)
    setTokenExpiresAt(_value)
  }

  // ANDROID PERMISSION
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result === RESULTS.GRANTED) {
        // console.log('Location permission granted');
      } else {
        // console.log('Location permission denied');
      }
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'ACCESS_FINE_LOCATION Permission',
            message:
              'Needs access to your ACCESS_FINE_LOCATION',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the ACCESS_FINE_LOCATION');
        } else {
          console.log('ACCESS_FINE_LOCATION permission denied');
          Linking.openSettings()
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const handleCopyPress = async () => {
    try {
      await Clipboard.setString(deviceToken);
      alert('文本已複製到剪貼板');
    } catch (error) {
      console.error('複製文本時出錯:', error);
    }
  };

  React.useEffect(() => {
    requestLocationPermission()
  }, []);

  React.useEffect(() => {
    $_getLocation()
    $_getDeviceInfo()
    $_getStorage()
    $_getExpireAt()
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // console.log('App has come to the foreground!');
        $_getLocation()
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return (
    <>
      <ScrollView>

        {device && (
          <WsPaddingContainer
            padding={0}
            style={{
              backgroundColor: $color.white,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 8,
              paddingHorizontal: 16,
              marginBottom: 8
            }}>
            <WsInfo
              style={{ flex: 1 }}
              label={t('設備型號')}
              value={device}
            />
          </WsPaddingContainer>
        )
        }

        {deviceToken && (
          <WsPaddingContainer
            padding={0}
            style={{
              backgroundColor: $color.white,
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 8,
              paddingHorizontal: 16,
              marginBottom: 8
            }}>
            <TouchableOpacity onLongPress={handleCopyPress}>
              <WsInfo
                style={{ flex: 1 }}
                label={`${t('FCM TOKEN')} (${t('LongPress to copy')})`}
                value={deviceToken}
              />
            </TouchableOpacity>
          </WsPaddingContainer>
        )
        }

        {/* <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            marginBottom: 8
          }}>
          {address && address.address_components &&
            address.address_components.length > 0 &&
            address.address_components.reverse().map(_address => {
              return (
                <View
                  style={{
                    flexWrap: 'nowrap',
                    borderWidth: 0.3,
                  }}
                >
                  <WsText>
                    {_address.types[0]}
                  </WsText>
                  <WsText>
                    {_address.long_name}
                  </WsText>
                </View>
              )
            })}
          {address && address.formatted_address && (
            <WsInfo
              style={{ marginTop: 16 }}
              label={t('完整地址')}
              value={address.formatted_address}
            />
          )
          }
        </WsPaddingContainer> */}

        {latLng && (
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
              marginBottom: 8
            }}>
            <WsInfo
              style={{}}
              label={t('目前位置')}
              value={`lat: ${latLng?.latitude} , \nlng: ${latLng?.longitude} , \n距離單位：約 ${unitDistant} 公尺`}
            />
          </WsPaddingContainer>
        )}



        {tokenExpiresAt && (
          <WsPaddingContainer
            padding={0}
            style={{
              backgroundColor: $color.white,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 8,
              paddingHorizontal: 16,
              marginBottom: 8
            }}>
            <WsInfo
              style={{ flex: 1 }}
              label={t('效期')}
              value={tokenExpiresAt}
            />
          </WsPaddingContainer>
        )
        }
        {/* <Button
          title='Try!'
          onPress={() => {
            Sentry.captureException(new Error('First error'))
            alert('test error')
          }}
        /> */}

      </ScrollView>
    </>
  )
}

export default ViewDeviceInfo
