import React from 'react'
import { WsText, WsFlex, WsIcon } from '@/components'
const WsInfoStatus = props => {
  // Props
  const { style, value } = props

  // Render
  return (
    <WsFlex
      style={[
        style,
        {
        }
      ]}
    >
      {value.icon && (
        <WsIcon
          name={value.icon}
          size={20}
          style={{
            marginRight: 4
          }}
          color={value.iconColor}
        />
      )}
      <WsText size={14} color={value.fontColor}>{value.label}</WsText>
    </WsFlex>
  )
}

export default WsInfoStatus
