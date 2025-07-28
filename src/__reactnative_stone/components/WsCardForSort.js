import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsPaddingContainer, WsFlex, WsText, WsDes, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsCardForSort = props => {
  const screenWidth = Math.round(Dimensions.get('window').width)
  // Props
  const { title, des, style, index } = props

  // Render
  return (
    <WsPaddingContainer
      style={[
        {
          backgroundColor: $color.white
        }
        // style,
      ]}>
      <WsFlex justifyContent="space-between">
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            style={{
              marginRight: 8
            }}
            size={14}>
            {index + 1}
            {'. '}
          </WsText>
          <View style={{}}>
            <WsText
              style={{
                width: screenWidth * 0.8
              }}
              size={14}>
              {title}
            </WsText>
            <WsDes>{des}</WsDes>
          </View>
        </View>
        <WsIcon name="ws-outline-drag-horizontal" size={24} />
      </WsFlex>
    </WsPaddingContainer>
  )
}

export default WsCardForSort
