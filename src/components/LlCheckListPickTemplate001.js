import React from 'react'
import { Pressable, View } from 'react-native'
import { WsText, WsFlex, WsTag } from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCheckListPickTemplate001 = props => {
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
          <WsText fontWeight="bold" size={14}>
            {no}
          </WsText>
        </WsFlex>
        <WsFlex flexDirection="column" alignItems="flex-start">
          <WsText fontWeight="bold" size={14}>
            {title}
          </WsText>
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

export default LlCheckListPickTemplate001
