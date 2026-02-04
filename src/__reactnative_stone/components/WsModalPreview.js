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
  const [gviewFailed, setGviewFailed] = React.useState(false)
  const [gviewRetryCount, setGviewRetryCount] = React.useState(0)
  const [webKey, setWebKey] = React.useState(0)
  const gviewFailHandledKeyRef = React.useRef(null)


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
  const $_onSavePress = async () => {
    if (typeof onSavePress === 'function') {
      await onSavePress()
    }
    setPreviewAvailable(true)
  }

  React.useEffect(() => {
    setGviewFailed(false)
    setGviewRetryCount(0)
    setWebKey(0)
    gviewFailHandledKeyRef.current = null
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
    if (Platform.OS === 'android') {
      return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(
        rawDocumentUrl
      )}`
    }
    return rawDocumentUrl
  }, [rawDocumentUrl])

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
            {((['png', 'jpg', 'jpeg', 'svg', 'PNG', 'JPG', 'JPEG', 'SVG'].includes(fileType)) || $_getFileType() === 'image')
              && (
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
            {((['gif', 'GIF'].includes(fileType)) || $_getFileType() === 'image')
              && (
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
            {($_getFileType() === 'pdf' || $_getFileType() === 'docx' || $_getFileType() === 'xlsx') && useWebView && !gviewFailed && (
              <>
                <View style={{ flex: 1 }}>
                  <WebView
                    key={`gview-${webKey}`}
                    ref={webviewRef}
                    originWhitelist={['*']}
                    source={{ uri: webViewSourceUri }}
                    onMessage={(event) => {
                      try {
                        const msg = JSON.parse(event.nativeEvent.data)
                        console.log(msg,'msgmsgmsg')
                        if (msg?.type === 'gview' && msg?.ok === false) {
                          if (gviewFailHandledKeyRef.current === webKey) return
                          gviewFailHandledKeyRef.current = webKey
                          setGviewRetryCount(prev => {
                            const next = prev + 1
                            if (next >= 3) {
                              setGviewFailed(true)
                              return next
                            }
                            setWebKey(k => k + 1)
                            return next
                          })
                        }
                      } catch {
                        // ignore invalid messages
                      }
                    }}
                    onLoad={handleLoad}
                    onLoadStart={() => setWebviewLoading(true)}
                    onLoadEnd={() => setWebviewLoading(false)}
                    onError={(e) => {
                      console.log('WV onError', e.nativeEvent)
                      setWebviewLoading(false)
                      setGviewRetryCount(prev => {
                        const next = prev + 1
                        if (next >= 3) {
                          setGviewFailed(true)
                          return next
                        }
                        setWebKey(k => k + 1)
                        return next
                      })
                    }}
                    onHttpError={(e) => {
                      console.log('WV onHttpError', e.nativeEvent)
                      // 403/404 等也可能直接白：可以視情況重掛或顯示 fallback
                      setGviewRetryCount(prev => {
                        const next = prev + 1
                        if (next >= 3) {
                          setGviewFailed(true)
                          return next
                        }
                        setWebKey(k => k + 1)
                        return next
                      })
                    }}
                    injectedJavaScript={`
                      (function() {
                        if (window.__gviewProbeStarted) return true;
                        window.__gviewProbeStarted = true;
                        const check = () => {
                          const hasFrame = document.querySelector('iframe, embed, object');
                          const hasText = document.body && document.body.innerText && document.body.innerText.trim().length > 0;
                          if (hasFrame || hasText) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'gview', ok: true }));
                            return;
                          }
                          if (document.readyState === 'complete') {
                            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'gview', ok: false }));
                            return;
                          }
                          setTimeout(check, 1000);
                        };
                        setTimeout(check, 2000);
                        true;
                      })();
                    `}

                    androidLayerType="hardware"
                    mixedContentMode="compatibility"
                    javaScriptEnabled
                    domStorageEnabled
                    // Google gview 常因 cookie / 第三方 cookie 設定造成偶發白屏
                    thirdPartyCookiesEnabled={true}
                    sharedCookiesEnabled={true}
                    // 避免 gview 嘗試開新視窗造成留白
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
            {($_getFileType() === 'pdf' || $_getFileType() === 'docx' || $_getFileType() === 'xlsx') && useWebView && gviewFailed && (
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
                  <WsText color={$color.white} textAlign="center">
                    {t('無法預覽，請下載')}
                  </WsText>
                </WsFlex>
              </View>
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
