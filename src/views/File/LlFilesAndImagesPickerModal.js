import React from 'react'
import {
  SafeAreaView,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native'
import {
  WsIcon,
  WsText,
  WsFlex,
  WsLoading,
  WsTabView,
  WsPopup
} from '@/components'
import { images } from '@/__reactnative_stone/assets/img'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import $config from '@/__config'
import axios from 'axios'
import TabUploadFromFileStore from '@/views/File/TabUploadFromFileStore'
import TabUploadFromLocalFile from '@/views/File/TabUploadFromLocalFile'
import TabUploadFromOtherFileStore from '@/views/File/TabUploadFromOtherFileStore'

const LlFilesAndImagesPickerModal = props => {
  const { width, height } = Dimensions.get('window')

  const {
    textColor = $color.primary,
    icon = 'md-backup',
    isVisible,
    onClose,
    onImageLibraryPress,
    onCameraPress,
    onBrowsePress,
    onRecordingPress,
    browseBtnVisible = true,
    loadingProgress = false,
    fileStoreBtnVisible = true,
    onUploadFromFileStoreComplete,
    onUploadFromLocalComplete,
    onUploadFromOtherFileStoreComplete,
    oneFile,
    fileExtension,
    value,
    modelName,
    limitFileExtension
  } = props

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'TabUploadFromLocalFile',
        label: i18next.t('自本地上傳檔案'),
        view: TabUploadFromLocalFile,
        props: {
          onClose: onClose,
          onUploadComplete: onUploadFromLocalComplete,
          oneFile: oneFile,
          modelName: modelName,
          limitFileExtension: limitFileExtension
        }
      },
      {
        value: 'TabUploadFromFileStore',
        label: i18next.t('選擇來自檔案庫的檔案'),
        view: TabUploadFromFileStore,
        props: {
          onClose: onClose,
          onUploadFromFileStoreComplete: onUploadFromFileStoreComplete,
          files: value,
          oneFile: oneFile,
          limitFileExtension: limitFileExtension
        }
      },
      {
        value: 'LlUploadFromOtherUnit',
        label: i18next.t('選擇來自其他單位的檔案'),
        view: TabUploadFromOtherFileStore,
        props: {
          onClose: onClose,
          onUploadFromOtherFileStoreComplete: onUploadFromOtherFileStoreComplete,
          files: value,
          oneFile: oneFile,
          limitFileExtension: limitFileExtension
        }
      }
    ])
  }

  React.useEffect(() => {
    console.log('useEffect');
    $_setTabItems()
  }, [value])


  return (
    <>
      <WsPopup
        active={isVisible}
        onClose={onClose}
        closeOnBackdropPress={false}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.8,
            backgroundColor: $color.white,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 16,
          }}
        >
          {tabItems && (
            <WsTabView
              index={tabIndex}
              setIndex={settabIndex}
              items={tabItems}
              // scrollEnabled={true} // 250723-issue-blank
              pointerVisible={true}
            />
          )}
        </View>
      </WsPopup>
    </>
  )
}
export default LlFilesAndImagesPickerModal
