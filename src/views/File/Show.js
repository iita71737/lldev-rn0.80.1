import React, { useCallback, useMemo } from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsModal,
  WsVersionHistory,
  LlLicenseHeaderCard001,
  LlBtn002,
  WsCardPassage,
  WsIcon,
  WsBtn,
  WsStateInput,
  WsCollapsible,
  WsInfoUser,
  WsAvatar,
  WsState,
  WsTag,
  WsTabView,
  WsEmpty,
  LlPopupAlert
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import FileHistoryVersion from '@/views/File/FileHistoryVersion'
import FileActivityRecord from '@/views/File/FileActivityRecord'
import S_File from '@/services/api/v1/file'
import LlFileFolderCRUDModal from './LlFileFolderCRUDModal'
import FileInfo from '@/views/File/FileInfo'

const FileStoreShow = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentActStatus = useSelector(state => state.data.actStatus)


  // Fields
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

  const fieldsForUploadVersion = {
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
      },
    },
    file_attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadToFileStore: true,
      oneFile: true,
      rules: 'required'
    }
  }

  // States
  const [file, setFile] = React.useState()
  const [checkDeleteModalVisible, setCheckDeleteModalVisible] = React.useState(false)
  const [checkDeleteModalContent, setCheckDeleteModalContent] = React.useState('對此檔案無刪除權限，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')

  // Tabs
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'file_info',
      label: i18next.t('資訊'),
      view: FileInfo,
      props: {
      },
    },
    {
      value: 'file_history_version',
      label: i18next.t('歷史版本'),
      view: FileHistoryVersion,
      props: {
        file: id
      },
    },
    {
      value: 'file_activity_record',
      label: i18next.t('活動紀錄'),
      view: FileActivityRecord,
      props: {
        file: id
      },
    }
  ])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])

  const [actionType, setActionType] = React.useState('')
  const [fileFolderCRUDModalVisible, setFileFolderCRUDModalVisible] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState()

  // Function
  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'file_info',
        label: i18next.t('資訊'),
        view: FileInfo,
        props: {
          file: file
        },
      },
      {
        value: 'file_history_version',
        label: i18next.t('歷史版本'),
        view: FileHistoryVersion,
        props: {
          file: id
        },
      },
      {
        value: 'file_activity_record',
        label: i18next.t('活動紀錄'),
        view: FileActivityRecord,
        props: {
          file: id
        },
      }
    ])
  }

  // Services
  const $_fetchFile = async () => {
    const _res = await S_File.show({ modelId: id })
    setFile(_res)
    if (_res) {
      const _formattedRes = S_File.formattedSelectedFileForFields(_res)
      setSelectedFile(_formattedRes)
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: t('檔案'),
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              testID={'ws-outline-edit-pencil'}
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                setIsBottomSheetActive(true)
              }}
            />
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
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

  const $_setBottomSheet = () => {
    setBottomSheetItems([
      {
        icon: 'ws-outline-edit-pencil',
        label: t('上傳新版本'),
        onPress: () => {
          setActionType('uploadNewVersion')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        icon: 'md-update',
        label: t('移動'),
        onPress: () => {
          setActionType('moveFile')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        icon: 'ws-outline-edit-pencil',
        label: t('編輯'),
        onPress: () => {
          setActionType('editFile')
          setFileFolderCRUDModalVisible(true)
        },
      },
      {
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除'),
        onPress: () => {
          setActionType('deleteFile')
          setFileFolderCRUDModalVisible(true)
        },
      }
    ])
  }

  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  React.useEffect(() => {
    $_fetchFile()
  }, [route])

  React.useEffect(() => {
    $_setTabItems()
  }, [file])

  React.useEffect(() => {
    $_setNavigationOption()
    $_setBottomSheet()
  }, [isBottomSheetActive, file])

  return (
    <>

      <WsTabView
        index={tabIndex}
        scrollEnabled={true}
        setIndex={settabIndex}
        items={tabItems}
        isAutoWidth={true}
      />

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        snapPoints={useMemo(() => ['25%', '32.5%'], [])}
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
          actionType={actionType}
          title={
            actionType === 'edit' ? t('編輯資料夾') :
              actionType === 'create' ? t('新增資料夾') :
                actionType === 'createFile' ? t('新增檔案') :
                  actionType === 'editFile' ? t('編輯檔案') :
                    actionType === 'uploadNewVersion' ? t('上傳新版本') :
                      ''
          }
          fields={
            (actionType === 'edit' || actionType === 'create') ? fields :
              actionType === 'createFile' ? fieldsForCreateFile :
                actionType === 'editFile' ? fieldsForEditFile :
                  actionType === 'uploadNewVersion' ? fieldsForUploadVersion :
                    {}
          }
          value={
            actionType === 'moveFile' ? file :
              (actionType === 'editFile' || actionType === 'uploadNewVersion') ? selectedFile :
                actionType === 'deleteFile' ? file : null
          }
          currentFolder={file.file_folder}
          remind1={
            actionType === 'edit' ? t('請注意，當您將資料夾分享至其他單位，將分享此資料夾下的所有檔案，但不會分享子資料夾') :
              actionType === 'move' ? t('請注意，當您移動本資料夾位置後，資料夾權限可能發生變化。') : null
          }
          remind2={
            actionType === 'edit' ? t('請注意，當您將資料夾分享至其他單位，非本單位只能唯讀') : null
          }
          setCheckDeleteModalVisible={setCheckDeleteModalVisible}
          setCheckDeleteModalContent={setCheckDeleteModalContent}
        ></LlFileFolderCRUDModal >
      )}

      <LlPopupAlert
        text={checkDeleteModalContent}
        visible={checkDeleteModalVisible}
        leftBtnVisible={false}
        onClose={() => {
          setCheckDeleteModalVisible(false)
        }}
        onPressEnter={() => { }}
      >
      </LlPopupAlert>
    </>
  )
}

export default FileStoreShow


const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    flex: 0,
  },
  content: {
    paddingLeft: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a4a4a',
  },
  message: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1,
    color: '#808080',
  },
  time: {
    position: 'absolute',
    top: 19,
    right: 20,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1,
    color: '#808080',
  },
  count_container: {
    position: 'absolute',
    top: 42,
    right: 20,
    paddingHorizontal: 8,
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.8,
    textAlign: 'center',
    color: '#fff',
  },
});