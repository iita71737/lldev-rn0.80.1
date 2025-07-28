import React from 'react'
import { WsRead } from '@/components'

// OUO coming soon
const WsRoutesRead = ({ navagation, route }) => {
  // Render
  return (
    <>
      <WsRead {...route.params} onFetched={() => { }} />
    </>
  )
}

export default WsRoutesRead
