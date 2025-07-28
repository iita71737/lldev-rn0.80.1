import React, { useState } from 'react'
import $color from '@/__reactnative_stone/global/color'
import { WsBtn, WsGradientButton } from '@/components'

const LlBtn001 = props => {

  const {
    children,
    onPress,
    style,
    isFullWidth = false,
    btnColor = [$color.primary5l, $color.primary],
    textColor = $color.white,
    borderWidth = 0,
    borderColor,
    disabled,
    testID
  } = props

  return (
    <WsGradientButton
      testID={testID}
      borderColor={borderColor}
      textColor={textColor}
      btnColor={btnColor}
      borderWidth={borderWidth}
      borderRadius={25}
      onPress={onPress}
      style={[style]}
      disabled={disabled}
    >
      {children}
    </WsGradientButton>
  )
}

export default LlBtn001
