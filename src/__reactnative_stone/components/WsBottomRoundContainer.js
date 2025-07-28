import React from 'react'
import { View } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsBottomRoundContainer = props => {
  // Props
  const { style, children, padding = 16 } = props

  // Render
  return (
    <View
      style={[
        {
          backgroundColor: $color.primary
        },
        style
      ]}>
      <View
        style={{
          padding: padding,
          borderTopStartRadius: padding,
          borderTopEndRadius: padding,
          backgroundColor: $color.primary11l
        }}>
        {children}
      </View>
    </View>
  )
}

export default WsBottomRoundContainer
