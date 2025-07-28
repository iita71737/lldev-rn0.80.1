import React from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'

const WsSwipeGestures = props => {
  // Props
  const {
    children,
    onSwipeDown,
    onSwipe = () => { },
    onSwipeUp,
    onSwipeLeft,
    onSwipeRight,
    config,
    backgroundColor,
    style
  } = props

  // Render
  return (
    <GestureRecognizer
      onSwipeDown={onSwipeDown}
      onSwipeUp={onSwipeUp}
      onSwipeRight={onSwipeRight}
      onSwipeLeft={onSwipeLeft}
      config={config}
      onSwipe={(direction, state) => onSwipe(direction, state)}
      onPress={() => {
      }}
      style={[
        {
          backgroundColor: backgroundColor
        },
        style
      ]}>
      <TouchableWithoutFeedback>
        <View>{children}</View>
      </TouchableWithoutFeedback>
    </GestureRecognizer>
  )
}

export default WsSwipeGestures
