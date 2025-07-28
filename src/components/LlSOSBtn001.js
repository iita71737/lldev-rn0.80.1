import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { Pressable, View, TouchableOpacity } from 'react-native'
import { WsIconBtn, WsIconCircle } from '@/components'
import $color from '@/__reactnative_stone/global/color'

// [看板-full]右上角求救按鈕
const WsSOSBtn001 = props => {

  const {
    style,
    size = 36,
    padding = 8,
    onPress
  } = props

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={[
          {
            borderRadius: 40,
            // backgroundColor: 'transparent',
            backgroundColor: $color.danger,
            shadowColor: '#000',
            shadowOffset: {
              width: 3,
              height: 2
            },
            shadowRadius: 2,
            shadowOpacity: 0.1,
            elevation: 15
          },
          style
        ]}>
        <WsIconCircle
          size={size}
          padding={padding}
          color="#ffffff"
          text="SOS"
          textStyle={{
            position: 'absolute',
            // borderWidth:1,
            width: 36,
            height: 24,
            alignSelf: 'center',
          }}
          gradientColor={[$color.danger, $color.danger4l]}
          isGradient={true}
          style={{
            backgroundColor: $color.danger,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2
            },
            borderRadius: 40,
            shadowRadius: 4,
            shadowOpacity: 0.2,
            elevation: 1
          }}
        />
      </TouchableOpacity>
    </>
  )
}
export default WsSOSBtn001
