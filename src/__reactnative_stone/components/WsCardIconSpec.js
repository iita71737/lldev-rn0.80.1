import React from 'react'
import { Image } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsCardIconSpec = props => {
  // Props
  const {
    text,
    img,
    icon,
    size = 70,
    borderRadius = 8,
    backgroundColor = $color.primary11l,
    color = $color.primary,
    style
  } = props

  // Render
  return (
    <WsFlex
      flexDirection="column"
      justifyContent="center"
      style={[
        {
          width: size,
          height: size,
          backgroundColor: backgroundColor,
          borderRadius: borderRadius,
          paddingVertical: 10,
          paddingHorizontal: 5
        },
        style
      ]}>
      {img && (
        <Image
          style={{
            width: size * 0.5,
            height: size * 0.5
          }}
          source={{
            uri: img
          }}
        />
      )}
      {icon && <WsIcon name={icon} color={color} size={size * 0.5} />}
      <WsText size="12" color={color} letterSpacing={0}>
        {text}
      </WsText>
    </WsFlex>
  )
}

export default WsCardIconSpec
