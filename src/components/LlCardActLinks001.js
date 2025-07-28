import React from 'react'

import { Pressable, View } from 'react-native'

import {
  WsText,
  WsInfo,
  WsInfoLink,
  WsIcon,
  WsPaddingContainer,
  WsCard,
  WsCardIconSpec
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const LlCardActLinks001 = props => {
  const { t, i18n } = useTranslation()
  const { icon, iconText, acts, effects } = props
  return (
    <View
      style={{
        paddingRight: 16
      }}>
      <WsText size={14}>{t('法規依據')}</WsText>
      {acts.map((act, actIndex) => {
        return (
          <WsInfoLink size={16} key={actIndex} text={act.last_version.name} />
        )
      })}

      {effects.map((effect, effectIndex) => {
        return (
          <WsCardIconSpec
            backgroundColor={$color.danger11l}
            color={$color.danger}
            key={effectIndex}
            img={effect.icon}
            text={effect.name}
          />
        )
      })}
    </View>
  )
}

export default LlCardActLinks001
