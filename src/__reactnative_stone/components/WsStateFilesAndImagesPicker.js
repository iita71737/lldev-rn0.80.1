import React, { useState, useEffect, useCallback } from 'react'
import {
  Text,
  Button,
  View,
  StyleSheet,
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
  WsCameraPage
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import config from '@/__config'
import * as ImagePicker from 'react-native-image-picker'
import { useTranslation } from 'react-i18next'
import { launchImageLibrary } from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native'
import { Image, Video } from 'react-native-compressor';
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs'
import { Camera, useCameraDevice } from 'react-native-vision-camera'
import { useNavigation } from '@react-navigation/native'
import HeicConverter from 'react-native-heic-converter';
import { pick, types } from '@react-native-documents/picker'

const WsStateFilesAndImagesPicker = props => {
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    onChange,
    value = [],
    uploadUrl,
    uploadSuffix,
    modelName,
    uploadToFileStore,
    oneFile,
    testID
  } = props

  // States
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [fileDurationExceed, setFileDurationExceed] = useState(false)
  const [fileSizeExceed, setFileSizeExceed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [recordingModalVisible, setRecordingModalVisible] = useState(false)

  // RECORDING
  const $_onRecordingPress = () => {
    setVisible(false)
    setRecordingModalVisible(true)
  }
  const $_onCameraRecording = async (e) => {
    try {
      const _fileType = e.fileType
      const _fileName = e.fileName
      // 如類型為video/mp4則限制長度3分鐘
      const _duration = e.fileDuration
      const maxDuration = 180;
      if (_fileType === 'video') {
        setFileDurationExceed(true)
        if (_duration <= maxDuration) {
          setFileDurationExceed(false)
        } else {
          Alert.alert(`${t('影像長度限制')} ≤ ${t('{number}分鐘', { number: 3 })}`)
          return
        }
      }
      const _path = await $_compress(e.lazyUri, _fileType);
      const isUnder30MB = await isFileUnder30MB(_path);
      if (isUnder30MB) {
        onChange([
          ...value,
          {
            lazyUri: _path,
            fileName: normalizeFileName(_fileName, 'mp4'),
            needUpload: true,
            fileType: _fileType,
            fileDuration: _duration,
          }
        ]);
        setRecordingModalVisible(false)
      } else {
        console.log(t('上傳檔案大於{number}MB,', { number: 30 }));
      }
    } catch (error) {
      console.error(error);
      setRecordingModalVisible(false)
    }
  }

  // Open Camera For Android CAMERA Permissions if u needed
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission'
          }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    } else {
      return true
    }
  }

  // Open Camera For Android WRITE_EXTERNAL_STORAGE Permissions if u needed
  const requestExternalWritePermission = async () => {
    let _permission = false
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED || granted === 'never_ask_again') {
          _permission = true
        }
        return _permission
      } catch (err) {
        console.log(err)
      }
    }
  }

  // Open Camera On Android
  const $_onCameraPressForAndroid = async () => {
    console.log('$_onCameraPressForAndroid');
    const _permission = await requestExternalWritePermission()
    console.log(_permission, '_permission');
    if (_permission) {
      const options = {
        saveToPhotos: true,
        mediaType: 'photo',
        includeBase64: false
      }
      console.log('$_onCameraPressForAndroid');
      try {
        const response = await new Promise((resolve, reject) => {
          ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
              console.log('User cancelled image picker');
              reject(new Error('User cancelled image picker'));
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
              reject(new Error('ImagePicker Error: ' + response.error));
            } else if (response.customButton) {
              console.log('User tapped custom button: ', response.customButton);
              reject(new Error('User tapped custom button: ' + response.customButton));
            } else {
              console.log(response, '--- response on ios ---');
              resolve(response);
            }
          });
        });
        // Compress photos
        const _type = response.assets[0].type
        const _path = await $_compress(response.assets[0].uri, _type);
        // Check compressed file size
        const isUnder30MB = await isFileUnder30MB(_path);
        if (isUnder30MB && value != null) {
          onChange([
            ...value,
            {
              lazyUri: _path,
              fileName: response.assets[0].fileName,
              needUpload: true,
              fileType: response && response.assets[0] && response.assets[0].type ? response.assets[0].type : undefined,
              fileExtension: response && response.assets[0] ? response.assets[0].fileName : 'error filename'
                ? response.fileName.split('.').pop()
                : null
            }
          ]);
          setVisible(false);
        } else {
          setFileSizeExceed(true)
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      return
    }
  }

  // Open Camera On iOS
  const $_onCameraPressForIOS = async () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false
    };
    try {
      const response = await new Promise((resolve, reject) => {
        ImagePicker.launchCamera(options, (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
            reject(new Error('User cancelled image picker'));
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
            reject(new Error('ImagePicker Error: ' + response.error));
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton);
            reject(new Error('User tapped custom button: ' + response.customButton));
          } else {
            console.log(response, '--- response on ios ---');
            resolve(response);
          }
        });
      });

      // Compress Photos - from iOS Photo
      const _type = response.assets[0].type
      const _path = await $_compress(response.assets[0].uri, _type);
      // Check compressed file size
      const isUnder30MB = await isFileUnder30MB(_path);
      if (isUnder30MB) {
        onChange([
          ...value,
          {
            lazyUri: _path,
            fileName: response.assets[0].fileName,
            needUpload: true,
            fileType: response && response.assets[0] && response.assets[0].type ? response.assets[0].type : undefined,
            fileExtension: response && response.assets[0] ? response.assets[0].fileName : 'error filename'
              ? response.fileName.split('.').pop()
              : null
          }
        ]);
        setVisible(false);
      } else {
        setFileSizeExceed(true)
      }
    } catch (error) {
      console.error(error);
    }
  };

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
      console.log(fileSizeInMB, 'fileSizeInMB');
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

  // 正規化檔名，強制副檔名 (預設 mp4)
  const normalizeFileName = (fileName, forceExt = 'mp4') => {
    if (!fileName) return `file.${forceExt}`;
    // 去掉原來的.mov或.mp4，只留一個乾淨名字
    const baseName = fileName.replace(/\.(mov|mp4|MOV|MP4|jpeg|jpg|png|heic)$/, '');
    return `${baseName}.${forceExt}`;
  };

  const $_onCameraPress = () => {
    if (Platform.OS === 'android') {
      $_onCameraPressForAndroid()
    }
    if (Platform.OS === 'ios') {
      $_onCameraPressForIOS()
    }
  }

  // Browse Files
  const $_onBrowsePress = async () => {
    try {
      const response = await pick({})
      console.log(response, 'response---');
      const _value = [...value]
      for (const item of response) {
        await processResponse(item, _value);
      }
    } catch (err) {
      // Android 有 code；iOS 可能只有 message
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (isCancel) {
        console.log('✅ 使用者取消選擇')
      } else {
        console.error('❌ 發生其他錯誤:', err)
      }
    }
  }
  // 壓縮流程
  const processResponse = async (responseItem, _value) => {
    try {
      let { uri, type, name } = responseItem;
      if (!Array.isArray(_value)) _value = [];

      if (!uri || !name) {
        Alert.alert('檔案格式錯誤');
        return;
      }

      const extension = name?.split('.').pop()?.toLowerCase();
      const isHEIC = extension === 'heic' || type === 'image/heic';

      // 如果是 HEIC，要先取得大小判斷要不要處理
      if (isHEIC) {
        if (!uri.startsWith('file://')) {
          Alert.alert(t('發生錯誤'));
          return;
        }

        const decodedUri = decodeURIComponent(uri);
        const fileInfo = await RNFS.stat(decodedUri);
        const fileSizeInMB = fileInfo.size / (1024 * 1024);
        console.log('HEIC 原始大小:', fileSizeInMB, 'MB');

        if (fileSizeInMB > 30) {
          Alert.alert(t('所選擇檔案大小超過30MB'));
          return;
        }

        // 若小於 30MB 再進行轉檔
        const converted = await HeicConverter.convert({
          path: uri.replace('file://', ''),
          quality: 1.0,
        });

        if (converted?.success && converted?.path) {
          uri = converted.path;
          name = name.replace(/\.heic$/i, '.jpg');
          type = 'image/jpeg';
          console.log('✅ HEIC 已轉為 JPG:', uri);
        } else {
          Alert.alert(t('發生錯誤'));
          return;
        }
      }

      // 加入清單
      _value.push({
        lazyUri: uri,
        fileName: name,
        fileType: type,
        needUpload: true,
        fileExtension: extension ?? null,
      });

      onChange(_value);
      setVisible(false);
    } catch (err) {
      console.error('processResponse error:', err);
      Alert.alert(t('發生錯誤'));
    }
  };




  // Photo Library FROM GALLERY
  const $_onImageLibraryPress = async () => {
    const options = {
      mediaType: 'mixed'
    }
    try {
      const response = await new Promise((resolve, reject) => {
        setLoadingProgress(true)
        ImagePicker.launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker')
            setLoadingProgress(false)
            reject(new Error('User cancelled image picker'));
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error)
            setLoadingProgress(false)
            reject(new Error('ImagePicker Error: ' + response.error));
          } else if (response.customButton) {
            console.log('User tapped custom button: ', response.customButton)
            setLoadingProgress(false)
            reject(new Error('User tapped custom button: ' + response.customButton));
          } else {
            console.log(response, '--- response on Photo Library ---');
            setLoadingProgress(false)
            resolve(response);
          }
        })
      });

      // 判斷heic or heif
      const asset = response.assets[0];
      const fileName = asset.fileName?.toLowerCase();
      const type = asset.type;
      if (type === 'image/heic' || fileName?.endsWith('.heic')) {
        console.log('📷 選到的是 HEIC 圖片');
      } else if (type === 'image/heif' || fileName?.endsWith('.heif')) {
        console.log('📷 選到的是 HEIF 圖片');
      } else {
        console.log('📷 選到的不是 HEIC/HEIF');
      }

      // 如類型為video/mp4則限制長度3分鐘
      const _type = response.assets[0].type
      let _duration
      const maxDuration = 180;
      if (response.assets[0] && _type.startsWith('video/')) {
        _duration = response.assets[0].duration
        setFileDurationExceed(true)
        if (_duration <= maxDuration) {
          setFileDurationExceed(false)
        } else {
          Alert.alert(`${t('影像長度限制')} ≤ ${t('{number}分鐘', { number: 3 })}`)
          return
        }
      }

      const _path = await $_compress(response.assets[0].uri, _type);
      const isUnder30MB = await isFileUnder30MB(_path);
      if (isUnder30MB) {
        onChange([
          ...value,
          {
            lazyUri: _path,
            fileName: response && response.assets[0] && response.assets[0].fileName ? response.assets[0].fileName : null,
            needUpload: true,
            fileType: response && response.assets[0] && response.assets[0].type ? response.assets[0].type : undefined,
            fileExtension: response && response.assets[0] ? response.assets[0].fileName : 'error filename'
              ? response.fileName.split('.').pop()
              : null
          }
        ]);
        setVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Remove Item
  const $_onRemove = index => {
    const _value = [...value]
    _value.splice(index, 1)
    onChange(_value, index)
  }

  // Upload Progress
  const $_onUploadComplete = ($event, $id, itemIndex) => {
    if (!oneFile) {
      const _value = [...value]
      _value[itemIndex] = $event
      onChange(_value, $id)
    } else {
      onChange([$event])
    }
  }

  // HELPER
  const $_getFileType = (item) => {
    try {
      if (typeof item === 'string') {
        // 字串型：直接取副檔名
        return item.substring(item.lastIndexOf('.') + 1).toLowerCase().split("?")[0]
      } else if (item?.file_version?.name) {
        // 優先取檔名
        return item.file_version.name.split('.').pop().toLowerCase().split('?')[0]
      } else if (item?.file_version?.source_url) {
        // 退而求其次取 URL
        return item.file_version.source_url.split('.').pop().toLowerCase().split('?')[0]
      }
    } catch (e) {
      console.warn('$_getFileType error:', e)
    }
    return null
  }

  // FILE STORE
  const $_onPressFileStore = () => {
    setVisible(false)
  }

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraPermission()
    }
  }, []);

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
          loadingProgress={loadingProgress}
          isVisible={visible}
          onClose={() => {
            if (loadingProgress) {
            } else {
              setVisible(false)
            }
          }}
          onImageLibraryPress={$_onImageLibraryPress}
          onCameraPress={$_onCameraPress}
          onBrowsePress={$_onBrowsePress}
          onRecordingPress={$_onRecordingPress}
          onPressFileStore={$_onPressFileStore}
        />
      )
      }

      {value != '' && value != null && (
        <WsGrid
          style={{
            marginTop: 8,
            minHeight: value && value.length ? 80 * value.length : 0
          }}
          numColumns={1}
          renderItem={({ item, itemIndex }) => (
            <>
              {item && item.lazyUri && (
                <WsStateFileItem
                  lazyUri={item.lazyUri}
                  fileType={item.fileType}
                  fileName={item.fileName}
                  needUpload={item.needUpload}
                  uploadUrl={uploadUrl}
                  uploadSuffix={uploadSuffix}
                  modelName={modelName}
                  uploadToFileStore={uploadToFileStore}
                  onUploadComplete={($event, $id) => {
                    $_onUploadComplete($event, $id, itemIndex)
                  }}
                />
              )}
              {!item.lazyUri && (
                <WsStateFileItem
                  value={item}
                  fileType={$_getFileType(item)}
                  fileExtension={item.fileExtension}
                  uploadUrl={uploadUrl}
                  uploadSuffix={uploadSuffix}
                  modelName={modelName}
                  uploadToFileStore={uploadToFileStore}
                  onRemove={() => {
                    $_onRemove(itemIndex)
                  }}
                />
              )}
            </>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
          data={value}
        />
      )}

      {
        (!oneFile) || (oneFile && value && value.length === 0) ? (
          <WsUpdateBtn
            testID={testID}
            onPress={() => {
              setVisible(true);
            }}
          >
            {t('上傳')}
          </WsUpdateBtn>
        ) : null
      }

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
        {`${t('影像長度限制')} ≤ ${t('{number}分鐘', { number: 3 })}`}
      </WsDes>
    </>
  )
}
export default WsStateFilesAndImagesPicker



