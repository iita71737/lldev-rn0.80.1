import React from 'react'
import { Pressable, View } from 'react-native'
import { WsText, WsFlex, WsTag } from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCheckListQuestionCard001 = props => {
  const { t, i18n } = useTranslation()

  const { no, title, style, onPress, isFocus = false } = props

  return (
    <Pressable onPress={onPress}>
      <WsFlex
        alignItems="flex-start"
        style={[
          {
            padding: 16,
            backgroundColor: gColor.white
          },
          style
        ]}>
        <WsFlex
          style={{
            width: 22,
            marginRight: 8
          }}
          justifyContent="center">
          {no && (
            <WsText fontWeight="bold" size={14}>
              {no}
            </WsText>
          )}
        </WsFlex>
        <WsFlex flexDirection="column" alignItems="flex-start">
          {title && (
            <WsText
              style={{
                marginRight: 24
              }}
              fontWeight="bold"
              size={14}>
              {title}
            </WsText>
          )}
          {isFocus && (
            <WsTag
              style={{
                marginTop: 8
              }}>
              {t('重點關注')}
            </WsTag>
          )}
        </WsFlex>
      </WsFlex>
    </Pressable>
  )
}

export default LlCheckListQuestionCard001
