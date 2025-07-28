import React, { useState, useEffect, useCallback } from 'react'
import {
  Text,
  Button,
  View,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert
} from 'react-native'
import {
  WsText,
  WsIcon,
  WsIconCircle,
  WsFastImage,
  WsStateFilesAndImagesPickerModal,
  WsUpdateBtn,
  WsGrid,
  WsStateFileItem,
  WsDes,
  WsCameraPage,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import config from '@/__config'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'

import * as ImagePicker from 'react-native-image-picker'
import { useTranslation } from 'react-i18next'
// import DocumentPicker from 'react-native-document-picker'
// import DocumentPicker from '@react-native-documents/picker'
import { pick, types } from '@react-native-documents/picker'
import { launchImageLibrary } from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native'
import { Image, Video } from 'react-native-compressor';
import RNFS from 'react-native-fs'
import { Camera, useCameraDevice } from 'react-native-vision-camera'
import { useNavigation } from '@react-navigation/native'
import Modal from 'react-native-modal'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import HeicConverter from 'react-native-heic-converter'
import RNBlobUtil from 'react-native-blob-util';

const WsStateFileOrImagePicker = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    onChange,
    value,
    uploadUrl,
    modelName,
    uploadToFileStore,
    testID,
    limitFileExtension
  } = props

  // States
  const [visible, setVisible] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [fileDurationExceed, setFileDurationExceed] = useState(false)
  const [fileSizeExceed, setFileSizeExceed] = useState(false)
  const [recordingModalVisible, setRecordingModalVisible] = useState(false)

  // Recording
  const $_onRecordingPress = () => {
    setVisible(false)
    setRecordingModalVisible(true)
  }
  const $_onCameraRecording = async (e) => {
    const removeFileExtension = (filename) => {
      if (typeof filename !== 'string') return filename;
      return filename.replace(/\.[^/.]+$/, '');
    }
    try {
      const _fileType = e.fileType
      const _fileName = removeFileExtension(e.fileName)
      // 如類型為video/mp4則限制長度3分鐘
      const _duration = e.fileDuration
      const maxDuration = 180;
      if (_fileType === 'video') {
        setFileDurationExceed(true)
        if (_duration <= maxDuration) {
          setFileDurationExceed(false)
        } else {
          Alert.alert('上傳影片長度上限為3分鐘')
          return
        }
      }
      const _path = await $_compress(e.lazyUri, _fileType);
      const isUnder30MB = await isFileUnder30MB(_path);
      if (isUnder30MB) {
        onChange(
          {
            lazyUri: _path,
            fileName: _fileName,
            needUpload: true,
            fileType: _fileType,
            fileDuration: _duration,
          }
        );
        setRecordingModalVisible(false)
      }
    } catch (error) {
      console.error(error);
      setRecordingModalVisible(false)
    }
  }
  // COMPRESSION
  const $_compress = async (uri, type) => {
    if (type.startsWith('video/') || type === 'video') {
      setLoadingProgress(true)
      try {
        const result = await Video.compress(
          uri,
          {
            progressDivider: 10,
            downloadProgress: (progress) => {
              console.log('downloadProgress: ', progress);
            },
          },
          (progress) => {
            console.log('Compression Progress: ', progress);
          }
        );
        setLoadingProgress(false)
        // 測試壓縮後的資訊，未使用需註解
        // await CameraRoll.save(result, { type: "video", album: "TestVideosAlbums" });

        return result
      } catch (e) {
        setLoadingProgress(false)
        Alert.alert(t('上傳發生異常'))
      }
    }
    else if (type.startsWith('image/') || type === 'image') {
      try {
        let imageUri = uri;
        const result = await Image.compress(imageUri, {
          progressDivider: 10,
          downloadProgress: (progress) => {
            console.log('downloadProgress: ', progress);
          },
        });
        // 測試壓縮後的資訊，未使用需註解
        // await CameraRoll.save(result, { type: "photo", album: "TestImagesAlbums" });
        return result
      } catch (e) {
        console.log('e:', e);
      }
    }
    else {
      return uri
    }
  }

  // CHECK UPLOAD FILE SIZE UNDER 30MB
  const isFileUnder30MB = async (filePath) => {
    const decodedPath = decodeURIComponent(filePath);
    try {
      const fileInfo = await RNFS.stat(decodedPath);
      const fileSizeInBytes = fileInfo.size;
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      if (fileSizeInMB < 30) {
        setFileSizeExceed(false)
        return true;
      } else {
        setFileSizeExceed(true)
        Alert.alert('所選擇檔案大小超過30MB')
        return false;
      }
    } catch (error) {
      Alert.alert('所選擇檔案有誤，上傳失敗')
      return false;
    }
  };

  const $_onCameraPress = () => {
    if (Platform.OS === 'android') {
      $_onCameraPressForAndroid()
    }
    if (Platform.OS === 'ios') {
      $_onCameraPressForIOS()
    }
  }

  // Open Camera For Android WRITE_EXTERNAL_STORAGE Permissions if u needed
  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.log(err)
      }
    }
  }
  // android camera permission
  const requestAndroidCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message: "App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return granted === PermissionsAndroid.RESULTS.GRANTED
        } else {
          console.log("Camera permission denied");
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  // Open Camera On Android
  const $_onCameraPressForAndroid = async () => {
    const _permission = await requestAndroidCameraPermission()
    if (_permission) {
      const options = {
        saveToPhotos: true,
        mediaType: 'photo',
        includeBase64: false
      }
      ImagePicker.launchCamera(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker')
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error)
        } else if (response.customButton) {
          console.log('User tapped custom button: ', response.customButton)
        } else {
          console.log(response, 'response');
          const rawUri = response.assets[0].uri;
          const fileName = response.assets[0].fileName;
          try {
            const compressedUri = await $_compress(rawUri, 'image');
            const isOk = await isFileUnder30MB(compressedUri || rawUri);
            if (!isOk) return;
            onChange({
              lazyUri: compressedUri || rawUri,
              fileName: response.assets[0].fileName,
              needUpload: true,
              fileType: response.assets[0].type ? response.type : 'image',
              fileExtension: response && response.assets[0].fileName
                ? response.assets[0].fileName.split('.').pop()
                : null
            })
            setVisible(false)
          } catch (e) {
            console.error('Compression error:', e);
            console.log('圖片壓縮失敗');
          }
        }
      })
    } else {
      return
    }
  }

  // Open Camera
  const $_onCameraPressForIOS = async () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false
    }
    ImagePicker.launchCamera(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        console.log(response, 'response');
        const rawUri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        try {
          const compressedUri = await $_compress(rawUri, 'image');
          const isOk = await isFileUnder30MB(compressedUri || rawUri);
          if (!isOk) return;

          onChange({
            lazyUri: compressedUri || rawUri,
            fileName: response.assets[0].fileName,
            needUpload: true,
            fileExtension: response && response.assets[0] && response.assets[0].fileName
              ? response.assets[0].fileName.split('.').pop()
              : null
          })
          setVisible(false)
        } catch (e) {
          console.error('Compression error:', e);
          console.log('圖片壓縮失敗');
        }
      }
    })
  }

  const getFileExtension = (fileName) => {
    // 使用正則表達式去除特殊字元和非法字元
    const cleanFileName = fileName.replace(/[^\w.-]/g, '');
    // 從清理後的檔案名稱中提取副檔名
    const parts = cleanFileName.split('.');
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase(); // 返回小寫的副檔名
    } else {
      return 'unknown'; // 如果找不到副檔名，返回'unknown'或其他預設值
    }
  };

  const copyContentUriToFile = async (uri, filename = 'tempfile') => {
    if (Platform.OS === 'android') {
      if (uri.startsWith('content://')) {
        const destPath = `${RNBlobUtil.fs.dirs.CacheDir}/${filename}`
        const result = await RNBlobUtil.fs.readStream(uri, 'base64', 4095)
        let base64Data = ''
        return new Promise((resolve, reject) => {
          result.open()
          result.onData(chunk => {
            base64Data += chunk
          })
          result.onError(err => {
            reject(err)
          })
          result.onEnd(async () => {
            await RNBlobUtil.fs.writeFile(destPath, base64Data, 'base64')
            resolve('file://' + destPath)
          })
        })
      } else {
        return uri // 可能是 file:// 開頭就直接傳
      }
    } else {
      // iOS 直接使用 file:// 或本地路徑即可
      return uri.startsWith('file://') ? uri : 'file://' + uri
    }
  }

  // Browse Files
  const $_onBrowsePress = async () => {
    try {
      console.log('222222-2222');
      const response = await pick({})
      console.log(response,'response---');
      const file = response[0]
      const ext = file.name?.split('.').pop()?.toLowerCase()
      let uri = file.uri
      let fileName = file.name

      // Android spec
      const localFilePath = await copyContentUriToFile(uri, fileName);
      console.log(localFilePath, 'localFilePath');
      console.log(fileName, 'fileName');

      // ✅ 若為 HEIC，進行轉檔並修改副檔名
      if (ext === 'heic') {
        try {
          const converted = await HeicConverter.convert({
            path: uri,
            quality: 1.0
          })
          if (converted?.success && converted?.path) {
            uri = converted.path
            // 將 .heic 改為 .jpeg
            fileName = fileName.replace(/\.heic$/i, '.jpeg')
          } else {
            console.warn('HEIC 轉檔失敗，保留原檔')
          }
        } catch (e) {
          console.error('HEIC 轉檔錯誤:', e)
        }
      }
      onChange({
        lazyUri: localFilePath,
        fileName,
        needUpload: true,
        fileType: file.type,
        fileExtension: getFileExtension(file.name)
      })
      setVisible(false)
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log(err)
      } else {
        throw err
      }
    }
  }

  // Photo Library
  const $_onImageLibraryPress = () => {
    const options = {
      mediaType: 'mixed', //250516
      selectionLimit: 1,
    }
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        console.log(response, 'response success');
        const asset = response.assets[0];
        const rawUri = response.assets[0].uri;
        const fileName = response.assets[0].fileName;
        const fileType = asset.type;
        try {
          let compressedUri = rawUri;
          if (fileType?.startsWith('image/')) {
            // ✅ 圖片壓縮流程
            compressedUri = await $_compress(rawUri, 'image');
          } else if (fileType?.startsWith('video/')) {
            // ✅ 影片壓縮流程
            compressedUri = await $_compress(rawUri, 'video');
          } else {
            console.warn('不支援的檔案類型:', fileType);
            return;
          }
          const isOk = await isFileUnder30MB(compressedUri || rawUri);
          if (!isOk) return;
          onChange({
            lazyUri: compressedUri || rawUri,
            fileName: fileName,
            needUpload: true,
            fileType: fileType,
            fileExtension: fileName?.split('.').pop()?.toLowerCase() ?? null,
          });
          setVisible(false)
        } catch (e) {
          console.error('Compression error:', e);
          console.log('相簿選擇後，壓縮失敗');
        }
      }
    })
  }

  // Remove Item
  const $_onRemove = () => {
    onChange()
  }

  // Upload Progress
  const $_onUploadComplete = $event => {
    const _value = $event
    onChange(_value)
  }

  // FILE STORE
  const $_onPressFileStore = () => {
    setVisible(false)
  }

  // validation 
  const isValidValue = (value) => {
    if (typeof value === 'string') {
      return value
    } else {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          return value
        } else {
          return undefined
        }
      }
      else if (value && !value.file_version) {
        return value &&
          value.file &&
          value.file.id &&
          value.file.name &&
          value.file.file_type
      }
      else {
        return value &&
          value.file &&
          value.file.id &&
          value.file_version &&
          value.file_version.file_type &&
          value.file_version.id &&
          value.file_version.name &&
          value.file_version.source_url &&
          value.file_version.version_number;
      }
    }
  };

  useEffect(() => {
    requestExternalWritePermission()
    requestAndroidCameraPermission()
  }, [])

  return (
    <>
      {recordingModalVisible && (
        <WsCameraPage
          isVisible={recordingModalVisible}
          onClose={() => { setRecordingModalVisible(false) }}
          onCameraRecording={$_onCameraRecording}
        ></WsCameraPage>
      )}

      {visible && (
        <WsStateFilesAndImagesPickerModal
          isVisible={visible}
          onClose={() => setVisible(false)}
          onImageLibraryPress={$_onImageLibraryPress}
          onCameraPress={$_onCameraPress}
          onBrowsePress={$_onBrowsePress}
          onRecordingPress={$_onRecordingPress}
          onPressFileStore={$_onPressFileStore}
          limitFileExtension={limitFileExtension}
        />
      )}

      {value && (
        <>
          {value.lazyUri && (
            <WsStateFileItem
              lazyUri={value.lazyUri}
              fileType={value.fileType}
              fileName={value.fileName}
              needUpload={value.needUpload}
              uploadUrl={uploadUrl}
              onRemove={$_onRemove}
              modelName={modelName}
              uploadToFileStore={uploadToFileStore}
              onUploadComplete={$event => {
                $_onUploadComplete($event)
              }}
            />
          )}
          {!value.lazyUri && isValidValue(value) && (
            <View
              style={{
                marginBottom: 8
              }}
            >
              <WsStateFileItem
                value={value}
                uploadUrl={uploadUrl}
                onRemove={$_onRemove}
              />
            </View>
          )}
        </>
      )}
      <WsUpdateBtn
        testID={testID}
        onPress={() => {
          setVisible(true)
        }}>
        {t('上傳')}
      </WsUpdateBtn>

      <WsDes
        color={fileSizeExceed ? $color.danger : $color.gray}
        style={{
          paddingTop: 8
        }}>
        {`${t('檔案大小限制')} ≤ 30MB`}
      </WsDes>
      <WsDes
        color={fileDurationExceed ? $color.danger : $color.gray}
        style={{
        }}>
        {`${t('影像長度限制')} ≤ ${t('{{number}}分鐘', { number: 3 })}`}
      </WsDes>

    </>
  )
}
export default WsStateFileOrImagePicker
