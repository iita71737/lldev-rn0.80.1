import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { WsFlex, WsText, WsBtnSelect, WsDialog, WsLoading } from '@/components'
import { Picker } from '@react-native-picker/picker'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const WsStatePickerAndroid = props => {
  const { t, i18n } = useTranslation()

  // Prop
  const {
    value = '',
    borderWidth,
    onChange,
    borderRadius = 25,
    borderColor = $theme == 'light' ? $color.white5d : $color.black5l,
    items = [],
    preText,
    pickerNum,
    placeholder,
    defaultValue,
    enabled = true,
    title,
    loading,
    nameKey
  } = props

  // State
  const [visible, setVisible] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const [text, setText] = React.useState(defaultValue ? defaultValue.label : '')

  // Function
  const $_setLabel = () => {
    items.forEach(item => {
      if (typeof item === 'object' && Object.keys(value).length != 0) {
        if (ObjCompare(item.value, value)) {
          setText(item.label)
        }
      }
      if (item.value === value) {
        setText(item.label)
      }
    })
  }

  const ObjCompare = (obj1, obj2) => {
    const Obj1_keys = Object.keys(obj1)
    const Obj2_keys = Object.keys(obj2)

    if (Obj1_keys.length !== Obj2_keys.length) {
      return false
    }
    for (let k of Obj1_keys) {
      if (obj1[k] !== obj2[k]) {
        return false
      }
    }
    return true
  }

  React.useEffect(() => {
    if (value) {
      $_setLabel()
    }
  }, [value, items])

  // Render
  return (
    <>
      <View
        style={{
          borderRadius: borderRadius,
          borderWidth: borderWidth,
        }}
      >
        {pickerNum != undefined && !loading && (
          <View
            style={{
              backgroundColor: $color.primary10l,
              borderRadius: 25,
              width: 32,
              height: 32,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 48,
              top: 12,
              bottom: 0,
            }}>
            <WsText
              fontWeight={'600'}
              size={12}
              style={{
              }}>
              {pickerNum}
            </WsText>
          </View>
        )}
        {loading && (
          <View
            style={{
              borderRadius: 25,
              width: 32,
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
              position: 'absolute',
              right: 48,
              top: 12,
            }}
          >
            <WsLoading></WsLoading>
          </View>
        )}
        <Picker
          style={{
            color: 'black',
          }}
          dropdownIconColor="black"
          enabled={enabled}
          selectedValue={selectedValue}
          placeholder={t(placeholder)}
          onValueChange={(itemValue, itemIndex) => {
            onChange(itemValue)
            setSelectedValue(itemValue)
            setVisible(false)
          }}>
          {items.map(item =>
            item.value == 'default' ? (
              <Picker.Items
                key={item.value}
                label={t(item.label) ? t(item.label) : moment(item[nameKey]).format('YYYY-MM-DD') ? moment(item[nameKey]).format('YYYY-MM-DD') : ''}
                value={item.value}
                disabled={true}
                style={{
                  fontSize: 14,
                  borderRadius: 12,
                }}
              />
            ) : (
              <Picker.Item
                key={item.value}
                label={t(item.label) ? t(item.label) : moment(item[nameKey]).format('YYYY-MM-DD') ? moment(item[nameKey]).format('YYYY-MM-DD') : ''}
                value={item.value}
                style={{
                  fontSize: 14,
                  borderRadius: 12,
                }}
                color={item.value == selectedValue ? $color.primary : $color.gray}
              />
            )
          )}
        </Picker>
      </View>
    </>
  )
}

export default WsStatePickerAndroid
