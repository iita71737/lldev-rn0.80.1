import React from 'react'
import { TouchableHighlight, TouchableOpacity } from 'react-native'
import { WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsIconBtn = ({
  // Prop
  name,
  size = 15,
  iconRotate,
  color = $color.primary,
  style,
  onPress,
  underlayColor,
  underlayColorPressIn = $color.white2d,
  isRound = true,
  padding = 10,
  disabled = false,
  testID
}) => {
  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={[
          isRound
            ? {
              width: size + padding * 2,
              height: size + padding * 2,
              borderRadius: (size + padding * 2) / 2
            }
            : null,
          {
            padding: padding,
            backgroundColor: underlayColor,
          },
          style,
          disabled && { opacity: 0.5 }
        ]}
        onPress={onPress}
        disabled={disabled}>
        <WsIcon name={name} size={size} color={color} rotate={iconRotate} />
      </TouchableOpacity>
    </>
  )
}

export default WsIconBtn
