import React from 'react'
import { TouchableOpacity } from 'react-native'
import {
  WsPopup,
  WsCard,
  WsText,
  WsStateCheckBox002,
  WsGradientButton,
  WsFlex
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

interface LlTaskTempalteResuePopup001Props {
  active: boolean
  onClose: () => void
  onConfirm: () => void
  templateHasTaker: boolean
  templateHasSubTaskTaker: boolean
  includeTaskTaker: boolean
  includeSubTaskTaker: boolean
  onChangeIncludeTaskTaker: (value: boolean) => void
  onChangeIncludeSubTaskTaker: (value: boolean) => void
  title?: string
}

const LlTaskTempalteResuePopup001: React.FC<LlTaskTempalteResuePopup001Props> = ({
  active,
  onClose,
  onConfirm,
  templateHasTaker,
  templateHasSubTaskTaker,
  includeTaskTaker,
  includeSubTaskTaker,
  onChangeIncludeTaskTaker,
  onChangeIncludeSubTaskTaker,
  title
}) => {
  const { t } = useTranslation()

  return (
    <WsPopup
      active={active}
      onClose={onClose}
    >
      <WsCard
        style={{
          width: 320,
          borderRadius: 10,
          padding: 16
        }}
      >
        <WsText
          fontWeight={600}
          size={16}
        >
          {title || t('公版沿用設定')}
        </WsText>

        {templateHasTaker && (
          <WsFlex
            style={{
              marginTop: 16
            }}
          >
            <WsStateCheckBox002
              value={includeTaskTaker}
              onChange={onChangeIncludeTaskTaker}
              checkboxText={t('沿用「任務負責人」')}
            />
          </WsFlex>
        )}

        {templateHasSubTaskTaker && (
          <WsFlex
            style={{
              marginTop: 16
            }}
          >
            <WsStateCheckBox002
              value={includeSubTaskTaker}
              onChange={onChangeIncludeSubTaskTaker}
              checkboxText={t('沿用「待辦執行者」')}
            />
          </WsFlex>
        )}

        <WsFlex
          justifyContent="flex-end"
          style={{
            marginTop: 24
          }}
        >
          <TouchableOpacity
            style={{
              width: 110,
              height: 50,
              borderColor: $color.gray,
              borderWidth: 1,
              borderRadius: 30,
              marginHorizontal: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={onClose}
          >
            <WsText color={$color.gray}>{t('取消')}</WsText>
          </TouchableOpacity>
          <WsGradientButton
            style={{
              width: 110,
              height: 50,
              marginHorizontal: 8
            }}
            onPress={onConfirm}
          >
            {t('確定')}
          </WsGradientButton>
        </WsFlex>
      </WsCard>
    </WsPopup>
  )
}

export default LlTaskTempalteResuePopup001
