import React from 'react'
import { Text } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import { WsText, WsFlex, WsTag, WsIcon, WsCard, WsInfo } from '@/components'

const WsErrorMessage = ({
  // Props
  children,
  style,
  color = $color.danger,
  fontSize = 10
}) => {
  // Render
  return (
    <>
      <WsFlex>
        <WsIcon name={'md-info-outline'} size={16} color={$color.danger} />
        <Text
          style={[
            {
              paddingHorizontal: 4,
              fontSize: fontSize,
              letterSpacing: 0.8,
              lineHeight: 20,
              color: color
            },
            style
          ]}>
          {children}
        </Text>
      </WsFlex>
    </>
  )
}

export default WsErrorMessage
