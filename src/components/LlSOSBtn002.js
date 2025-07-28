import React from 'react';
import {
  View,
  TouchableHighlight,
  StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native';
import {
  WsIcon,
  WsLoading,
  WsText,
  WsFlex,
  LlSOSBtn001,
} from '@/components'
import $theme from '@/__reactnative_stone/global/theme'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

// [看板-full]右上角求救按鈕
const LlSOSBtn002 = (props) => {
  const { t, i18n } = useTranslation();
  const {
    isDisabled = false,
    activeOpacity = .7,
    unClickableOpacity = .3,
    clickableOpacity = 1,
    style,
    children,
    minHeight = 50,
    borderColor = "transparent",
    borderWidth = 0,
    borderRadius = 36,
    isLoading = false,
    color = $color.danger,
    colorDisabled = $theme == 'light' ? $color.primary1l : $color.primary1d,
    loadingColor = $theme == 'light' ? $color.white : $color.black,
    textColor = $color.white,
    underlayColor = "transparent",
    isFullWidth = true,
    onPress
  } = props

  // Component
  const StyleContainer = ({ children, style }) => {

    return (
      <View
        style={[
          {
            backgroundColor: color,
          },
          isDisabled ? {
            backgroundColor: colorDisabled
          } : null,
          style,
        ]}
      >
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

  return (
    <>
      <TouchableHighlight
        onPress={onPress}
        style={[
          isDisabled
            ? { opacity: unClickableOpacity }
            : { opacity: clickableOpacity },
          {
            minHeight: minHeight,
            borderRadius: borderRadius,
          },
          isFullWidth ? {
            width: '100%'
          } : null,
          style
        ]}
        underlayColor={underlayColor}
        activeOpacity={activeOpacity}
      >
        <View>
          <StyleContainer
            {...props}
            style={[
              {
                justifyContent: 'center',
                minHeight: minHeight,
                borderRadius: borderRadius,
                borderColor: borderColor,
                borderWidth: borderWidth,
                paddingHorizontal: 16,
                paddingVertical: 10,
              },
            ]}
          >
            <WsFlex>
              <LlSOSBtn001
                onPress={onPress}
                size={40}
                style={{
                  borderRadius: 40,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  borderRadius: 10,
                  shadowRadius: 4,
                  shadowOpacity: 0.2,
                  elevation: 1,
                }}
              ></LlSOSBtn001>
              {isLoading && (
                <WsLoading
                  color={loadingColor}
                  size="small"
                />
              )}
              {!isLoading && (
                <WsText
                  style={
                    [
                      {
                        textAlign: 'center',
                        color: textColor,
                        flex: 1,
                      }
                    ]
                  }
                  size={14}
                  letterSpacing={1}
                >{t('緊急求助')}</WsText>
              )}
              {!isLoading && typeof (children) == 'object' && (
                <View>{children}</View>
              )}
            </WsFlex>
          </StyleContainer>
        </View>
      </TouchableHighlight>
    </>
  )
}
export default LlSOSBtn002;
