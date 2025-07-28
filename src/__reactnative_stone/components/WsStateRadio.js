import React, { useEffect } from 'react'
import {
  Dimensions,
  View,
  TouchableOpacity,
} from 'react-native'
import {
  WsStateRadioItem,
  WsFlex,
  WsIcon,
  WsText
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsStateRadio = props => {
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    value,
    onChange,
    items = [],
    disabled,
    isError,
    borderColorError = $color.danger,
    style,
    testID,
    autoFocus = false,
    remindColor = $color.primary,
  } = props

  // Variable
  const windowWidth = Dimensions.get('window').width
  const _remind = items[value - 1]?.showRemind?.remind
  const _remindColor = items[value - 1]?.showRemind?.remindColor

  // Function
  const $_isActive = itemValue => {
    if (value != null) {
      return itemValue === value
    }
    if (value == null && itemValue === 0) {
      return true
    }
  }

  const $_onPress = itemValue => {
    onChange(itemValue)
  }

  // Render
  return (
    <>
      <WsFlex
        style={[
          {
            // DO NOT SET
            // flex: 1,
            flexWrap: 'wrap',
            // borderWidth:1,
          },
          style,
          isError
            ? {
              borderRadius: 5,
              borderWidth: 1,
              borderColor: borderColorError
            }
            : null
        ]}>
        {items.map((item, index) => (
          <View
            testID={testID}
            key={index}
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 20,
                // borderWidth:1,
              },
              item.style ? {
                ...item.style,
              } : null
            ]
            }>
            <WsStateRadioItem
              testID={item.label}
              disabled={disabled}
              key={item.value}
              label={item.label}
              isActive={$_isActive(item.value)}
              onPress={() => {
                $_onPress(item.value)
              }}
            />
          </View>
        ))}
      </WsFlex>

      {_remind && (
        <>
          <TouchableOpacity
            onPress={() => {
            }}>
            <WsFlex
              style={
                [
                  autoFocus ? null :
                    {
                      marginTop: 12
                    }
                ]
              }>
              <WsIcon
                name="md-info-outline"
                color={_remindColor}
                style={{
                  marginRight: 6
                }}
                size={16}
              />
              <WsText
                style={{
                  paddingRight: 16
                }}
                size={12}
                color={_remindColor}>
                {_remind}
              </WsText>
            </WsFlex>
          </TouchableOpacity>
        </>
      )}

    </>
  )
}

export default WsStateRadio
