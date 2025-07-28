import React from 'react'
import { Pressable, View } from 'react-native'
import { WsText, WsFlex, WsTag, WsIconBtn, WsDes, WsState } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCheckListPickTemplate = props => {
  const { t, i18n } = useTranslation()

  const {
    no,
    title,
    style,
    onPress,
    isFocus = false,
    value,
    onChange,
    des,
    copyOnPress,
    icon = 'ws-outline-copy'
  } = props

  return (
    <Pressable onPress={onPress}>
      <WsFlex
        alignItems="flex-start"
        style={[
          {
            padding: 16,
            backgroundColor: $color.white
          },
          style
        ]}>
        <WsFlex
          style={{
            width: 22,
            marginRight: 8
          }}
          justifyContent="center">
          <WsText fontWeight="bold" size={14} style={{}}>
            {no}
          </WsText>
        </WsFlex>
        <WsFlex
          flexDirection="column"
          alignItems="flex-start"
          style={{
            marginRight: 12,
            flex: 1
          }}>
          <WsText fontWeight="bold" size={14}>
            {title}
          </WsText>
          <WsDes
            style={{
              marginVertical: 8
            }}>
            {des}
          </WsDes>

          {isFocus && <WsTag>{t('重點關注')}</WsTag>}
        </WsFlex>
        <WsFlex flexDirection="column" justifyContent="center">
          <WsState
            type="switch"
            value={value}
            onChange={onChange}
            style={{
              marginBottom: 8
            }}
          />
          <WsIconBtn
            name={icon}
            size={24}
            underlayColor={$color.primary8l}
            underlayColorPressIn={$color.primary9l}
            padding={6}
            onPress={copyOnPress}
          />
        </WsFlex>
      </WsFlex>
    </Pressable>
  )
}

export default LlCheckListPickTemplate
