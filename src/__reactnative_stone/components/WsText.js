import React from 'react'
import { Text, StyleSheet } from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsText = ({
  // Prop
  children,
  color = $color.black,
  size = 14,
  fontWeight,
  style,
  textAlign,
  letterSpacing,
  numberOfLines,
  ellipsizeMode,
  selectable = false,
  testID,
  onTextLayout
}) => {

  // Render
  return (
    <Text
      selectable={selectable}
      testID={testID}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      selectable={selectable}
      onTextLayout={onTextLayout}
      style={[
        styles[`text${size}`],
        {
          color: color,
          fontWeight: fontWeight,
          textAlign: textAlign,
          letterSpacing: letterSpacing,
          flexWrap: 'wrap',    // 允許換行-250421
        },
        style
      ]}>
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  text60: {
    fontSize: 60,
    lineHeight: 84,
    letterSpacing: 1
  },
  text48: {
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: 1
  },
  text36: {
    fontSize: 36,
    lineHeight: 48,
    letterSpacing: 1
  },
  text28: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 1
  },
  text24: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 0.6
  },
  text18: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.6
  },
  text16: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.6
  },
  text14: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.6
  },
  text12: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6
  }
})

export default WsText
