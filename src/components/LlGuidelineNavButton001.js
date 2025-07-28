import React from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import { WsFlex, WsIcon, WsText, WsDes } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlGuidelineNavButton001 = props => {
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    children,
    imageLeft,
    fontColor = $color.black,
    iconLeft,
    fontSize = 14,
    iconLeftColor = $color.gray,
    iconRight = 'md-chevron-right',
    iconRightVisible = true,
    iconRightColor = $color.gray,
    bottomLine = true,
    textRight,
    textRightWidthTimes = 0.1,
    textLeftWidthTimes = 0.4,
    textRight002,
    textRightSize = 18,
    textRightColor,
    textRight002Color,
    backgroundColor,
    activeOpacity = 0.4,
    iconRightSize = 24,
    subTitle,
    onPress,
    disabled = false,
    style,
    paddingHorizontal = 16,
    paddingVertical = 10,
    borderRadius = 8,
    leftTitle = '',
    textRightOnPress,
    textRight002OnPress,
    textRightOnPressDisable = false,
    textRight002OnPressDisable = false,
    testID001,
    testID002,
    testID,
    defaultRightWidthTimes = 0.325,
    defaultLeftWidthTime = 0.375,
    onTitlePress
  } = props

  // Render
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        {
        },
        style
      ]}
    >
      <View
        style={{
          // borderWidth: 1
        }}
      >
        <WsFlex
          style={[
            {
              paddingHorizontal,
              paddingVertical,
              backgroundColor: backgroundColor,
              borderRadius: borderRadius,
            }
          ]
          }
        >
          {iconLeft && (
            <WsIcon
              name={iconLeft}
              size={24}
              color={iconLeftColor}
            />
          )}
          <View
            style={[
              {
                marginLeft: 8,
                // borderWidth:1,
              }
            ]}>
            <TouchableOpacity
              style={{
              }}
              onPress={() => {
                onTitlePress()
              }}
            >
              {children ? children : ''}
            </TouchableOpacity>
          </View>
        </WsFlex>
      </View>
    </TouchableOpacity >
  )
}

const styles = StyleSheet.create({
  imageLeft: {
    width: 24,
    height: 24
  },
})

export default LlGuidelineNavButton001
