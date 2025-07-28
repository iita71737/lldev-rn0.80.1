import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import $color from '@/__reactnative_stone/global/color'

const WsGradientCircle = props => {
  // Props
  const {
    start = { x: 0.8, y: 1 },
    end = { x: 0, y: 0 },
    colors = [$color.primary, $color.primary11l],
    size = 100,
    style
  } = props

  const $_checkColors = (colors) => {
    if (colors.includes(undefined)) {
      // UI ERROR CLG
      console.log(colors, 'colors');
      return false
    } else {
      return true
    }
  }


  // Render
  return (
    <LinearGradient
      start={start}
      end={end}
      colors={$_checkColors(colors) ? colors : [$color.primary, $color.primary11l]}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2
        },
        style
      ]}
    />
  )
}

export default WsGradientCircle
