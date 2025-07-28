import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import {
  WsPaddingContainer,
  WsCard,
  WsIcon,
  WsText,
  WsDes,
  WsFlex,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_ContractorContract from '@/services/api/v1/contract'

const LlContractCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    contract,
    style,
    onPress,
    testID
  } = props

  // HELPER FUNC
  const $_isExpired = () => {
    if (contract?.valid_end_date) {
      const year = contract?.valid_end_date.slice(0, 4)
      const month = contract?.valid_end_date.slice(5, 7)
      const day = contract?.valid_end_date.slice(8, 10)
      const date = new Date(year, month, day)
      return moment().isAfter(date)
    }
    else if (contract?.remind_date) {
      return moment().isAfter(contract.remind_date)
    }
  }
  const $_getBindingLicenses = licenses => {
    const _string = licenses.map(r => {
      return r.name
    })
    return _string.toString()
  }
  const $_ContractState = (date) => {
    const _contractState = S_ContractorContract.getLicenseStatus({
      nowDate: moment(new Date()),
      endDate: moment(date),
    })
    return _contractState
  }

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard
          style={[
            {
              shadowColor: $color.gray,
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 2,
              shadowOpacity: 0.25,
              elevation: 4
            },
            style
          ]}
          padding={0}>
          <WsPaddingContainer>
            {contract &&
              contract.valid_end_date &&
              $_ContractState(contract.valid_end_date) != 0 && (
                <WsFlex>
                  <WsTag
                    backgroundColor={
                      $_ContractState(contract.valid_end_date)
                        ? $color.danger11l
                        : $color.primary11l
                    }
                    textColor={
                      $_ContractState(contract.valid_end_date) == 2 ? $color.danger : $color.primary
                    }>
                    {$_ContractState(contract.valid_end_date) == 2
                      ? t('契約逾期')
                      : $_ContractState(contract.valid_end_date) == 1
                        ? t('契約風險')
                        : 'unkonwn'}
                  </WsTag>
                </WsFlex>
              )}
            <WsText style={{ marginTop: 8 }}>{contract.name}</WsText>
            <WsFlex
              style={{
                marginTop: 8
              }}>
              <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                {t('效期')}
              </WsDes>
              {contract.valid_end_date &&
                contract.valid_start_date && (
                  <WsDes>{`${moment(contract.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(contract.valid_end_date).format('YYYY-MM-DD')}`}</WsDes>
                )}
            </WsFlex>
            <WsFlex
              style={{
                marginTop: 8
              }}>
              <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                {t('管理者')}
              </WsDes>
              <WsDes>{contract.reminder.name}</WsDes>
            </WsFlex>
            <WsFlex
              style={{
                marginTop: 8
              }}>
              <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                {t('資格證')}
              </WsDes>
              <WsDes
                style={{
                  flexWrap: 'wrap',
                  paddingRight: 36
                }}>
                {contract.licenses
                  ? $_getBindingLicenses(contract.licenses)
                  : ''}
              </WsDes>
            </WsFlex>
          </WsPaddingContainer>
          {contract.valid_start_date &&
            contract.remind_date && (
              <WsFlex
                style={{
                  backgroundColor: $_isExpired()
                    ? $color.danger11l
                    : $color.primary11l,
                  paddingVertical: 8,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10
                }}
                justifyContent="center">
                <WsIcon
                  name="ws-outline-reminder"
                  color={$_isExpired() ? $color.danger : $color.primary}
                  size={18}
                  style={{
                    marginRight: 8
                  }}
                />
                <WsText
                  size={12}
                  color={$_isExpired() ? $color.danger : $color.primary}>
                  {contract.valid_end_date ? moment(contract.valid_end_date).format('YYYY-MM-DD') : contract.remind_date ? moment(contract.remind_date).format('YYYY-MM-DD') : '無'}
                </WsText>
              </WsFlex>
            )}
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlContractCard001
