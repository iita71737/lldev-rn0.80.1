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
import { WsState } from 'components'
import { useTranslation } from 'react-i18next'

const WsStateFileItem = props => {
  const { width, height } = Dimensions.get('window')
  const { t } = useTranslation()

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
    testID,
    orderMode = 'default',
    onDragPressIn,
    itemIndex,
    onItemChange,
    exportAttachmentName,
  } = props


  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [uploadProgress, setUploadProgress] = React.useState(0)

  // Function
  const $_getFileName = () => {
    if (typeof value === 'string') {
      // const _value = decodeURI(S_url.getFileName(value))
      const _value = S_url.getFileName(value)
      // console.log(_value, '_value B')
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


  const $_uploadStart = async () => {
    // 先取得實體路徑
    if (!uploadToFileStore) {
      let uri = Platform.OS === 'android'
        ? lazyUri
        : decodeURIComponent(lazyUri.replace('file://', '').replace('file://', ''));

      const token = await S_Keychain.getToken();
      const _uploadUrl = uploadUrl && uploadSuffix

        ? `${uploadUrl}/${encodeURIComponent(fileName)}?${uploadSuffix}`
        : `${uploadUrl}/${encodeURIComponent(fileName)}`;

      console.log(`${endpoint}/${_uploadUrl}`, '_uploadUrl status A')

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
          console.log('state A1')
          let json = res.json();
          onUploadComplete(json.signed_url);
        } else if (status === 201) {
          console.log('state A2')
          // 230816 新上传方式
          let json = res.json();
          onUploadComplete(json.data.source_url, json.data.last_version.id);
        } else {
          console.log(uri, 'state A3')
          throw new Error(`Upload failed with status: ${status}`);
        }
      } catch (err) {
        console.log(err.message, 'state A4 error');
        onUploadComplete(uri);
      }
    } else {
      console.log('status B')
      let uri = Platform.OS === 'android'
        ? lazyUri
        : decodeURIComponent(lazyUri.replace('file://', '').replace('file://', ''));
      const token = await S_Keychain.getToken();
      const _params = {
        module: modelName,
        factory: currentFactory.id
      }
      const queryString = new URLSearchParams(_params).toString();
      console.log(fileName, 'fileName AAA')
      const _uploadUrl = `general_file/${encodeURIComponent(fileName)}?${queryString}` // 260123-filepath-issue

      console.log(_uploadUrl, '_uploadUrl status B')

      try {
        const res = await RNBlobUtil.fetch(
          'PUT',
          `${endpoint}/${_uploadUrl}`,
          {
            'Authorization': token
          },
          RNBlobUtil.wrap(uri)
        );
        console.log(res.json(), 'res.json()---')

        let status = res.info().status;
        if (status === 200 && modelName) {
          console.log('status B1')
          let json = res.json();
          const _params = {
            name: fileName,
            file_type: getFileExtensionFromUrl(json.signed_url),
            source_url: json.signed_url,
            factory: currentFactory.id,
            module: modelName
          }
          console.log(_params, 'storeSystem_params')
          try {
            const _storeSystem = await S_File.storeSystem({ params: _params })
            console.log(_storeSystem?.source_url, '_storeSystem.source_url')
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
          console.log('status B2')
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
          console.log('status B3')
          let json = res.json();
          onUploadComplete(json.signed_url)
        } else {
          console.log('status B4')
          throw new Error(`Upload failed with status: ${status}`);
        }
      } catch (err) {
        console.log(err.message, 'error');
        console.log(uri, 'onUploadComplete(uri)')
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

  const exportName = value?.export_attachment_name ?? $_getFileName()
  const exportAttachmentValue =
    typeof value?.export_attachment_name_enabled === 'boolean'
      ? value?.export_attachment_name_enabled
      : exportAttachmentName ?? false
  const exportAttachmentPositionValue =
    value?.frame_position ?? 'top-right'
  const shouldShowExportAttachmentSettings =
    modelName === 'meeting' &&
    orderMode !== 'sort' &&
    exportAttachmentName

  // Render
  return (
    <View
      style={
        shouldShowExportAttachmentSettings
          ? {
            borderWidth: 0.3,
            padding: 16,
            borderRadius: 10
          }
          : undefined
      }
    >
      {
        shouldShowExportAttachmentSettings && (
          <>
            <WsState
              style={
                [
                  { marginBottom: 8, marginTop: itemIndex === 0 ? 0 : 16 }
                ]
              }
              type="checkbox"
              label={t('是否匯出附件名稱')}
              value={exportAttachmentValue}
              onChange={$event => {
                onItemChange?.({ export_attachment_name_enabled: $event })
              }}
            />
            {exportAttachmentValue && (
              <WsState
                style={
                  [
                    { marginBottom: 8, marginTop: itemIndex === 0 ? 0 : 16 }
                  ]
                }
                type="radio"
                items={[
                  { label: t('右上'), value: 'top-right' },
                  { label: t('左上'), value: 'top-left' },
                ]}
                label={t('附件名稱位置')}
                value={exportAttachmentPositionValue}
                onChange={$event => {
                  onItemChange?.({ frame_position: $event })
                }}
              />
            )}
            <WsState
              style={
                [
                  { marginBottom: 8 }
                ]
              }
              type="text"
              label={t('匯出​附件​名​稱')}
              value={exportName}
              editable={!!exportAttachmentValue}
              onChange={(text) => {
                onItemChange?.({ export_attachment_name: text })
              }}
            />
          </>
        )}
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
              fileName={exportName ? exportName : $_getFileName()}
              fileType={fileType ? fileType : fileExtension ? fileExtension : null}
              value={$_getSource()}
              disabled={
                $_getSource().file?.source_url === null && $_getSource().file?.name !== 'invalid scope' ? true : false
              }
            />
            {orderMode === 'sort' ? (
              <Pressable
                disabled={!onDragPressIn}
                onPressIn={onDragPressIn}
                onLongPress={onDragPressIn}
                hitSlop={8}
              >
                <WsIconCircle
                  name="ws-outline-drag-horizontal"
                  size={20}
                  color={$color.white}
                  backgroundColor={$color.gray}
                />
              </Pressable>
            ) : (
              <TouchableOpacity onPress={onRemove} testID={'ws-outline-delete'}>
                <WsIconCircle
                  name="ws-outline-delete"
                  size={20}
                  color={$color.white}
                  backgroundColor={$color.danger}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </WsFlex>
    </View>
  )
}

export default WsStateFileItem
