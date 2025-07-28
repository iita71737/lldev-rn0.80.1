import React from 'react'
import { Dimensions } from 'react-native'
import { WsLoadingDot, WsFlex } from '@/components'

const WsLoadingView = ({
  // Props
  mode,
  style
}) => {
  // Render
  return (
    <WsFlex
      justifyContent="center"
      style={[
        {
          width: Dimensions.get('window').width
        },
        style
      ]}>
      <WsLoadingDot mode={mode} loading={true} />
    </WsFlex>
  )
}

export default WsLoadingView
