import React from 'react'
import { View } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsPaddingContainer = props => {
  // Prop
  const {
    style,
    children,
    padding = 16,
    borderColor = $color.white3,
    backgroundColor,
    alignItems,
    testID
  } = props

  // Render
  return (
    <View
      testID={testID}
      style={[
        {
          alignItems: alignItems,
          padding: padding,
          borderColor: borderColor,
          backgroundColor: backgroundColor
        },
        style
      ]}>
      {children}
    </View>
  )
}

export default WsPaddingContainer
