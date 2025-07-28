import React from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import { WsFlex, WsIcon, WsText, WsDes, WsCollapsible } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlActListingCollapseCard001 = props => {
  // Props
  const {
    children,
    imageLeft,
    fontColor,
    iconLeft,
    fontSize = 14,
    iconLeftColor = $color.gray,
    iconRight = 'md-chevron-up',
    iconRightColor = $color.gray,
    bottomLine = true,
    textRight,
    textRight002,
    textRightSize = 18,
    textRightColor,
    textRight002Color,
    backgroundColor,
    activeOpacity = 0.4,
    iconRightSize = 24,
    subTitle,
    onPress,
    style,
    paddingHorizontal = 16,
    paddingVertical = 10,
    borderRadius = 10,
    leftTitle = '',
    isCollapsed,
    testID
  } = props

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      style={[
        {
          // borderWidth:1,
        },
        style
      ]}
    >
      <View>
        <WsFlex
          style={[
            {
              paddingHorizontal,
              paddingVertical,
              backgroundColor: backgroundColor,
              borderRadius: borderRadius
            }
          ]}
          alignItems="flex-start">
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
                flex: 1,
              }
            ]}>
            <WsText size={fontSize} color={fontColor}>
              {leftTitle ? leftTitle : ''}
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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: textRight002 ? 110 : 24,
              justifyContent: textRight002 ? 'space-between' : 'flex-start'
            }}>
            {textRight002 && (
              <WsDes
                style={{
                  marginRight: 16,
                  fontSize: textRightSize,
                  color: textRight002Color && textRight002Color
                }}>
                {textRight002}
              </WsDes>
            )

            }
            {textRight && (
              <WsDes
                color={textRightColor && textRightColor}
                style={{
                  marginRight: 8,
                  fontSize: textRightSize
                }}>
                {textRight}
              </WsDes>
            )}
            {iconRight && (
              <WsIcon
                name={isCollapsed ? 'md-chevron-down' : 'md-chevron-up'}
                size={iconRightSize}
                color={iconRightColor}
              />
            )}
          </WsFlex>
        </WsFlex>
        {bottomLine && (
          <View style={styles.bottomLineSec}>
            <View style={styles.bottomLine} />
          </View>
        )}
      </View>
    </TouchableOpacity>
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

export default LlActListingCollapseCard001
