import React, { useState } from 'react'
import { Platform, Pressable, View, TouchableOpacity, Alert } from 'react-native'
import {
  WsText,
  WsBtn,
  WsFastImage,
  WsFlex,
  WsIcon,
  WsIconCircle,
  WsBottomSheet,
  WsModal,
  WsBottomModal,
  WsIconBtn,
  WsStateFilesAndImagesPickerModal
} from '@/components'
import config from '@/__config'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

import RNBlobUtil from 'react-native-blob-util'
import * as ImagePicker from 'react-native-image-picker'
// import DocumentPicker from 'react-native-document-picker'
import DocumentPicker from '@react-native-documents/picker'
import { launchImageLibrary } from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native'
import axios from 'axios'
import RNFS from 'react-native-fs'
import { Image, Video } from 'react-native-compressor';

const WsStateImage = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    onChange,
    value,
    modelName,
    endpoint = axios.defaults.baseURL,
    uploadUrl,
    icon = 'md-image',
    paddingVertical = 39,
    style,
    text = t('上傳'),
    color = $color.primary4l,
    centerBtnVisible = true,
    bottomRightBtnVisible = false,
    resizeMode = 'cover',
    recordingBtnVisible
  } = props

  // State
  const [fileSizeExceed, setFileSizeExceed] = useState(false)

  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [needUpload, setNeedUpload] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  const $_onCameraPress = async () => {
    if (Platform.OS === 'android') {
      await requestCameraPermission()
      await requestExternalWritePermission()
      $_onCameraPressForAndroid()
    }
    if (Platform.OS === 'ios') {
      $_onCameraPressForIOS()
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
            message: 'App needs camera permission',
            // buttonNegative: 'Cancel',
            buttonPositive: 'OK',
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
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'External Storage Write Permission',
            message: 'App needs write permission',
            // buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.log(err)
      }
    }
  }

  // Open Camera On Android
  const $_onCameraPressForAndroid = async () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false
    }
    await ImagePicker.launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        new Promise(async (resolve, reject) => {
          let uri =
            Platform.OS === 'android'
              ? response.assets[0].uri
              : response.assets[0].uri.replace('file://', '')
          const fileName = response.assets[0].fileName.slice(-10)
          const token = await S_Keychain.getToken()
          const _uploadUrl = uploadUrl
            ? `${uploadUrl}/${fileName}`
            : `${modelName}/${fileName}`

          setNeedUpload(true)
          RNBlobUtil.fetch(
            'PUT',
            `${endpoint}/${_uploadUrl}`,
            {
              Authorization: `${token}`
            },
            RNBlobUtil.wrap(compressedUri || uri)
          )
            .uploadProgress((written, total) => {
              setUploadProgress(written / total)
            })
            .then(res => {
              let status = res.info().status
              if (status == 200) {
                let json = res.json()
                onChange(json.signed_url)
                resolve(json.signed_url)
                setNeedUpload(false)
                setVisible(false)
              } else {
                console.log('Server Error', status)
              }
            })
            .catch(err => {
              console.log('err', err)
            })
        })
        setVisible(false)
      }
    })
  }


  // Open Camera
  const $_onCameraPressForIOS = async () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false
    }
    await ImagePicker.launchCamera(options, async (response) => {
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

          new Promise(async (resolve, reject) => {
            let uri =
              Platform.OS === 'android'
                ? compressedUri
                : compressedUri.replace('file://', '')

            const fileName = S_Wasa.getFileNameFromUrl(uri)
            const token = await S_Keychain.getToken()
            const _uploadUrl = uploadUrl
              ? `${uploadUrl}/${fileName}`
              : `${modelName}/${fileName}`

            setNeedUpload(true)
            RNBlobUtil.fetch(
              'PUT',
              `${endpoint}/${_uploadUrl}`,
              {
                Authorization: `${token}`
              },
              RNBlobUtil.wrap(uri)
            )
              .uploadProgress((written, total) => {
                setUploadProgress(written / total)
              })
              .then(res => {
                let status = res.info().status
                if (status == 200) {
                  let json = res.json()
                  onChange(json.signed_url)
                  resolve(json.signed_url)
                  setNeedUpload(false)
                  setVisible(false)
                } else {
                  console.log('Server Error', status)
                }
              })
              .catch(err => {
                console.log('err', err)
              })
          })
          setVisible(false)

        } catch (e) {
          console.error(e, 'e');
        }


      }
    })
  }

  // Photo Library
  const $_onImageLibraryPress = () => {
    const options = {
      mediaType: 'photo'
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

          new Promise(async (resolve, reject) => {
            let uri =
              Platform.OS === 'android'
                ? compressedUri
                : compressedUri.replace('file://', '')

            const fileName = S_Wasa.getFileNameFromUrl(uri)
            const token = await S_Keychain.getToken()
            const _uploadUrl = uploadUrl
              ? `${uploadUrl}/${fileName}`
              : `${modelName}/${fileName}`

            setNeedUpload(true)
            RNBlobUtil.fetch(
              'PUT',
              `${endpoint}/${_uploadUrl}`,
              {
                Authorization: `${token}`
              },
              RNBlobUtil.wrap(uri)
            )
              .uploadProgress((written, total) => {
                setUploadProgress(written / total)
              })
              .then(res => {
                let status = res.info().status
                if (status == 200) {
                  let json = res.json()
                  onChange(json.signed_url)
                  resolve(json.signed_url)
                  setNeedUpload(false)
                  setVisible(false)
                } else {
                  console.log('Server Error', status)
                }
              })
              .catch(err => {
                console.log('err', err)
              })
          })

        } catch (e) {
          console.error('Compression error:', e);
          console.log('相簿選擇後，壓縮失敗');
        }
      }
    })
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
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

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      // 檢查是否已經獲取權限，如果尚未獲取則發起請求
      requestExternalWritePermission()
      requestCameraPermission()
    }
  }, []);

  return (
    <>
      <WsStateFilesAndImagesPickerModal
        isVisible={visible}
        onClose={() => setVisible(false)}
        onImageLibraryPress={$_onImageLibraryPress}
        onCameraPress={() => $_onCameraPress()}
        browseBtnVisible={false}
        recordingBtnVisible={recordingBtnVisible}
      />

      {!value && (
        <TouchableOpacity
          style={[
            {
              backgroundColor: $color.primary10l,
              paddingVertical: paddingVertical
            },
            style
          ]}
          onPress={() => {
            setVisible(true)
          }}
        >
          {!needUpload && (
            <WsFlex
              flexDirection="column"
              style={{
                // 230925
                position: 'absolute',
                right: 0,
                left: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
              }}
            >
              <WsIcon name={icon} size={50} color={color} />
              <WsText color={color} fontWeight="700">
                {text}
              </WsText>
            </WsFlex>
          )}
          {needUpload && (
            <WsIconCircle
              hasProgress={true}
              count={Math.round(uploadProgress * 100)}
              progressTintColor={$color.primary}
              backgroundColor="transparent"
              size={20}
            />
          )}
        </TouchableOpacity>
      )}
      {value && (
        <>
          <WsFlex
            justifyContent="center"
            style={[
              {
                backgroundColor: $color.primary10l
              },
              style
            ]}>
            {centerBtnVisible && (
              <WsBtn
                isFullWidth={false}
                borderRadius={10}
                borderWidth={1}
                borderColor={$color.white2d}
                textColor={$color.white2d}
                color="transparent"
                style={{
                  position: 'absolute',
                  zIndex: 3,
                  width: 100
                }}
                onPress={() => {
                  setVisible(true)
                }}>
                {t('更換圖片')}
              </WsBtn>
            )}
            {bottomRightBtnVisible && (
              <WsIconBtn
                onPress={() => {
                  setVisible(true)
                }}
                name="ws-outline-camera"
                color={$color.white}
                size={24}
                style={{
                  zIndex: 4,
                  position: 'absolute',
                  bottom: -8,
                  right: -8,
                  backgroundColor: 'rgba(4,116,185, .8)'
                }}
              />
            )}
            <WsFastImage
              isUri={true}
              source={value}
              fillWidth={true}
              style={style}
              resizeMode={'cover'}
            />
          </WsFlex>
        </>
      )}
    </>
  )
}

export default WsStateImage
