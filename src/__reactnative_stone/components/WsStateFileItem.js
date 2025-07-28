import React from 'react'
import $config from '@/__config'
import { View, Pressable, TouchableOpacity, Dimensions, Platform } from 'react-native'
import { WsIconCircle, WsFlex, WsLoading, WsInfoFile, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'

import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import store from '@/store'
import { useSelector } from 'react-redux'
import S_File from '@/services/api/v1/file'
import axios from 'axios'
import factory from '@/services/api/v1/factory'
import S_url from '@/__reactnative_stone/services/app/url'
import RNBlobUtil from 'react-native-blob-util'

const WsStateFileItem = props => {
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    fileName,
    fileType,
    value,
    lazyUri,
    onRemove,
    uploadUrl,
    modelName,
    endpoint = axios.defaults.baseURL,
    onUploadComplete,
    needUpload = false,
    fileExtension,
    uploadSuffix,
    uploadToFileStore = false,
    testID
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [uploadProgress, setUploadProgress] = React.useState(0)

  // Function
  const $_getFileName = () => {
    if (typeof value === 'string') {
      const _value = decodeURI(S_url.getFileName(value))
      return _value
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value[0]?.file?.name || value[0]?.file?.fileName || value[0]?.file_version?.name || null
      } else {
        if (value.file_version) {
          return value.file_version?.name !== 'invalid scope' && value.file_version?.version_number ? `${value.file_version?.name} ver.${value.file_version?.version_number}` : `${value.file_version?.name}`
        } else {
          return value.file?.name !== 'invalid scope' ? `${value.file?.name} ver.${value.file?.version_number}` : value.file?.name
        }
      }
    } else {
      return null
    }
  }

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

  // helper
  const getUploadablePath = async (lazyUri) => {
    if (!lazyUri) return null;
    try {
      if (Platform.OS === 'android' && lazyUri.startsWith('content://')) {
        const stat = await RNBlobUtil.fs.stat(lazyUri);
        return stat.path; // ✅ 真實路徑
      } else if (Platform.OS === 'android' && lazyUri.startsWith('file://')) {
        return lazyUri.replace('file://', '');
      } else if (Platform.OS === 'ios') {
        return decodeURIComponent(lazyUri.replace('file://', ''));
      } else {
        return lazyUri;
      }
    } catch (e) {
      console.error('getUploadablePath failed:', e);
      return null;
    }
  };

  const $_uploadStart = async () => {
    console.log(lazyUri, '$_uploadStart--');
    // 先取得實體路徑
    if (!uploadToFileStore) {
      let uri = Platform.OS === 'android'
        ? lazyUri
        : decodeURIComponent(lazyUri.replace('file://', '').replace('file://', ''));

      const token = await S_Keychain.getToken();
      const _uploadUrl = uploadUrl && uploadSuffix
        ? `${uploadUrl}/${encodeURI(fileName)}?${uploadSuffix}`
        : `${uploadUrl}/${encodeURI(fileName)}`;

      console.log(uri, 'uri');

      try {
        const res = await RNBlobUtil.fetch(
          'PUT',
          `${endpoint}/${_uploadUrl}`,
          {
            'Authorization': token
          },
          RNBlobUtil.wrap(uri)
        );
        let status = res.info().status;
        if (status === 200) {
          let json = res.json();
          onUploadComplete(json.signed_url);
        } else if (status === 201) {
          // 230816 新上传方式
          let json = res.json();
          onUploadComplete(json.data.source_url, json.data.last_version.id);
        } else {
          throw new Error(`Upload failed with status: ${status}`);
        }
      } catch (err) {
        console.log(err.message, 'error');
        onUploadComplete(uri);
      }
    } else {
      let uri = Platform.OS === 'android'
        ? lazyUri
        : decodeURIComponent(lazyUri.replace('file://', '').replace('file://', ''));
      const token = await S_Keychain.getToken();
      const _params = {
        module: modelName,
        factory: currentFactory.id
      }
      const queryString = new URLSearchParams(_params).toString();
      const _uploadUrl = `general_file/${encodeURI(fileName)}?${queryString}`
      try {
        const res = await RNBlobUtil.fetch(
          'PUT',
          `${endpoint}/${_uploadUrl}`,
          {
            'Authorization': token
          },
          RNBlobUtil.wrap(uri)
        );
        let status = res.info().status;
        if (status === 200 && modelName) {
          let json = res.json();
          const _params = {
            name: fileName,
            file_type: getFileExtensionFromUrl(json.signed_url),
            source_url: json.signed_url,
            factory: currentFactory.id,
            module: modelName
          }
          try {
            const _storeSystem = await S_File.storeSystem({ params: _params })
            const _formattedPostData = {
              file: {
                id: _storeSystem.id,
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
        } else if (status === 201 && modelName) {
          // 230816 新上传方式
          let json = res.json();
          const _params = {
            name: fileName,
            file_type: getFileExtensionFromUrl(json.signed_url),
            source_url: json.signed_url,
            factory: currentFactory.id,
            module: modelName
          }
          try {
            const _storeSystem = await S_File.storeSystem({ params: _params })
            const _formattedPostData = {
              file: {
                id: _storeSystem.id,
              },
              file_version: {
                id: _storeSystem.last_version?.id,
                file_type: _storeSystem.file_type,
                name: _storeSystem.name,
                source_url: _storeSystem.source_url,
                version_number: _storeSystem.version_number
              }
            }
            onUploadComplete(source_url)
          } catch (e) {
            console.error(e);
          }
        } else if (status === 200 && !modelName) {
          let json = res.json();
          onUploadComplete(json.signed_url)
        } else {
          throw new Error(`Upload failed with status: ${status}`);
        }
      } catch (err) {
        console.log(err.message, 'error');
        onUploadComplete(uri);
      }
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
    <>
      <WsFlex>
        {needUpload && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <WsIconCircle
              hasProgress={true}
              count={Math.round(uploadProgress * 100)}
              progressTintColor={$color.primary}
              backgroundColor="transparent"
              style={{
                top: 16,
              }}
              size={20}
            />
          </View>
        )}
        {!needUpload && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <WsInfoFile
              testID={testID}
              fileName={$_getFileName()}
              fileType={fileType ? fileType : fileExtension ? fileExtension : null}
              value={$_getSource()}
              disabled={
                $_getSource().file?.source_url === null && $_getSource().file?.name !== 'invalid scope' ? true : false
              }
            />
            <TouchableOpacity onPress={onRemove} testID={'ws-outline-delete'}>
              <WsIconCircle
                name="ws-outline-delete"
                size={20}
                color={$color.white}
                backgroundColor={$color.danger}
              />
            </TouchableOpacity>
          </View>
        )}
      </WsFlex>
    </>
  )
}

export default WsStateFileItem
