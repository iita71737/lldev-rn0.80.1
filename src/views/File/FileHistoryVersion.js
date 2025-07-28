import React, { useState } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  Modal,
  Platform
} from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlActCard001,
  WsText,
  WsSkeleton,
  LlActLibrarySystemClassCard002,
  WsEmpty,
  WsIconBtn,
  WsFilter002,
  WsPageIndex,
  WsCard,
  WsDes,
  WsInfo,
  WsLoading,
  WsModalIconMessage,
  WsInfoFile
} from '@/components'
import moment from 'moment'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { CameraRoll } from '@react-native-camera-roll/camera-roll'
import RNFS from 'react-native-fs';
import FileViewer from "react-native-file-viewer";
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux'

const FileHistoryVersion = (props) => {
  const { t } = useTranslation()

  const {
    file,
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [downloaded, setDownloaded] = React.useState([])
  const [downloadSuccessModal, setDownloadedSuccessModal] = React.useState(false)
  const [onPressDownload, setOnPressDownload] = React.useState(false)

  const [filterFields] = React.useState({
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
      label: t('上傳日期'),
      time_field: 'created_at'
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
            label: i18next.t('依建立日期由遠至近'),
            value: {
              order_way: 'asc',
              order_by: 'created_at'
            }
          },
        ]
    }
  })

  const [params] = React.useState({
    lang: "tw",
    order_by: "created_at",
    order_way: "desc",
    file: file
  })

  // helper
  const getUrlExtension = (url) => {
    return url.split(/[#?]/)[0].split(".").pop().trim();
  }

  // Download
  const $_onSave = async (item) => {
    let _download_files = [...downloaded]
    if (['png', 'jpg', 'gif', 'jpeg', 'svg', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG', 'mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(item.file_type)) {
      try {
        CameraRoll.save(`${item.source_url}`, { type: "photo", album: "ESGoal-fileStore" })
          .then(res => {
            _download_files.push(item.id)
            setDownloaded(_download_files)
            setDownloadedSuccessModal(true)
            setTimeout(() => {
              setDownloadedSuccessModal(false)
            }, 500)
          })
      } catch (e) {
        Alert.alert('儲存失敗', e);
        setTimeout(() => {
          setDownloadedSuccessModal(false)
        }, 500)
      }
    } else {
      const extension = getUrlExtension(item.source_url);
      const url = item.source_url
      let filePath
      if (Platform.OS === 'ios') {
        filePath = RNFS.LibraryDirectoryPath + `/${item.name}`;
      } else {
        filePath = `${RNFS.DownloadDirectoryPath}/${item.name}`;
      }
      // Android權限請求
      if (Platform.OS === 'android') {
        let deviceVersion = DeviceInfo.getSystemVersion();
        let granted = PermissionsAndroid.RESULTS.DENIED;
        console.log(deviceVersion, 'deviceVersion');
        if (deviceVersion >= 13) {
          request(PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((result) => {
            // console.log(result,'result');
          });
        } else {
          granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        }
      }
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
        background: Platform.OS === 'ios' ? true : false, // Enable downloading in the background (iOS only)
        discretionary: Platform.OS === 'ios' ? true : false, // Allow the OS to control the timing and speed (iOS only)
        begin: (res) => {
          console.log('Download has begun with headers: ', res.headers);
        },
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Progress: ${progress.toFixed(2)}%`);
        },
      })
        .promise.then((result) => {
          if (result.statusCode == 200) {
            console.log('File downloaded successfully!');
            FileViewer.open(filePath)
              .then((res) => {
                // setIsProcessing(false);
              })
              .catch((error) => {
                console.error(error, 'FileViewer.open failed');
                if (error?.message) {
                  // setIsVisible(true)
                }
              });
          } else {
            console.log('Failed to download file:', result.statusCode);
          }
        })
        .catch((error) => {
          Alert.alert('Error:', error.message)
          console.error(error, 'RNFS.downloadFile failed');
          // setIsVisible(true)
        });
      // setIsProcessing(false);
    }
  }

  return (
    <>
      <Modal visible={downloadSuccessModal} animationType="fade" transparent={true}>
        <WsModalIconMessage
          visible={downloadSuccessModal}
          icon="ws-outline-check-circle-outline"
          text={t('已儲存')}
        />
      </Modal>

      <WsPageIndex
        modelName={'file_version'}
        serviceIndexKey={'index'}
        params={params}
        filterFields={filterFields}
        searchLabel={t('標題')}
        defaultFilterValue={
          {
            order: {
              order_way: 'desc',
              order_by: 'created_at'
            }
          }
        }
        renderItem={({ item, index, __params }) => {
          return (
            <TouchableOpacity
              disabled={true}
              onPress={() => {
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
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 999,
                  }}
                >
                  {onPressDownload ? (
                    <WsLoading></WsLoading>
                  ) : downloaded.includes(item.id) ? (
                    <WsText size={12}>{'已下載'}</WsText>
                  ) : (
                    <WsIconBtn
                      name={onPressDownload ? 'md-info' : 'ws-outline-cloud-download'}
                      color={$color.gray}
                      onPress={() => {
                        $_onSave(item)
                      }}
                      padding={0}
                      size={24}
                    />
                  )}
                </View>

                <View
                  style={{
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginBottom: 8,
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

                <WsInfo
                  labelWidth={75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  labelSize={12}
                  labelFontWeight={300}
                  label={t('版本')}
                  value={item.version_number}
                />

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

                <WsInfo
                  labelWidth={75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  labelSize={12}
                  labelFontWeight={300}
                  label={t('上傳時間')}
                  value={moment(item.created_at)}
                  type="dateTime"
                />

              </WsCard>
            </TouchableOpacity>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default FileHistoryVersion