import React, { useRef } from 'react'
import {
  Modal,
  View,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  WsText,
  WsFlex,
  WsBtn,
  WsModalHeader,
  WsModalDownloadProcess,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_url from '__reactnative_stone/services/app/url'
import { useTranslation } from 'react-i18next'
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';
import Pdf from 'react-native-pdf'

const WsModalPreview = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    fileName,
    fileType,
    source,
    visible,
    onRequestClose,
    onSavePress,
    ableDownload = true,
    priority = 'normal',
    useWebView = false,
  } = props

  // PDF STATES
  const webviewRef = useRef(null)
  const handleLoad = event => {
    const url = event.nativeEvent.url; // e.g. "https://editor.your-domain.com/page"
    // 簡單取 domain（hostname）
    try {
      const { hostname } = new URL(url);
      // console.log('hostname:', hostname); // e.g. "editor.your-domain.com"
    } catch (e) {
      console.log('URL parse error', e);
    }
  }

  // State
  const videoRef = React.useRef();
  const [previewAvailable, setPreviewAvailable] = React.useState(false)
  const [webviewLoading, setWebviewLoading] = React.useState(false)


  // for video error handling
  const [isError, setIsError] = React.useState(false);
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  // helper-250731-issue-影片未完全載入下載會卡住
  const isVideoType = ['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(fileType);
  const isSupportedType = [
    'png', 'jpg', 'gif', 'jpeg', 'svg',
    'mp4', 'avi', 'mov', 'mkv', 'wmv',
    'pdf', 'xlsx', 'docx', 'doc', 'csv'
  ].includes(fileType);


  // FUNCTION
  const $_onPreviewComplete = () => {
    setPreviewAvailable(false)
  }
  const $_onSavePress = () => {
    if (typeof onSavePress === 'function') {
      console.log('AAA')
      onSavePress()
    }
    console.log('BBB')
    setPreviewAvailable(true)
  }

  React.useEffect(() => {
  }, [source, visible])


  // HELPER
  const $_getFileType = () => {
    if (typeof source === 'object') {
      if (Array.isArray(source)) {
        return source[0]?.file_version?.file_type || source[0]?.file?.file_type || null
      } else {
        if (source && source.file_version) {
          return source?.file_version?.file_type
        } else if (source && source.file) {
          return source?.file?.file_type
        } else {
          return 'unknown'
        }
      }
    } else {
      if (!fileName && !fileType) {
        return null
      } else if (fileType) {
        return fileType
      } else if (fileName) {
        return fileName.substring(fileName.lastIndexOf('.') + 1)
      } else {
        return 'image'
      }
    }
  }

  const $_getFileName = () => {
    if (fileName) {
      return fileName
    } else {
      if (source && typeof source === 'object') {
        if (Array.isArray(source)) {
          return source[0]?.file_version?.name || source[0]?.file?.name || null
        } else {
          if (source.file_version) {
            return source.file_version?.name
          } else {
            return source.file?.name
          }
        }
      } else if (source && typeof source === 'string') {
        return decodeURI(S_url.getFileName(source))
      } else {
        return null
      }
    }
  }


  // HELPER 
  const handleError = (event) => {
    console.error('Error loading video:', event);
  };
  const handleBuffer = (event) => {
    console.error('buffer loading video:', event);
  };

  const getFileTypeByUrl = (url) => {
    if (!url) {
      return
    }
    const regex = /\/([^/?.]+)\.(\w+)(\?.*)?$/;
    const match = url && url.match(regex);
    if (match) {
      const fileName = match[1];
      const fileExtension = match[2].toLowerCase();
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
      const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'mpeg', '3gp', 'webm', 'ogg'];
      if (imageExtensions.includes(fileExtension)) {
        return 'image';
      } else if (videoExtensions.includes(fileExtension)) {
        return 'video';
      } else {
        return 'unknown';
      }
    } else {
      return 'unknown';
    }
  }

  const getVideoUri = (source) => {
    let url = '';

    if (!source) return '';

    if (typeof source === 'string') {
      url = source;
    } else if (Array.isArray(source)) {
      url = source[0]?.file?.source_url || '';
    } else if (source?.file?.source_url) {
      url = source.file.source_url;
    } else if (source?.file_version?.source_url) {
      url = source.file_version.source_url;
    }
    return url;
  };

  const rawDocumentUrl = React.useMemo(() => {
    const raw =
      typeof source === 'string'
        ? source
        : Array.isArray(source)
          ? source[0]?.file?.source_url
          : source?.file_version?.source_url ??
          source?.file?.source_url ??
          null
    const fallback = `https://pdftron.s3.amazonaws.com/downloads/pl/report.docx`
    return raw || fallback
  }, [source])

  const webViewSourceUri = React.useMemo(() => {
    return rawDocumentUrl
  }, [rawDocumentUrl])

  const resolvedFileType = String($_getFileType() || fileType || '')
    .toLowerCase()
    .split('?')[0]
  const isImageFile = ['png', 'jpg', 'jpeg', 'svg'].includes(resolvedFileType)
  const isGifFile = ['gif'].includes(resolvedFileType)

  // Render
  return (
    <>
      <Modal
        hardwareAccelerated={Platform.OS === 'android'}
        transparent={true}
        visible={visible}
        onRequestClose={onRequestClose}
      >
        <WsModalDownloadProcess
          onComplete={$_onPreviewComplete}
          visible={previewAvailable}
          source={source}
          fileType={fileType}
          fileName={$_getFileName()}
        />
        <SafeAreaView
          style={{
            backgroundColor: 'black',
            flex: 1,
          }}
          edges={['top', 'bottom']}
        >
          <WsModalHeader
            leftOnPress={onRequestClose}
            iconLeftColor={$color.white}
            title={$_getFileName()}
            titleColor={$color.white}
            hasReduce={false}
          />
          <View
            style={{
              flex: 1
            }}
          >
            {!isError && ['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(fileType) && (
              <>
                <Video
                  ref={videoRef}
                  source={{ uri: getVideoUri(source) }}
                  // source={{ uri: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }}
                  resizeMode="contain"
                  controls={true}
                  repeat={true}
                  onBuffer={e => {
                    console.log(e, 'onBuffer');
                  }}
                  onError={e => {
                    console.log(e, 'onError');
                    setIsError(true)
                  }}
                  onLoad={e => {
                    console.log('✅ 影片已載入', e);
                    setIsVideoReady(true); // ← 可設定為可儲存狀態
                  }}

                  style={{
                    borderColor: $color.white,
                    backgroundColor: $color.primary10l,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    width: '100%',
                    flex: 1
                  }}
                />
              </>
            )}
            {(isImageFile || resolvedFileType === 'image') && (
                <>
                  <FastImage
                    style={[
                      {
                        flex: 1,
                        backgroundColor: 'white',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        width: '100%',
                      }
                    ]}
                    source={{
                      uri: typeof source === 'string' ? source :
                        typeof source === 'object' && Array.isArray(source) ? source[0].file?.source_url :
                          source.file_version?.source_url ? source.file_version?.source_url :
                            source.file?.source_url ? source.file?.source_url : null,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </>
              )}
            {(isGifFile || resolvedFileType === 'image') && (
                <>
                  <Image
                    style={{
                      flex: 1,
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      width: '100%',
                    }}
                    source={{
                      uri:
                        typeof source === 'string'
                          ? source
                          : Array.isArray(source)
                            ? source[0]?.file?.source_url
                            : source?.file_version?.source_url ??
                            source?.file?.source_url ??
                            null,
                    }}
                    resizeMode="contain"
                  />
                </>
              )}
            {$_getFileType() === 'pdf' && !useWebView && (
              <View style={{ flex: 1, backgroundColor: $color.white }}>
                <Pdf
                  source={{ uri: rawDocumentUrl, cache: true }}
                  style={{ flex: 1, width: '100%' }}
                  onError={(error) => {
                    console.log('PDF onError', error)
                  }}
                />
              </View>
            )}
            {($_getFileType() === 'pdf' || $_getFileType() === 'docx' || $_getFileType() === 'xlsx') && useWebView && (
              <>
                <View style={{ flex: 1 }}>
                  <WebView
                    ref={webviewRef}
                    originWhitelist={['*']}
                    source={{ uri: webViewSourceUri }}
                    onLoad={handleLoad}
                    onLoadStart={() => setWebviewLoading(true)}
                    onLoadEnd={() => setWebviewLoading(false)}
                    onError={(e) => {
                      console.log('WV onError', e.nativeEvent)
                      setWebviewLoading(false)
                    }}
                    onHttpError={(e) => {
                      console.log('WV onHttpError', e.nativeEvent)
                    }}
                    androidLayerType="hardware"
                    mixedContentMode="compatibility"
                    javaScriptEnabled
                    domStorageEnabled
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={true}
                    setSupportMultipleWindows={false}
                    startInLoadingState
                    renderLoading={() => (
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0,0,0,0.2)',
                        }}
                      >
                        <ActivityIndicator size="large" color={$color.white} />
                      </View>
                    )}
                  />
                </View>
              </>
            )}
            {!['png', 'jpg', 'gif', 'jpeg', 'svg', 'pdf', 'docx', 'xlsx', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG', 'mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(
              $_getFileType() || isError
            ) && (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center'
                  }}
                >
                  <WsFlex
                    justifyContent="center"
                    style={{
                      paddingHorizontal: 24
                    }}>
                    <WsText color={$color.white}
                      style={{
                      }}
                    >{$_getFileName()}
                    </WsText>
                  </WsFlex>
                  <WsFlex
                    justifyContent="center"
                    style={{
                      paddingHorizontal: 24,
                      marginTop: 16,
                    }}>
                    <WsText color={$color.white} textAlign="center">{t('無法預覽此類型檔案\n請點擊[儲存]下載檔案後再瀏覽')}</WsText>
                  </WsFlex>
                </View>
              )}
          </View>
          <WsFlex
            justifyContent="space-between"
            style={{
              height: 54,
              marginHorizontal: 16,
            }}>
            <View />
            <View>
              {ableDownload && (!isVideoType || (isVideoType && isVideoReady)) && (
                <WsBtn
                  testID={'儲存'}
                  onPress={$_onSavePress}
                  textColor={$color.white}
                  color="transparent"
                >
                  {(['png', 'jpg', 'gif', 'jpeg', 'svg', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG', 'mp4', 'avi', 'mov', 'mkv', 'wmv', 'pdf', 'xlsx', 'docx', 'doc', 'csv'].includes($_getFileType())) ? t('儲存') : t('預覽')}
                </WsBtn>
              )}
            </View>
          </WsFlex>
        </SafeAreaView>
      </Modal >
    </>
  )
}

export default WsModalPreview
