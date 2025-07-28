import React from 'react'
import { View } from 'react-native'
import { WsGrid, WsToggleBtn } from '@/components'
import { useTranslation } from 'react-i18next'

const WsFilterButtons = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    items = [],
    value,
    onChange,
    valueKey = 'value',
    multiple = false
  } = props

  // Function
  const $_activeCheck = (value, item) => {
    if (multiple) {
    } else {
      if (value == item[valueKey]) {
        return true
      } else {
        return false
      }
    }
  }
  const $_onPress = item => {
    if (multiple) {
    } else {
      if ($_activeCheck(value, item)) {
        onChange(null)
      } else {
        onChange(item[valueKey])
      }
    }
  }

  // Render
  return (
    <>
      <WsGrid
        style={{
          marginHorizontal: 10,
        }}
        data={items}
        numColumns={2}
        keyExtractor={(item, itemIndex) => itemIndex}
        renderItem={({ item, itemIndex }) => {
          return (
            <View
              style={{
                paddingLeft: 6,
                paddingRight: 6
              }}>
              <WsToggleBtn
                testID={item.label}
                onPress={() => {
                  $_onPress(item)
                }}
                key={itemIndex}
                isActive={$_activeCheck(value, item)}>
                {t(item.label)}
              </WsToggleBtn>
            </View>
          )
        }}
      />
    </>
  )
}

export default WsFilterButtons
