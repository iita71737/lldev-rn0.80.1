import React from 'react'
import { View } from 'react-native'

const WsFlex = props => {
  // Props
  const {
    children,
    style,
    flexDirection = 'row',
    alignItems = 'center',
    justifyContent = 'flex-start',
    flexWrap,
    testID
  } = props

  // Render
  return (
    <View
      testID={testID}
      style={[
        {
          flexDirection,
          alignItems,
          justifyContent,
          flexWrap
        },
        style
      ]}>
      {children}
    </View>
  )
}

export default WsFlex
