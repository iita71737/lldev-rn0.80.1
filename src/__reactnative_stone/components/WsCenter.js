import React from 'react'
import { View } from 'react-native'

const WsCenter = props => {
  // Prop
  const { children, style } = props

  // Render
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        },
        style
      ]}>
      {children}
    </View>
  )
}

export default WsCenter
