import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import { WsPaddingContainer, WsText, WsTag, WsFlex, WsInfo } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlChangeResultCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { text = '', score, style, no, onPress, risk, disabled } = props

  return (
    <>
      <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
      >
        {text != '' && (
          <WsPaddingContainer style={[{ backgroundColor: $color.white, marginBottom: 16 }, style]} padding={16}>
            <WsFlex alignItems="flex-start">
              <WsText style={{ marginRight: 16 }} size={16} fontWeight={'600'}>
                {no}
                {'.'}
              </WsText>
              <WsText size={14} style={{ flex: 1 }}>
                {text}
              </WsText>
            </WsFlex>
            <WsFlex justifyContent="flex-end">
              <WsTag
                borderRadius={16}
                icon={
                  score == 16
                    ? 'ws-filled-check-circle'
                    : score == 17
                      ? 'ws-filled-warning'
                      : score == 18
                        ? 'ws-filled-cancel'
                        : 'ws-filled-help'
                }
                iconColor={
                  score == 16
                    ? $color.green
                    : score == 17
                      ? $color.yellow
                      : score == 18
                        ? $color.danger
                        : $color.gray2d
                }
                backgroundColor={
                  score == 16
                    ? $color.green11l
                    : score == 17
                      ? $color.yellow11l
                      : score == 18
                        ? $color.danger11l
                        : $color.white3d
                }
                textColor={
                  score == 16
                    ? $color.green
                    : score == 17
                      ? $color.gray2d
                      : score == 18
                        ? $color.danger
                        : $color.gray2d
                }
                style={{
                  marginVertical: 16
                }}>
                {score == 16
                  ? t('無條件同意')
                  : score == 17
                    ? t('有條件同意')
                    : score == 18
                      ? t('不同意')
                      : t('尚未評估')}
              </WsTag>
            </WsFlex>
            {risk && risk.answer && risk.answer.description && (
              <WsFlex
                style={{
                }}>
                <WsText size={14} fontWeight={'600'} style={{ marginRight: 16 }}>
                  {t('條件說明')}
                </WsText>
                <WsText style={{ flex: 1 }}>{risk.answer.description}</WsText>
              </WsFlex>
            )}
            {risk &&
              risk.answer &&
              risk.answer.attaches &&
              risk.answer.attaches.length > 0 && (
                <WsInfo
                  style={{
                    marginTop: 16
                  }}
                  type="files"
                  label={t('附件')}
                  value={risk.answer.attaches}
                />
              )}
            {risk &&
              risk.answer &&
              risk.answer.file_attaches &&
              risk.answer.file_attaches.length > 0 && (
                <WsInfo
                  style={{
                  }}
                  type="filesAndImages"
                  label={t('附件')}
                  value={risk.answer.file_attaches}
                />
              )}
          </WsPaddingContainer>
        )}
      </TouchableOpacity>
    </>
  )
}

export default LlChangeResultCard001
