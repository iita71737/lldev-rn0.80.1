import React, { useState } from 'react'

import { WsBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlBtn002 = props => {

  const {
    children,
    onPress,
    style,
    textColor = $color.gray,
    borderColor = $color.gray,
    minHeight,
    borderWidth = 1,
    bgColor = 'transparent',
    testID
  } = props

  return (
    <WsBtn
      testID={testID}
      color={bgColor}
      textColor={textColor}
      borderColor={borderColor}
      borderWidth={borderWidth}
      isFullWidth={false}
      borderRadius={25}
      onPress={onPress}
      style={[style]}
      minHeight={minHeight}
    >
      {children}
    </WsBtn>
  )
}

export default LlBtn002
