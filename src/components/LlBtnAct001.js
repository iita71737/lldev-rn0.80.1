import React, { useState } from 'react'
import { StyleSheet, View, Pressable, TouchableOpacity } from 'react-native'
import { WsDes, WsFlex, WsPaddingContainer, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlBtnAct001 = props => {
  // i18n
  const { t, i18n } = useTranslation()

  const { children, onPress, style, testID } = props

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsPaddingContainer
        style={[
          {
            backgroundColor: $color.primary11l,
          },
          style
        ]}>
        <WsFlex justifyContent="space-between">
          {children}
        </WsFlex>
      </WsPaddingContainer>
    </TouchableOpacity>
  )
}
export default LlBtnAct001
