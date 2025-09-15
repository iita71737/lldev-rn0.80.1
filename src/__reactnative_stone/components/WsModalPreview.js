import React from 'react'
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
    ableDownload = true,
    priority = 'normal'
  } = props

  // PDF STATES
  const [PDFLoading, setPDFLoading] = React.useState(true);
  const [PDFError, setPDFError] = React.useState(false);

  // State
  const videoRef = React.useRef();
  const [previewAvailable, setPreviewAvailable] = React.useState(false)

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
    setPreviewAvailable(true)
  }

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
  const $_PDFonLoaded = (e) => {
    setPDFLoading(false)
  }
  const $_PDFonError = (e) => {
    setPDFError(true)
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


  // Render
  return (
    <>
      <Modal
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
            {((['png', 'jpg', 'jpeg', 'svg', 'pdf', 'PNG', 'JPG', 'JPEG', 'SVG'].includes(fileType)) || $_getFileType() === 'image')
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
            {$_getFileType() === 'pdf' && (
              <>
                {PDFLoading && (
                  <View
                    style={{
                      transform: [{ rotate: '180deg' }],
                      position: 'absolute',
                      height: height * 0.8,
                      width: width,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'black'
                    }}>
                    <WsLoading size={30}></WsLoading>
                  </View>
                )}
                {/* <PDFView
                  fadeInDuration={0.0}
                  style={{
                    flex: 1
                  }}
                  resource={source}
                  resourceType="url"
                  onLoad={$_PDFonLoaded}
                  onError={$_PDFonError}
                /> */}
              </>
            )}
            {!['png', 'jpg', 'gif', 'jpeg', 'svg', 'pdf', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG', 'mp4', 'avi', 'mov', 'mkv', 'wmv'].includes(
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
