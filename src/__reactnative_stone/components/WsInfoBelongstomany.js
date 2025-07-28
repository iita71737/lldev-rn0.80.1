import React from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import { WsText, WsIcon, WsInfoBelongsto, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsInfoBelongstomany = props => {
  // Props
  const {
    value,
    nameKey = "name",
    onPress,
    style,
    valueFontSize,
    valueMaxWidth
  } = props

  // Render
  return (
    <View
      style={
        [
          {
            flexWrap: 'nowrap',
            maxWidth: valueMaxWidth,
            // flexDirection: 'row'
          },
        ]}
    >
      {value &&
        value.length > 0 &&
        value.map((item, itemIndex) => (
          <WsInfoBelongsto
            key={itemIndex}
            value={item}
            itemIndex={itemIndex}
            length={value.length}
            nameKey={nameKey}
            valueFontSize={valueFontSize}
          />
        ))}
    </View>
  )
}

export default WsInfoBelongstomany
