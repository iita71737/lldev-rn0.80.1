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
  WsText,
  WsDes,
  WsCard,
  WsIconBtn,
  WsBottomSheet,
  WsIcon,
  WsInfo,
  WsState,
  WsPopup,
  WsLoading,
  WsTag
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_FileFolder from '@/services/api/v1/file_folder'
import S_File from '@/services/api/v1/file'

const LlFileFolderCard002 = ({
  item,
  setIsBottomSheetActive002,
  fileFolderId,
  setFileFolderId,
  setIsBottomSheetActive003,
  setParentFile,
  moreBtnVisible = true,
  tab,
  setFolderScope,
  testID
}) => {
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

  // STATES
  const [visible, setVisible] = React.useState(false)
  const [fileFolder, setFileFolder] = React.useState()
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState();

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
  const $_fetchFile = async (id) => {
    try {
      const _res = await S_File.show({ modelId: id })
      if (_res) {
        const _formattedRes = S_File.formattedSelectedFileForFields(_res)
        setParentFile(_formattedRes)
      }
    } catch (e) {
      console.error(e);
    }
  }
  // 檔案庫資料夾權限流程
  const $_checkFolderUserScope = async (folderId) => {
    try {
      const _params = {
        file_folder_id: folderId
      }
      const apiResponse = await S_FileFolder.getUserScope({ params: _params })
      if (apiResponse) {
        return apiResponse
      }
    } catch (e) {
      Alert.alert('取得資料夾權限異常')
      console.error(e);
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
  const breadcrumbs = useMemo(() => {
    const {
      folder_path,
      folder_uuid_path,
      file_path,
      file_uuid_path
    } = item;
    const folders = folder_path ? folder_path.split('/').slice(0, -1) : [];
    const folders_uuids = folder_uuid_path ? folder_uuid_path.split('/').slice(0, -1) : [];
    const files = file_path ? file_path.split('/').slice(0, -1) : [];
    const file_uuids = file_uuid_path ? file_uuid_path.split('/').slice(0, -1) : [];
    if ((folders.length !== folders_uuids.length) || (files.length !== file_uuids.length)) {
      return [];
    }
    if (folders.length > 0) {
      return folders.map((folder, index) => ({
        name: folder,
        uuid: folders_uuids[index],
      }));
    } else if (files.length > 0) {
      return files.map((file, index) => ({
        name: file,
        uuid: file_uuids[index],
      }));
    }
    return [];
  }, [item.folder_path, item.folder_uuid_path, item.file_path, item.file_uuid_path]);

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

  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={{
          paddingTop: 8,
        }}
        onPress={async () => {
          if (item.is_secret && !item.name) {
            Alert.alert(t('您無此權限'))
            return
          }
          if (item.type === 'file_folder' && tab !== 'tab4') {
            const _folderScope = await $_checkFolderUserScope(item.id)
            if (!_folderScope.has_read) {
              Alert.alert(t('您無此權限'))
              return
            }
            navigation.push('FileStoreSubLayer', {
              file_folder: item.id,
              name: item.name,
              folder_path: item.folder_path,
              folder_uuid_path: item.folder_uuid_path,
              tab: tab,
              folderScope: tab === 'tab1' ? _folderScope : undefined
            })
          } else if (item.type === 'file_folder' && tab === 'tab4') {
            const _folderScope = await $_checkFolderUserScope(item.id)
            const _canRead = _folderScope && Array.isArray(_folderScope.scopes)
              ? hasPermission(_folderScope.scopes, 'system-file-read')
              : false;
            if (!_canRead) {
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
            navigation.push('FileStoreSubLayer', {
              file_folder: item.id,
              name: item.name,
              folder_path: item.folder_path,
              folder_uuid_path: item.folder_uuid_path,
              tab: tab,
              folderScope: _folderScope ? _folderScope : undefined
            })
          } else {
            navigation.push('FileStoreShow', {
              id: item.id
            })
          }
        }}
      >
        <WsCard
          style={[
            {
            }
          ]}
        >

          <View
            style={{
              flexDirection: 'column',
              flexWrap: 'nowrap',
              justifyContent: 'center',
            }}>
            <WsFlex
              justifyContent={'space-between'}
              style={{

              }}
            >
              <WsFlex
                justifyContent="space-between"
              >
                {item.file_type ? (
                  <Image
                    style={{
                      width: 32,
                      height: 32,
                    }}
                    source={$_getFileTypeImage(item.file_type?.toLowerCase())}
                  />
                ) : (
                  <WsIcon
                    color={$color.black}
                    name={item.is_secret ? 'md-folder_lock' : 'md-folder-open'}
                    size={30}
                  />
                )}

                {item.is_invalid === 1 && (
                  <WsTag
                    icon={'md-archive'}
                    iconColor={$color.danger}
                    textColor={$color.danger}
                    backgroundColor={$color.danger11l}
                    style={{
                      width: 'auto',
                      margin: 2
                    }}>
                    {t('作廢')}
                  </WsTag>
                )}
              </WsFlex>

              <WsFlex>
                {!item.file_type &&
                  (item.name) &&
                  ((tab === 'tab1') || (tab === 'tab2') || (tab === 'tab4' && item.type === 'file')) && (
                    <WsIconBtn
                      testID={'md-info-outline'}
                      size={24}
                      name={"md-info-outline"}
                      onPress={async () => {
                        if (item.is_secret && !item.name) {
                          Alert.alert(t('您無此權限'))
                          return
                        }
                        const _folderScope = await $_checkFolderUserScope(item.id)
                        if (!_folderScope.has_read) {
                          Alert.alert(t('您無此權限'))
                          return
                        }
                        $_fetchFileFolder(item.id)
                        setVisible(true)
                      }}
                    >
                    </WsIconBtn>
                  )}
                {moreBtnVisible &&
                  (item.name) &&
                  ((tab === 'tab1') || (tab === 'tab2') || (tab === 'tab4' && item.type === 'file')) && (
                    <WsIconBtn
                      testID={'md-more-vert'}
                      size={24}
                      name={"md-more-vert"}
                      onPress={async () => {
                        const folders = item.file_uuid_path ? item.file_uuid_path.split('/')[0] : undefined
                        const _folderScope = await $_checkFolderUserScope(item.type === 'file_folder' ? item.id : fileFolderId ? fileFolderId : folders)
                        const _isFirstLayerFolder = item.type === 'file_folder' && item.folder_uuid_path && !item.folder_uuid_path.includes('/') ? true : false
                        setFolderScope(_folderScope)
                        if (item.type === 'file_folder') {
                          if (_isFirstLayerFolder) {
                            setFileFolderId(item.id)
                          }
                          setIsBottomSheetActive002(true)
                        } else if (item.type === 'file') {
                          $_fetchFile(item.id)
                          setIsBottomSheetActive003(true)
                        }
                      }}
                    >
                    </WsIconBtn>
                  )}
              </WsFlex>

            </WsFlex>
            {item && item.name ? (
              <WsText
                style={{
                  marginTop: 8
                }}>
                {t(item.name)}
              </WsText>
            ) : (
              <WsText
                style={{
                  marginTop: 8
                }}>
                {t('無權限')}
              </WsText>
            )}
          </View>

          {breadcrumbs && (
            <WsFlex
              style={{
                marginTop: 8
              }}
            >
              <WsText
                size={12}
                fontWeight={300}
                style={{
                  marginRight: 16,
                  width: 70,
                }}
              >
                {t('路徑')}
              </WsText>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  // maxWidth: width * 0.4,
                  flex: 1
                }}
              >
                <TouchableOpacity
                  disabled={true}
                >
                  <WsText color={$color.black} size={12}>{'最上層'}</WsText>
                </TouchableOpacity>
                {breadcrumbs.map((crumb, index) => (
                  <>
                    <WsText color={$color.black}>{' / '}</WsText>
                    <TouchableOpacity
                      style={{
                      }}
                      disabled={true}
                      onPress={() => {
                      }}
                    >
                      <WsText color={$color.black} size={12}>{crumb.name}</WsText>
                    </TouchableOpacity>
                  </>
                ))}
              </View>
            </WsFlex>
          )}

          {item.version_number && (
            <WsInfo
              labelWidth={75}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              value={item.version_number}
              label={t('版本')}
              labelSize={12}
              labelFontWeight={300}
            />
          )}

          {item.created_user &&
            item.created_user.length > 0 && (
              <WsInfo
                labelWidth={75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
                type={'user'}
                label={t('上傳者')}
                labelSize={12}
                labelFontWeight={300}
                value={item.created_user ? item.created_user : t('無')}
              />
            )}

          <WsInfo
            testID={item.updated_at ? undefined : `建立時間`}
            labelWidth={75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              // marginTop: 4
            }}
            labelSize={12}
            labelFontWeight={300}
            label={t('建立時間')}
            value={item.created_at ? moment(item.created_at) : '無'}
            type={item.created_at ? "dateTime" : 'text'}
          />

          <WsInfo
            testID={item.updated_at ? undefined : `更新時間`}
            labelWidth={75}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 4
            }}
            labelSize={12}
            labelFontWeight={300}
            label={t('更新時間')}
            value={item.updated_at ? moment(item.updated_at) : '無'}
            type={item.updated_at ? "dateTime" : "text"}
          />

        </WsCard>
      </TouchableOpacity>

      <WsPopup
        active={visible}
        onClose={() => {
          setVisible(false)
        }}>
        <View
          style={{
            maxHeight: height * 0.875,
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <ScrollView>
            <WsFlex
              justifyContent={'space-between'}
              style={{
              }}
            >
              <WsText size={18}>{'資料夾資訊'}</WsText>
              <WsIconBtn
                padding={0}
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
                {fileFolder.is_secret === 1 && (
                  <View
                    style={{
                      width: 60,
                      marginTop: 8
                    }}
                  >
                    <WsTag
                      icon={'md-lock'}
                      iconColor={$color.danger}
                      textColor={$color.danger}
                      backgroundColor={$color.danger11l}
                      style={{
                      }}>
                      {t('機密')}
                    </WsTag>
                  </View>
                )}

                <WsInfo
                  labelWidth={150}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                    maxWidth: width * 0.4
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

                {fileFolder.users &&
                  fileFolder.users.length > 0 && (
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
                  )}

                {fileFolder.file_folder_with_role &&
                  fileFolder.file_folder_with_role.length > 0 && (
                    <WsInfo
                      type={'belongstomany'}
                      labelWidth={150}
                      style={{
                        flexDirection: 'row',
                        marginTop: 4,
                      }}
                      labelSize={12}
                      labelFontWeight={300}
                      valueFontSize={12}
                      valueMaxWidth={width / 2.5}
                      label={t('權限-依角色')}
                      value={fileFolder.file_folder_with_role}
                    />
                  )}

                <WsInfo
                  labelWidth={150}
                  style={{
                    flexDirection: 'row',
                    marginTop: 4,
                    maxWidth: width * 0.4,
                  }}
                  labelSize={12}
                  labelFontWeight={300}
                  label={t('路徑')}
                  value={`${removeLastSlashSegment(fileFolder.folder_path)}`}
                />

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
                      valueFontSize={12}
                      label={t('分享至其他單位')}
                      value={fileFolder.share_factories}
                    />
                  )}

              </>
            ) : (
              <WsLoading></WsLoading>
            )}
          </ScrollView>

        </View>
      </WsPopup >
    </>
  )
}

export default LlFileFolderCard002