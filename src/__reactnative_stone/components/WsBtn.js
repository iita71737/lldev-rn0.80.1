import React from 'react'
import {
  View,
  TouchableHighlight,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import { WsIcon, WsLoading, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsBtn = props => {
  // Prop
  const {
    isDisabled = false,
    onPress,
    activeOpacity = 0.7,
    unclickableOpacity = 0.3,
    clickableOpacity = 1,
    style,
    textSize = 14,
    children,
    minHeight = 48,
    borderColor = 'transparent',
    borderWidth = 0,
    rightIcon = null,
    rightIconColor,
    borderRadius = 4,
    isLoading = false,
    color = $color.primary,
    colorDisabled = 'transparent',
    loadin$color = $theme == 'light' ? $color.white : $color.black,
    textColor = $color.white,
    underlayColor = 'transparent',
    isFullWidth = true,
    testID
  } = props

  // Computed
  const _isDisabled = React.useMemo(() => {
    if (isDisabled) {
      return true
    } else if (isLoading) {
      return true
    } else {
      return false
    }
  }, [isDisabled])

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      disabled={_isDisabled}
      onPress={$event => {
        if (onPress) {
          onPress($event)
        }
      }}
      onBlur={() => { }}
      style={[
        isDisabled
          ? { opacity: unclickableOpacity }
          : { opacity: clickableOpacity },
        {
          minHeight: minHeight,
          borderRadius: borderRadius,
          justifyContent: 'center',
          backgroundColor: _isDisabled ? colorDisabled : color,
        },
        isFullWidth
          ? {
            width: '100%'
          }
          : null,
        style
      ]}
      underlayColor={underlayColor}
      activeOpacity={activeOpacity}
    >
      <View>
        {isLoading && <WsLoading color={loadin$color} size="small" />}
        {!isLoading && typeof children === 'string' && (
          <WsText
            style={[
              styles.buttonText,
              {
                color: textColor,
                paddingHorizontal: 8
              }
            ]}
            size={textSize}>
            {children}
          </WsText>
        )}
        {!isLoading && typeof children === 'object' && (
          <>
            {children}
          </>
        )}
        {rightIcon && (
          <WsIcon
            style={[styles.RightIcon]}
            name={rightIcon}
            size={24}
            color={rightIconColor}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  StyleContainer: {
    justifyContent: 'center'
  },
  buttonText: {
    textAlign: 'center'
  },
  RightIcon: {
    position: 'absolute',
    right: 17,
    top: 20
  }
})

export default WsBtn
