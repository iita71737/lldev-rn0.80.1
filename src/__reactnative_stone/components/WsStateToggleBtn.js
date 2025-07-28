import React from 'react'
import { WsToggleBtn } from '@/components'
import { isEqual } from 'lodash'

const WsStateToggleBtn = props => {
  // Props
  const { value, onChange, items, style, testID } = props

  // Render
  return (
    <>
      {items.map((item, itemIndex) => (
        <WsToggleBtn
          testID={item.label}
          style={style}
          key={itemIndex}
          onPress={() => {
            onChange(item, itemIndex)
          }}
          isActive={isEqual(value, item)}
        >
          {item.label}
        </WsToggleBtn>
      ))}
    </>
  )
}

export default WsStateToggleBtn
