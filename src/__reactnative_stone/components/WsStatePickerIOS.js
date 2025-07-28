import React from 'react'
import {
  View,
  Dimensions,
  Platform
} from 'react-native'
import {
  WsFlex,
  WsBtnSelect,
  WsText,
  WsPopup
} from '@/components'
import { Picker } from '@react-native-picker/picker'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const WsStatePickerIOS = props => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    nameKey,
    value,
    borderWidth,
    onChange,
    borderRadius,
    borderColor = $theme === 'light' ? $color.gray3l : $color.black3l,
    items = [],
    preText,
    pickerNum,
    placeholder = `${t('選擇')}`,
    defaultValue,
    enabled = true,
    title,
    loading,
    testID,
  } = props

  const [visible, setVisible] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value)
  const [text, setText] = React.useState(defaultValue?.label || '')

  const $_setLabel = () => {
    items.forEach(item => {
      if (typeof item === 'object' && Object.keys(value || {}).length !== 0) {
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
    const keys1 = Object.keys(obj1 || {})
    const keys2 = Object.keys(obj2 || {})
    if (keys1.length !== keys2.length) return false
    return keys1.every(k => obj1[k] === obj2[k])
  }

  React.useEffect(() => {
    if (value) $_setLabel()
  }, [value, items])

  return (
    <>
      <WsFlex>
        {preText && <WsText style={{ marginRight: 8 }}>{preText}</WsText>}
        <View
          style={{
            flex: 1,
            borderRadius,
            borderWidth,
            borderColor,
          }}>
          <WsBtnSelect
            testID={testID}
            loading={loading}
            placeholder={t(placeholder)}
            pickerNum={pickerNum}
            text={t(text)}
            onPress={() => {
              setVisible(true)
            }}
          />
        </View>
      </WsFlex>

      <WsPopup
        active={visible}
        onClose={() => setVisible(false)}
        popupBgRGBA={'rgba(0,0,0,0.6)'}
      >
        <View
          style={{
            width: width * 0.8,
            height: 250,
            backgroundColor: $color.white,
            borderRadius: 12,
            justifyContent: 'center',
            paddingHorizontal: 8,
            paddingBottom: 16,
          }}
        >
          <Picker
            selectedValue={selectedValue}
            enabled={enabled}
            style={{
              height: 200,
              width: '100%',
            }}
            itemStyle={{
              color: '#000',
              fontSize: 16,
            }}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedValue(itemValue)
              setVisible(false)
              onChange?.(itemValue)
            }}
          >
            {items.map((item, index) => (
              <Picker.Item
                key={index}
                label={
                  item.label
                    ? t(item.label)
                    : item[nameKey]
                      ? moment(item[nameKey]).format('YYYY-MM-DD')
                      : ''
                }
                value={item.value}
              />
            ))}
          </Picker>
        </View>
      </WsPopup>
    </>
  )
}

export default WsStatePickerIOS
