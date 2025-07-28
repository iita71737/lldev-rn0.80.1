import React from 'react'
import Collapsible from 'react-native-collapsible'

const WsCollapsible = props => {
  // Props
  const { isCollapsed, children } = props

  // Render
  return (
    <>
      <Collapsible
        style={{
        }}
        collapsed={isCollapsed}
      >
        {children}
      </Collapsible>
    </>
  )
}
export default WsCollapsible
