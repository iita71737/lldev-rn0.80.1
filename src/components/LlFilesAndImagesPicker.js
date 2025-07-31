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
  WsUpdateBtn,
  WsGrid,
  WsStateFileItem,
  WsDes,
  WsCameraPage,
  WsPopup,
  LlPopupAlert,
  WsLoading,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import config from '@/__config'
import * as ImagePicker from 'react-native-image-picker'
import { useTranslation } from 'react-i18next'
// import DocumentPicker from 'react-native-document-picker'
import DocumentPicker from '@react-native-documents/picker'
import { launchImageLibrary } from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native'
import RNFS from 'react-native-fs'
import { Camera, useCameraDevice } from 'react-native-vision-camera'
import { useNavigation } from '@react-navigation/native'
import { pick } from '@react-native-documents/picker'
import LlFilesAndImagesPickerModal from '@/views/File/LlFilesAndImagesPickerModal'
import S_File from '@/services/api/v1/file'

const LlFilesAndImagesPicker = props => {
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
    uploadToFileStore = true,
    testID = 'Ll_filesAndImages',
    oneFile,
    mode = 'default',
    limitFileExtension,
    uploadBtnText,
    uploadBtnIcon
  } = props

  // States
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [visible, setVisible] = useState(false)

  const [checkDeleteModalVisible, setCheckDeleteModalVisible] = useState(false)
  const [checkDeleteModalContent, setCheckDeleteModalContent] = useState('對此檔案無刪除權限，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')
  const [checkDeleteIndex, setCheckDeleteIndex] = useState()
  const [checkDeleteItem, setCheckDeleteItem] = useState()
  const [checkDeleteScopeRes, setCheckDeleteScopeRes] = useState()
  const [loading, setLoading] = useState()


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

  // $_checkDeleteScope
  const $_checkDeleteScope = async (item, index) => {
    setLoading(true)
    setCheckDeleteIndex(index)
    setCheckDeleteItem(item)
    const _params = {
      file_id: item.file?.id,
      module: modelName
    }
    const _res = await S_File.checkDeleteScope({ params: _params })
    setCheckDeleteScopeRes(_res.message)
    if (_res.message === 'invalid scopes') {
      setCheckDeleteModalContent('對此檔案無刪除權限，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file is used') {
      setCheckDeleteModalContent('此檔案正在使用中，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file can delete') {
      setCheckDeleteModalContent('確定要移除與此檔案的關聯且刪除檔案嗎？ 請注意，刪除檔案也會連同文件檔案庫的檔案一起刪除。')
      setCheckDeleteModalVisible(true)
    }
    setLoading(false)
  }

  // Upload Progress
  const $_onUploadComplete = ($event, $id, itemIndex) => {
    const _value = [...value]
    _value[itemIndex] = $event
    onChange(_value, $id)
  }

  // HELPER
  const $_getFileType = (item) => {
    if (typeof item === 'string') {
      return item.substring(item.lastIndexOf('.') + 1).toLowerCase().split("?")[0]
    } else {
      if (Array.isArray(value)) {
        return value[0]?.file?.file_type
      } else {
        if (value.file_version) {
          return value.file_version?.file_type
        } else {
          return value.file?.file_type
        }
      }
    }
  }

  // 來自本地上傳的檔案
  const onUploadFromLocalComplete = (file) => {
    if (!oneFile) {
      const _value = [...value]
      _value.push(file)
      onChange(_value)
    } else {
      onChange([file])
    }
  }

  // 來自檔案庫的檔案
  const onUploadFromFileStoreComplete = (files, relatedVersion) => {
    if (!oneFile) {
      const _value = value ? [...value] : []
      const _urls = files && files.map(item => {
        if (relatedVersion === 'latest') {
          return {
            file: {
              ...item
            },
          }
        } else if (relatedVersion === 'specific') {
          return {
            file: {
              id: item.file?.id
            },
            file_version: {
              ...item
            }
          }
        }
      });
      const newFiles = _urls.filter(newFile =>
        !_value.some(existingFile => existingFile.file?.id === newFile.file?.id)
      );
      const updatedValue = [..._value, ...newFiles];
      onChange(updatedValue)
    } else {
      const _urls = files && files.map(item => {
        if (relatedVersion === 'latest') {
          return {
            file: {
              ...item
            },
          }
        } else if (relatedVersion === 'specific') {
          return {
            file: {
              id: item.file?.id
            },
            file_version: {
              ...item
            }
          }
        }
      });
      onChange(_urls)
    }
  }

  // 來自其他單位的檔案
  const onUploadFromOtherFileStoreComplete = (files, relatedVersion) => {
    if (!oneFile) {
      const _value = value ? [...value] : []
      const _urls = files.map(item => {
        if (relatedVersion === 'latest') {
          return {
            file: {
              ...item
            },
          }
        } else if (relatedVersion === 'specific') {
          return {
            file: {
              id: item.file?.id
            },
            file_version: {
              ...item
            }
          }
        }
      });
      const newFiles = _urls.filter(newFile =>
        !_value.some(existingFile => existingFile.file?.id === newFile.file?.id)
      );
      const updatedValue = [..._value, ...newFiles];
      onChange(updatedValue)
    } else {
      const _urls = files && files.map(item => {
        if (relatedVersion === 'latest') {
          return {
            file: {
              ...item
            },
          }
        } else if (relatedVersion === 'specific') {
          return {
            file: {
              id: item.file?.id
            },
            file_version: {
              ...item
            }
          }
        }
      });
      onChange(_urls)
    }
  }

  const $_onPressCancel = () => {
    setCheckDeleteModalVisible(false)
  }

  const $_onPressEnter = async () => {
    const _params = {
      module: modelName,
      file: checkDeleteItem.file?.id
    }
    setLoading(true)
    if (checkDeleteScopeRes === 'invalid scopes' || checkDeleteScopeRes === 'file is used') {
      const _value = [...value]
      _value.splice(checkDeleteIndex, 1)
      onChange(_value, checkDeleteIndex)
    } else if (checkDeleteScopeRes === 'file can delete') {
      const _res = await S_File.delete({ params: _params })
      const _value = [...value]
      _value.splice(checkDeleteIndex, 1)
      onChange(_value, checkDeleteIndex)
    }
    setLoading(false)
  }

  // helper
  const formatFileItems = (items) => {
    return items && items.map(item => {
      if (item.file_type && item.source_url) {
        return item;
      }
      const { file, file_version } = item;
      if (file) {
        const formattedItem = {
          id: file.id,
          file_type: (file_version && file_version.file_type) || file.file_type,
          is_invalid: (file_version && file_version.is_invalid) || file.is_invalid,
          name: (file_version && file_version.name) || file.name,
          source_url: (file_version && file_version.source_url) || file.source_url,
          version_number: (file_version && file_version.version_number) || file.version_number,
        };
        return formattedItem;
      } else {
        return null
      }
    });
  }

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraPermission()
    }
  }, []);

  return (
    <>

      <LlFilesAndImagesPickerModal
        modelName={modelName}
        oneFile={oneFile}
        limitFileExtension={limitFileExtension}
        value={formatFileItems(value)}
        loadingProgress={loadingProgress}
        isVisible={visible}
        onClose={() => {
          setVisible(false)
        }}
        onUploadFromFileStoreComplete={(files, relatedVersion) => {
          onUploadFromFileStoreComplete(files, relatedVersion)
        }}
        onUploadFromLocalComplete={(url) => {
          onUploadFromLocalComplete(url)
        }}
        onUploadFromOtherFileStoreComplete={(files, relatedVersion) => {
          onUploadFromOtherFileStoreComplete(files, relatedVersion)
        }}
      ></LlFilesAndImagesPickerModal>

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
                  testID={`WsStateFileItem-${itemIndex}`}
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
                  testID={`WsStateFileItem-${itemIndex}`}
                  value={item}
                  fileType={$_getFileType(item)}
                  fileExtension={item.fileExtension}
                  uploadUrl={uploadUrl}
                  uploadSuffix={uploadSuffix}
                  modelName={modelName}
                  uploadToFileStore={uploadToFileStore}
                  onRemove={() => {
                    $_checkDeleteScope(item, itemIndex)
                  }}
                />
              )}
            </>
          )}
          keyExtractor={(item, index) => `${item}-${index}`}
          data={value}
        />
      )}

      {mode === 'default' && (
        <>
          <WsUpdateBtn
            testID={testID}
            onPress={() => {
              setVisible(true)
            }}
            icon={uploadBtnIcon}
          >
            {uploadBtnText ? uploadBtnText : t('上傳')}
          </WsUpdateBtn>
        </>
      )}

      {mode === 'icon' && (
        <TouchableOpacity
          onPress={() => {
            setVisible(true)
          }}
        >
          <WsIcon
            style={{
            }}
            name="md-image"
            color={$color.gray}
            size={24}
          ></WsIcon>
        </TouchableOpacity>
      )}

      <LlPopupAlert
        text={checkDeleteModalContent}
        visible={checkDeleteModalVisible}
        onClose={() => {
          setCheckDeleteModalVisible(false)
        }}
        onPressEnter={() => $_onPressEnter()}
      >
      </LlPopupAlert>

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <WsLoading></WsLoading>
        </View>
      )
      }

    </>
  )
}
export default LlFilesAndImagesPicker



