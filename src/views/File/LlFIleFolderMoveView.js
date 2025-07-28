import React, { useState } from 'react'
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native'
import {
  WsIconBtn,
  WsStateForm,
  WsBtn,
  WsPageScrollView,
  WsFlex,
  LlPopupAlert,
  WsGradientButton,
  WsText,
  WsIcon,
  WsState,
  WsPageIndex,
  WsCard,
  WsInfo
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_Validator from '@/__reactnative_stone/services/validator'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import FileStoreTab1 from '@/views/File/FileStoreTab1'
import S_FileFolder from '@/services/api/v1/file_folder'
import S_File from '@/services/api/v1/file'

const LlFIleFolderMoveView = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    value,
    onChange,
    onClose,
    actionType,
    remind,
    remindColor,
    remind1,
    remind1Color,
    currentFolder
  } = props

  // STATES
  const [isSubmittable, setIsSubmittable] = useState(false)
  const [popupAlertVisible, setPopupAlertVisible] = useState(false)

  const [currentFileFolder, setCurrentFileFolder] = React.useState(currentFolder)
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState();
  const [params, setParams] = React.useState({
    lang: 'tw',
    order_by: 'created_at',
    order_way: 'desc',
  })
  const [searchValue, setSearchValue] = React.useState(null)

  // Services
  const $_fileFolderMove = async () => {
    if (actionType === 'moveFolder') {
      try {
        const _params = {
          to_path: currentFileFolder && currentFileFolder.id ? currentFileFolder.id : "",
          now_path: value.id
        }
        const res = await S_FileFolder.updatePath({ params: _params })
        if (res) {
          navigation.replace('FileStore')
        }
      } catch (e) {
        console.error(e);
      }
    } else if (actionType === 'moveFile') {
      try {
        const _params = {
          to_path: currentFileFolder && currentFileFolder.id ? currentFileFolder.id : "",
          now_path: value.id
        }
        const res = await S_File.updatePath({ params: _params })
        if (res) {
          navigation.replace('FileStore')
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  // helper
  const removeLastSlashSegment = (path) => {
    if (!path.includes('/')) {
      return '最上層';
    }
    const lastSlashIndex = path.lastIndexOf('/');
    return `最上層/${path.substring(0, lastSlashIndex)}`;
  }

  // Breadcrumbs
  const generateBreadcrumbs = (folderPath, folderUuidPath, folderId) => {
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
        uuid: uuids[index],
      };
    });
    return breadcrumbs;
  }
  // handleBreadcrumbPress
  const handleBreadcrumbPress = (index) => {
    const updatedBreadcrumbs = currentBreadcrumbs.slice(0, index + 1);
    setCurrentBreadcrumbs(updatedBreadcrumbs);
    const crumb = updatedBreadcrumbs[index];
    setParams({
      lang: "tw",
      order_by: "created_at",
      order_way: "desc",
      file_folder: crumb.uuid,
    })
  };

  React.useEffect(() => {
    if (currentFileFolder && currentFileFolder.folder_path && currentFileFolder.folder_uuid_path) {
      const breadcrumbs = generateBreadcrumbs(currentFileFolder.folder_path, currentFileFolder.folder_uuid_path, currentFileFolder.id);
      setCurrentBreadcrumbs(breadcrumbs)
    }
  }, [currentFileFolder]);

  return (
    <>
      {value && (
        <WsText
          style={{
            paddingHorizontal: 16,
          }}
          color={$color.black}
          size={18}
          fontWeight={500}
        >
          {`移動「${value.name}」位置`}
        </WsText>
      )}

      {
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 8
          }}
        >
          <WsText
            color={$color.black}
            size={14}
            fontWeight={600}
          >{actionType === 'moveFolder' ? t('目前資料夾所在位置') : t('目前檔案所在位置')}
          </WsText>
          <WsFlex
            style={{
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              disabled={true}
              onPress={() => {
              }}
            >
              <WsText color={$color.black} size={14}>{t('最上層')}</WsText>
            </TouchableOpacity>
            {currentBreadcrumbs && currentBreadcrumbs.map((crumb, index) => (
              <>
                <WsText color={$color.primary}>{' / '}</WsText>
                <TouchableOpacity
                  onPress={() => {
                    handleBreadcrumbPress(index)
                  }}
                  style={{
                    // borderWidth:1,
                  }}
                >
                  <WsText color={$color.black} size={14}>{crumb.name}</WsText>
                </TouchableOpacity>
              </>
            ))}
          </WsFlex>


          <WsText color={$color.black} size={14} fontWeight={600}>{'移動至'}</WsText>
          <WsFlex
            style={{
              flexWrap: 'wrap',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setCurrentBreadcrumbs([])
                setParams({
                  lang: "tw",
                  order_by: "created_at",
                  order_way: "desc",
                })
                setCurrentFileFolder(null)
              }}
            >
              <WsText color={$color.primary} size={14}>{'最上層'}</WsText>
            </TouchableOpacity>
            {currentBreadcrumbs && currentBreadcrumbs.map((crumb, index) => (
              <>
                <WsText color={$color.primary}>{' / '}</WsText>
                <TouchableOpacity
                  onPress={() => {
                    handleBreadcrumbPress(index)
                  }}
                >
                  <WsText color={$color.primary} size={14}>{crumb.name}</WsText>
                </TouchableOpacity>
              </>
            ))}
          </WsFlex>
        </View>
      }

      {remind && (
        <TouchableOpacity
          style={{
            marginTop: 8,
            marginRight: 16,
            paddingHorizontal: 16,
            flexWrap: 'wrap'
          }}
          onPress={() => { }}
        >
          <WsFlex
            style={{
            }}
          >
            <WsIcon
              name="md-info-outline"
              color={remindColor}
              style={{
                marginRight: 6
              }}
              size={16}
            />
            <WsText
              style={{
                paddingRight: 16
              }}
              size={12}
              color={remindColor}>
              {remind}
            </WsText>
          </WsFlex>
        </TouchableOpacity>
      )}

      <WsState
        style={{
          marginTop: 8,
          paddingHorizontal: 16,
          marginBottom: 8
        }}
        label={t('選擇資料夾位置')}
        type="search"
        rules='required'
        placeholder={t('搜尋資料夾名稱')}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e)
          setParams({
            lang: 'tw',
            order_by: 'created_at',
            order_way: 'desc',
            search: e,
          })
        }}
      />

      <WsPageIndex
        modelName={'file_folder'}
        serviceIndexKey={'indexAll'}
        params={params}
        filterVisible={false}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <TouchableOpacity
                onPress={() => {
                  setCurrentFileFolder(item)
                  setParams({
                    lang: "tw",
                    order_by: "created_at",
                    order_way: "desc",
                    file_folder: item.id
                  })
                }}
              >
                <WsCard style={[
                  {
                    paddingBottom: 8,
                    paddingTop: 16
                  }
                ]}
                >
                  <View
                    style={{
                      flexDirection: 'column',
                      flexWrap: 'nowrap',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}>
                    {item && item.name && (
                      <WsText
                        style={{
                          marginTop: 8
                        }}>
                        {t(item.name) ? t(item.name) : item.name}
                      </WsText>
                    )}
                  </View>
                </WsCard>
              </TouchableOpacity>
            </>
          )
        }}
      >
      </WsPageIndex>

      <WsFlex
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: $color.white,
            paddingHorizontal: 16,
            paddingVertical: 9,
            borderColor: $color.gray,
            borderRadius: 25,
            borderWidth: 1,
            width: 110,
            alignItems: 'center',
            height: 48
          }}
          onPress={() => {
            setPopupAlertVisible(true)
          }}>
          <WsText
            style={{
              padding: 1
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
            $_fileFolderMove()
          }}>
          {t('確定')}
        </WsGradientButton>
      </WsFlex>

      <LlPopupAlert
        text={t('確定捨棄嗎？')}
        leftBtnText={t('取消')}
        rightBtnText={t('確定')}
        visible={popupAlertVisible}
        onClose={() => {
          setPopupAlertVisible(false)
        }}
        onPressEnter={() => {
          onClose()
        }}
      >
      </LlPopupAlert>
    </>
  )
}

export default LlFIleFolderMoveView