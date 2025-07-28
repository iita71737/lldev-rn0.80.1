import React from 'react'
import { View, Platform } from 'react-native'
import { WsInfoImage, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'

import $config from '@/__config'
import store from '@/store'
import { useSelector } from 'react-redux'
import S_File from '@/services/api/v1/file'
import axios from 'axios'
import RNBlobUtil from 'react-native-blob-util'

const WsStateImageItem = props => {
  // Props
  const {
    width = 120,
    value,
    lazyUri,
    fileName,
    onRemove,
    uploadUrl,
    modelName,
    endpoint = axios.defaults.baseURL,
    onUploadComplete,
    needUpload = false,
    uploadToFileStore
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [uploadProgress, setUploadProgress] = React.useState()

  // Function
  const $_getSource = () => {
    if (value) {
      return value
    } else {
      return lazyUri
    }
  }

  const getFileExtensionFromUrl = (url) => {
    const path = url.split('?')[0]; // 去除 URL 中的查詢參數
    const segments = path.split('/'); // 分割 URL
    const filename = segments[segments.length - 1]; // 獲取檔案名稱
    const extension = filename.split('.').pop(); // 獲取檔案擴展名
    return extension;
  };

  const $_uploadStart = async () => {
    if (!uploadToFileStore) {
      let uri =
        Platform.OS === 'android'
          ? lazyUri
          : decodeURIComponent(
            lazyUri.replace('file://', '').replace('file://', '')
          )
      const token = await S_Keychain.getToken()
      const _uploadUrl = uploadUrl
        ? `${uploadUrl}/${encodeURI(fileName)}`
        : `${modelName}/${encodeURI(fileName)}`
      RNBlobUtil.fetch(
        'PUT',
        `${endpoint}/${_uploadUrl}`,
        {
          Authorization: token
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
            onUploadComplete(json.signed_url)
          } else {
            console.log('Server Error', status)
          }
        })
        .catch(err => {
          console.log('err', err)
        })
    } else {
      let uri =
        Platform.OS === 'android'
          ? lazyUri
          : decodeURIComponent(
            lazyUri.replace('file://', '').replace('file://', '')
          )
      const token = await S_Keychain.getToken()
      const _params = {
        module: modelName,
        factory: currentFactory.id
      }
      const queryString = new URLSearchParams(_params).toString();
      const _uploadUrl = `general_file/${encodeURI(fileName)}?${queryString}`
      RNBlobUtil.fetch(
        'PUT',
        `${endpoint}/${_uploadUrl}`,
        {
          Authorization: token,
        },
        RNBlobUtil.wrap(uri)
      )
        .uploadProgress((written, total) => {
          setUploadProgress(written / total)
        })
        .then(async res => {
          let status = res.info().status
          if (status == 200) {
            let json = res.json()
            const _params = {
              name: fileName,
              file_type: getFileExtensionFromUrl(json.signed_url),
              source_url: json.signed_url,
              factory: currentFactory.id,
              module: modelName
            }
            // console.log(_params, '_params---');
            try {
              const _storeSystem = await S_File.storeSystem({ params: _params })
              // console.log(_storeSystem,'_storeSystem--');
              const _formattedPostData = {
                file: {
                  id: _storeSystem.id,
                  // file_type: _storeSystem.file_type,
                  // name: _storeSystem.name,
                  // source_url: _storeSystem.source_url
                },
                file_version: {
                  id: _storeSystem.last_version?.id,
                  file_type: _storeSystem.file_type,
                  name: _storeSystem.name,
                  source_url: _storeSystem.source_url,
                  version_number: _storeSystem.version_number
                }
              }
              onUploadComplete(_formattedPostData)
            } catch (e) {
              console.error(e);
            }
          } else {
            console.log('Server Error', status)
          }
        })
        .catch(err => {
          console.log('err', err)
        })
    }

  }

  // Effect
  React.useEffect(() => {
    if (needUpload) {
      $_uploadStart()
    }
  }, [needUpload])

  // Render
  return (
    <View
      style={{
        padding: 8,
      }}>
      {!needUpload && (
        <View
          style={{
            borderRadius: 25 / 2,
            backgroundColor: $color.white,
            position: 'absolute',
            right: 4,
            top: 0,
            zIndex: 2,
            width: 25,
            height: 25
          }}>
          <WsIconBtn
            name="ws-filled-cancel"
            size={24}
            color={$color.danger}
            padding={0}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              zIndex: 3
            }}
            onPress={onRemove}
          />
        </View>
      )}
      <View>
        {needUpload && (
          <View
            style={{
              width: width - 16,
              height: width - 16,
              backgroundColor: '#000',
              position: 'absolute',
              opacity: 0.6,
              zIndex: 1
            }}
          />
        )}
        <WsInfoImage
          width={width - 16}
          height={width - 16}
          fileName={fileName}
          value={$_getSource()}
          uploadProgress={uploadProgress}
          style={{
            position: 'relative'
          }}
        />
      </View>
    </View>
  )
}

export default WsStateImageItem
