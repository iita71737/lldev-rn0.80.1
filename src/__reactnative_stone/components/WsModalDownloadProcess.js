import React from 'react'
import { Modal, Platform, Alert, View, PermissionsAndroid } from 'react-native'
import { WsLoading, WsFlex, WsIcon, WsText } from '@/components'
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
import S_url from '__reactnative_stone/services/app/url'

const WsModalDownloadProcess = props => {
  // i18n
  const { t } = useTranslation()

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
  const [saveSucceeded, setSaveSucceeded] = React.useState(false)
  const successTimeoutRef = React.useRef(null)

  const clearSuccessTimeout = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
  }

  const resetSaveState = () => {
    setSavedVisible(false)
    setSaveSucceeded(false)
  }

  const closeWithoutSaved = () => {
    resetSaveState()
    onComplete?.()
  }

  const showSavedThenClose = (delay = 500) => {
    setSaveSucceeded(true)
    setSavedVisible(true)
    successTimeoutRef.current = setTimeout(() => {
      onComplete?.()
      setSavedVisible(false)
      setSaveSucceeded(false)
      successTimeoutRef.current = null
    }, delay)
  }

  const isCanceledShareResult = (result) => {
    if (!result) return false
    if (result?.dismissedAction) return true
    if (result?.success === false) return true
    if (typeof result?.message === 'string' && /(cancel|dismiss)/i.test(result.message)) {
      return true
    }
    return false
  }

  const isCanceledShareError = (error) => {
    const msg = String(error?.message || error || '')
    return /cancel/i.test(msg)
  }

  const isLikelyPhotoPermissionError = (error) => {
    const msg = String(error?.message || error || '')
    return /PHPhotosErrorDomain|permission|denied|not authorized|3311/i.test(msg)
  }

  const promptOpenSettingsForPhotoPermission = () => {
    Alert.alert(
      t('無法儲存至相簿'),
      t('請前往設定開啟照片權限'),
      [
        {
          text: t('取消'),
          style: 'cancel',
          onPress: () => {
            closeWithoutSaved()
          }
        },
        {
          text: t('前往設定'),
          onPress: async () => {
            try {
              await openSettings()
            } catch (err) {
              console.log('openSettings error', err)
            } finally {
              closeWithoutSaved()
            }
          }
        }
      ]
    )
  }

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

  const $_getFileType = (input = source) => {
    if (fileType) {
      return String(fileType).toLowerCase()
    }
    if (!input) return ''
    if (typeof input === 'string') {
      const cleaned = input.split('?')[0]
      const ext = cleaned.substring(cleaned.lastIndexOf('.') + 1)
      return String(ext || '').toLowerCase()
    }
    if (Array.isArray(input)) {
      return String(
        input?.[0]?.file_version?.file_type ??
        input?.[0]?.file?.file_type ??
        ''
      ).toLowerCase()
    }
    return String(
      input?.file_version?.file_type ??
      input?.file?.file_type ??
      ''
    ).toLowerCase()
  }

  const $_getSourceUrl = (input = source) => {
    if (!input) return null
    if (typeof input === 'string') return input
    if (Array.isArray(input)) {
      return (
        input?.[0]?.file_version?.source_url ??
        input?.[0]?.file?.source_url ??
        null
      )
    }
    if (typeof input === 'object') {
      return (
        input?.file_version?.source_url ??
        input?.file?.source_url ??
        null
      )
    }
    return null
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

  const $_ensureIOSPhotoLibraryPermission = async () => {
    if (Platform.OS !== 'ios') return true
    try {
      const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY)
      if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
        return true
      }
      if (status === RESULTS.DENIED) {
        const requestStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY)
        if (requestStatus === RESULTS.GRANTED || requestStatus === RESULTS.LIMITED) {
          return true
        }
      }

      Alert.alert(
        t('無法儲存至相簿'),
        t('請開啟應用程式照片權限'),
        [
          {
            text: t('取消'),
            style: 'cancel',
            onPress: () => {
              onComplete?.()
            }
          },
          {
            text: t('前往設定'),
            onPress: async () => {
              try {
                await openSettings()
              } catch (error) {
                console.log('openSettings error', error)
              } finally {
                onComplete?.()
              }
            }
          }
        ]
      )
      return false
    } catch (error) {
      console.error('iOS 相簿權限檢查失敗', error)
      return false
    }
  }

  const $_onSave = async () => {
    clearSuccessTimeout()
    resetSaveState()
    setLoading(true)
    try {
      const resolvedFileType = $_getFileType(source)
      const resolvedSourceUrl = $_getSourceUrl(source)
      const isImageType = ['png', 'jpg', 'gif', 'jpeg', 'svg'].includes(resolvedFileType)
      const isVideoTypeNeedCameraRoll = ['mp4', 'mov', 'mkv'].includes(resolvedFileType)

      if (Platform.OS === 'ios' && (isImageType || isVideoTypeNeedCameraRoll)) {
        const permissionGranted = await $_ensureIOSPhotoLibraryPermission()
        if (!permissionGranted) {
          return
        }
      }

      if (Platform.OS === 'android') {
        await $_checkAndroidPermission()
      }
      if (!resolvedSourceUrl) {
        closeWithoutSaved()
        return
      }
      if (['mp4', 'mov', 'mkv'].includes(resolvedFileType)) {
        downloadAndSaveVideo(resolvedSourceUrl, 'ESGoal-dev', fileName)
      }
      if (Platform.OS === 'android' && ['avi'].includes(resolvedFileType)) {
        downloadAndSaveVideo(resolvedSourceUrl, 'ESGoal-dev', fileName)
      }
      if (Platform.OS === 'ios' && ['avi'].includes(resolvedFileType)) {
        downloadVideo(resolvedSourceUrl)
      }
      if (['wmv'].includes(resolvedFileType)) {
        downloadVideo(resolvedSourceUrl)
      }
      if (['png', 'jpg', 'gif', 'jpeg', 'svg'].includes(resolvedFileType)) {
        if (resolvedFileType === 'svg') {
          Alert.alert(t('此圖片格式不支援儲存至相簿'))
          closeWithoutSaved()
          return
        }
        try {
          const ext = resolvedSourceUrl.split('.').pop()?.split('?')[0]; // 安全地取得副檔名
          const res = await RNBlobUtil.config({
            fileCache: true,
            appendExt: ext,
          }).fetch('GET', resolvedSourceUrl);
          const localPath = res.path();
          console.log(localPath, 'localPath--RNBlobUtil');
          const savePath = localPath.startsWith('file://') ? localPath : `file://${localPath}`
          const uri = await CameraRoll.save(savePath, { type: "auto", album: "ESGoal-Dev" })
          console.log(uri, 'CameraRoll.save uri');
          showSavedThenClose(1000)
        } catch (error) {
          console.error('儲存失敗:', error);
          if (Platform.OS === 'ios' && isLikelyPhotoPermissionError(error)) {
            promptOpenSettingsForPhotoPermission()
            return
          }
          closeWithoutSaved()
        }
        return
      }

      if (['pdf', 'xlsx', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'csv', 'ods', 'odt'].includes(resolvedFileType)) {
        const url = resolvedSourceUrl
        const rawFileName = normalizeFileName($_getFileName(source))
        const fileNameWithExt = sanitizeFilename(ensureExtension(rawFileName, resolvedFileType))
        const filePath = `${RNFS.DocumentDirectoryPath}/${fileNameWithExt}`
        // Android權限請求
        if (Platform.OS === 'android') {
          let deviceVersion = DeviceInfo.getSystemVersion();
          console.log(deviceVersion, 'deviceVersion');
          if (deviceVersion >= 13) {
            request(PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
              // console.log(result,'result');
            });
          } else {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          }
        }
        try {
          await RNFS.downloadFile({
            fromUrl: url,
            toFile: filePath,
            background: Platform.OS === 'ios' ? true : false, // Enable downloading in the background (iOS only)
            discretionary: Platform.OS === 'ios' ? true : false, // Allow the OS to control the timing and speed (iOS only)
            progress: (res) => {
              const progress = (res.bytesWritten / res.contentLength) * 100;
              console.log(`Progress: ${progress.toFixed(2)}%`);
            },
          }).promise
        } catch (err) {
          Alert.alert(t('檔案下載失敗'));
          console.error(err);
          closeWithoutSaved()
          return
        }

        const targetPath =
          Platform.OS === 'android' && RNFS.ExternalDirectoryPath
            ? `${RNFS.ExternalDirectoryPath}/${fileNameWithExt}`
            : null
        if (targetPath) {
          try {
            await RNFS.moveFile(filePath, targetPath)
            console.log('File moved successfully')
          } catch (err) {
            console.error('Error moving file:', err)
          }
        }

        const finalPath = targetPath || filePath
        let isSaveSuccess = false
        if (Platform.OS === 'android') {
          try {
            const sourceUri = encodeURI(`file://${finalPath}`)
            await saveDocuments({
              sourceUris: [sourceUri],
              mimeType: getMimeType(resolvedFileType),
              fileName: fileNameWithExt,
              copy: true,
            })
            isSaveSuccess = true
          } catch (error) {
            console.log('saveDocuments error', error)
          }
        } else if (Platform.OS === 'ios') {
          try {
            const shareResult = await Share.open({
              url: `file://${finalPath}`,
              filename: fileNameWithExt,
              type: getMimeType(resolvedFileType),
              saveToFiles: true,
              failOnCancel: true,
            })
            console.log('Share.open result', shareResult)
            isSaveSuccess = !isCanceledShareResult(shareResult)
          } catch (error) {
            console.log('Share.open error', error)
            setSavedVisible(false)
          }
        }

        if (isSaveSuccess) {
          showSavedThenClose(500)
        } else {
          closeWithoutSaved()
        }
      }
    } catch (error) {
      console.error('儲存時發生錯誤：', error);
      if (!isCanceledShareError(error)) {
        Alert.alert(t('儲存失敗'), error.message);
      }
      closeWithoutSaved()
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
        showSavedThenClose(500)
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
      const fullFileName = videoName.endsWith(`.${extension}`) ? videoName : `${videoName}.${extension}`;
      const albumDirectory = `${RNFS.DocumentDirectoryPath}/${albumName}`;
      await RNFS.mkdir(albumDirectory);

      // DOWNLOAD TO TEMP FOLDER
      const tempVideoPath = `${albumDirectory}/${fullFileName}`;
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: tempVideoPath,
      })
        .promise.then(async () => {
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
            showSavedThenClose(500)
            if (Platform.OS === 'ios') {
              Alert.alert(t('已儲存'))
            }
          }
        }).catch((error) => {
          console.log('Download error:', error.message);
        });
    } catch (error) {
      Alert.alert(t('影像儲存失敗'), error.message);
      setTimeout(() => {
        closeWithoutSaved()
      }, 500)
    }
  };

  React.useEffect(() => {
    if (visible) {
      $_onSave()
    } else {
      clearSuccessTimeout()
      setLoading(false)
      resetSaveState()
    }
  }, [visible])

  React.useEffect(() => {
    return () => {
      clearSuccessTimeout()
    }
  }, [])

  // Render
  return (
    <>
      <Modal
        visible={visible && (loading || (savedVisible && saveSucceeded))}
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
        ) : (savedVisible && saveSucceeded) ? (
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
        ) : null
        }
      </Modal>
    </>
  )
}

export default WsModalDownloadProcess
