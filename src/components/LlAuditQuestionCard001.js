import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsDes,
  WsCard
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlAuditQuestionCard001 = props => {
  const { t, i18n } = useTranslation()

  const {
    no,
    title,
    style,
    onPress,
    isFocus = false,
    question
  } = props

  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            marginHorizontal: 16,
          },
          style
        ]}
      >
        <WsFlex
          flexWrap={'wrap'}
          style={{
            marginRight: 8,
            // borderWidth: 1,
          }}
          alignItems={'flex-start'}
        >
          <WsText fontWeight="bold" size={14}>
            {no}{'.  '}
          </WsText>
          <View>
            <WsText fontWeight="bold" size={14}>
              {title}
            </WsText>
            {question?.type === 'custom' && (
              <WsDes
                style={{
                }}>
                {t('自訂題目')}
              </WsDes>
            )}
          </View>

          {isFocus && (
            <WsTag
              style={{
                position: 'absolute',
                right: 0
              }}>
              {t('重點關注')}
            </WsTag>
          )}
        </WsFlex>

      </WsCard>
    </TouchableOpacity>
  )
}

export default LlAuditQuestionCard001
