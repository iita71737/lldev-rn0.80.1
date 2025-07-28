import React from 'react'
import { WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsDes = ({ children, color = $color.gray, style, size = 12 }) => {

  // Render
  return (
    <WsText color={color} size={size} style={[style]}>
      {children}
    </WsText>
  )
}

export default WsDes
