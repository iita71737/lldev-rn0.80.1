import React from 'react'
import { View, TouchableHighlight, TouchableOpacity } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsToggleBtn = props => {

  // Props
  const {
    onPress,
    style,
    selectBgc = $color.primary10l,  // DO NOT CHANGE 
    selectColor = $color.primary,  // DO NOT CHANGE
    underlayColor = $color.white2d,  // DO NOT CHANGE
    backgroundColor = $color.white, // DO NOT CHANGE
    isActive,
    children,
    type = 'a',
    textStyle,
    testID
  } = props

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      style={{
        // DO NOT SET
        // flex: 1
        // borderWidth:1,
      }}
      activeOpacity={0.6}
      underlayColor={underlayColor}
      onPress={onPress}
    >
      <>
        {type == 'a' && (
          <View
            style={[
              {
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 8,
                borderWidth: 0.3,
              },
              isActive
                ? {
                  backgroundColor: selectBgc,
                  borderColor: selectColor,
                }
                : {
                  backgroundColor: backgroundColor,
                  borderColor: $color.gray
                },
              style
            ]}>
            <WsText color={isActive ? selectColor : $color.gray}>
              {children}
            </WsText>
          </View>
        )}
        {type == 'b' && (
          <WsFlex
            style={[
              {
                paddingVertical: 16,
                paddingHorizontal: 16,
                backgroundColor: 'transparent',
              },
              style
            ]}>
            <WsFlex
              justifyContent="space-between"
            >
              <WsText
                color={isActive ? selectColor : $color.black2l}
                size={14}
                style={[
                  {
                    flex: 1,
                  },
                  {
                    ...textStyle

                  }
                ]}
              >
                {children}
              </WsText>
              {isActive && (
                <WsIcon
                  style={{
                    position: 'absolute',
                    right: 16,
                    // borderWidth:1,
                  }}
                  name="ws-outline-check"
                  size={30}
                  color={$color.primary}
                />
              )}
            </WsFlex>
          </WsFlex>
        )}
      </>
    </TouchableOpacity>
  )
}

export default WsToggleBtn
