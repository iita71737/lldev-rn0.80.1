import React, { useEffect } from 'react'
import { Image } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import { WsText, WsFlex, WsIcon } from '@/components'

const WsIconTitle = props => {
  // Props
  const {
    icon,
    image,
    iconSize = 24,
    size = '18',
    color = $color.primary,
    style,
    marginTop = 8,
    marginBottom = 8,
    children
  } = props

  // Render
  return (
    <WsFlex
      style={[
        {
          marginTop,
          marginBottom
        },
        style
      ]}>
      {icon && <WsIcon name={icon} size={iconSize} color={color} />}
      {image && (
        <Image
          source={{
            width: iconSize,
            height: iconSize,
            uri: image
          }}
        />
      )}
      <WsText
        size={size}
        style={[
          {
            color: color,
            marginLeft: 8
          }
        ]}>
        {children}
      </WsText>
    </WsFlex>
  )
}

export default WsIconTitle
