import React from 'react'
import { View } from 'react-native'

const WsViewModal = props => {
  // Props
  const { children, style, visible = true } = props

  // Render
  return <>{visible && <View style={[style]}>{children}</View>}</>
}

export default WsViewModal
