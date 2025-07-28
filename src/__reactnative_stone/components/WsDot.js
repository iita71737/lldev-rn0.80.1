import React from 'react'
import { View } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsDot = props => {
  // Props
  const { size = 10, color = $color.primary, style } = props

  // Render
  return (
    <View
      style={[
        {
          borderRadius: size / 2,
          width: size,
          height: size,
          backgroundColor: color
        },
        style
      ]}
    />
  )
}

export default WsDot
