import React from 'react'

import { WsNavButton } from '@/components'

const LlNavButton001 = props => {
  const {
    style,
    children,
    iconLeft,
    subTitle,
    onPress,
    iconRight = 'ws-outline-chevron-forward',
    testID
  } = props

  return (
    <WsNavButton
      testID={testID}
      style={[
        {
          marginTop: 8
        },
        style
      ]}
      iconLeft={iconLeft}
      bottomLine={false}
      subTitle={subTitle}
      onPress={onPress}
      iconRight={iconRight}>
      {children}
    </WsNavButton>
  )
}

export default LlNavButton001
