import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  Alert
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
  WsIconBtn,
  WsBottomSheet,
  WsIcon,
  WsInfo,
  WsState,
  LlFileFolderCard
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import LlFileFolderCRUDModal from './LlFileFolderCRUDModal'
import S_FileFolder from '@/services/api/v1/file_folder'

const FileStoreTab1 = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // 檔案庫資料夾權限流程
  const hasPermission = (folderScope = [], permission) => {
    if (Array.isArray(folderScope)) {
      return folderScope.includes(permission);
    }
    return false;
  }

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // Fields
  const fields = {
    name: {
      label: t('名稱'),
      rules: 'required',
      placeholder: t('輸入')
    },
    is_public: {
      label: t('開放所有人員瀏覽'),
      type: 'checkbox',
      checkboxText: t('開放'),
      updateValueOnCheckboxChange: ($event, value, fields) => {
        if ($event) {
          fields.is_secret.disabled = true
          return {
            is_secret: 0
          }
        } else if (!$event) {
          fields.is_secret.disabled = false
          return {
            is_secret: 1
          }
        }
      },
    },
    is_secret: {
      label: t('機密'),
      type: 'radio',
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 },
      ],
      rules: 'required',
    },
    users: {
      type: 'belongstomany',
      label: t('檢閱權限-依成員'),
      placeholder: t('選擇'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      hasMeta: true,
      parentId: factory ? factory.id : null,
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
      displayCheck(fieldsValue) {
        if (fieldsValue.is_public) {
          return false
        } else {
          return true
        }
      }
    },
    file_folder_with_role: {
      type: 'multipleBelongstomany',
      label: t('權限-依角色'),
      placeholder: t('選擇'),
      nameKey: 'name',
      innerLabel: ['自訂角色'],
      modelName: ['user_role'],
      serviceIndexKey: 'IndexByFile',
      rules: 'required',
      hasMeta: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      searchBarVisible: true,
    },
    share_factories: {
      type: 'belongstomany002',
      label: t('分享至其他單位'),
      placeholder: t('選擇'),
      nameKey: 'name',
      modelName: 'factory',
      serviceIndexKey: 'indexAllRelated',
      parentId: factory ? factory.id : null,
    },
  }

  // STATES
  const [fileFolderCRUDModalVisible, setFileFolderCRUDModalVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [actionType, setActionType] = React.useState('')
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
  const [_folderScope, setFolderScope] = React.useState()
  const [isBottomSheetActive002, setIsBottomSheetActive002] = React.useState(false)
  const [bottomSheetItems002, setBottomSheetItems002] = React.useState([])
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState();
  const [fileFolder, setFileFolder] = React.useState()
  const [fileFolderId, setFileFolderId] = React.useState()

  // Services
  const $_fetchFileFolder = async (id) => {
    try {
      const _res = await S_FileFolder.show({ modelId: id });
      const _formattedForFields = S_FileFolder.getFormattedForField(_res)
      setFileFolder(_formattedForFields);
    } catch (error) {
      console.error(error);
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              testID={'md-add'}
              name="md-add"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                setIsBottomSheetActive(!isBottomSheetActive)
              }}
            />
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
  // BottomSheetModal
  const $_setBottomSheet = () => {
    setBottomSheetItems([
      {
        onPress: () => {
          setActionType('create')
          setFileFolderCRUDModalVisible(true)
        },
        icon: 'md-add',
        label: t('新增資料夾')
      },
    ])
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
        onPress: async () => {
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
          } else if (_canEditFolder) {
            await $_fetchFileFolder(fileFolderId)
            setActionType('edit')
            setFileFolderCRUDModalVisible(true)
          }
        },
      },
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('移動'),
        onPress: async () => {
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
          await $_fetchFileFolder(fileFolderId)
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

  React.useEffect(() => {
    $_setNavigationOption()
    $_setBottomSheet()
  }, [isBottomSheetActive])

  React.useEffect(() => {
    $_setBottomSheetItems002()
  }, [_folderScope, fileFolderId])

  return (
    <>
      <WsPageIndex
        modelName={'file_folder'}
        serviceIndexKey={'indexWithFile'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={
          {
            search_type: 'file',
            order: {
              order_way: 'desc',
              order_by: 'created_at',
            }
          }
        }
        searchVisible={false}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <LlFileFolderCard
              testID={`LlFileFolderCard-${index}`}
              item={item}
              setIsBottomSheetActive002={setIsBottomSheetActive002}
              setFileFolderId={setFileFolderId}
              tab={'tab1'}
              setFolderScope={setFolderScope}
            ></LlFileFolderCard>
          )
        }}
      >
      </WsPageIndex >

      {/* 建立資料夾 */}
      < WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        snapPoints={useMemo(() => ['25%', '12.5%'], [])}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />

      {/* Modal */}
      {fileFolderCRUDModalVisible && (
        <LlFileFolderCRUDModal
          isVisible={fileFolderCRUDModalVisible}
          onClose={() => {
            setFileFolderCRUDModalVisible(false)
          }}
          fields={fields}
          actionType={actionType}
          title={
            actionType === 'edit' ? t('編輯資料夾') : ''
          }
          value={
            actionType === 'edit' ? fileFolder :
              actionType === 'moveFolder' ? fileFolder :
                actionType === 'deleteFolder' ? fileFolder : null
          }
          remind={
            actionType === 'edit' ? t('請注意，當您將資料夾設為機密，只有權限人員可看到此資料夾名稱') :
              actionType === 'moveFolder' ? t('請注意，當您移動本資料夾位置後，資料夾權限可能發生變化。') : null
          }
          remindColor={
            actionType === 'moveFolder' ? $color.danger : $color.gray
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
      )
      }

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
    </>
  )
}

export default FileStoreTab1