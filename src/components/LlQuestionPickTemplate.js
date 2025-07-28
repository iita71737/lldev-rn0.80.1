import React from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
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

const LlQuestionPickTemplate = props => {
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
    status
  } = props

  // State
  const [stateModal, setStateModal] = React.useState(false)

  return (
    <>
      <TouchableOpacity
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
          {status != 'remove' && (
            <WsFlex flexDirection="column" justifyContent="center">
              {type == 'template' && (
                <WsState
                  type="switch"
                  value={switchValue}
                  onChange={onSwitch}
                  style={{
                    marginBottom: 8
                  }}
                />
              )}
              {type == 'custom' && (
                <WsIconBtn
                  style={{
                    marginBottom: 8
                  }}
                  name="ws-outline-delete"
                  size={24}
                  underlayColor={$color.danger}
                  underlayColorPressIn={$color.danger9l}
                  padding={6}
                  color={$color.white}
                  onPress={deleteOnPress}
                />
              )}
              <WsIconBtn
                name={icon}
                size={24}
                underlayColor={$color.primary8l}
                underlayColorPressIn={$color.primary9l}
                padding={6}
                onPress={copyOnPress}
              />
            </WsFlex>
          )}
        </WsFlex>
        {status == 'remove' && (
          <WsTag
            textColor={$color.gray}
            paddingTop={0}
            borderRadius={0}
            icon="md-info-outline"
            backgroundColor={$color.white}>
            {t('此題在此公版已移除')}
          </WsTag>
        )}
        {status == 'add' && (
          <WsTag
            textColor={$color.danger}
            paddingTop={0}
            borderRadius={0}
            icon="md-info-outline"
            backgroundColor={$color.white}>
            {t('此題為公版新增題目')}
          </WsTag>
        )}
        {status == 'update' && (
          <WsTag
            borderRadius={0}
            icon="md-info-outline"
            backgroundColor={$color.white}>
            {t('此題版本更新')}
          </WsTag>
        )}
      </TouchableOpacity>
      <WsStateFormModal
        title={type === 'custom' ? t('編輯自訂題目') : t('編輯建議題目')}
        initValue={value}
        fields={fields}
        visible={stateModal}
        setNavigationOptionEnable={false}
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

export default LlQuestionPickTemplate
