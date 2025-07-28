import React, { useState } from 'react'
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import {
  WsIconBtn,
  WsIcon,
  WsStateRadioItem,
  WsState
} from '@/components'
import $config from '@/__config'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import store from '@/store'
import { useSelector } from 'react-redux'

const WsStateSwitchBelongto = React.forwardRef(
  (
    {
      value,
      onChange,
      disabled = false,
      switchTextInputItemLabel
    },
    ref
  ) => {

    // Redux
    const currentFactory = useSelector(state => state.data.currentFactory)

    // State
    const [belongToValue, setBelongToValue] = useState(value)
    const [checked, setChecked] = React.useState()
    const [radioItemLabel] = React.useState(switchTextInputItemLabel)

    const $_onPress = itemValue => {
      onChange(itemValue)
    }

    // Render
    return (
      <>
        {radioItemLabel.map((item, index) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              borderColor: $theme == 'light' ? $color.gray3l : $color.black3l,
              backgroundColor: $config.component.WsStateInput.backgroundColor,
              borderRadius: $config.component.WsStateInput && $config.component.WsStateInput.borderRadius,
              marginBottom: 8
            }}>
            <WsStateRadioItem
              disabled={disabled}
              key={item.label}
              label={item.label}
              isActive={checked === index ? 'checked' : null}
              onPress={() => {
                setChecked(index)
                if (index === 0) {
                  $_onPress(currentFactory)
                  setBelongToValue(undefined)
                } else {
                  $_onPress(undefined)
                }
              }}
            />
            {item.type == 'belongsto' && (
              <View
                style={{
                  flex: 1
                }}
              >
                {index === 0 ? (
                  <WsState
                    key={index}
                    type={item.type}
                    rules={item.rules}
                    nameKey={item.nameKey}
                    modelName={item.modelName}
                    serviceIndexKey={item.serviceIndexKey}
                    editable={item.editable}
                    onChange={(e) => {
                    }}
                    value={currentFactory}
                  >
                  </WsState>
                ) : (
                  <WsState
                    key={index}
                    type={item.type}
                    rules={item.rules}
                    nameKey={item.nameKey}
                    modelName={item.modelName}
                    serviceIndexKey={item.serviceIndexKey}
                    onChange={(e) => {
                      setBelongToValue(e)
                      setChecked(index)
                      $_onPress(e)
                    }}
                    value={belongToValue}
                  >
                  </WsState>
                )}
              </View>
            )}
          </View>
        ))}
      </>
    )
  }
)

export default WsStateSwitchBelongto
