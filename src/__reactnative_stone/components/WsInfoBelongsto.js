import React from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { WsText, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsInfoBelongsto = props => {
  // Props
  const {
    value,
    itemIndex,
    length,
    nameKey,
    onPress,
    valueFontSize,
  } = props

  // Render
  return (
    <>
      <View
        style={
          [
            {
            }
          ]}
      >
        <WsText
          size={valueFontSize && valueFontSize}
          fontWeight={400}
          color={onPress ? $color.primary : $color.black}
        >
          {value ? `${value[nameKey]}` : ''}{((length > 1) && ((length - 1) !== itemIndex)) ? ',' : ''}
        </WsText>
      </View>
    </>
  )
}

export default WsInfoBelongsto
