import React from 'react'
import { ActivityIndicator } from 'react-native'
import { WsLoadingDotView, WsLoadingImageSwitch } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsLoading = ({
  // Prop
  size = 'large',
  color = $color.primary,
  style,
  type = 'default',
  items = []
}) => {
  // Render
  return (
    <>
      {type == 'default' && (
        <ActivityIndicator style={[style]} size={size} color={color} />
      )}
      {type == 'a' && <WsLoadingDotView style={style} />}
      {type == 'b' && <WsLoadingDotView mode={'b'} style={style} />}
      {type == 'imageswitch' && <WsLoadingImageSwitch items={items} />}
    </>
  )
}

export default WsLoading
