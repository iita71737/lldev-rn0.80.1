import React, { useState, useMemo } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
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
  WsInfo,
  WsIcon,
  WsSubtaskCard,
  WsPopup,
  WsLoading,
  LlFileFolderCard
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_FileFolder from '@/services/api/v1/file_folder'
import S_File from '@/services/api/v1/file'
import LlFileFolderCRUDModal from './LlFileFolderCRUDModal'

const FileStoreSubLayer = ({ route }, props) => {
  const { t } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentActStatus = useSelector(state => state.data.actStatus)

  // Props
  const {
    file_folder,
    name,
    folder_path,
    folder_uuid_path,
    breadcrumbs,
    tab,
    folderScope,
  } = route.params

  // 權限判斷
  const hasPermission = (folderScope = [], permission) => {
    if (Array.isArray(folderScope)) {
      return folderScope.includes(permission);
    }
    return false;
  }
  const _canCreateFolder = folderScope && Array.isArray(folderScope.scopes)
    ? hasPermission(folderScope.scopes, 'other-folder-create')
    : false;
  const _canCreateFile = folderScope && Array.isArray(folderScope.scopes)
    ? hasPermission(folderScope.scopes, 'file-create')
    : false;

  // Fields
  const fields = {
    name: {
      label: t('名稱'),
      rules: 'required',
      placeholder: t('輸入'),
      editable: actionType === 'edit' ? false : true,
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
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      hasMeta: true,
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
      nameKey: 'name',
      modelName: 'factory',
      serviceIndexKey: 'indexAllRelated',
      parentId: factory ? factory.id : null,
    },
  }

  const fieldsForCreateFile = {
    name: {
      label: t('標題'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    des: {
      label: t('版本說明'),
      placeholder: t('輸入'),
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
    file_attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadToFileStore: true,
      oneFile: true,
      rules: 'required',
      modelName: 'file'
    }
  }

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

  // STATES
  const [_folderScope, setFolderScope] = React.useState()
  const [visible, setVisible] = React.useState(false)
  const [fileFolder, setFileFolder] = React.useState(file_folder ?
    {
      id: file_folder,
      name: name,
      folder_path: folder_path,
      folder_uuid_path: folder_uuid_path
    } : {}
  )
  const [fileFolderCRUDModalVisible, setFileFolderCRUDModalVisible] = React.useState(false)
  const [actionType, setActionType] = React.useState('')
  const [isBottomSheetActive002, setIsBottomSheetActive002] = React.useState(false)
  const [bottomSheetItems002, setBottomSheetItems002] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState(breadcrumbs);
  const [params, setParams] = React.useState({
    lang: "tw",
    order_by: "created_at",
    order_way: "desc",
    file_folder: file_folder
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
            label: i18next.t('標題'),
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
      time_field: 'created_at'
    },
    order_way: {
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
            label: i18next.t('依期限由舊至新'),
            value: {
              order_way: 'asc',
              order_by: 'expired_at'
            }
          },
          {
            label: i18next.t('依完成度由低至高'),
            value: {
              order_way: 'desc',
              order_by: 'completion_degree'
            }
          }
        ]
    }
  })
  const [_file, setFile] = React.useState()
  const [isBottomSheetActive003, setIsBottomSheetActive003] = React.useState(false)
  const [bottomSheetItems003, setBottomSheetItems003] = React.useState([])

  // FUNCTION
  const $_fetchFileFolder = async (id) => {
    try {
      const _res = await S_FileFolder.show({ modelId: id })
      const _formattedForFields = S_FileFolder.getFormattedForField(_res)
      setFileFolder(_formattedForFields)
    } catch (e) {
      console.error(e);
    }
  }
  const $_fetchFile = async (id) => {
    try {
      const _res = await S_File.show({ modelId: id })
      if (_res) {
        const _formattedRes = S_File.formattedSelectedFileForFields(_res)
        setFile(_formattedRes)
      }
    } catch (e) {
      console.error(e);
    }
  }
  const $_onBottomSheetItemPress = item => {
    item.onPress()
  }

  // helper
  const generateBreadcrumbs = (path, uuidPath) => {
    if (!path || !uuidPath) {
      return [];
    }
    const folders = path.split('/');
    const uuids = uuidPath.split('/');
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
  const removeLastSlashSegment = (path) => {
    if (!path.includes('/')) {
      return '最上層';
    }
    const lastSlashIndex = path.lastIndexOf('/');
    return `最上層/${path.substring(0, lastSlashIndex)}`;
  }
  // FUNC
  const handleBreadcrumbPress = (index) => {
    const updatedBreadcrumbs = currentBreadcrumbs.slice(0, index + 1);
    setCurrentBreadcrumbs(updatedBreadcrumbs);
    const crumb = updatedBreadcrumbs[index];
    navigation.replace('FileStoreSubLayer', {
      file_folder: crumb.uuid,
      name: crumb.name,
      folder_path: folder_path,
      folder_uuid_path: folder_uuid_path,
      breadcrumbs: updatedBreadcrumbs,
      tab: tab
    });
  };

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        if ((_canCreateFolder || _canCreateFile) && tab === 'tab1') {
          return (
            <WsIconBtn
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
          );
        }
        return null;
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
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
        );
      }
    });
  }
  // BottomSheetModal
  const $_setBottomSheet = () => {
    const _bottomSheet = [
      _canCreateFolder &&
      {
        icon: 'md-add',
        label: t('新增資料夾'),
        onPress: () => {
          setActionType('create')
          setFileFolderCRUDModalVisible(true)
        },
      },
      _canCreateFile &&
      {
        icon: 'md-cloud-upload',
        label: t('新增檔案'),
        onPress: () => {
          setActionType('createFile')
          setFileFolderCRUDModalVisible(true)
        },
      },
    ]
    setBottomSheetItems(_bottomSheet)
  }
  // FileImage
  const $_getFileTypeImage = (fileType) => {
    if (fileType === 'pdf') {
      return require('@/__reactnative_stone/assets/img/pdf-pdf.png')
    } else if (fileType === 'jpg') {
      return require('@/__reactnative_stone/assets/img/image-jpg.png')
    } else if (fileType === 'gif') {
      return require('@/__reactnative_stone/assets/img/image-gif.png')
    } else if (fileType === 'jpeg') {
      return require('@/__reactnative_stone/assets/img/image-jpeg.png')
    } else if (fileType === 'bmp') {
      return require('@/__reactnative_stone/assets/img/image-bmp.png')
    } else if (fileType === 'svg') {
      return require('@/__reactnative_stone/assets/img/image-svg.png')
    } else if (fileType === 'tiff') {
      return require('@/__reactnative_stone/assets/img/image-tiff.png')
    } else if (fileType === 'webp') {
      return require('@/__reactnative_stone/assets/img/image-webp.png')
    } else if (fileType === 'png') {
      return require('@/__reactnative_stone/assets/img/image-png.png')
    } else if (fileType === 'pptx' || fileType === 'ppt') {
      return require('@/__reactnative_stone/assets/img/image-pptx.png')
    } else if (fileType === 'mp3') {
      return require('@/__reactnative_stone/assets/img/image-mp3.png')
    } else if (fileType === 'wav') {
      return require('@/__reactnative_stone/assets/img/image-wav.png')
    } else if (fileType === 'mp4') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mp4.png')
    } else if (fileType === 'avi') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-avi.png')
    } else if (fileType === 'mov') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mov.png')
    } else if (fileType === 'mkv') {
      return require('@/__reactnative_stone/assets/img/image-mkv.png')
    } else if (fileType === 'wmv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-wmv.png')
    } else if (fileType === 'txt') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-txt.png')
    } else if (fileType === 'doc') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-doc.png')
    } else if (fileType === 'docx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-docx.png')
    } else if (fileType === 'odt') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-odt.png')
    } else if (fileType === 'pages') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-pages.png')
    } else if (fileType === 'rtf') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-rtf.png')
    } else if (fileType === 'key') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-key.png')
    } else if (fileType === 'odp') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-odp.png')
    } else if (fileType === 'pps') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-pps.png')
    } else if (fileType === 'ppsx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-ppsx.png')
    } else if (fileType === 'csv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-csv.png')
    } else if (fileType === 'numbers') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-numbers.png')
    } else if (fileType === 'ods') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-ods.png')
    } else if (fileType === 'tsv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-tsv.png')
    } else if (fileType === 'xls') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xls.png')
    } else if (fileType === 'xlsx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xlsx.png')
    } else if (fileType === 'xml') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xml.png')
    } else {
      return require('@/__reactnative_stone/assets/img/other.png')
    }
  }

  const $_setBottomSheetItems002 = () => {
    setBottomSheetItems002([
      {
        type: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('編輯'),
        onPress: async () => {
          const _canEditFolder = _folderScope && Array.isArray(_folderScope.scopes)
            ? hasPermission(_folderScope.scopes, 'other-folder-update')
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
            await $_fetchFileFolder(file_folder)
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
            ? hasPermission(_folderScope.scopes, 'other-folder-update')
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
          await $_fetchFileFolder(file_folder)
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
            ? hasPermission(_folderScope.scopes, 'other-folder-delete')
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
    if (tab === 'tab1') {
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
                    text: t('確定'),
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
    } else if (tab === 'tab4') {
      setBottomSheetItems003([
        {
          type: 'delete',
          color: $color.danger,
          labelColor: $color.danger,
          icon: 'ws-outline-delete',
          label: t('刪除'),
          onPress: () => {
            const _canDeleteFolder = _folderScope && Array.isArray(_folderScope.scopes)
              ? hasPermission(_folderScope.scopes, 'system-file-delete')
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
            setActionType('deleteFile')
            setFileFolderCRUDModalVisible(true)
          },
        }
      ])
    }
  }

  React.useEffect(() => {
    if (!breadcrumbs) {
      const breadcrumbs = generateBreadcrumbs(folder_path, folder_uuid_path);
      setCurrentBreadcrumbs(breadcrumbs)
    }
  }, []);

  React.useEffect(() => {
    $_setNavigationOption()
    $_setBottomSheet()
  }, [isBottomSheetActive, folderScope])

  React.useEffect(() => {
    $_setBottomSheetItems002()
    $_setBottomSheetItems003()
  }, [_folderScope])

  return (
    <>
      <WsPageIndex
        modelName={'file_folder'}
        serviceIndexKey={tab === 'tab4' ? 'indexSystem' : tab === 'tab3' ? 'indexFromShare' : tab === 'tab2' ? 'indexToShare' : 'indexWithFile'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={
          {
            search_type: 'file',
            order: {
              order_way: 'desc',
              order_by: 'created_at'
            }
          }
        }
        searchVisible={false}
        ListHeaderComponent={() => {
          return (
            <View
              style={{
                padding: 16,
                flexDirection: 'row',
                flexWrap: 'wrap',
                maxWidth: width
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('FileStore')
                }}
              >
                <WsText color={$color.primary}>{'最上層'}</WsText>
              </TouchableOpacity>
              {currentBreadcrumbs && currentBreadcrumbs.map((crumb, index) => (
                <>
                  <WsText color={$color.primary}>{' > '}</WsText>
                  <TouchableOpacity
                    disabled={index === currentBreadcrumbs.length - 1 ? true : false}
                    onPress={() => {
                      handleBreadcrumbPress(index)
                    }}
                  >
                    <WsText color={index === currentBreadcrumbs.length - 1 ? $color.black : $color.primary}>{crumb.name}</WsText>
                  </TouchableOpacity>
                </>
              ))}
            </View>
          )
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlFileFolderCard
                testID={`LlFileFolderCard-${index}`}
                item={item}
                setIsBottomSheetActive002={setIsBottomSheetActive002}
                setParentFileFolder={setFileFolder}
                setIsBottomSheetActive003={setIsBottomSheetActive003}
                setParentFile={setFile}
                tab={tab}
                fileFolderId={file_folder}
                setFolderScope={setFolderScope}
              ></LlFileFolderCard>
            </>
          )
        }}
      >
      </WsPageIndex >

      {/* Modal */}
      {fileFolderCRUDModalVisible && (
        <LlFileFolderCRUDModal
          isVisible={fileFolderCRUDModalVisible}
          onClose={() => {
            setFileFolderCRUDModalVisible(false)
          }}
          actionType={actionType}
          title={
            (actionType === 'edit' || actionType === 'create') ? t('新增資料夾') :
              actionType === 'createFile' ? t('新增檔案') :
                actionType === 'editFile' ? t('編輯檔案') :
                  ''
          }
          fields={
            (actionType === 'edit' || actionType === 'create') ? fields :
              actionType === 'createFile' ? fieldsForCreateFile :
                actionType === 'editFile' ? fieldsForEditFile :
                  {}}
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
            (actionType === 'edit' || actionType === 'create') ? t('請注意，當您將資料夾設為機密，只有權限人員可看到此資料夾名稱') :
              actionType === 'moveFolder' ? t('請注意，當您移動本資料夾位置後，資料夾權限可能發生變化。') :
                actionType === 'moveFile' ? t('請注意，當您移動本檔案位置後，檔案瀏覽權限可能發生變化。') : null
          }
          remindColor={
            actionType === 'moveFolder' ? $color.danger : $color.gray
          }
          remind1={
            (actionType === 'edit' || actionType === 'create') ? t('請注意，當您將資料夾共享至其他單位，將共享此資料夾下的所有檔案，但不會共享子資料夾') : null
          }
          remind1Color={
            actionType === 'moveFolder' ? $color.danger : $color.gray
          }
          remind2={
            (actionType === 'edit' || actionType === 'create') ? t('請注意，當您將資料夾共享至其他單位，非本單位只能唯讀') : null
          }
        ></LlFileFolderCRUDModal >
      )}

      {/* 檔案資訊 */}
      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        snapPoints={useMemo(() => ['25%', '20%'], [])}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />

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

      {/* 資料夾資訊 */}
      <WsPopup
        active={visible}
        onClose={() => {
          setVisible(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16
          }}>
          <WsFlex
            justifyContent={'space-between'}
            style={{
            }}
          >
            <WsText size={18}>{'資料夾資訊'}</WsText>
            <WsIconBtn
              size={24}
              name={"md-close"}
              onPress={
                () => setVisible(false)
              }
            >
            </WsIconBtn>
          </WsFlex>

          {fileFolder ? (
            <>
              <WsInfo
                labelWidth={150}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4
                }}
                labelSize={12}
                labelFontWeight={300}
                label={t('名稱')}
                value={fileFolder.name}
              />
              <WsInfo
                labelWidth={150}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 4
                }}
                labelSize={12}
                labelFontWeight={300}
                label={t('開放所有人員瀏覽')}
                value={fileFolder.is_public ? t('是') : t('否')}
              />

              <WsInfo
                type={'users'}
                labelWidth={150}
                style={{
                  flexDirection: 'row',
                  marginTop: 4,
                  width: 150
                }}
                labelSize={12}
                labelFontWeight={300}
                label={t('檢閱權限-依成員')}
                value={fileFolder.users}
              />

              <WsInfo
                type={'belongstomany'}
                labelWidth={150}
                style={{
                  flexDirection: 'row',
                  marginTop: 4,
                }}
                labelSize={12}
                labelFontWeight={300}
                label={t('權限-依角色')}
                value={fileFolder.file_folder_with_role}
              />

              {fileFolder.folder_path && (
                <WsInfo
                  labelWidth={150}
                  style={{
                    flexDirection: 'row',
                    marginTop: 4,
                  }}
                  labelSize={12}
                  labelFontWeight={300}
                  label={t('路徑')}
                  value={`${removeLastSlashSegment(fileFolder.folder_path)}`}
                />
              )}

              {fileFolder.share_factories &&
                fileFolder.share_factories.length > 0 && (
                  <WsInfo
                    type={'belongstomany'}
                    labelWidth={150}
                    style={{
                      flexDirection: 'row',
                      marginTop: 4,
                      width: 150
                    }}
                    labelSize={12}
                    labelFontWeight={300}
                    label={t('分享至其他單位')}
                    value={fileFolder.share_factories}
                  />
                )}

            </>
          ) : (
            <WsLoading></WsLoading>
          )}
        </View>
      </WsPopup>
    </>
  )
}

export default FileStoreSubLayer