import React from 'react'
import {
  Pressable,
  TouchableOpacity,
  View,
  Text,
  Image,
  Platform,
  Dimensions
} from 'react-native'
import FastImage from 'react-native-fast-image'
import {
  WsModalPreview,
  WsIconCircle,
  WsIcon,
  WsShadowCard,
  WsFlex,
  WsText,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Video from 'react-native-video';
import S_url from '@/__reactnative_stone/services/app/url'

const WsInfoImage = props => {
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    value,
    fileName,
    fileType,
    priority = 'normal',
    uploadProgress,
  } = props

  // State
  const [isProcessing, setIsProcessing] = React.useState(false);
  const videoRef = React.useRef();
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [count, setCount] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(false)
  const [isError, setIsError] = React.useState(false);

  // Function
  const $_onImageOnPress = () => {
    if (isProcessing) {
      return;
    }
    setIsProcessing(true);
    setIsVisible(true)
  }
  const $_onRequestClose = () => {
    setIsVisible(false)
  }
  const handlePlayPause = () => {
    setIsVisible(true)
  };

  // HELPER
  const isVideoOrImage = (url) => {
    if (!url) {
      return
    }
    const fileExtension = url.split('.').pop().toLowerCase().replace(/\?.*$/, '').toLowerCase();
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    if (videoExtensions.includes(fileExtension)) {
      return 'video';
    } else if (imageExtensions.includes(fileExtension)) {
      return 'image';
    } else {
      return fileExtension
    }
  }
  const $_getFileName = () => {
    if (fileName) {
      return fileName
    } else {
      if (value && typeof value === 'string') {
        return decodeURI(S_url.getFileName(value))
      } else if (value && typeof value === 'object') {
        return value.file_version?.name ? value.file_version?.name : value[0]?.file?.name
      } else {
        return null
      }
    }
  }
  const $_getFileType = () => {
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
    } else if ($_getFileType() === 'mp3') {
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

  React.useEffect(() => {
    if (uploadProgress) {
      setCount(Math.round(uploadProgress * 100))
    }
  }, [uploadProgress])

  // Render
  return (
    <>
      <TouchableOpacity
        onPress={$_onImageOnPress}
        style={{
          justifyContent: 'center',
          alignItems:'center'
        }}>
        {['png', 'jpg', 'gif', 'jpeg', 'svg', 'pdf', 'PNG', 'JPG', 'GIF', 'JPEG', 'SVG'].includes($_getFileType()) && (
          <FastImage
            style={[
              {
                width: 104,
                height: 104,
                position: 'relative',
                borderRadius: 5,
              }
            ]}
            source={{
              uri: isError ? 'https://cdn3.iconfinder.com/data/icons/files-buttons/512/File_Unknown-1024.png' :
                typeof value === 'string' ? value :
                  typeof value === 'object' ? value.file_version?.source_url :
                    value[0]?.file?.source_url ? value[0]?.file?.source_url : null,
              priority: FastImage.priority[priority],
              cache: FastImage.cacheControl.immutable
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
        {['mp4', 'avi', 'mov', 'mkv', 'wmv'].includes($_getFileType()) && (
          <>
            {/* {Platform.OS === 'android' && (
              <>
                <Video
                  ref={videoRef}
                  source={{
                    // uri: 'https://static.videezy.com/system/resources/previews/000/043/142/original/3prts-2.mp4'
                    uri: value ? encodeURI(value) : isError ? 'https://static.videezy.com/system/resources/previews/000/043/142/original/3prts-2.mp4' : ''
                  }}
                  resizeMode="contain"
                  onError={() => setIsError(true)}
                  onEnd={() => setIsPlaying(false)}
                  controls={true}
                  repeat={false}
                  style={{
                    borderWidth: 0.3,
                    width: width,
                    height: height,
                  }}
                />
                {!isPlaying && isVideoOrImage(value) === 'video' && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 50,
                      left: 50,
                      transform: [{ translateX: -25 }, { translateY: -25 }],
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => handlePlayPause()}
                  >
                    <WsIcon
                      name="fa-play"
                      color={$color.white}
                      size={48}
                    ></WsIcon>
                  </TouchableOpacity>
                )}
              </>
            )}
            {Platform.OS === 'ios' && ( */}
            <Image
              style={{
                width: 104,
                height: 104,
              }}
              source={$_getFileTypeImage()}
            />
            {/* )}  */}
          </>
        )}
        {['txt', 'rtf', 'pages', 'odt', 'docx', 'doc', 'key', 'odp', 'pps', 'ppsx', 'ppt', 'csv', 'numbers', 'ods', 'tsv', 'xls', 'xlsx', 'xml'].includes($_getFileType()) && (
          <Image
            style={{
              width: 104,
              height: 104,
            }}
            source={$_getFileTypeImage()}
          />
        )}
      </TouchableOpacity >
      <WsModalPreview
        fileName={fileName}
        fileType={$_getFileType()}
        source={value}
        visible={isVisible}
        onRequestClose={$_onRequestClose}
        iconLeftOnPress={$_onRequestClose}
      />
    </>
  )
}

export default WsInfoImage
