import React from 'react'
import {
  SafeAreaView,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { WsIcon, WsText, WsFlex, WsLoading } from '@/components'
import Modal from 'react-native-modal'
import { images } from '@/__reactnative_stone/assets/img'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import $config from '@/__config'
import axios from 'axios'

const WsStateFilesAndImagesPickerModal = props => {
  const {
    textColor = $color.primary,
    icon = 'md-backup',
    isVisible,
    onClose,
    onImageLibraryPress,
    onCameraPress,
    onBrowsePress,
    onRecordingPress,
    recordingBtnVisible = true,
    browseBtnVisible = true,
    loadingProgress = false,
    fileStoreBtnVisible = true,
    onPressFileStore,
    limitFileExtension,
  } = props

  const allowedExtensions = limitFileExtension && limitFileExtension.split(", ").map(ext => ext.trim());

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={loadingProgress ? styles.modalOnLoading : styles.modal}
    >
      {isVisible && !loadingProgress && (
        <SafeAreaView style={styles.buttons}>
          <TouchableOpacity
            testID={'相冊'}
            style={styles.button}
            onPress={onImageLibraryPress}
          >
            <Image style={styles.buttonIcon} source={images.image} />
            <Text style={styles.buttonText}>{i18next.t('相冊')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID={'相機'}
            style={styles.button}
            onPress={onCameraPress}
          >
            <Image style={styles.buttonIcon} source={images.camera} />
            <Text style={styles.buttonText}>{i18next.t('相機')}</Text>
          </TouchableOpacity>

          {(allowedExtensions &&
            allowedExtensions.includes(".mp4, .mov, .wmv, .avi, .flv, .mkv, .webm, .mpeg, .mpg, .m4v, .3gp, .3g2") || allowedExtensions === undefined) && (
              <>
                {recordingBtnVisible && (
                  <TouchableOpacity
                    testID={'錄影'}
                    style={styles.button}
                    onPress={onRecordingPress}
                  >
                    <Image style={styles.buttonIcon} source={images.recording} />
                    <Text style={styles.buttonText}>{i18next.t('錄影')}</Text>
                  </TouchableOpacity>
                )}

                {browseBtnVisible && (
                  <TouchableOpacity
                    testID={'檔案'}
                    style={styles.button}
                    onPress={onBrowsePress}
                  >
                    <WsIcon
                      name={icon}
                      size={30}
                      style={{
                        margin: 4
                      }}
                    />
                    <WsText size={14} fontWeight={'600'} color={textColor}>
                      {i18next.t('檔案')}
                    </WsText>
                  </TouchableOpacity>
                )}
              </>
            )}

        </SafeAreaView>
      )}
      {loadingProgress && (
        <WsLoading
          style={{}}>
        </WsLoading>
      )}
    </Modal>
  )
}
export default WsStateFilesAndImagesPickerModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  modalOnLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0
  },
  buttonIcon: {
    width: 30,
    height: 30,
    margin: 4
  },
  buttons: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  button: {
    marginTop: 16,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  }
})
