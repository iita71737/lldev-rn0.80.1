import React from 'react'
import { Text } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsTitle = ({
  // Prop
  fontSize = 13,
  children,
  letterSpacing = 0,
  fontWeight = '500',
  color = $theme == 'light' ? $color.gray5d : $color.gray5l,
  style
}) => {
  // Render
  return (
    <Text
      style={[
        {
          fontSize: fontSize,
          letterSpacing: letterSpacing,
          fontWeight: fontWeight,
          color: color
        },
        style
      ]}>
      {children}
    </Text>
  )
}

export default WsTitle
