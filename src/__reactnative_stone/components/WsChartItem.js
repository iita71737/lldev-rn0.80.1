import React from 'react'
import { View, Pressable } from 'react-native'
import { WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsChartItem = props => {
  // Props
  const {
    color = $color.primary,
    text,
    textSize = 14,
    colorSize = 16,
    colorBorderRadius = colorSize / 3,
    style,
    onPress
  } = props

  // Render
  return (
    <>
      <Pressable onPress={onPress}>
        <WsFlex style={[style]}>
          <View
            style={{
              marginRight: 4,
              width: colorSize,
              height: colorSize,
              backgroundColor: color,
              borderRadius: colorBorderRadius
            }}
          />
          <WsText size={textSize}>{text}</WsText>
        </WsFlex>
      </Pressable>
    </>
  )
}

export default WsChartItem
