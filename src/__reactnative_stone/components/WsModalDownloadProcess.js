import React from 'react'
import { Modal, Platform, Alert, View } from 'react-native'
import { WsLoading, WsModalIconMessage } from '@/components'
import moment from 'moment'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import RNBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import $color from '@/__reactnative_stone/global/color'
import { Linking } from 'react-native';
import { request, check, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';

const WsModalDownloadProcess = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    visible = true,
    source,
    fileName,
    fileType,
    onComplete
  } = props

  // State
  const [progressNum, setProgressNum] = React.useState(0)
  const [fileSize, setFileSize] = React.useState(0)
  const [fileSizeWritten, setFileSizeWritten] = React.useState(0)
  const [jobId, setJobId] = React.useState(null)
  const [savedVisible, setSavedVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(null)

  // Function
  const $_checkAndroidPermission = async () => {
    let permission;
    if (Platform.Version >= 33) {
      // Android 13+ 使用分離權限
      permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
      // 若你儲存影片，也可換成 READ_MEDIA_VIDEO
    } else {
      permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
    }
    try {
      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        return true;
      }
      if (result === RESULTS.DENIED) {
        const requestResult = await request(permission);
        return requestResult === RESULTS.GRANTED;
      }
      if (result === RESULTS.BLOCKED) {
        console.log('權限被封鎖，建議引導使用者前往設定頁開啟');
        // openSettings(); // 可引導前往系統設定頁
        return false;
      }
      return false;
    } catch (error) {
      console.error('檢查/請求權限時發生錯誤：', error);
      return false;
    }
  };

  const $_getFileName = () => {
    if (fileName) {
      return encodeURIComponent(fileName)
    } else {
      if (value) {
        return decodeURI(S_url.getFileName(value))
      } else {
        return null
      }
    }
  }

  // HELPER
  const isVideoOrImage = (url) => {
    if (!url) {
      return
    }
    const fileExtension = url.split('.').pop().toLowerCase().replace(/\?.*$/, '').toLowerCase();
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    if (videoExtensions.includes(fileExtension)) {
      return 'video';
    } else if (imageExtensions.includes(fileExtension)) {
      return 'image';
    } else {
      return 'image';
    }
  }
  const sanitizeFilename = (filename) => {
    return fileName.replace(/[\/\?<>\\:\*\|"]/g, '').replace(/\s+/g, '_');
  }
  const $_onSave = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(true);
    try {
      const resultCheck = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY)
      if (Platform.OS === 'android') {
        await $_checkAndroidPermission()
      }
      if (['mp4', 'mov', 'mkv'].includes(fileType)) {
        downloadAndSaveVideo(source, 'ESGoal-dev', fileName)
      }
      if (Platform.OS === 'android' && ['avi'].includes(fileType)) {
        downloadAndSaveVideo(source, 'ESGoal-dev', fileName)
      }
      if (Platform.OS === 'ios' && ['avi'].includes(fileType)) {
        downloadVideo(source)
      }
      if (['wmv'].includes(fileType)) {
        downloadVideo(source)
      }
      if (['png', 'jpg', 'gif', 'jpeg', 'svg', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG'].includes(fileType)) {
        let _source
        if (typeof source === 'string') {
          _source = source
        } else if (typeof source === 'object') {
          _source = source.file_version?.source_url ? source.file_version?.source_url : source.file?.source_url
        }
        try {
          const ext = _source.split('.').pop()?.split('?')[0]; // 安全地取得副檔名
          const res = await RNBlobUtil.config({
            fileCache: true,
            appendExt: ext,
          }).fetch('GET', _source);
          const localPath = res.path();
          console.log(localPath, 'localPath--RNBlobUtil');
          // 保存至相册
          CameraRoll.save(localPath, { type: "photo", album: "ESGoal-Dev" })
            .then(uri => {
              console.log(uri, 'CameraRoll.save uri');

              setSavedVisible(true)
              setTimeout(() => {
                onComplete();
                setSavedVisible(false);
              }, 1000);
            })
          // setSavedVisible(true)
          // setTimeout(() => {
          //   onComplete();
          //   setSavedVisible(false);
          // }, 1000);
        } catch (error) {
          console.error('儲存失敗:', error);
          setTimeout(() => {
            onComplete();
            setSavedVisible(false);
          }, 500);
        }
      }

      if (['pdf', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'ods', 'odt'].includes(fileType)) {
        const url = source
        let filePath
        if (Platform.OS === 'ios') {
          filePath = `${RNFS.DocumentDirectoryPath}/${$_getFileName(source)}`;
        } else {
          filePath = `${RNFS.DocumentDirectoryPath}/${$_getFileName(source)}`;
        }
        // Android權限請求
        if (Platform.OS === 'android') {
          let deviceVersion = DeviceInfo.getSystemVersion();
          let granted = PermissionsAndroid.RESULTS.DENIED;
          console.log(deviceVersion, 'deviceVersion');
          if (deviceVersion >= 13) {
            request(PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
              // console.log(result,'result');
            });
          } else {
            granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          }
        }
        await RNFS.downloadFile({
          fromUrl: url,
          toFile: filePath,
          background: Platform.OS === 'ios' ? true : false, // Enable downloading in the background (iOS only)
          discretionary: Platform.OS === 'ios' ? true : false, // Allow the OS to control the timing and speed (iOS only)
          progress: (res) => {
            const progress = (res.bytesWritten / res.contentLength) * 100;
            console.log(`Progress: ${progress.toFixed(2)}%`);
          },
        })
          .promise.then(() => {
            RNFS.moveFile(filePath, `${RNFS.ExternalDirectoryPath}/${$_getFileName(source)}`)
              .then(() => console.log('File moved successfully'))
              .catch((err) => console.error('Error moving file:', err));
            Alert.alert('檔案下載成功路徑', filePath);
            setSavedVisible(true)
            setTimeout(() => {
              onComplete()
              setSavedVisible(false)
            }, 500)
          })
          .catch((err) => {
            alert('檔案下載失敗');
            console.error(err);
          });
      }
    } catch (error) {
      console.error('儲存時發生錯誤：', error);
      Alert.alert('儲存失敗', error.message);
    } finally {
      setLoading(false);
    }
  }

  // AVI && WMV
  const downloadVideo = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);

        setTimeout(() => {
          setSavedVisible(true)
        }, 100)

        setTimeout(() => {
          onComplete()
          setSavedVisible(false)
        }, 500)
      } else {
        console.log("Can't open URL:", url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // FOR VIDEO
  const downloadAndSaveVideo = async (url, albumName, _videoName) => {
    const videoName = sanitizeFilename(_videoName)
    try {
      // 解析副檔名
      const extension = url.split('.').pop().split('?')[0].toLowerCase();
      const videoName = sanitizeFilename(_videoName);
      const fullFileName = videoName.endsWith(`.${extension}`) ? videoName : `${videoName}.${extension}`;
      const albumDirectory = `${RNFS.DocumentDirectoryPath}/${albumName}`;
      await RNFS.mkdir(albumDirectory);

      // DOWNLOAD TO TEMP FOLDER
      const tempVideoPath = `${albumDirectory}/${fullFileName}`;
      const downloadResult = await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempVideoPath,
      })
        .promise.then(async (response) => {
          // SAVE TO CAMERA ROLL
          try {
            console.log(`file://${tempVideoPath}`, 'file://${tempVideoPath}');
            CameraRoll.save(`file://${tempVideoPath}`, { type: 'video' })
              .then(uri => {
                console.log(uri, 'CameraRoll.save-uri-video');
              })
            // DELETE TEMP RNFS
            const fileExists = await RNFS.exists(tempVideoPath);
            if (fileExists) {
              await RNFS.unlink(tempVideoPath);
            } else {
              console.log(`File ${tempVideoPath} does not exist.`);
            }
          } catch (error) {
            console.log(error.message, 'error.messageQAQ');
          } finally {
            setSavedVisible(true)
            setTimeout(() => {
              onComplete()
              setSavedVisible(false)
            }, 500)
            if (Platform.OS === 'ios') {
              Alert.alert(t('已儲存'))
            }
          }
        }).catch((error) => {
          console.log('Download error:', error.message);
        });
    } catch (error) {
      Alert.alert('影像儲存失敗', error.message);
      setTimeout(() => {
        onComplete()
        setSavedVisible(false)
      }, 500)
    }
  };

  React.useEffect(() => {
    if (visible) {
      $_onSave()
    }
  }, [visible])

  // Render
  return (
    <>
      <Modal
        visible={loading || savedVisible}
        animationType="fade"
        transparent={true}
      >
        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <WsLoading color={$color.white} />
          </View>
        ) : (
          <WsModalIconMessage
            visible={savedVisible}
            icon="ws-outline-check-circle-outline"
            text={t('已儲存')}
          />
        )}
      </Modal>

    </>
  )
}

export default WsModalDownloadProcess
