import React from 'react'
import {
  Image,
  Dimensions,
  View,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native'
import { WsText, WsFlex, WsShadowCard, WsModalPreview, WsLoading, WsInfo } from '@/components'
import S_url from '@/__reactnative_stone/services/app/url'
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs'
import FileViewer from 'react-native-file-viewer'
import DeviceInfo from 'react-native-device-info'
import { request, PERMISSIONS } from 'react-native-permissions'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'

const WsInfoFile = props => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')

  // Props
  const {
    fileName,
    fileType,
    value,
    fileVersion,
    disabled,
    testID,
    exportAttachmentName
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [isVisible, setIsVisible] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isError, setIsError] = React.useState(false)

  const $_onRequestClose = () => setIsVisible(false)

  /** =========================
   *  Helpers (永遠不炸)
   *  ========================= */

  const isArray = (v: any) => Array.isArray(v)

  const getFirst = (v: any) => (isArray(v) ? v[0] : v)

  const getSourceUrl = (v: any): string => {
    if (!v) return ''
    if (typeof v === 'string') return v

    const obj = getFirst(v)
    // 你後端可能會回：
    // { file: {source_url,file_type...} } 或 { file_version: {source_url,file_type...} }
    // 也有可能直接就是 file_version/file 的結構
    return (
      obj?.file_version?.source_url ||
      obj?.file?.source_url ||
      obj?.source_url ||
      ''
    )
  }

  const getUrlExtension = (v: any): string => {
    const url = getSourceUrl(v)
    if (!url || typeof url !== 'string') return ''
    const clean = url.split(/[#?]/)[0]
    const ext = clean.split('.').pop()
    return (ext || '').trim().toLowerCase()
  }

  const getDisplayFileType = (): string => {
    // 1) 外部硬塞 fileType 且 disabled=true 的情境
    if (fileType && disabled === true) return String(fileType).toLowerCase()

    if (!value) return ''

    if (typeof value === 'string') {
      if (fileType) return String(fileType).toLowerCase()
      // 從 url 推副檔名
      return getUrlExtension(value)
    }

    const obj = getFirst(value)
    const t1 = obj?.file_version?.file_type || obj?.file?.file_type || obj?.file_type
    return (t1 || getUrlExtension(value) || '').toLowerCase()
  }

  const getDisplayFileName = (): string | null => {
    if (fileName !== 'invalid scope' && fileName) return fileName

    if (typeof value === 'string') {
      if (value === 'invalid scope') return '無權限'
      return decodeURI(S_url.getFileName(value))
    }

    if (typeof value === 'object' && value) {
      const obj = getFirst(value)
      if (obj?.file_version) {
        return obj.file_version?.name !== 'invalid scope'
          ? `${obj.file_version?.name} ver.${obj.file_version?.version_number}`
          : '無權限'
      }
      if (obj?.file) {
        return obj.file?.name !== 'invalid scope'
          ? `${obj.file?.name} ver.${obj.file?.version_number}`
          : '無權限'
      }
      // fallback
      return obj?.name || null
    }

    return null
  }

  const safeFileName = (name: string) => {
    // iOS/Android 檔名避免奇怪字元
    const base = name || 'download'
    return base.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  }

  const isLocalPath = (url: string) => {
    if (!url) return false
    return url.startsWith('file://') || url.startsWith('/private')
  }

  const previewTypes = new Set([
    'png', 'jpg', 'gif', 'jpeg', 'svg',
    'mp4', 'avi', 'mov', 'mkv', 'wmv',
  ])

  const ensureAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true

    const version = parseInt(DeviceInfo.getSystemVersion(), 10)

    // Android 13+
    if (version >= 13) {
      const [img, vid, aud] = await Promise.all([
        request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES),
        request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO),
        request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO),
      ])

      // 只要有任何一個 granted，就算可讀媒體（你的情境是要下載到 app 文件夾再開，其實不一定要這三個）
      // 但沿用你原本邏輯
      const ok = [img, vid, aud].includes(PermissionsAndroid.RESULTS.GRANTED)
      if (!ok) {
        Alert.alert('權限被拒絕', '請授權媒體讀取權限')
        return false
      }
      return true
    }

    // Android 12-
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    )
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert('權限被拒絕', '請授權寫入儲存空間權限')
      return false
    }
    return true
  }

  const $_getFileTypeImage = () => {
    const type = getDisplayFileType()

    if (type === 'pdf') return require('@/__reactnative_stone/assets/img/pdf-pdf.png')
    if (type === 'jpg') return require('@/__reactnative_stone/assets/img/image-jpg.png')
    if (type === 'gif') return require('@/__reactnative_stone/assets/img/image-gif.png')
    if (type === 'jpeg') return require('@/__reactnative_stone/assets/img/image-jpeg.png')
    if (type === 'bmp') return require('@/__reactnative_stone/assets/img/image-bmp.png')
    if (type === 'svg') return require('@/__reactnative_stone/assets/img/image-svg.png')
    if (type === 'tiff') return require('@/__reactnative_stone/assets/img/image-tiff.png')
    if (type === 'webp') return require('@/__reactnative_stone/assets/img/image-webp.png')
    if (type === 'png') return require('@/__reactnative_stone/assets/img/image-png.png')
    if (type === 'pptx' || type === 'ppt') return require('@/__reactnative_stone/assets/img/image-pptx.png')
    if (type === 'mp3') return require('@/__reactnative_stone/assets/img/image-mp3.png')
    if (type === 'wav') return require('@/__reactnative_stone/assets/img/image-wav.png')
    if (type === 'mp4') return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mp4.png')
    if (type === 'avi') return require('@/__reactnative_stone/assets/img/thumbnail_file/video-avi.png')
    if (type === 'mov') return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mov.png')
    if (type === 'mkv') return require('@/__reactnative_stone/assets/img/image-mkv.png')
    if (type === 'wmv') return require('@/__reactnative_stone/assets/img/thumbnail_file/video-wmv.png')
    if (type === 'txt') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-txt.png')
    if (type === 'doc') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-doc.png')
    if (type === 'docx') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-docx.png')
    if (type === 'odt') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-odt.png')
    if (type === 'pages') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-pages.png')
    if (type === 'rtf') return require('@/__reactnative_stone/assets/img/thumbnail_file/document-rtf.png')
    if (type === 'key') return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-key.png')
    if (type === 'odp') return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-odp.png')
    if (type === 'pps') return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-pps.png')
    if (type === 'ppsx') return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-ppsx.png')
    if (type === 'csv') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-csv.png')
    if (type === 'numbers') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-numbers.png')
    if (type === 'ods') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-ods.png')
    if (type === 'tsv') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-tsv.png')
    if (type === 'xls') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xls.png')
    if (type === 'xlsx') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xlsx.png')
    if (type === 'xml') return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xml.png')

    return require('@/__reactnative_stone/assets/img/other.png')
  }

  /** =========================
   *  Main: Open/Preview
   *  ========================= */
  const $_onCardPress = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const type = getDisplayFileType()
      const url = getSourceUrl(value)

      if (!url) {
        console.warn('[WsInfoFile] empty url, value=', value)
        setIsVisible(true)
        return
      }

      // 圖片 / 影片直接預覽
      if (previewTypes.has(type)) {
        setIsVisible(true)
        return
      }

      // 本地檔案直接開
      if (isLocalPath(url)) {
        await FileViewer.open(decodeURIComponent(url), { showOpenWithDialog: true })
        return
      }

      // Android 權限
      const ok = await ensureAndroidPermission()
      if (!ok) return

      // 下載到 app 文件夾後開啟（避免 blob/cache + RNFS 下載兩次）
      const fileExt = (getUrlExtension(value) || type || 'pdf').toLowerCase()
      const displayName = getDisplayFileName() || 'download'
      const baseName = safeFileName(displayName.replace(/\.(\w+)$/i, '')) // 去掉尾端副檔名
      const filePath = `${RNFS.DocumentDirectoryPath}/${baseName}.${fileExt}`

      const downloadRes = await RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
        background: Platform.OS === 'ios',
        discretionary: Platform.OS === 'ios',
      }).promise

      if (downloadRes.statusCode === 200) {
        await FileViewer.open(filePath, { showOpenWithDialog: true })
      } else {
        console.warn('[WsInfoFile] download failed status:', downloadRes.statusCode)
        setIsVisible(true)
      }
    } catch (error) {
      console.error('Error during file open:', error)
      setIsVisible(true)
    } finally {
      setIsProcessing(false)
    }
  }

  /** =========================
   *  Render
   *  ========================= */
  const type = getDisplayFileType()
  const displayName = getDisplayFileName()

  return (
    <>
      {value && (
        <>
          {disabled === false && ['png', 'jpg', 'gif', 'jpeg', 'svg'].includes(type) ? (
            <TouchableOpacity
              testID={testID}
              onPress={() => {
                if (fileName === 'unknown') return
                $_onCardPress()
              }}
              style={{ justifyContent: 'center' }}
            >
              {currentFactory?.is_image_viewable ? (
                <FastImage
                  style={{
                    width: 104,
                    height: 104,
                    position: 'relative',
                    borderRadius: 5,
                    borderWidth: 0.3,
                  }}
                  source={{
                    uri: (() => {
                      if (isError) return 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png'
                      const url = getSourceUrl(value)
                      return url || 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png'
                    })(),
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <WsShadowCard
                  onPress={$_onCardPress}
                  style={{
                    width: width * 0.675,
                    borderColor: $color.white2d,
                    borderWidth: 0.5,
                    borderRadius: 10,
                  }}
                >
                  <WsFlex>
                    <Image style={{ width: 32, height: 32 }} source={$_getFileTypeImage()} />
                    <WsText style={{ marginLeft: 8, marginRight: 20 }} size={14}>
                      {fileName !== 'invalid scope' && fileVersion
                        ? `${fileName} ver.${fileVersion}`
                        : fileVersion
                          ? `${displayName} ver.${fileVersion}`
                          : `${displayName}`}
                    </WsText>
                  </WsFlex>
                </WsShadowCard>
              )}
            </TouchableOpacity>
          ) : (
            <WsShadowCard
              disabled={fileName === 'invalid scope'}
              testID={testID}
              onPress={() => {
                if (disabled === true) {
                  Alert.alert(t('您沒有此檔案所屬資料夾的權限'))
                  return
                }
                $_onCardPress()
              }}
              style={{
                width: width * 0.675,
              }}
            >
              {isProcessing && (
                <View
                  style={{
                    position: 'absolute',
                    justifyContent: 'center',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                  }}
                >
                  <WsLoading />
                </View>
              )}

              {exportAttachmentName && (
                <>
                  <WsInfo
                    labelWidth={160}
                    label={t('是否匯出附件名稱')}
                    labelColor={$color.gray}
                    value={
                      exportAttachmentName ? t('是') : t('否')
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  />
                  <WsInfo
                    labelWidth={120}
                    label={t('匯出附件名稱')}
                    labelColor={$color.gray}
                    value={
                      exportAttachmentName ? `${exportAttachmentName}` : null
                    }
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flexWrap:'wrap',
                      marginVertical: 8
                    }}
                  />
                </>
              )}

              <WsFlex
                style={{
                  // borderWidth:1
                }}
              >
                <Image style={{ width: 32, height: 32 }} source={$_getFileTypeImage()} />
                <WsText
                  testID={'WsInfoFile名稱'}
                  style={{ marginLeft: 8, marginRight: 20 }}
                  size={14}
                  style={{
                    flexShrink: 1
                  }}
                >
                  {fileName !== 'invalid scope' && fileVersion
                    ? `${fileName} ver.${fileVersion}`
                    : fileVersion
                      ? `${displayName} ver.${fileVersion}`
                      : `${displayName}`}
                </WsText>
              </WsFlex>
            </WsShadowCard>
          )}

          <WsModalPreview
            fileName={
              fileName && fileVersion
                ? `${fileName} ver.${fileVersion}`
                : fileName
                  ? fileName
                  : `${displayName || ''}`
            }
            fileType={type}
            source={value}
            visible={isVisible}
            onRequestClose={$_onRequestClose}
            iconLeftOnPress={$_onRequestClose}
          />
        </>
      )}
    </>
  )
}

export default WsInfoFile
