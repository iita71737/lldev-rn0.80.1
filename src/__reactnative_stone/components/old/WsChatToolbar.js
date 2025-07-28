import React, { useState, useEffect, useRef } from 'react';

import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  Keyboard,
} from 'react-native'
import {
  WsChatToolbarImages,
} from '@/components'
import {
  WsIconBtn,
} from '@/components'
import config from '@/__config'
import * as ImagePicker from "react-native-image-picker"
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsChatToolbar = ({
  inputColor = $theme == 'light' ? $color.gray5d : $color.gray5l,
  onSend,
  autoFocus = false
}) => {

  // Ref
  const inputRef = useRef(null)

  // State
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState([])

  // Function
  const $_onSendPress = () => {
    if (photos.length > 0) {
      onSend({
        messageType: 'images',
        photos: photos
      })
      setPhotos([])
    } else if (text) {
      onSend({
        messageType: 'text',
        text: text
      })
      setText('')
    }
  }
  const $_onImageRemove = (index) => {
    const _photos = [...photos]
    _photos.splice(index, 1)
    setPhotos(_photos)
  }
  const $_onImageUploadPress = () => {
    const options = {
      title: '上傳照片/影片',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      mediaType: 'photo',
    };
    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let uri =
          Platform.OS === 'android'
            ? response.uri
            : response.uri.replace('file://', '');
        setText('')
        setPhotos([
          ...photos,
          {
            source: uri,
            contentType: response.type
          }
        ])
      }
    });
  }
  const $_onKeyboardDidHide = () => {
    if (inputRef && inputRef.current) {
      inputRef.current.blur()
    }
  }

  // Effect
  useEffect(() => {
    const subscription = Keyboard.addListener('keyboardDidHide', $_onKeyboardDidHide)

    return () => {
      subscription.remove() // ✅ 正確移除方式
    }
  }, [])

  return (
    <View
      style={[
        styles.Toolbar
      ]}
    >
      <View
        style={[
          styles.LeftBtns
        ]}
      >
        <WsIconBtn
          name="Image"
          size={24}
          color="#808080"
          onPress={$_onImageUploadPress}
        ></WsIconBtn>
      </View>
      <View
        style={[
          styles.TextInputContainer
        ]}
      >
        {photos.length > 0 && (
          <WsChatToolbarImages
            photos={photos}
            onRemove={$_onImageRemove}
          ></WsChatToolbarImages>
        )}
        {photos.length == 0 && (
          <TextInput
            ref={inputRef}
            style={[
              styles.TextInput,
              {
                color: inputColor
              }
            ]}
            multiline
            autoFocus={autoFocus}
            value={text}
            onChangeText={setText}
          ></TextInput>
        )}
      </View>
      {(text != '' || photos.length > 0) && (
        <View
          style={[
            styles.SendContainer
          ]}
        >
          <WsIconBtn
            name="send-lg"
            size={24}
            onPress={$_onSendPress}
          ></WsIconBtn>
        </View>
      )}
    </View>
  )

}
const styles = StyleSheet.create({
  Toolbar: {
    borderTopWidth: 1,
    borderTopColor: '#d7d7d7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  TextInputContainer: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#faf8f6',
    fontSize: 16,
    color: '#808080',
    marginHorizontal: 8,
    paddingHorizontal: 16,
  },
  TextInput: {
    backgroundColor: "transparent",
    paddingVertical: 6,
  },
  LeftBtns: {
    // paddingHorizontal: 8,
    // paddingRight: 8
  },
  SendContainer: {
    // paddingHorizontal: 8,
  },
})

export default WsChatToolbar