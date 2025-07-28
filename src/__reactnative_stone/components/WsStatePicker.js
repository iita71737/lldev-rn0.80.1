import React from 'react'
import { Platform } from 'react-native'
import { WsStatePickerIOS, WsStatePickerAndroid } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsStatePicker = props => {
  // Prop
  const {
    value,
    borderWidth = 1,
    onChange,
    borderRadius = 5,
    borderColor = $theme == 'light' ? $color.gray3l : $color.black3l,
    items = [],
    preText,
    placeholder,
    defaultValue,
    enabled = true,
    title,
    pickerNum,
    loading,
    testID,
    nameKey
  } = props

  // Render
  return (
    <>
      {Platform.OS === 'ios' && (
        <WsStatePickerIOS
          testID={testID}
          nameKey={nameKey}
          value={value}
          borderWidth={borderWidth}
          onChange={onChange}
          borderRadius={borderRadius}
          borderColor={borderColor}
          items={items}
          preText={preText}
          placeholder={placeholder}
          defaultValue={defaultValue}
          enabled={enabled}
          title={title}
          pickerNum={pickerNum}
          loading={loading}
        />
      )}
      {Platform.OS === 'android' && (
        <WsStatePickerAndroid
          testID={testID}
          nameKey={nameKey}
          value={value}
          borderWidth={borderWidth}
          onChange={onChange}
          borderRadius={borderRadius}
          borderColor={borderColor}
          items={items}
          preText={preText}
          placeholder={placeholder}
          defaultValue={defaultValue}
          enabled={enabled}
          title={title}
          pickerNum={pickerNum}
          loading={loading}
        />
      )}
    </>
  )
}

export default WsStatePicker
