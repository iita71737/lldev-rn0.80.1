import React from 'react'

import { WsNavButton } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlNavButton003 = props => {
  const {
    children,
    iconLeft,
    subTitle,
    onPress,
    textRight,
    textRight002,
    textRightSize,
    imageLeft,
    activeOpacity,
    iconRightSize,
    iconRightVisible,
    fontColor = $color.black2l,
    title,
    textRightColor,
    textRight002Color,
    textRightOnPress,
    textRight002OnPress,
    disabled,
    paddingVertical = 16,
    testID001,
    testID002,
  } = props

  // HELPER
  const removePrefix = (str, prefix) => {
    if (str.startsWith(prefix)) {
      return str.slice(prefix.length);
    }
    return str;
  }

  return (
    <WsNavButton
      iconRightSize={iconRightSize}
      iconRight="md-chevron-right"
      iconRightVisible={iconRightVisible}
      iconLeft={iconLeft}
      imageLeft={imageLeft}
      bottomLine={false}
      leftTitle={title}
      iconLeftColor={$color.primary}
      fontColor={fontColor}
      iconRightColor={$color.gray4d}
      subTitle={subTitle}
      activeOpacity={activeOpacity}
      fontSize={16}
      paddingVertical={paddingVertical}
      onPress={onPress}
      disabled={disabled}
      textRight={textRight}
      textRight002={textRight002}
      textRightSize={textRightSize}
      textRightColor={textRightColor}
      textRight002Color={textRight002Color}
      textRightOnPress={textRightOnPress}
      textRight002OnPress={textRight002OnPress}
      iconRight={removePrefix(textRight, '+') == 0 && removePrefix(textRight002, '+') == 0 ? "" : 'md-chevron-right'}
      textRightOnPressDisable={textRight == 0 ? true : false}
      textRight002OnPressDisable={textRight002 == 0 ? true : false}
      testID001={testID001}
      testID002={testID002}
    >
      {children}
    </WsNavButton>
  )
}

export default LlNavButton003
