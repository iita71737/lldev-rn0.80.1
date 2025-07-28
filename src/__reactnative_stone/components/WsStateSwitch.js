import React from 'react'
// import Switch from 'react-native-switch-pro'
import {Switch, StyleSheet} from 'react-native';
import $color from '@/__reactnative_stone/global/color'

const WsSwitch = props => {
  // Props
  const {
    width = 40,
    height = 24,
    value,
    disabled,
    style,
    backgroundInactive,
    onChange,
    onAsyncPress,
    mode = 'default'
  } = props

  // Render
  return (
    <>
      <Switch
        width={width}
        height={height}
        value={value}
        disabled={disabled}
        backgroundActive={$color.primary}
        backgroundInactive={backgroundInactive}
        onSyncPress={(value) => {
          onChange(value)
          if (mode === 'number') {
            if (value === 'false') {
              onChange(0)
            } else if (value === 'false') {
              onChange(1)
            }
          }
        }}
        onAsyncPress={onAsyncPress}
        style={[style]}
      />
    </>
  )
}

export default WsSwitch
