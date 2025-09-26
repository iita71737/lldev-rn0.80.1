import React, { useState } from 'react'
import {
  Text,
  Alert,
  View,
  Platform,
  Button,
  Dimensions,
  TouchableOpacity,
  Linking,
  InteractionManager
} from 'react-native'
import { Provider } from 'react-redux'
import store from '@/store'
import RoutesMain from '@/__reactnative_stone/routes/RoutesMain'
import G_i18n from '@/__reactnative_stone/global/i18n'
import Config from "react-native-config";
import { LogBox } from 'react-native'
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  /Require cycle:.*audit_question/,
]);
// import codePush from 'react-native-code-push'
import {
  WsLoading,
  WsText,
  WsDes,
  WsSnackBar,
  WsGlobalOfflineAlert,
  WsPopup,
  WsGradientButton,
  WsFlex,
  WsStatusBar
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { addEventListener, useNetInfo } from "@react-native-community/netinfo";
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'

import { checkForUpdate } from '@/__reactnative_stone/global/checkForUpdate'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import semver from "semver";
import DeviceInfo from "react-native-device-info";
import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
} from "sp-react-native-in-app-updates";
import BootSplash from "react-native-bootsplash";
import VersionCheck from 'react-native-version-check';
G_i18n.i18nInit()
if (!__DEV__) {
  LogBox.ignoreAllLogs(true);
} else {
  LogBox.ignoreAllLogs(true);
}
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider } from 'react-native-paper';
import { CopilotProvider } from 'react-native-copilot';
import 'react-native-gesture-handler';

function App(): JSX.Element {
  const { t, i18n } = useTranslation()
  const info = useNetInfo()
  const { width, height } = Dimensions.get('window')
  const IOS_MARKETING_VERSION: string = DeviceInfo.getVersion();
  const IOS_CURRENT_PROJECT_VERSION: string = DeviceInfo.getBuildNumber();

  const [stopUsingAlertVisible, setStopUsingAlertVisible] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [des, setDes] = React.useState(false)
  const [downloadProgress, setDownloadProgress] = React.useState(0);

  // helper 
  const isLower = (buildNumber: string, targetVersion: string): boolean => {
    return semver.lt(buildNumber, targetVersion); // 大於或等於則返回 true
  };

  const $_init = async () => {
    try {
      // PRD環境檢查線上新版本，停用現有舊版本
      if (Platform.OS === 'ios') {
        const inAppUpdates = new SpInAppUpdates(false);
        const updateCheckResult = await inAppUpdates.checkNeedsUpdate();
        if (updateCheckResult.shouldUpdate) {
          setStopUsingAlertVisible(true)
          await S_Auth.logout()
          return;
        }
        // 🔽 這裡是你想加的版本檢查
        const latestVersion = await VersionCheck.getLatestVersion({ provider: 'appStore' });
        const currentVersion = VersionCheck.getCurrentVersion();
        const url = await VersionCheck.getAppStoreUrl({
          appID: '6473244155', // PRD's AppID
          country: 'tw'
        });
        console.log(`目前版本 : ${currentVersion}，最新版本: ${latestVersion}`);
        console.log(url, 'url');
        const res = await VersionCheck.needUpdate({
          currentVersion,
          latestVersion,
        })
        const _check = res?.isNeeded
        if (_check) {
          setStopUsingAlertVisible(true);
          Linking.openURL(url);
          return;
        }
      } else if (Platform.OS === 'android' && __DEV__ === false) {
        const _updateFromStore = await checkForUpdate()
        if (_updateFromStore === false) {
          setStopUsingAlertVisible(true)
          await S_Auth.logout()
        }
      }
      // CodePush
      // const _update = await codePush.checkForUpdate();
      // if (_update) {
      //   setIsLoading(true)
      //   $_codePushUpdate()
      //   return
      // } else {
      //   setIsLoading(false)
      // }
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error(error);
    }
  }

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
            if (Platform.OS === 'ios') {
              codePush.restartApp(true);
            }
            break;
        }
      },
      ({ receivedBytes, totalBytes, }) => {
        const calculatedProgress = Math.floor((receivedBytes / totalBytes) * 100);
        setDownloadProgress(calculatedProgress);
      })
      .then((update) => {
        console.log(update, 'update');
      })
      .catch(error => {
        console.error(error);
        setIsLoading(false)
      })
  }

  const $_setApiUrl = async () => {
    try {
      base.init()
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_setApiUrl()

    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      BootSplash.hide({ fade: true }).catch(console.warn)
      $_init()
    })

    return () => {
      interactionHandle.cancel?.()
    }
  }, [])

  return (
    <>
      <WsPopup
        active={stopUsingAlertVisible}
        onClose={() => {
        }}>
        <View
          style={{
            width: width * 0.9,
            height: 256,
            backgroundColor: $color.white,
            borderRadius: 10,
            zIndex: 1000,
          }}>
          <WsText
            size={24}
            color={$color.black}
            style={{
              padding: 16
            }}
          >{t('版本訊息')}
          </WsText>
          <WsText
            size={18}
            color={$color.black}
            style={{
              paddingHorizontal: 16
            }}
          >{t('已有新版本，請更新最新版本後使用。')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <WsGradientButton
              style={{
                width: 108,
              }}
              onPress={async () => {
                await checkForUpdate()
              }}>
              {t('檢查更新')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

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

      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <CopilotProvider>
            <PaperProvider>
              {Config.ENV === 'development' && <WsGlobalOfflineAlert />}
              <WsSnackBar />
              {isLoading ? null : <RoutesMain />}   {/* ← 只切內容，不切 Provider */}
            </PaperProvider>
          </CopilotProvider>
        </Provider>
      </GestureHandlerRootView>
    </>
  )
}

export default App;
