import React from 'react'
import { Linking, Pressable } from 'react-native'
import { WsText } from '@/components'

const WsInfoPhone = props => {
  // Props
  const { children, color, value } = props

  // Render
  return (
    <>
      <Pressable
        onPress={() => {
          Linking.openURL(`tel:${value}`)
        }}>
        <WsText color={color}>{children ? children : '-'}</WsText>
      </Pressable>
    </>
  )
}

export default WsInfoPhone
