import React from 'react'

import { WsNavButton } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlNavButton002 = props => {
  const {
    backgroundColor,
    paddingVertical = 16,
    children,
    iconLeft,
    iconLeftColor,
    subTitle,
    onPress,
    testID
  } = props

  return (
    <WsNavButton
      backgroundColor={backgroundColor}
      style={{
        marginTop: 8,
        shadowColor: $color.black,
        shadowOffset: {
          width: 2,
          height: 6
        },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 20
      }}
      iconRight="ws-outline-arrow-right"
      iconLeft={iconLeft}
      iconLeftColor={iconLeftColor}
      bottomLine={false}
      fontColor={$color.primary3l}
      iconRightColor={$color.primary3l}
      subTitle={subTitle}
      fontSize={18}
      paddingVertical={paddingVertical}
      onPress={onPress}
      testID={testID}
    >
      {children}
    </WsNavButton>
  )
}

export default LlNavButton002
