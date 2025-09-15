import React from 'react'
import { Image, Dimensions, View, TouchableOpacity, Platform, PermissionsAndroid, Linking, Alert } from 'react-native'
import { WsText, WsFlex, WsShadowCard, WsModalPreview, WsLoading } from '@/components'
import S_url from '@/__reactnative_stone/services/app/url'
import FastImage from 'react-native-fast-image'
import RNFS from 'react-native-fs';
import FileViewer from "react-native-file-viewer";
import DeviceInfo from 'react-native-device-info';
import { request, PERMISSIONS, openSettings, check } from 'react-native-permissions';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import RNBlobUtil from 'react-native-blob-util';

const WsInfoFile = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    fileName,
    fileType,
    value,
    fileVersion,
    disabled,
    testID
  } = props


  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [isVisible, setIsVisible] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  // Function
  const $_onRequestClose = () => {
    setIsVisible(false)
  }

  // *IMPORTANT*: The correct file extension is always required.
  // You might encounter issues if the file's extension isn't included
  // or if it doesn't match the mime type of the file.
  // https://stackoverflow.com/a/47767860
  const getUrlExtension = (url) => {
    if (url) {
      if (typeof url === 'string') {
        return url.split(/[#?]/)[0].split(".").pop().trim();
      } else if (typeof url === 'object') {
        if (url.file?.file_type && url.file?.source_url) {
          return url.file?.source_url.split(/[#?]/)[0].split(".").pop().trim();
        } else if (url.file_version?.file_type && url.file_version?.source_url) {
          return url.file_version?.source_url.split(/[#?]/)[0].split(".").pop().trim();
        }
      }
    }
  }
  const getSourceUrl = (url) => {
    if (url) {
      if (typeof url === 'string') {
        return url
      } else if (typeof url === 'object') {
        if (url.file?.file_type && url.file?.source_url) {
          return url.file?.source_url
        } else if (url.file_version?.file_type && url.file_version?.source_url) {
          return url.file_version?.source_url
        }
      }
    }
  }
  const removeWhitespace = (str) => {
    return str.replace(/\s+/g, '');
  }

  const $_onCardPress = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const type = $_getFileType()?.toLowerCase?.();
      const url = getSourceUrl(value);

      // 圖片 / 影片直接預覽
      const previewTypes = ['png', 'jpg', 'gif', 'jpeg', 'svg', 'mp4', 'avi', 'mov', 'mkv', 'wmv'];
      if (previewTypes.includes(type)) {
        setIsVisible(true);
        return;
      }

      // ✅ Android 若為本地檔案（file:// 開頭）直接開啟
      if (url.startsWith('file://')) {
        await FileViewer.open(decodeURIComponent(url), { showOpenWithDialog: true });
        return;
      }

      // ✅ iOS 若為本地檔案（/private 開頭）直接開啟
      if (url.startsWith('/private')) {
        await FileViewer.open(decodeURIComponent(url), { showOpenWithDialog: true });
        return;
      }

      // ⛔ Android 權限檢查
      if (Platform.OS === 'android') {
        const version = parseInt(DeviceInfo.getSystemVersion(), 10);
        if (version >= 13) {
          const [img, vid, aud] = await Promise.all([
            request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES),
            request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO),
            request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO),
          ]);
          if (![img, vid, aud].includes(PermissionsAndroid.RESULTS.GRANTED)) {
            Alert.alert('權限被拒絕', '請授權媒體讀取權限');
            return;
          }
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('權限被拒絕', '請授權寫入儲存空間權限');
            return;
          }
        }
      }

      const res = await RNBlobUtil.config({
        fileCache: true,
        appendExt: value.split('?')[0].split('.').pop()?.toLowerCase() || 'pdf'
      }).fetch('GET', value);
      const localPath = res.path(); 
      console.log(localPath,'localPath--');
      await FileViewer.open(localPath, { showOpenWithDialog: true });

      // 🧠 構建下載路徑
      // const safeFileName = encodeURIComponent($_getFileName(value));
      const safeFileName = $_getFileName(value).replace(/[^a-zA-Z0-9.\-_]/g, '_'); // 只保留安全字元
      const fileExtension = getFileExtension(value) || $_getFileType();
      const baseDir = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.DocumentDirectoryPath;
      const filePath = `${baseDir}/${safeFileName}.${fileExtension}`;
      const decodedFilePath = decodeURIComponent(filePath);

      // 💾 下載檔案
      const downloadRes = await RNFS.downloadFile({
        fromUrl: url,
        toFile: decodedFilePath,
        background: Platform.OS === 'ios',
        discretionary: Platform.OS === 'ios',
        begin: (res) => console.log('Download started:', res.headers),
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download progress: ${progress.toFixed(2)}%`);
        },
      }).promise;

      if (downloadRes.statusCode === 200) {
        console.log(decodedFilePath, 'decodedFilePath');
        await FileViewer.open(decodedFilePath, { showOpenWithDialog: true });
      } else {
        console.warn('Download failed with status:', downloadRes.statusCode);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error during file open:', error);
      setIsVisible(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileExtension = (file) => {
    if (typeof file === 'string') {
      const match = file && file.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
      return match ? match[1] : null;
    } else if (typeof file === 'object') {
      if (file.file) {
        return file.file?.file_type
      } else if (file.file_version) {
        return file.file_version?.file_type
      }
    }
  };
  const $_getFileName = () => {
    if (fileName != 'invalid scope') {
      return fileName
    }
    if (typeof value === 'string') {
      if (value == 'invalid scope') {
        return '無權限'
      } else {
        const _value = decodeURI(S_url.getFileName(value))
        return _value
      }
    } else if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value[0]?.file?.name || value[0]?.file?.fileName || value[0]?.file_version?.name || null
      } else {
        if (value.file_version) {
          return value.file_version?.name !== 'invalid scope' ? `${value.file_version?.name} ver.${value.file_version?.version_number}` : '無權限'
        } else {
          return value.file?.name !== 'invalid scope' ? `${value.file?.name} ver.${value.file?.version_number}` : '無權限'
        }
      }
    } else {
      return null
    }
  }

  const $_getFileType = () => {
    if (fileType && disabled === true) {
      return fileType
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value[0]?.file_version?.file_type.toLowerCase() || value[0]?.file?.file_type.toLowerCase() || null;
      } else {
        if (value.file_version) {
          return value.file_version?.source_url ? value.file_version?.file_type?.toLowerCase() : null
        } else {
          return value.file?.source_url ? value.file?.file_type?.toLowerCase() : null
        }
      }
    } else if (typeof value === 'string') {
      if (!$_getFileName() && !fileType) {
        return null
      } else if (fileType) {
        return fileType.toLowerCase()
      } else {
        const filename = value.split('/').pop().split('?')[0];
        const fileType = filename.split('.').pop();
        return fileType.toLowerCase();
      }
    }
  }

  const $_getFileTypeImage = () => {
    if ($_getFileType() === 'pdf') {
      return require('@/__reactnative_stone/assets/img/pdf-pdf.png')
    } else if ($_getFileType() === 'jpg') {
      return require('@/__reactnative_stone/assets/img/image-jpg.png')
    } else if ($_getFileType() === 'gif') {
      return require('@/__reactnative_stone/assets/img/image-gif.png')
    } else if ($_getFileType() === 'jpeg') {
      return require('@/__reactnative_stone/assets/img/image-jpeg.png')
    } else if ($_getFileType() === 'bmp') {
      return require('@/__reactnative_stone/assets/img/image-bmp.png')
    } else if ($_getFileType() === 'svg') {
      return require('@/__reactnative_stone/assets/img/image-svg.png')
    } else if ($_getFileType() === 'tiff') {
      return require('@/__reactnative_stone/assets/img/image-tiff.png')
    } else if ($_getFileType() === 'webp') {
      return require('@/__reactnative_stone/assets/img/image-webp.png')
    } else if ($_getFileType() === 'png') {
      return require('@/__reactnative_stone/assets/img/image-png.png')
    } else if ($_getFileType() === 'pptx' || $_getFileType() === 'ppt') {
      return require('@/__reactnative_stone/assets/img/image-pptx.png')
    }
    else if ($_getFileType() === 'mp3') {
      return require('@/__reactnative_stone/assets/img/image-mp3.png')
    } else if ($_getFileType() === 'wav') {
      return require('@/__reactnative_stone/assets/img/image-wav.png')
    }
    else if ($_getFileType() === 'mp4') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mp4.png')
    } else if ($_getFileType() === 'avi') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-avi.png')
    } else if ($_getFileType() === 'mov') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-mov.png')
    } else if ($_getFileType() === 'mkv') {
      return require('@/__reactnative_stone/assets/img/image-mkv.png')
    } else if ($_getFileType() === 'wmv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/video-wmv.png')
    }
    else if ($_getFileType() === 'txt') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-txt.png')
    } else if ($_getFileType() === 'doc') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-doc.png')
    } else if ($_getFileType() === 'docx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-docx.png')
    } else if ($_getFileType() === 'odt') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-odt.png')
    } else if ($_getFileType() === 'pages') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-pages.png')
    } else if ($_getFileType() === 'rtf') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/document-rtf.png')
    }
    else if ($_getFileType() === 'key') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-key.png')
    } else if ($_getFileType() === 'odp') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-odp.png')
    } else if ($_getFileType() === 'pps') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-pps.png')
    } else if ($_getFileType() === 'ppsx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/presentation-ppsx.png')
    }
    else if ($_getFileType() === 'csv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-csv.png')
    } else if ($_getFileType() === 'numbers') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-numbers.png')
    } else if ($_getFileType() === 'ods') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-ods.png')
    } else if ($_getFileType() === 'tsv') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-tsv.png')
    } else if ($_getFileType() === 'xls') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xls.png')
    } else if ($_getFileType() === 'xlsx') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xlsx.png')
    } else if ($_getFileType() === 'xml') {
      return require('@/__reactnative_stone/assets/img/thumbnail_file/spreadsheet-xml.png')
    }
    else {
      return require('@/__reactnative_stone/assets/img/other.png')
    }
  }

  // Render
  return (
    <>
      {value && (
        <>
          {disabled === false && (['png', 'jpg', 'gif', 'jpeg', 'svg', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG'].includes($_getFileType())) ? (
            <TouchableOpacity
              testID={testID}
              onPress={() => {
                if (fileName == 'unknown') {
                  return
                }
                $_onCardPress()
              }}
              style={{
                justifyContent: 'center',
              }}
            >
              {currentFactory.is_image_viewable ? (
                <FastImage
                  style={[
                    {
                      width: 104,
                      height: 104,
                      position: 'relative',
                      borderRadius: 5,
                      borderWidth: 0.3
                    }
                  ]}
                  source={{
                    uri: (() => {
                      if (isError) {
                        return 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png';
                      }
                      if (typeof value === 'string') {
                        return value;
                      }
                      if (typeof value === 'object') {
                        if (Array.isArray(value)) {
                          return value[0]?.file_version?.source_url || value[0]?.file?.source_url || 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png';
                        } else {
                          return value.file_version?.source_url || value.file?.source_url || 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png';
                        }
                      }
                      // 如果所有條件都不符合，回傳預設圖片
                      return 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png';
                    })(),
                    priority: FastImage.priority.normal,
                    cache: FastImage.cacheControl.immutable
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <>
                  <WsShadowCard
                    onPress={() => {
                      $_onCardPress()
                    }}
                    style={{
                      width: width * 0.675,
                      borderColor: $color.white2d,
                      borderWidth: 0.5,
                      borderRadius: 10
                    }}
                  >
                    <WsFlex
                      style={{
                      }}
                    >
                      <Image
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        source={$_getFileTypeImage()}
                      />
                      <WsText
                        style={{
                          marginLeft: 8,
                          marginRight: 20,
                        }}
                        size={14}
                      >
                        {fileName !== 'invalid scope' && fileVersion ? `${fileName} ver.${fileVersion}` : fileVersion ? `${$_getFileName(value)} ver.${fileVersion}` : `${$_getFileName(value)}`}
                      </WsText>
                    </WsFlex>
                  </WsShadowCard>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <WsShadowCard
              disabled={fileName === 'invalid scope' ? true : false}
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
                  <WsLoading
                  ></WsLoading>
                </View>
              )}
              <WsFlex
                style={{
                }}
              >
                <Image
                  style={{
                    width: 32,
                    height: 32,
                  }}
                  source={$_getFileTypeImage()}
                />
                <WsText
                  testID={'WsInfoFile名稱'}
                  style={{
                    marginLeft: 8,
                    marginRight: 20,
                  }}
                  size={14}>
                  {fileName !== 'invalid scope' && fileVersion ? `${fileName} ver.${fileVersion}` : fileVersion ? `${$_getFileName(value)} ver.${fileVersion}` : `${$_getFileName(value)}`}
                </WsText>
              </WsFlex>
            </WsShadowCard>
          )}
          <WsModalPreview
            fileName={fileName && fileVersion ? `${fileName} ver.${fileVersion}` : fileName ? fileName : `${$_getFileName()}`}
            fileType={$_getFileType()}
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
