import React from 'react'
import { View } from 'react-native'
import { WsIcon, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlNumCard001 = props => {
  const {
    style,
    text,
    textSize = 12,
    textColor = $color.gray,
    borderRadius = 8,
    backgroundColor = $color.primary11l,
    minWidth = 70,
    minHeight = 70,
    num,
    numSize = 14,
    numColor = $color.black
  } = props

  return (
    <WsFlex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
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
      <WsText
        style={{
          marginTop: 1
        }}
        size={textSize}
        color={textColor}>
        {text}
      </WsText>
      <WsText
        style={{
          marginTop: 1
        }}
        size={numSize}
        color={numColor}>
        {num}
      </WsText>
    </WsFlex>
  )
}

export default LlNumCard001
