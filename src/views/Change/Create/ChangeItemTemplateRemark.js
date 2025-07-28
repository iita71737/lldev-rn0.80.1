import React from 'react'
import { ScrollView, View } from 'react-native'
import { WsText, WsPaddingContainer } from '@/components'
import gColor from '@/__reactnative_stone/global/color'

const ChangeItemTemplateRemark = ({ route }) => {
  // Params
  const { remark } = route.params

  return (
    <ScrollView>
      <WsPaddingContainer>
        <WsText>{remark}</WsText>
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default ChangeItemTemplateRemark
