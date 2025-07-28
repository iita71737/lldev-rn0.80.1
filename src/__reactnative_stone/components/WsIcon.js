const Icon = createIconSetFromIcoMoon(icoMoonConfig, 'icomoon', 'icomoon.ttf')
import React from 'react'
import { View } from 'react-native'
import { createIconSetFromIcoMoon } from 'react-native-vector-icons'
import icoMoonConfig from '@/__reactnative_stone/assets/icomoon/selection.json'
import $color from '@/__reactnative_stone/global/color'

const WsIcon = ({
  // Prop
  name,
  size = 15,
  color = $color.primary,
  style,
  rotate = '0deg'
}) => {

  // Render
  return (
    <View
      style={[
        {
          alignItems: 'center',
          transform: [{ rotate: rotate }],
        },
        style
      ]}>
      <Icon
        name={name}
        size={size}
        color={color}
        style={{
          width: size,
          height: size,
          textAlign: 'center',
          alignSelf: 'center'
        }}
      />
    </View>
  )
}
export default WsIcon
