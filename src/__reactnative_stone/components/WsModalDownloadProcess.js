import React from 'react'
import { Modal, Platform, PermissionsAndroid, Alert, View } from 'react-native'
import { WsLoading, WsModalIconMessage } from '@/components'
import moment from 'moment'
import S_Wasa from '@/__reactnative_stone/services/wasa'

import RNBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import { request, PERMISSIONS, openSettings, RESULTS, check, } from 'react-native-permissions';
import $color from '@/__reactnative_stone/global/color'
import { Linking } from 'react-native';

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
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    try {
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(permission);
      if (status === 'granted') {
        return true;
      } else {
        // 在此處處理權限被拒絕的情況
        console.log('用戶拒絕了權限');
        return false;
      }
    } catch (error) {
      // 在此處處理錯誤
      console.error('檢查/請求許可權時發生錯誤：', error);
      return false;
    }
  }

  const $_getFileName = () => {
    if (fileName) {
      return fileName
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
    setLoading(true);
    // await new Promise(resolve => setTimeout(resolve, 5000));
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
        if (typeof source === 'string') {
          _source = source
        } else if (typeof source === 'object') {
          _source = source.file?.source_url
        }
        try {
          const res = await RNBlobUtil.config({
            fileCache: true,
            appendExt: _source.substring(_source.lastIndexOf('.') + 1, _source.indexOf('?')), // 取得副檔名
            addAndroidDownloads: {
              useDownloadManager: true,
              notification: true,
              title: fileName, // 下載顯示名稱
              path: `${RNBlobUtil.fs.dirs.PictureDir}/${fileName}`, // Android 儲存路徑
              description: '下載完成後可在相簿查看',
              mime: 'application/octet-stream',
              mediaScannable: true, // 可被掃描進媒體資料庫
            },
          }).fetch('GET', _source);
          let filePath;
          if (Platform.OS === 'ios') {
            filePath = RNFS.LibraryDirectoryPath + `/${$_getFileName(_source)}`;
          } else {
            filePath = `${RNFS.DocumentDirectoryPath}/${$_getFileName(_source)}`;
          }
          // 保存至相册
          CameraRoll.save(_source, { type: "photo", album: "ESGoal-Dev" })
            .then(res => {
              console.log(res, 'res');
            })
          setSavedVisible(true)
          onComplete();
          setTimeout(() => {
            setSavedVisible(false);
          }, 500);
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
        setSavedVisible(true)
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
            await CameraRoll.save(`file://${tempVideoPath}`, { type: 'video' })
            setSavedVisible(true)
            setTimeout(() => {
              onComplete()
              setSavedVisible(false)
            }, 500)
            // DELETE TEMP RNFS
            const fileExists = await RNFS.exists(tempVideoPath);
            if (fileExists) {
              await RNFS.unlink(tempVideoPath);
            } else {
              console.log(`File ${tempVideoPath} does not exist.`);
            }
            setSavedVisible(true)
            setTimeout(() => {
              onComplete()
              setSavedVisible(false)
            }, 500)
          } catch (error) {
            console.log(error.message, 'error.messageQAQ');
            // Alert.alert('影像儲存失敗', error.message);
          } finally {
            setTimeout(() => {
              onComplete()
              setSavedVisible(false)
            }, 500)
          }
        }).catch((error) => {
          console.log('Download error:', error.message);
        });
    } catch (error) {
      console.log('22222');
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
      <Modal visible={loading || savedVisible} animationType="fade" transparent={true}>
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
