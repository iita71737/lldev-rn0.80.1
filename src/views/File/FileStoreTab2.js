import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsPageIndex,
  WsText,
  WsDes,
  WsCard,
  LlFileFolderCard,
  WsIconBtn,
  WsBottomSheet,
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import LlFileFolderCRUDModal from './LlFileFolderCRUDModal'

const FileStoreTab2 = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // 權限判斷
  const hasPermission = (folderScope = [], permission) => {
    if (Array.isArray(folderScope)) {
      return folderScope.includes(permission);
    }
    return false;
  }

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentActStatus = useSelector(state => state.data.actStatus)

  // FIELDS
  const fieldsForEditFile = {
    name: {
      label: t('標題'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    des: {
      label: t('版本說明'),
      placeholder: t('輸入'),
    },
    is_deprecate: {
      label: t('檔案作廢'),
      type: 'checkbox',
      checkboxText: '作廢',
    },
    share_factories: {
      type: 'belongstomany002',
      label: t('分享至其他單位'),
      nameKey: 'name',
      modelName: 'factory',
      serviceIndexKey: 'indexAllRelated',
      parentId: factory ? factory.id : null,
    },
    remark: {
      label: t('備註'),
      placeholder: t('輸入'),
      multiline: true
    },
    related_acts: {
      type: 'Ll_relatedAct',
      label: t('關聯法規'),
      modelName: 'act',
      serviceIndexKey: 'index',
      parentId: factory ? factory.id : null,
      params: {
        lang: 'tw',
        order_by: 'announce_at',
        order_way: 'desc',
        time_field: 'announce_at',
        act_status: currentActStatus ? currentActStatus[0].id : ''
      }
    },
  }

  // STATE
  const [_file, setFile] = React.useState()
  const [actionType, setActionType] = React.useState('')
  const [fileFolderCRUDModalVisible, setFileFolderCRUDModalVisible] = React.useState(false)
  const [isBottomSheetActive003, setIsBottomSheetActive003] = React.useState(false)
  const [bottomSheetItems003, setBottomSheetItems003] = React.useState([])
  const [_folderScope, setFolderScope] = React.useState()
  const [isBottomSheetActive002, setIsBottomSheetActive002] = React.useState(false)
  const [bottomSheetItems002, setBottomSheetItems002] = React.useState([])
  const [fileFolder, setFileFolder] = React.useState()
  const [params, setParams] = React.useState({
    lang: 'tw',
    order_by: 'created_at',
    order_way: 'desc',
  })
  const [filterFields] = React.useState({
    search_type: {
      testID: '搜尋種類picker',
      type: 'picker',
      label: t('搜尋種類'),
      placeholder: '選擇搜尋種類',
      items:
        [
          {
            label: i18next.t('資料夾名稱'),
            value: 'file_folder'
          },
          {
            label: i18next.t('檔案標題'),
            value: 'file'
          },
        ]
    },
    search: {
      type: 'search',
      label: t('搜尋'),
    },
    created_user: {
      type: 'belongstomany',
      label: t('上傳者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    button: {
      type: 'date_range',
      label: t('更新日期'),
      time_field: 'updated_at'
    },
    order: {
      type: 'picker',
      label: t('排序'),
      items:
        [
          {
            label: i18next.t('依建立日期由近至遠'),
            value: {
              order_way: 'desc',
              order_by: 'created_at'
            }
          },
          {
            label: i18next.t('依更新時間由近至遠'),
            value: {
              order_way: 'desc',
              order_by: 'updated_at'
            }
          },

        ]
    }
  })

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={'backButton'}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }
  const $_onBottomSheetItemPress = item => {
    item.onPress(item)
  }
  const $_setBottomSheetItems002 = () => {
    setBottomSheetItems002([
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('編輯'),
        onPress: () => {
          const _canEditFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'first-folder-update')
            : false;
          if (!_canEditFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: t('確定'),
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('edit')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('移動'),
        onPress: () => {
          const _canUpdateFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'first-folder-update')
            : false;
          if (!_canUpdateFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: t('確定'),
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('moveFolder')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        type: 'delete',
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除'),
        onPress: () => {
          const _canDeleteFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'first-folder-delete')
            : false;
          if (!_canDeleteFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: t('確定'),
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('deleteFolder')
          setFileFolderCRUDModalVisible(true)
        },
      }
    ])
  }
  const $_setBottomSheetItems003 = () => {
    setBottomSheetItems003([
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('編輯'),
        onPress: () => {
          const _canEditFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'file-update')
            : false;
          if (!_canEditFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: t('確定'),
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('editFile')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('移動'),
        onPress: () => {
          const _canUpdateFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'file-update')
            : false;
          if (!_canUpdateFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: t('確定'),
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('moveFile')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        type: 'delete',
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除'),
        onPress: () => {
          const _canDeleteFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'file-delete')
            : false;
          if (!_canDeleteFolder) {
            Alert.alert(t('您無此權限'), '',
              [
                {
                  text: '確定',
                  onPress: () => console.log('OK Pressed')
                },
              ]
            )
            return
          }
          setActionType('deleteFile')
          setFileFolderCRUDModalVisible(true)
        },
      }
    ])
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    $_setBottomSheetItems002()
    $_setBottomSheetItems003()
  }, [_folderScope])


  return (
    <>
      <WsPageIndex
        modelName={'file_folder'}
        serviceIndexKey={'indexToShare'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={
          {
            search_type: 'file',
            order: {
              order_by: 'created_at',
              order_way: 'desc',
            }
          }
        }
        searchVisible={false}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <LlFileFolderCard
              item={item}
              tab={'tab2'}
              setParentFileFolder={setFileFolder}
              setFolderScope={setFolderScope}
              setIsBottomSheetActive002={setIsBottomSheetActive002}
              setIsBottomSheetActive003={setIsBottomSheetActive003}
              setParentFile={setFile}
            ></LlFileFolderCard>
          )
        }}
      >
      </WsPageIndex>

      {/* 編輯/移動/刪除 資料夾 */}
      <WsBottomSheet
        isActive={isBottomSheetActive002}
        onDismiss={() => {
          setIsBottomSheetActive002(false)
        }}
        items={bottomSheetItems002}
        snapPoints={['25%', '28%']}
        onItemPress={$_onBottomSheetItemPress}
        underlayColor={$color.primary11l}
      />
      {/* 編輯/移動/刪除 檔案資訊 */}
      <WsBottomSheet
        isActive={isBottomSheetActive003}
        onDismiss={() => {
          setIsBottomSheetActive003(false)
        }}
        items={bottomSheetItems003}
        snapPoints={['25%', '28%']}
        onItemPress={$_onBottomSheetItemPress}
        underlayColor={$color.primary11l}
      />

      {/* Modal */}
      {fileFolderCRUDModalVisible && (
        <LlFileFolderCRUDModal
          tab={'tab2'}
          isVisible={fileFolderCRUDModalVisible}
          onClose={() => {
            setFileFolderCRUDModalVisible(false)
          }}
          actionType={actionType}
          title={
            (actionType === 'edit' || actionType === 'create') ? t('編輯資料夾') :
              actionType === 'createFile' ? '' :
                actionType === 'editFile' ? t('編輯檔案') :
                  ''
          }
          fields={
            (actionType === 'edit' || actionType === 'create') ? fields :
              actionType === 'createFile' ? fieldsForCreateFile :
                actionType === 'editFile' ? fieldsForEditFile :
                  {}
          }
          value={
            actionType === 'create' ? fileFolder :
              actionType === 'edit' ? fileFolder :
                actionType === 'deleteFolder' ? fileFolder :
                  actionType === 'moveFolder' ? fileFolder :
                    actionType === 'moveFile' ? _file :
                      actionType === 'createFile' ? { file_folder: file_folder } :
                        actionType === 'editFile' ? _file :
                          actionType === 'deleteFile' ? _file : null
          }
          currentFolder={fileFolder}
          remind={
            actionType === 'edit' ? t('請注意，當您將資料夾設為機密，只有權限人員可看到此資料夾名稱') :
              actionType === 'moveFolder' ? t('請注意，當您移動本資料夾位置後，資料夾權限可能發生變化。') :
                actionType === 'moveFile' ? t('請注意，當您移動本檔案位置後，檔案瀏覽權限可能發生變化。') : null
          }
          remindColor={
            actionType === 'moveFolder' || actionType === 'moveFile' ? $color.danger : $color.gray
          }
          remind1={
            actionType === 'edit' ? t('請注意，當您將資料夾共享至其他單位，將共享此資料夾下的所有檔案，但不會共享子資料夾') : null
          }
          remind1Color={
            actionType === 'moveFolder' ? $color.danger : $color.gray
          }
          remind2={
            actionType === 'edit' ? t('請注意，當您將資料夾共享至其他單位，非本單位只能唯讀') : null
          }
        ></LlFileFolderCRUDModal >
      )}
    </>
  )
}

export default FileStoreTab2