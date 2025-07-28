import React from 'react'
import { Pressable } from 'react-native'
import { WsText, WsCard, WsIcon, WsFlex, WsStateFormModal } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCreateQuestionCard = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    iconColor = $color.gray,
    iconSize = 26,
    icon = 'md-add-circle',
    borderRadius = 0,
    fields = {},
    value,
    onSubmit
  } = props

  // States
  const [stateModal, setStateModal] = React.useState(false)

  return (
    <>
      <Pressable
        onPress={() => {
          setStateModal(true)
        }}>
        <WsCard borderRadius={borderRadius} style={{ marginTop: 8 }}>
          <WsFlex>
            <WsIcon
              color={iconColor}
              name={icon}
              size={iconSize}
              style={{ marginRight: 8 }}
            />
            <WsText>{t('新增自訂題目')}</WsText>
          </WsFlex>
        </WsCard>
      </Pressable>
      <WsStateFormModal
        setNavigationOptionEnable={false}
        initValue={value}
        title={t('新增自訂題目')}
        fields={fields}
        visible={stateModal}
        onSubmit={$event => {
          onSubmit($event)
          setStateModal(false)
        }}
        onClose={() => {
          setStateModal(false)
        }}
      />
    </>
  )
}
export default LlCreateQuestionCard
