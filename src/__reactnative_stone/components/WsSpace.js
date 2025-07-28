import React from 'react'
import { View } from 'react-native'

const WsSpace = props => {
  // Props
  const { children } = props

  // Render
  return (
    <View
      style={{
        marginTop: 20
      }}>
      {children}
    </View>
  )
}

export default WsSpace
