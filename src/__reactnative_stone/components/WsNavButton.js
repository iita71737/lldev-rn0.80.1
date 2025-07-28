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

const WsNavButton = props => {
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
    defaultLeftWidthTime = 0.375
  } = props

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={[style]}
    >
      <View
        style={{
          // borderWidth:1
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
          ]}
          alignItems="center"
          justifyContent="space-between"
        >
          {iconRight && iconRightVisible && (
            <WsIcon
              style={{
                // position: 'absolute',
                // right: 16,
                // borderWidth:1
                marginRight: 4
              }}
              name={iconRight}
              size={iconRightSize}
              color={iconRightColor}
            />
          )}

          {imageLeft && (
            <Image source={{ uri: imageLeft }} style={styles.imageLeft} />
          )}
          {iconLeft && (
            <WsIcon name={iconLeft} size={24} color={iconLeftColor} />
          )}
          <View
            style={[
              imageLeft || iconLeft
                ? {
                  marginLeft: 8
                }
                : null,
              {
                minWidth: width * defaultLeftWidthTime,
                // borderWidth:1,
              }
            ]}>
            <WsText size={fontSize} color={fontColor}
              style={{
                maxWidth: width * textLeftWidthTimes,
              }}
            >
              {children ? children : leftTitle ? leftTitle : ''}
            </WsText>
            {subTitle && (
              <WsDes
                style={{
                  marginTop: 8
                }}>
                {subTitle}
              </WsDes>
            )}
          </View>

          <WsFlex
            justifyContent={'space-between'}
            style={{
              width: width * defaultRightWidthTimes,
              flexDirection: 'row',
              // borderWidth: 2,
            }}>
            {textRight002 && (
              <TouchableOpacity
                disabled={textRight002OnPressDisable}
                style={{
                  alignItems: 'space-between',
                  width: width * 0.1,
                  paddingVertical: 16,
                  // borderWidth: 1,
                }}
                onPress={textRight002OnPress}
                testID={testID001}
              >
                <WsDes
                  style={{
                    // borderWidth:1,
                    fontSize: textRightSize,
                    color: textRight002Color && textRight002Color
                  }}>
                  {textRight002}
                </WsDes>
              </TouchableOpacity>
            )}
            {textRight && (
              <TouchableOpacity
                disabled={textRightOnPressDisable}
                onPress={textRightOnPress}
                style={{
                  alignItems: 'center', // 250421
                  width: width * textRightWidthTimes,
                  // borderWidth: 1,
                }}
                testID={testID002}
              >
                <WsDes
                  color={textRightColor && textRightColor}
                  style={{
                    // borderWidth:1,
                    fontSize: textRightSize
                  }}>
                  {textRight}
                </WsDes>
              </TouchableOpacity>
            )}
          </WsFlex>
        </WsFlex>
        {bottomLine && (
          <View style={styles.bottomLineSec}>
            <View style={styles.bottomLine} />
          </View>
        )}
      </View>
    </TouchableOpacity >
  )
}

const styles = StyleSheet.create({
  imageLeft: {
    width: 24,
    height: 24
  },
  text: {
    flex: 1,
    marginLeft: 8,
    fontSize: 17,
    fontWeight: '500',
    lineHeight: 22,
    letterSpacing: 0.5,
    color: '#4a4a4a'
  },
  textRight: {
    marginRight: 8,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 24,
    letterSpacing: 0.5,
    color: '#808080'
  },
  bottomLineSec: {
    paddingLeft: 20,
    paddingRight: 20,
    height: 1,
    backgroundColor: '#fff'
  },
  bottomLine: {
    height: 1,
    backgroundColor: '#dadada'
  }
})

export default WsNavButton
