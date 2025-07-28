import React, { useRef, useState, useEffect } from 'react'
import { StyleSheet, Animated, View } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsLoadingDot = ({ loading, mode = 'a' }) => {
  const ANIMATION_DURATION = 800
  const scaleUp = useRef(new Animated.Value(0)).current
  const scaleDown = useRef(new Animated.Value(1)).current
  const translateRight = useRef(new Animated.Value(0)).current

  // Function
  const dotScaleUp = () => {
    Animated.loop(
      Animated.timing(scaleUp, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      { iterations: -1 }
    ).start()
  }
  const dotScaleDown = () => {
    Animated.loop(
      Animated.timing(scaleDown, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      { iterations: -1 }
    ).start()
  }
  const dotTranslateRight = () => {
    Animated.loop(
      Animated.timing(translateRight, {
        toValue: 18,
        duration: ANIMATION_DURATION,
        useNativeDriver: true
      }),
      { iterations: -1 }
    ).start()
  }
  useEffect(() => {
    if (loading) {
      dotScaleUp()
      dotScaleDown()
      dotTranslateRight()
    }
  }, [loading])

  // Render
  return (
    <View style={mode === 'b' && styles.underlayerContainer}>
      <View style={styles.dotLoadingIndicatorContainer}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 21,
              left: 5,
              width: 8,
              height: 8,
              borderRadius: 6,
              backgroundColor: $color.primary,
            },
            {
              transform: [
                {
                  scale: scaleUp
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 21,
              left: 5,
              width: 8,
              height: 8,
              borderRadius: 6,
              backgroundColor: $color.primary
            },
            {
              transform: [
                {
                  translateX: translateRight
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 21,
              left: 23,
              width: 8,
              height: 8,
              borderRadius: 6,
              backgroundColor: $color.primary
            },
            {
              transform: [
                {
                  translateX: translateRight
                }
              ]
            }
          ]}
        />
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 21,
              left: 41,
              width: 8,
              height: 8,
              borderRadius: 6,
              backgroundColor: $color.primary
            },
            {
              transform: [
                {
                  scale: scaleDown
                }
              ]
            }
          ]}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  dotLoadingIndicatorContainer: {
    width: 54,
    height: 54
  },
  underlayerContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: $color.white,
    borderRadius: 10
  }
})

export default WsLoadingDot
