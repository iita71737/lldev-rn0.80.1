import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  WsFlex,
  WsIcon,
  WsText,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsStateCheckBox002 = props => {
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    iconRightVisible = true,
    iconLeftColor = $color.gray,
    iconRightSize = 24,
    checkboxText = '是',
    value,
    disabled,
    onChange,
    style,
  } = props

  // State
  const [iconRight, setIconRight] = useState('md-check-box-outline-blank')
  const [iconRightColor, setIconRightColor] = useState($color.gray)

  // Function
  const $_onPress = () => {
    if (value) {
      onChange(false)
    } else {
      onChange(true)
    }
  }
  const $_setIcon = () => {
    if (value) {
      setIconRight('md-check-box')
      setIconRightColor($color.primary)
    } else {
      setIconRight('md-check-box-outline-blank')
      setIconRightColor($color.gray)
    }
  }

  useEffect(() => {
    $_setIcon()
  }, [value])

  // Render
  return (
    <TouchableOpacity
      style={{
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
      disabled={disabled}
      onPress={$_onPress}
    >
      <WsFlex>
        {iconRight && iconRightVisible && (
          <WsIcon
            style={{
            }}
            name={iconRight}
            size={iconRightSize}
            color={iconRightColor}
          />
        )}
        <WsDes
          style={{
            marginLeft: 4,
            fontSize: 14,
            color: value ? $color.black : $color.gray
          }}>
          {checkboxText}
        </WsDes>
      </WsFlex>
    </TouchableOpacity >
  )
}

export default WsStateCheckBox002
