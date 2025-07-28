import React from 'react'
import {
  Pressable,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native'
import {
  WsText,
  WsIcon,
  WsCard,
  WsFlex,
  WsStateFormModal,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const LlBatchEditBtn001 = props => {
  // i18n
  const { t, i18n } = useTranslation()

  const {
    onPress,
    text = t('批次編輯')
  } = props

  return (
    <TouchableOpacity
      style={{
        alignItems: 'flex-end',
        marginLeft: 8
      }}
      onPress={onPress}>
      <WsTag
        style={{
          flex: 1
        }}>
        {t(text)}
      </WsTag>
    </TouchableOpacity>
  )
}

export default LlBatchEditBtn001
