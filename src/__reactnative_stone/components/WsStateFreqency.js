import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WsFlex } from '@/components'
import { Picker } from '@react-native-picker/picker'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsStatePicker = props => {
  // Prop
  const {
    value = '',
    borderWidth = 1,
    onChange,
    borderRadius = 10,
    borderColor = $theme == 'light' ? $color.white5d : $color.black5l,
    items = []
  } = props

  // Render
  return (
    <View
      style={{
        borderWidth: borderWidth,
        borderColor: borderColor,
        borderRadius: borderRadius
      }}>
      <WsFlex>
        <Picker
          style={{
            flex: 1
          }}
          itemStyle={{}}
          selectedValue={value}
          onValueChange={(itemValue, itemIndex) => onChange(itemValue)}>
          {items.map(item => (
            <Picker.Item
              key={item.value}
              label={item.label}
              value={item.value}
              style={{
                fontSize: 14,
                borderRadius: 12
              }}
            />
          ))}
        </Picker>
      </WsFlex>
    </View>
  )
}

const styles = StyleSheet.create({
  WsStatePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    minHeight: 52
  },
  WsStatePickerFocusIOS: {
    paddingVertical: 15
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 13,
    letterSpacing: 1
  }
})

export default WsStatePicker
