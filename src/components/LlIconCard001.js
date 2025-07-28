import React from 'react'
import { View } from 'react-native'
import { WsIcon, WsText, WsFlex } from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlIconCard001 = props => {
  const { t, i18n } = useTranslation()

  const {
    icon,
    iconSize = 32,
    iconColor = gColor.primary,
    style,
    text,
    textSize = 12,
    textColor = gColor.primary,
    borderRadius = 8,
    backgroundColor = gColor.primary11l,
    minWidth = 70,
    minHeight = 70
  } = props

  return (
    <WsFlex
      flexDirection="column"
      alignItems="center"
      style={[
        {
          padding: 9,
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
          minWidth: minWidth,
          minHeight: minHeight
        },
        style
      ]}>
      <WsIcon name={icon} size={iconSize} color={iconColor} />
      <WsText
        style={{
          marginTop: 1
        }}
        size={textSize}
        color={textColor}>
        {t(text)}
      </WsText>
    </WsFlex>
  )
}

export default LlIconCard001
