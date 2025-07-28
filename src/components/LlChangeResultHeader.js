import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import {
  WsTabView,
  WsIconTitleCircle,
  WsPaddingContainer,
  WsFlex,
  WsTag,
  WsText,
  WsInfo,
  LlChangeResultCard
} from '@/components'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'

const LlChangeResultHeader = props => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts

  // Props
  const { result } = props

  // Function
  const $_setIcon = () => {
    if (result.disagreeNum > 0) {
      return 'ws-filled-risk-high'
    } else if (result.conditional_agree_num > 0) {
      return 'ws-filled-warning'
    } else if (result.agreeNum > 0) {
      return 'ws-filled-risk-low'
    } else {
      return 'ws-filled-help'
    }
  }
  const $_setIconColor = () => {
    if (result.disagreeNum > 0) {
      return $color.danger
    } else if (result.conditional_agree_num > 0) {
      return $color.yellow
    } else if (result.agreeNum > 0) {
      return $color.green
    } else {
      return $color.gray
    }
  }
  const $_setIconText = () => {
    if (result.disagreeNum > 0) {
      return t('不同意')
    } else if (result.conditional_agree_num > 0) {
      return t('有條件同意')
    } else if (result.agreeNum > 0) {
      return t('無條件同意')
    } else {
      return t('尚未評估')
    }
  }

  // Render
  return (
    <>
      <WsPaddingContainer
        style={{
          backgroundColor: $color.white,
          marginBottom: 8
        }}>
        <WsFlex justifyContent="center" flexDirection="column">
          <WsIconTitleCircle
            backgroundColor={$_setIconColor()}
            color={$color.white}
            icon={$_setIcon()}
            title={$_setIconText()}
            fontSize={12}
          />
          <WsFlex
            justifyContent="space-around"
            style={{
              width: windowWidth
            }}>
            <WsFlex style={{ marginTop: 16, width: windowWidth * 0.25 }} flexDirection="column">
              <WsTag
                backgroundColor={$color.green11l}
                dotColor={$color.green}
                textColor={$color.black}
                borderRadius={16}>
                {t('無條件同意')}
              </WsTag>
              <WsText>{result.agreeNum}</WsText>
            </WsFlex>

            <WsFlex style={{ marginTop: 16, width: windowWidth * 0.25 }} flexDirection="column">
              <WsTag
                backgroundColor={$color.yellow11l}
                textColor={$color.gray3d}
                dotColor={$color.yellow}
                borderRadius={16}>
                {t('有條件同意')}
              </WsTag>
              <WsText>{result.conditional_agree_num}</WsText>
            </WsFlex>

            <WsFlex style={{ marginTop: 16, width: windowWidth * 0.25 }} flexDirection="column">
              <WsTag
                backgroundColor={$color.danger11l}
                textColor={$color.black}
                dotColor={$color.danger}
                borderRadius={16}>
                {t('不同意')}
              </WsTag>
              <WsText>{result.disagreeNum}</WsText>
            </WsFlex>

          </WsFlex>
        </WsFlex>
      </WsPaddingContainer>
    </>
  )
}

export default LlChangeResultHeader
