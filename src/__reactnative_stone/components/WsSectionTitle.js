import React from 'react'
import { WsFlex, WsText, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsSectionTitle = props => {
  // Props
  const { children, icon } = props

  // Render
  return (
    <WsFlex
      style={{
        paddingVertical: 12,
        paddingHorizontal: 16
      }}>
      {icon && (
        <WsIcon
          name={icon}
          size={20}
          color={$color.gray}
          style={{
            marginRight: 6
          }}
        />
      )}
      <WsText size={14} color={$color.gray}>
        {children}
      </WsText>
    </WsFlex>
  )
}
export default WsSectionTitle
