import React from 'react'
import { WsIcon, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsIconTitleCircle = props => {
  // Props
  const {
    size = 40,
    title,
    icon,
    padding = 20,
    fontSize = 14,
    color = $color.white,
    backgroundColor = $color.primary
  } = props

  // Render
  return (
    <WsFlex
      flexDirection="column"
      justifyContent="center"
      style={{
        width: size * 2.5,
        height: size * 2.5,
        flex: 0,
        borderRadius: (size * 2.5) / 2,
        paddingVertical: padding,
        backgroundColor: backgroundColor
      }}>
      <WsIcon
        color={color}
        name={icon}
        size={size}
        style={{
          marginBottom: 4
        }}
      />
      <WsText color={color} size={fontSize}>
        {title}
      </WsText>
    </WsFlex>
  )
}

export default WsIconTitleCircle
