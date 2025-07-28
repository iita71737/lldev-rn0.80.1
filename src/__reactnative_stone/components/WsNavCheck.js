import React, { useState, useEffect } from 'react'
import { WsNavButton } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsNavCheck = props => {
  // Props
  const {
    style,
    paddingHorizontal,
    paddingVertical,
    backgroundColor,
    children,
    bottomLine = false,
    value,
    onChange,
    disabled,
    fontColor,
    testID,
    textRight,
    defaultRightWidthTimes,
    textRightWidthTimes,
    defaultLeftWidthTime,
    textLeftWidthTimes
  } = props

  // State
  const [iconRight, setIconRight] = useState('md-check-box-outline-blank')
  const [iconRightColor, setIconRightColor] = useState($color.gray)

  // Function
  const $_onPress = () => {
    onChange(!value)
  }
  const $_setIcon = () => {
    if (value) {
      setIconRight('md-check-box')
      setIconRightColor($color.primary)
    } else {
      setIconRight('md-check-box-outline-blank')
      setIconRightColor($color.gray)
    }
  }

  useEffect(() => {
    $_setIcon()
  }, [value])

  // Render
  return (
    <WsNavButton
      testID={testID}
      paddingHorizontal={paddingHorizontal}
      paddingVertical={paddingVertical}
      style={style}
      backgroundColor={backgroundColor}
      iconRight={iconRight}
      iconRightColor={iconRightColor}
      bottomLine={bottomLine}
      onPress={$_onPress}
      disabled={disabled}
      fontColor={fontColor}
      textRight={textRight}
      textRightSize={12}
      defaultRightWidthTimes={defaultRightWidthTimes}
      textRightWidthTimes={textRightWidthTimes}
      defaultLeftWidthTime={defaultLeftWidthTime}
      textLeftWidthTimes={textLeftWidthTimes}
    >
      {children}
    </WsNavButton>
  )
}

export default WsNavCheck
