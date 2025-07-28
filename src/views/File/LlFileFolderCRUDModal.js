import React, { useState } from 'react'
import {
  SafeAreaView,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  Alert
} from 'react-native'
import {
  WsIcon,
  WsText,
  WsFlex,
  WsLoading,
  WsTabView,
  WsPopup,
  WsStateFormView,
  LlFileStoreStateFormView,
  LlPopupAlert,
  WsGradientButton
} from '@/components'
import { images } from '@/__reactnative_stone/assets/img'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import $config from '@/__config'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import S_FileFolder from '@/services/api/v1/file_folder'
import TabUploadFromFileStore from '@/views/File/TabUploadFromFileStore'
import TabUploadFromLocalFile from '@/views/File/TabUploadFromLocalFile'
import TabUploadFromOtherFileStore from '@/views/File/TabUploadFromOtherFileStore'
import LlFIleFolderMoveView from '@/views/File/LlFIleFolderMoveView'
import S_File from '@/services/api/v1/file'
import S_FileVersion from '@/services/api/v1/file_version'

const LlFileFolderCRUDModal = props => {
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const { t } = useTranslation()

  const {
    isVisible,
    onClose,
    fields,
    actionType,
    value,
    remind,
    remindColor,
    remind1,
    remind1Color,
    remind2,
    currentFolder,
    setCheckDeleteModalContent,
    setCheckDeleteModalVisible,
    tab,
    title
  } = props

  // STATES
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState();

  // FUNCTION
  const $_onChange = async (fieldsValue) => {
    if (actionType === 'create') {
      try {
        const postData = S_FileFolder.getFormattedCreateData(fieldsValue, value?.id)
        const res = await S_FileFolder.create({ params: postData })
        if (res) {
          Alert.alert('新增資料夾完成')
          navigation.replace('FileStore')
        }
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === 'edit') {
      try {
        const postData = S_FileFolder.getFormattedUpdateData(fieldsValue)
        const res = await S_FileFolder.update({
          modelId: value.id,
          data: postData
        })
        if (res) {
          Alert.alert('編輯資料夾完成')
          navigation.replace('FileStore')
        }
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === 'createFile') {
      try {
        const postData = S_File.getFormattedCreateData(fieldsValue)
        console.log(postData, 'postData---');
        const res = await S_File.create({ params: postData })
        if (res) {
          navigation.replace('FileStoreSubLayer', {
            file_folder: res.file_folder?.id,
            name: res.file_folder?.name,
            folder_path: res.file_folder?.folder_path,
            folder_uuid_path: res.file_folder?.folder_uuid_path
          })
        }
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === 'editFile') {
      try {
        const postData = S_File.getFormattedUpdateData(fieldsValue)
        const res = await S_File.update({
          modelId: postData.id,
          data: postData
        })
        if (res) {
          Alert.alert('編輯檔案資料完成')
          if (tab !== 'tab2') {
            navigation.replace('FileStoreSubLayer', {
              file_folder: res.file_folder?.id,
              name: res.file_folder?.name,
              folder_path: res.file_folder?.folder_path,
              folder_uuid_path: res.file_folder?.folder_uuid_path
            })
          } else if (tab === 'tab2') {
            navigation.replace('FileStore')
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === 'uploadNewVersion') {
      try {
        const postData = S_File.getFormattedUploadVersionData(fieldsValue)
        const res = await S_FileVersion.updateVersion({
          modelId: postData.id,
          data: postData
        })
        if (res) {
          // Alert.alert('上傳新版本完成')
          navigation.replace('FileStoreShow', {
            id: value.id,
          })
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 刪除資料夾流程
  const hasPermission = (response, permission) => {
    if (Array.isArray(response.scopes)) {
      return response.scopes.includes(permission);
    }
    return false;
  }
  const $_deleteFolder = async () => {
    try {
      const _params = {
        file_folder_id: value.id
      }
      const apiResponse = await S_FileFolder.getUserScope({ params: _params })
      if (!apiResponse.has_read) {
        Alert.alert('無此資料夾權限')
        return
      }
      const hasFileDeletePermission = hasPermission(apiResponse, 'file-delete');
      if (hasFileDeletePermission && apiResponse.has_child === false) {
        try {
          const _res = await S_FileFolder.delete({ modelId: value.id })
          if (_res) {
            Alert.alert('已成功刪除資料夾')
          }
        } catch (e) {
          console.error(e);
          Alert.alert(`尚有資料夾或檔案在此資料夾中，\n所以無法刪除。\n如需要刪除，\n請先清空此資料夾。`)
        }
      } else {
        Alert.alert(`尚有資料夾或檔案在此資料夾中，\n所以無法刪除。\n如需要刪除，\n請先清空此資料夾。`)
      }
    } catch (e) {
      Alert.alert('資料夾刪除發生異常')
      console.error(e);
    }
  }
  const $_deleteFileCheck = async () => {
    try {
      const _params = {
        file_folder_id: currentFolder.id
      }
      const apiResponse = await S_FileFolder.getUserScope({ params: _params })
      if (!apiResponse.has_read) {
        Alert.alert('無此檔案瀏覽權限')
        onClose()
        return
      }
      const hasFileDeletePermission = hasPermission(apiResponse, 'file-delete');
      if (hasFileDeletePermission) {
        $_onPressEnter()
      }
    } catch (e) {
      Alert.alert('無刪除檔案權限')
      console.error(e);
      onClose()
    }
  }
  const $_onPressEnter = async () => {
    const _params = {
      file_id: value.id
    }
    const _res = await S_File.checkDeleteScope({ params: _params })
    if (_res.message === 'invalid scopes') {
      onClose()
      setCheckDeleteModalContent('對此檔案無刪除權限')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file is used') {
      onClose()
      setCheckDeleteModalContent('此檔案正在使用中')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file can delete') {
      try {
        const _params = {
          module: undefined,
          file: value.id
        }
        const res = await S_File.delete({ params: _params })
        navigation.replace('FileStoreSubLayer', {
          file_folder: currentFolder.id,
          name: currentFolder.name,
          folder_path: currentFolder.folder_path,
          folder_uuid_path: currentFolder.folder_uuid_path
        })
        onClose()
      } catch (e) {
        console.error(e);
        Alert.alert(t('發生錯誤'))
        onClose()
      }
    }
  }

  // Breadcrumbs
  const generateBreadcrumbs = (folderPath, folderUuidPath) => {
    if (!folderPath || !folderUuidPath) {
      return [];
    }
    const folders = folderPath.split('/');
    const uuids = folderUuidPath.split('/');
    if (folders.length !== uuids.length) {
      return [];
    }
    const breadcrumbs = folders.map((folder, index) => {
      return {
        name: folder,
        uuid: uuids[index]
      };
    });
    return breadcrumbs;
  }

  React.useEffect(() => {
    if (value && value.folder_path && value.folder_uuid_path) {
      const breadcrumbs = generateBreadcrumbs(value.folder_path, value.folder_uuid_path);
      setCurrentBreadcrumbs(breadcrumbs)
    }
  }, []);

  return (
    <>
      <WsPopup
        active={isVisible}
        onClose={() => {
          if (actionType !== 'create' && actionType !== 'edit' && actionType !== 'createFile') {
            onClose();
          }
        }}
      >
        <SafeAreaView>
          <View
            style={{
              width: width * 0.9,
              height: (actionType === 'deleteFolder' || actionType === 'deleteFile') ? height * 0.2 : height * 0.9,
              backgroundColor: $color.white,
              borderRadius: 10,
              paddingVertical: 16
            }}
          >
            <>
              {title && (
                <WsText
                  style={{
                    paddingHorizontal: 16,
                  }}
                  size={18}
                  fontWeight={600}
                >{title}
                </WsText>
              )}

              {actionType === 'edit' && (
                <View
                  style={{
                    paddingHorizontal: 16
                  }}
                >
                  <WsText color={$color.black} size={14} fontWeight={600}>{t('目前所在資料夾')}</WsText>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{
                      marginVertical: 8
                    }}
                  >
                    <View>
                      <WsText color={$color.black} size={14}>{t('最上層')}</WsText>
                    </View>
                    {currentBreadcrumbs && currentBreadcrumbs.map((crumb, index) => (
                      <>
                        <WsText color={$color.primary}>{' > '}</WsText>
                        <View>
                          <WsText color={$color.primary} size={14}>{crumb.name}</WsText>
                        </View>
                      </>
                    ))}
                  </WsFlex>
                </View>
              )}

              {fields && (actionType === 'create' || actionType === 'edit') && (
                <LlFileStoreStateFormView
                  backgroundColor={$color.white}
                  fields={fields}
                  onChange={(fieldsValue) => {
                    $_onChange(fieldsValue)
                  }}
                  initValue={actionType === 'edit' ? value : undefined}
                  onClose={onClose}
                  actionType={actionType}
                  remind1={remind1}
                  remind1Color={remind1Color}
                  remind2={remind2}
                  remind={remind}
                  remindColor={remindColor}
                />
              )}

              {(actionType === 'moveFolder' ||
                actionType === 'moveFile') && (
                  <LlFIleFolderMoveView
                    onClose={onClose}
                    actionType={actionType}
                    value={value}
                    currentFolder={currentFolder}
                    remind={remind}
                    remindColor={remindColor}
                    remind1={remind1}
                    remind1Color={remind1Color}
                  ></LlFIleFolderMoveView>
                )}

              {fields &&
                (actionType === 'createFile' || actionType === 'editFile' || actionType === 'uploadNewVersion') && (
                  <LlFileStoreStateFormView
                    backgroundColor={$color.white}
                    fields={fields}
                    onChange={(fieldsValue) => {
                      $_onChange(fieldsValue)
                    }}
                    initValue={value}
                    onClose={onClose}
                    actionType={actionType}
                  />
                )}

              {actionType === 'deleteFolder' && (
                <>
                  <WsText
                    size={18}
                    color={$color.black}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: 16
                    }}
                  >{t('確定刪除嗎？')}
                  </WsText>
                  <WsFlex
                    style={{
                      position: 'absolute',
                      right: 16,
                      bottom: 16,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        borderColor: $color.gray,
                        borderRadius: 25,
                        borderWidth: 1,
                        alignItems: 'center',
                        width: 110,
                        height: 48,
                        paddingVertical: 9,
                      }}
                      onPress={() => {
                        onClose()
                      }}>
                      <WsText
                        style={{
                        }}
                        size={14}
                        color={$color.gray}
                      >{t('取消')}
                      </WsText>
                    </TouchableOpacity>
                    <WsGradientButton
                      style={{
                        width: 110,
                      }}
                      onPress={() => {
                        $_deleteFolder()
                        onClose()
                      }}>
                      {t('確定')}
                    </WsGradientButton>
                  </WsFlex>
                </>
              )}

              {actionType === 'deleteFile' && (
                <>
                  <WsText
                    size={18}
                    color={$color.black}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: 16
                    }}
                  >{t('確定刪除嗎？')}
                  </WsText>
                  <WsFlex
                    style={{
                      position: 'absolute',
                      right: 16,
                      bottom: 16,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        borderColor: $color.gray,
                        borderRadius: 25,
                        borderWidth: 1,
                        alignItems: 'center',
                        width: 110,
                        height: 48,
                        paddingVertical: 9,
                      }}
                      onPress={() => {
                        onClose()
                      }}>
                      <WsText
                        style={{
                        }}
                        size={14}
                        color={$color.gray}
                      >{t('取消')}
                      </WsText>
                    </TouchableOpacity>
                    <WsGradientButton
                      style={{
                        width: 110,
                      }}
                      onPress={() => {
                        $_deleteFileCheck()
                      }}>
                      {t('確定')}
                    </WsGradientButton>
                  </WsFlex>
                </>
              )}
            </>
          </View>
        </SafeAreaView>
      </WsPopup>
    </>


  )
}
export default LlFileFolderCRUDModal
