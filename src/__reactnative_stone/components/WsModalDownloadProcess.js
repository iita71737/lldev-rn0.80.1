import React from 'react'
import { Modal, Platform, Alert, View, PermissionsAndroid } from 'react-native'
import { WsLoading, WsFlex, WsIcon, WsText } from '@/components'
import moment from 'moment'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import RNBlobUtil from 'react-native-blob-util';
import { useTranslation } from 'react-i18next'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import Share from 'react-native-share';
import $color from '@/__reactnative_stone/global/color'
import { Linking } from 'react-native';
import { request, check, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import { saveDocuments } from '@react-native-documents/picker';

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
  const [savedVisible, setSavedVisible] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

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

  const $_getFileName = (input = source) => {
    if (fileName) {
      return encodeURIComponent(fileName)
    } else {
      if (input) {
        return decodeURI(S_url.getFileName(input))
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
  const sanitizeFilename = (filename = '') => {
    return String(filename || '').replace(/[\/\?<>\\:\*\|"]/g, '').replace(/\s+/g, '_');
  }

  const normalizeFileName = (name) => {
    if (!name) return 'file'
    try {
      return decodeURIComponent(name)
    } catch {
      return name
    }
  }

  const ensureExtension = (name, ext) => {
    if (!name) return name
    if (!ext) return name
    const lowerName = String(name).toLowerCase()
    const lowerExt = String(ext).toLowerCase()
    if (lowerName.endsWith(`.${lowerExt}`)) return name
    return `${name}.${lowerExt}`
  }

  const getMimeType = (ext) => {
    const value = String(ext || '').toLowerCase()
    if (value === 'pdf') return 'application/pdf'
    if (value === 'doc') return 'application/msword'
    if (value === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    if (value === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    if (value === 'ppt') return 'application/vnd.ms-powerpoint'
    if (value === 'pptx') return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    if (value === 'txt') return 'text/plain'
    if (value === 'csv') return 'text/csv'
    if (value === 'ods') return 'application/vnd.oasis.opendocument.spreadsheet'
    if (value === 'odt') return 'application/vnd.oasis.opendocument.text'
    return 'application/octet-stream'
  }
  const $_onSave = async () => {
    setLoading(true)
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
        const rawFileName = normalizeFileName($_getFileName(source))
        const fileNameWithExt = sanitizeFilename(ensureExtension(rawFileName, fileType))
        let filePath
        if (Platform.OS === 'ios') {
          filePath = `${RNFS.DocumentDirectoryPath}/${fileNameWithExt}`;
        } else {
          filePath = `${RNFS.DocumentDirectoryPath}/${fileNameWithExt}`;
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
          .promise.then(async () => {
            const targetPath =
              Platform.OS === 'android' && RNFS.ExternalDirectoryPath
                ? `${RNFS.ExternalDirectoryPath}/${fileNameWithExt}`
                : null
            if (targetPath) {
              RNFS.moveFile(filePath, targetPath)
                .then(() => console.log('File moved successfully'))
                .catch((err) => console.error('Error moving file:', err));
            }
            const finalPath = targetPath || filePath
            if (Platform.OS === 'android') {
              try {
                const sourceUri = encodeURI(`file://${finalPath}`)
                await saveDocuments({
                  sourceUris: [sourceUri],
                  mimeType: getMimeType(fileType),
                  fileName: fileNameWithExt,
                  copy: true,
                })
              } catch (error) {
                console.log('saveDocuments error', error)
              }
            } else if (Platform.OS === 'ios') {
              try {
                await Share.open({
                  url: `file://${finalPath}`,
                  filename: fileNameWithExt,
                  type: getMimeType(fileType),
                  saveToFiles: true,
                  failOnCancel: false,
                })
              } catch (error) {
                console.log('Share.open error', error)
              }
            }
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
      setLoading(false)
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
          <WsFlex
            style={{ flex: 1 }}
            alignItems="center"
            justifyContent="center"
          >
            <View
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              style={{
                width: 160,
                height: 160,
                backgroundColor: 'rgba(0,0,0,.8)',
                borderRadius: 8,
              }}
            >
              <WsIcon name="ws-outline-check-circle-outline" size={48} color={$color.white} />
              <WsText
                style={{ marginTop: 16 }}
                color={$color.white}
              >
                {t('已儲存')}
              </WsText>
            </View>
          </WsFlex>
        )}
      </Modal>
    </>
  )
}

export default WsModalDownloadProcess
