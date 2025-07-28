import React from 'react'
import { View } from 'react-native'

const WsCircle = props => {
  // Props
  const { size = 30, color, style } = props

  // Render
  return (
    <>
      <View
        style={[
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2
          },
          style
        ]}
      />
    </>
  )
}

export default WsCircle
