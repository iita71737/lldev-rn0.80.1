import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsNavCheck
} from '@/components';

const WsStateCheckboxes = props => {

  // Props
  const {
    items,
    value = [],
    onChange,
    style
  } = props

  const $_onChange = ($event, item) => {
    const _value = value ? [...value] : []
    const checked = _value.findIndex(e => {
      return e == item.id
    })
    if (!$event) {
      if (checked >= 0) {
        _value.splice(checked, 1)
      }
    } else {
      if (checked < 0) {
        _value.push(item.id)
      }
    }
    onChange(_value)
  }
  const _CheckValue = item => {
    if (!value) {
      return false
    } else if (value.includes(item.id)) {
      return true
    } else {
      return false
    }
  }

  // Render
  return (
    <>
      <ScrollView
        style={[
          {
          },
          style
        ]}
      >
        {items.map((item, itemIndex) => {
          return (
            <WsNavCheck
              testID={item.name}
              key={itemIndex}
              value={_CheckValue(item)}
              onChange={($event) => {
                $_onChange($event, item)
              }}
            >{item.name}</WsNavCheck>
          )
        })}
      </ScrollView>
    </>
  )
}

export default WsStateCheckboxes
