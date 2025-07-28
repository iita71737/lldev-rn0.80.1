import React from 'react'
import { View } from 'react-native'
import { WsFlex, WsText } from '@/components'
import gColor from '@/__reactnative_stone/global/color'

const LlInfoContainer001 = props => {
  const { children, style } = props

  return (
    <View
      style={[
        {
          padding: 16,
          backgroundColor: gColor.white
        },
        style
      ]}>
      {children}
    </View>
  )
}

export default LlInfoContainer001
