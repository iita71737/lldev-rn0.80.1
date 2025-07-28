import React from 'react'
import { Linking, TouchableOpacity } from 'react-native'
import { WsText } from '@/components'

const WsInfoEmail = props => {
  // Props
  const { children, color, value, style } = props

  // Render
  return (
    <>
      <TouchableOpacity
        style={{
          style
        }}
        onPress={() => {
          Linking.openURL(`mailto:${value}`)
        }}>
        <WsText color={color}>{children ? children : ''}</WsText>
      </TouchableOpacity>
    </>
  )
}

export default WsInfoEmail
