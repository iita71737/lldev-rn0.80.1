import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  StatusBar,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  WsBtn,
  WsTabView,
  WsProgress,
  WsText,
  WsFlex,
  WsIconBtn,
  SafeAreaView,
  WsPopup,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

interface LlPopupAlertProps {
  backBtnOnPress: () => void;
}

const LlPopupAlert: React.FC<LlPopupAlertProps> = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    visible,
    onClose = () => { },
    text = 'content',
    onPressEnter,
    leftBtnText = t('取消'),
    leftBtnVisible = true,
    rightBtnText = t('確定'),
    rightBtnVisible = true,
  } = props

  return (
    <WsPopup
      active={visible}
      onClose={onClose}>
      <View
        style={{
          width: width * 0.9,
          height: height * 0.25,
          backgroundColor: $color.white,
          borderRadius: 10,
          flexDirection: 'row',
        }}>
        <WsText
          testID={'文案'}
          size={18}
          color={$color.black}
          style={{
            padding: 16,
          }}
        >{text}
        </WsText>
        <WsFlex
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
          }}
        >
          {leftBtnVisible && (
            <TouchableOpacity
              testID={leftBtnText}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center',
                justifyContent: 'center', // 垂直置中
                height: 48
              }}
              onPress={() => {
                onClose()
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{leftBtnText}
              </WsText>
            </TouchableOpacity>
          )}

          {rightBtnVisible && (
            <WsGradientButton
              testID={'確定'}
              style={{
                width: 110,
              }}
              onPress={() => {
                onClose()
                onPressEnter()
              }}>
              {rightBtnText}
            </WsGradientButton>
          )}

        </WsFlex>
      </View>
    </WsPopup>
  )
}

export default LlPopupAlert

