import React from 'react'
import {
  Pressable,
  ScrollView,
  Image,
  View,
  Dimensions,
  Alert,
  Text,
  TouchableOpacity,
  Platform,
  Linking
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
  WsStateForm,
  WsStateFormView,
  WsState,
  WsTag,
  WsGradientButton,
  WsDes,
  WsLoading,
  WsInfoForm
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import $config from '@/__config'
import S_User from '@/services/api/v1/user'
import S_UserFactoryRole from '@/services/api/v1/user_factory_role'
import store from '@/store'
import { getCurrentUser } from '@/store/data'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import DeviceInfo from 'react-native-device-info';
import axios from 'axios'
import S_OtherData from '@/services/api/v1/other_data'

const ViewSystemVersion = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // REDUX
  const factoryId = useSelector(state => state.data.currentFactory?.id)
  const currentUser = useSelector(state => state.data.currentUser)
  const version = useSelector(state => state.data.version)

  // STATES
  const [isLoading, setIsLoading] = React.useState(false)
  const [des, setDes] = React.useState(false)
  const [downloadProgress, setDownloadProgress] = React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [allFetchData, setAllFetchData] = React.useState({});


  // CODE_PUSH
  const handleUpdate = async () => {
    try {
      const _update = await codePush.checkForUpdate();
      console.log(_update, '_update');
      if (_update) {
        setIsLoading(true)
        $_codePushUpdate()
        return
      } else {
        Alert.alert('error');
      }
    } catch (error) {
      Alert.alert(t(`請求次數過多，請稍候再試`))
      console.error('更新失败：', error);
    }
  };

  const $_codePushUpdate = () => {
    codePush.sync(
      {
        updateDialog: false,
        installMode: codePush.InstallMode.IMMEDIATE, // 立即安裝更新
      },
      (status) => {
        switch (status) {
          case codePush.SyncStatus.CHECKING_FOR_UPDATE:
            console.log("Checking for updates.");
            break;
          case codePush.SyncStatus.DOWNLOADING_PACKAGE:
            console.log("Downloading package.");
            setDes("偵測到新版本，下載更新中...")
            break;
          case codePush.SyncStatus.INSTALLING_UPDATE:
            console.log("Installing update.");
            break;
          case codePush.SyncStatus.UP_TO_DATE:
            console.log("Up-to-date.");
            setDes("已經是最新版本")
            setIsLoading(false)
            break;
          case codePush.SyncStatus.UPDATE_INSTALLED:
            console.log("Update installed.");
            setDes("更新完成，等待 App 重新啟動。")
            setIsLoading(false)
            codePush.restartApp(true);
            break;
        }
      },
      ({ receivedBytes, totalBytes, }) => {
        const calculatedProgress = Math.floor((receivedBytes / totalBytes) * 100);
        setDownloadProgress(calculatedProgress);
      })
      .then((update) => {
        console.log(update, 'update');
        Alert.alert('應用已更新！\n請重啟應用程式');
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false)
      })
  }

  const [fields, setFields] = React.useState({
    androidMinimumAppVersion: {
      label: t('ANDROID_VERSION_CODE'),
      type: "link",
      style: {
        marginVertical: 16
      },
      // 暫時註解
      // onPress: async () => {
      //   // 檢查裝置是否能夠開啟該 URL
      //   const url = `https://play.google.com/apps/test/com.esgoalprd/132`
      //   const canOpen = await Linking.canOpenURL(url);
      //   if (canOpen) {
      //     await Linking.openURL(url);
      //   } else {
      //     console.log('無法開啟此 URL:', url);
      //   }
      // }
    },
    androidMinimumSupportedVersion: {
      label: t('ANDROID_VERSION_NAME'),
      type: "link",
      style: {
        marginVertical: 16
      },
    },
    iOSMinimumAppVersion: {
      label: t('IOS_CURRENT_PROJECT_VERSION'),
      type: "link",
      style: {
        marginVertical: 16
      },
    },
    iOSMinimumSupportedVersion: {
      label: t('IOS_MARKETING_VERSION'),
      type: "link",
      style: {
        marginVertical: 16
      },
    },
  })

  // API
  const fetchOtherData = async () => {
    const IOS_MARKETING_VERSION: string = DeviceInfo.getVersion();
    const IOS_CURRENT_PROJECT_VERSION: string = DeviceInfo.getBuildNumber();
    const ANDROID_VERSION_NAME: string = DeviceInfo.getVersion();
    const ANDROID_VERSION_CODE: string = DeviceInfo.getBuildNumber();
    const _data = {
      androidMinimumAppVersion: Platform.OS === 'android' ? ANDROID_VERSION_CODE : null,
      androidMinimumSupportedVersion: Platform.OS === 'android' ? ANDROID_VERSION_NAME : null,
      iOSMinimumAppVersion: Platform.OS === 'ios' ? IOS_CURRENT_PROJECT_VERSION : null,
      iOSMinimumSupportedVersion: Platform.OS === 'ios' ? IOS_MARKETING_VERSION : null,
    }
    setAllFetchData(_data)
    setLoading(false)
    // 暫時註解
    // try {
    //   const _params = {}
    //   const android_app_version = await S_OtherData.android_app_version({ params: _params })
    //   const android_os_version = await S_OtherData.android_os_version({ params: _params })
    //   const ios_app_version = await S_OtherData.ios_app_version({ params: _params })
    //   const ios_os_version = await S_OtherData.ios_os_version({ params: _params })
    //   await Promise.all([android_app_version, android_os_version, ios_app_version, ios_os_version])
    //     .then(res => {
    //       const _data = {
    //         androidMinimumAppVersion: res[0].data.payload.version,
    //         androidMinimumSupportedVersion: res[1].data.payload.version,
    //         iOSMinimumAppVersion: res[2].data.payload.version,
    //         iOSMinimumSupportedVersion: res[3].data.payload.version,
    //       }
    //       setAllFetchData(_data)
    //       setLoading(false)
    //     })
    // } catch (e) {
    //   console.error(e);
    // }
  }

  React.useEffect(() => {
    fetchOtherData()
  }, [])

  return (
    <>
      {isLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: 'center',
            padding: 10,
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: 100,
            backgroundColor: $color.black
          }}
        >
          <WsLoading
            style={{
              zIndex: 2
            }}
          />
          <WsDes
            style={{
              marginTop: 100
            }}
          >{des} {downloadProgress}%</WsDes>
        </View>
      )}
      {isLoading === false && (
        <ScrollView>
          <WsPaddingContainer
            padding={0}
            style={{
              backgroundColor: $color.white,
              flexDirection: 'row',
              paddingTop: 8,
              paddingHorizontal: 16,
              marginBottom: 8
            }}>
            <View
            >
              <WsText size={14} color={$color.black} fontWeight={600}>
                {t("應用程式內版本")}
              </WsText>
              <WsText size={14} color={$color.gray} fontWeight={600}>
                {`[${version}]`}
              </WsText>
            </View>
          </WsPaddingContainer>

          {/* <WsGradientButton onPress={() => handleUpdate()}>
            {t('檢查codePush更新')}
          </WsGradientButton> */}

          {!loading && (
            <WsInfoForm
              style={{
                padding: 16,
              }}
              fields={fields}
              value={allFetchData}
            />
          )}


        </ScrollView>
      )}
    </>
  )
}

export default ViewSystemVersion
