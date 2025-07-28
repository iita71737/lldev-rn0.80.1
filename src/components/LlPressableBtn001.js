import React, { useEffect, useState } from 'react'
import { View, StyleSheet, Pressable } from 'react-native'
import { WsIcon, WsLoading, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { Children } from 'react'
import { translate } from 'i18n-js'

const LlBtn001 = props => {
  // Prop
  const {
    isOnPress,
    onPress,
    color = $color.white,
    colorDisabled = $theme == 'light' ? $color.primary1l : $color.primary1d,
    minHeight = 64,
    width,
    backgroundColor = $color.white,
    style,
    children
  } = props

  // Render
  return (
    <>
      <Pressable onPress={onPress}>
        <WsFlex
          justifyContent="center"
          style={{
            position: 'absolute',
            zIndex: 5,
            width: '100%',
            minHeight: minHeight
          }}>
          <WsText>{children}</WsText>
        </WsFlex>
        <View
          style={{
            zIndex: 3
          }}>
          <View
            style={[
              {
                borderRadius: 10,
                minHeight: minHeight,
                width: width
              },
              isOnPress
                ? {
                  transform: [{ scale: 0.98 }],
                  backgroundColor: $color.primary8l
                }
                : {
                  backgroundColor: $color.white,
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 1,
                    height: 2
                  },
                  shadowRadius: 2,
                  shadowOpacity: 0.5,
                  elevation: 5
                },
              style
            ]}
          />
        </View>
      </Pressable>
    </>
  )
}

export default LlBtn001
