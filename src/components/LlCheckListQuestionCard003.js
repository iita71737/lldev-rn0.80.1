import React from 'react'
import { Pressable } from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsIconBtn,
  WsDes,
  WsState,
  WsStateFormView,
  WsModal,
  WsStateFormModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCheckListQuestionCard003 = props => {
  const { t, i18n } = useTranslation()

  const {
    no,
    fields,
    title,
    style,
    isFocus = false,
    value,
    onSwitch,
    des,
    onSubmit,
    copyOnPress,
    deleteOnPress,
    type,
    switchValue,
    icon = 'ws-outline-copy',
    noWidth = 22,
    status,
    questionId
  } = props

  // State
  const [stateModal, setStateModal] = React.useState(false)

  return (
    <>
      <Pressable
        onPress={() => {
          if (status != 'remove') {
            setStateModal(true)
          }
        }}>
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
              width: noWidth,
              marginRight: 8
            }}
            justifyContent="center">
            {status != 'remove' && (
              <WsText fontWeight="bold" size={14} style={{}}>
                {no}
              </WsText>
            )}
          </WsFlex>
          <WsFlex
            flexDirection="column"
            justifyContent="center"
            alignItems="flex-start"
            style={{
              flex: 1
            }}>
            <WsText
              fontWeight="bold"
              size={14}
              style={[
                status == 'remove'
                  ? {
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid'
                  }
                  : null
              ]}>
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
        </WsFlex>
        {status == 'add' && (
          <WsTag icon="md-info-outline" backgroundColor={$color.white}>
            {t('此題為公版新增題目')}
          </WsTag>
        )}
        {status == 'update' && (
          <WsTag icon="md-info-outline" backgroundColor={$color.white}>
            {t('此題版本更新')}
          </WsTag>
        )}
      </Pressable>
      <WsStateFormModal
        footerBtnLeftText={false}
        footerBtnRightText={false}
        title={t('確認欲新增題目')}
        initValue={value}
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

export default LlCheckListQuestionCard003
