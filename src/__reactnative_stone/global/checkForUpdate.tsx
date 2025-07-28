import SpInAppUpdates, {
  IAUUpdateKind,
  StartUpdateOptions,
  IAUInstallStatus,
} from "sp-react-native-in-app-updates";
import DeviceInfo from "react-native-device-info";
import { Platform, Alert } from "react-native";
// import semver from "semver";
import Config from "react-native-config";

// 檢查版本是否符合要求的函數，返回布林值
// const isUpToDate = (currentVersion: string, targetVersion: string): boolean => {
//   return semver.gte(currentVersion, targetVersion); // 大於或等於則返回 true
// };

// 檢查並處理更新的主函數
export const checkForUpdate = async (): Promise<boolean> => {
  const inAppUpdates = new SpInAppUpdates(false);
  const ANDROID_VERSION_NAME: string = DeviceInfo.getVersion();
  const ANDROID_VERSION_CODE: string = DeviceInfo.getBuildNumber();

  try {
    // 檢查是否有可用更新
    const updateCheckResult = await inAppUpdates.checkNeedsUpdate();
    // alert(JSON.stringify(updateCheckResult))
    if (!updateCheckResult.shouldUpdate) {
      return true; // 沒有版本需要更新，返回 true
    }

    // 設置更新選項
    const updateOptions: StartUpdateOptions | undefined = Platform.select({
      ios: {
        title: 'Update available',
        message: "There is a new version of the app available on the App Store, do you want to update it?",
        buttonUpgradeText: 'Update',
        buttonCancelText: 'Cancel',
      },
      android: {
        updateType: IAUUpdateKind.IMMEDIATE,
      },
    });

    // 監聽更新狀態
    inAppUpdates.addStatusUpdateListener((downloadStatus) => {
      if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
        inAppUpdates.installUpdate();
      }
    });

    // 啟動更新流程
    inAppUpdates.startUpdate(updateOptions)
      .then(() => {
        return false; // 有更新的情況，返回 false
      })
      .catch((error: any) => {
        if (error.code === 'UPDATE_CANCELED') {
          console.log("User canceled the update.");
          return false;
        } else {
          console.error("Update failed:", error);
          return false;
        }
      });

    return false; // 當有可更新版本，但流程未成功時返回 false

  } catch (error) {
    console.error("Error during update process:", error);
    return false;
  }
};
