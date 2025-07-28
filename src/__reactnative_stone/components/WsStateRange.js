import React from 'react'
import { WsStateInput, WsFlex, WsText } from '@/components'
const WsStateRange = props => {
  // Props
  const { preValue, setPreValue, behindValue, setBehindValue } = props

  // Render
  return (
    <>
      <WsFlex>
        <WsStateInput
          style={{
            flex: 1
          }}
          value={preValue}
          onChange={setPreValue}
        />
        <WsText
          textAlign="center"
          style={{
            width: 30
          }}>
          ~
        </WsText>
        <WsStateInput
          style={{
            flex: 1
          }}
          value={behindValue}
          onChange={setBehindValue}
        />
      </WsFlex>
    </>
  )
}

export default WsStateRange
