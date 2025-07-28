import React from 'react'
import { View, TouchableHighlight, StyleSheet } from 'react-native'
import { WsIcon, WsLoading, WsText, WsCircle, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsBtnLeftIconCircle = props => {
  // Prop
  const {
    isDisabled = false,
    onPress,
    activeOpacity = 0.7,
    unclickableOpacity = 0.3,
    clickableOpacity = 1,
    style,
    textSize = 16,
    children,
    minHeight = 48,
    borderColor = 'transparent',
    borderWidth = 0,
    borderRadius = 4,
    isLoading = false,
    color = $color.primary,
    colorDisabled = $theme == 'light' ? $color.primary1l : $color.primary1d,
    loadin$color = $theme == 'light' ? $color.white : $color.black,
    textColor = $color.white,
    underlayColor = 'transparent',
    isFullWidth = true,
    icon = 'll-nav-alert-filled',
    circleColor = $color.primary5l,
    iconSize = 24,
    iconColor = $color.white
  } = props

  // Component
  const StyleContainer = ({ children, style }) => {
    return (
      <View
        style={[
          {
            backgroundColor: color
          },
          isDisabled
            ? {
              backgroundColor: colorDisabled
            }
            : null,
          style
        ]}>
        {children}
      </View>
    )
  }

  // Computed
  const _isDisabled = () => {
    if (isDisabled) {
      return true
    } else if (isLoading) {
      return true
    } else {
      return false
    }
  }

  // Render
  return (
    <TouchableHighlight
      disabled={_isDisabled()}
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
          borderRadius: borderRadius
        },
        isFullWidth
          ? {
            width: '100%'
          }
          : null,
        style
      ]}
      underlayColor={underlayColor}
      activeOpacity={activeOpacity}>
      <View>
        <StyleContainer
          {...props}
          style={[
            styles.StyleContainer,
            {
              minHeight: minHeight,
              borderRadius: borderRadius,
              borderColor: borderColor,
              borderWidth: borderWidth,
              paddingHorizontal: 4,
              paddingVertical: 4
            }
          ]}>
          {isLoading && <WsLoading color={loadin$color} size="small" />}
          {!isLoading && typeof children === 'string' && (
            <WsFlex>
              <WsFlex flexDirection="column" justifyContent="center">
                {icon && (
                  <>
                    <WsIcon
                      name={icon}
                      style={{
                        position: 'absolute',
                        zIndex: 3
                      }}
                      size={iconSize}
                      color={iconColor}
                    />
                    <WsCircle
                      color={circleColor}
                      size={iconSize + iconSize / 2}
                      style={{
                        position: 'relative',
                        zIndex: 2
                      }}
                    />
                  </>
                )
                }
              </WsFlex>
              <WsText
                style={[
                  styles.buttonText,
                  {
                    color: textColor,
                    flex: 1
                  }
                ]}
                size={textSize}>
                {children}
              </WsText>
            </WsFlex>
          )}
          {!isLoading && typeof children === 'object' && (
            <View>{children}</View>
          )}
        </StyleContainer>
      </View>
    </TouchableHighlight>
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

export default WsBtnLeftIconCircle
