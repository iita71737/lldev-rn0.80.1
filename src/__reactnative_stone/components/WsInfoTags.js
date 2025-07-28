import React from 'react'
import { WsFlex, WsTag } from '@/components'

const WsInfoTags = props => {
  // Props
  const { value = [], color, style } = props

  // Render
  return (
    <>
      <WsFlex flexWrap="wrap"
        style={[
          {
          },
          { ...style }]}>
        {value &&
          value.length > 0 &&
          value.map((item, index) => (
            <WsTag
              key={index}
              backgroundColor={'#f5f5f5'}
              textColor={'#373737'}
              style={{
                marginTop: 8,
                marginRight: 8
              }}
            >
              {`#${item.name}`}
            </WsTag>
          ))}
      </WsFlex>
    </>
  )
}

export default WsInfoTags
