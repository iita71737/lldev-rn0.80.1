import React from 'react'
import { Text, StyleSheet, Pressable } from 'react-native'
import { WsText, WsIcon, WsFlex } from '@/components'
// import config from '@/__config'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlTopAlertBar001 = ({
  //Prop
  children,
  onPress,
  text = '更新題目'
}) => {
  const { t, i18n } = useTranslation()

  //Render
  return (
    <Pressable
      disabled={true}
      onPress={onPress}
    >
      <WsFlex
        style={[
          {
            minHeight: 34,
            backgroundColor: gColor.danger2l
          }
        ]}>
        <WsIcon
          name="ws-outline-info"
          size={18}
          color={gColor.white}
          style={{
            marginRight: 8,
            marginLeft: 8
          }}
        />
        <WsText
          size={12}
          color={gColor.white}
          style={{
            flex: 1,
            paddingVertical: 8
          }}>
          {children}
        </WsText>
        {/* <WsText
          size={12}
          color={gColor.white}
          fontWeight="700"
          style={{
            paddingHorizontal: 8
          }}>
          {t(text)}
        </WsText> */}
      </WsFlex>
    </Pressable>
  )
}

export default LlTopAlertBar001
