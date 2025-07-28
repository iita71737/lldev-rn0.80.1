import React, { Children } from 'react'
import {
  View,
  Pressable,
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsIcon,
  WsDialog,
  WsPopup,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'

const WsRemindPopup = (props) => {
  const { width, height } = Dimensions.get('window')

  const {
    remind = 'remind',
    remindBtnDisabled,
    remindColor = $color.primary,
    fixedheight,
    children,
  } = props

  const [visible, setVisible] = React.useState(false)

  return (
    <>
      {remind && (
        <>
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
            }}
            disabled={remindBtnDisabled}
            onPress={() => {
              if (!remindBtnDisabled) {
                setVisible(true)
              }
            }}>
            <WsFlex
              alignItems={'flex-start'}
              style={{
                marginTop: 12,
              }}
            >
              <WsIcon
                name="md-info-outline"
                color={remindColor}
                style={{
                  marginRight: 6
                }}
                size={18}
              />
              <WsText
                style={{
                }}
                size={12}
                color={remindColor}>
                {remind}
              </WsText>
            </WsFlex>
          </TouchableOpacity>

          <WsPopup
            active={visible}
            onClose={() => {
              setVisible(false)
            }}>
            <View
              style={{
                width: width * 0.9,
                height: fixedheight ? fixedheight : 256,
                backgroundColor: $color.white,
                borderRadius: 10,
                padding: 16
              }}>
              <WsFlex
                justifyContent={'flex-end'}
                style={{
                }}
              >
                <WsIconBtn
                  size={24}
                  name={"md-close"}
                  onPress={
                    () => setVisible(false)
                  }
                >
                </WsIconBtn>
              </WsFlex>
              {children}
            </View>
          </WsPopup>
        </>
      )}
    </>
  )
}

export default WsRemindPopup