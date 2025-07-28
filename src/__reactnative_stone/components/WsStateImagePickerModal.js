import React from 'react'
import {
  SafeAreaView,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { WsIcon, WsText, WsFlex } from '@/components'
import Modal from 'react-native-modal'
import { images } from '@/__reactnative_stone/assets/img'
import $color from '@/__reactnative_stone/global/color'

const WsStateImagePickerModal = props => {
  const {
    textColor = $color.primary,
    icon = 'md-backup',
    isVisible,
    onClose,
    onImageLibraryPress,
    onCameraPress
  } = props

  return (
    <Modal
      isVisible={isVisible}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      style={styles.modal}>
      <SafeAreaView style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={onImageLibraryPress}>
          <Image style={styles.buttonIcon} source={images.image} />
          <Text style={styles.buttonText}>{i18next.t('相冊')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onCameraPress}>
          <Image style={styles.buttonIcon} source={images.camera} />
          <Text style={styles.buttonText}>{i18next.t('相機')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  )
}
export default WsStateImagePickerModal

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  buttonIcon: {
    width: 30,
    height: 30,
    margin: 10
  },
  buttons: {
    backgroundColor: 'white',
    flexDirection: 'row',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600'
  }
})
