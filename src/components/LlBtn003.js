import React, { useState } from 'react'

import { WsBtn } from '@/components'
import gColor from '@/__reactnative_stone/global/color'

const LlBtn003 = props => {
  const { children, onPress, style, textColor = gColor.gray } = props

  return (
    <WsBtn
      color={'transparent'}
      textColor={textColor}
      borderWidth={1}
      isFullWidth={false}
      borderRadius={25}
      onPress={onPress}
      style={[style]}>
      {children}
    </WsBtn>
  )
}

export default LlBtn003
