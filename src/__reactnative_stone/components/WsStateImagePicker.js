import React, { useState, useEffect, useCallback } from 'react'
import {
  Text,
  Button,
  View,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native'
import {
  WsText,
  WsIcon,
  WsIconCircle,
  WsFastImage,
  WsStateImagePickerModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import config from '@/__config'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import * as ImagePicker from 'react-native-image-picker'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import RNBlobUtil from 'react-native-blob-util'

const WsStateImagePicker = ({ navigation }, props) => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    onChange,
    value,
    modelName,
    uploadUrl,
    endpoint = axios.defaults.baseURL,
    icon = 'md-image',
    paddingVertical = 39,
    style,
    text = t('上傳'),
    color = $color.primary4l,
    uploadToFileStore = true
  } = props

  // States
  const [uploadProgress, setUploadProgress] = React.useState(0)
  const [needUpload, setNeedUpload] = React.useState(false)

  const [pickerResponse, setPickerResponse] = useState(null)
  const [visible, setVisible] = useState(false)

  const onImageLibraryPress = useCallback(() => {
    const options = {
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false
    }
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        setPickerResponse(response)
        setVisible(false)
        setUri(response.assets[0].uri)

        if (!uploadToFileStore) {
          new Promise(async (resolve, reject) => {
            let uri =
              Platform.OS === 'android'
                ? uri
                : response.assets[0].uri.replace('file://', '')

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
                } else {
                  console.log('Server Error', status)
                }
              })
              .catch(err => {
                console.log('err', err)
              })
          })
        } else {
          console.log(_uploadUrl, '_uploadUrl---222');
          new Promise(async (resolve, reject) => {
            let uri =
              Platform.OS === 'android'
                ? uri
                : response.assets[0].uri.replace('file://', '')

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
                } else {
                  console.log('Server Error', status)
                }
              })
              .catch(err => {
                console.log('err', err)
              })
          })
        }

      }
    })
  }, [])

  const onCameraPress = React.useCallback(async () => {
    const options = {
      saveToPhotos: true,
      mediaType: 'photo',
      includeBase64: false
    }
    ImagePicker.launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        setPickerResponse(response)
        setVisible(false)
        setUri(response.assets[0].uri)

        new Promise(async (resolve, reject) => {
          let uri =
            Platform.OS === 'android'
              ? uri
              : response.assets[0].uri.replace('file://', '')

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
              } else {
                console.log('Server Error', status)
              }
            })
            .catch(err => {
              console.log('err', err)
            })
        })
      }
    })
  }, [])

  const [uri, setUri] = React.useState(
    pickerResponse?.assets && pickerResponse.assets[0].uri
  )

  return (
    <>
      <WsStateImagePickerModal
        isVisible={visible}
        onClose={() => setVisible(false)}
        onImageLibraryPress={onImageLibraryPress}
        onCameraPress={onCameraPress}
      />
      <TouchableOpacity
        onPress={() => {
          setVisible(true)
        }}>
        <View
          style={{
            height: 100,
            width: 100,
            marginHorizontal: 6,
            marginVertical: 6,
            borderWidth: 2,
            borderRadius: 1,
            borderStyle: 'dashed',
            borderColor: 'grey',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(199,199,199,0.7)'
          }}>
          {uri ? (
            <View>
              <WsFastImage
                style={{ height: 100, width: 100 }}
                isUri={true}
                source={uri}
                fillWidth={false}
                setResizeMode={'cover'}
              />
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 4,
                  top: 4
                }}
                onPress={() => {
                  setPickerResponse(null)
                  setUri(null)
                  setNeedUpload(false)
                }}>
                <WsIcon
                  color="#fff"
                  name="md-cancel"
                  size={28}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {!needUpload && (
                <WsIcon
                  name="md-add-circle"
                  size={34}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                  color={$color.gray2d}
                />
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
            </>
          )}
        </View>
      </TouchableOpacity>
    </>
  )
}
export default WsStateImagePicker
