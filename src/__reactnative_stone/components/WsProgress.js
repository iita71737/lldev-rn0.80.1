import React from 'react'
import * as Progress from 'react-native-progress'
import { Dimensions } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsProgress = props => {
  const windowWidth = Dimensions.get('window').width
  // Props
  const {
    progress = 0.5,
    borderRadius = 0,
    width = windowWidth,
    style,
    color = $color.primary
  } = props

  // Render
  return (
    <>
      <Progress.Bar
        progress={progress}
        animated={true}
        borderRadius={borderRadius}
        borderWidth={0}
        width={width}
        style={[style]}
        height={3}
        color={color}
      />
    </>
  )
}

export default WsProgress
