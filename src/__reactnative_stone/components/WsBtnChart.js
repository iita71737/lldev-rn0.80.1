import React from 'react'
import { TouchableHighlight } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsBtnChart = props => {
  // Props
  const {
    style,
    icon,
    onPress,
    size,
    colors = [$color.primary4l, $color.primary],
    shadowColor = $color.primary8d,
    testID
  } = props

  // Render
  return (
    <TouchableHighlight
      testID={testID}
      style={[
        {
          width: size || 48,
          height: size || 48,
          position: 'absolute',
          right: 12,
          bottom: 16,
          zIndex: 9,
          borderRadius: 24,
          shadowColor: shadowColor,
          shadowOffset: {
            width: 0,
            height: 5
          },
          shadowRadius: 6,
          shadowOpacity: 1,
          elevation: 5
        },
        style
      ]}
      onPress={onPress}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 0.9 }}
        colors={colors}
        style={[
          {
            alignItems: 'center',
            justifyContent: 'center'
          },
          { borderRadius: style ? style.borderRadius : 24 },
          { width: size || 48, height: size || 48 }
        ]}>
        <WsIcon name={icon} size={size ? size - 16 : 29} color="#ffffff" />
      </LinearGradient>
    </TouchableHighlight>
  )
}

export default WsBtnChart
