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
import { useTranslation } from 'react-i18next'
import S_ContractorLicense from '@/services/api/v1/contractor_license'

const LlContractorLicenseCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    license,
    style,
    onPress,
    contractorState,
    testID,
    contractor
  } = props

  // HELPER FUNC
  const $_isExpired = () => {
    if (license.last_version && license.last_version.valid_end_date) {
      const year = license.last_version.valid_end_date.slice(0, 4)
      const month = license.last_version.valid_end_date.slice(5, 7)
      const day = license.last_version.valid_end_date.slice(8, 10)
      const date = new Date(year, month, day)
      return moment().isAfter(date)
    }
  }
  const $_licenseState = (date) => {
    const _licenseState = S_ContractorLicense.getLicenseStatus({
      nowDate: moment(new Date()),
      endDate: moment(date),
    })
    return _licenseState
  }


  // Render
  return (
    <>
      <TouchableOpacity onPress={onPress} testID={testID}>
        {license && license.last_version && (
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
            padding={0}
          >
            <WsPaddingContainer>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between'
                }}>
                {license.last_version &&
                  license.last_version.valid_end_date &&
                  $_licenseState(license.last_version.valid_end_date) != 0 && (
                    <WsTag
                      backgroundColor={
                        $_licenseState(license.last_version.valid_end_date)
                          ? $color.danger11l
                          : $color.primary11l
                      }
                      textColor={
                        $_licenseState(license.last_version.valid_end_date) == 2 ?
                          $color.danger :
                          $color.primary
                      }>
                      {$_licenseState(license.last_version.valid_end_date) == 2
                        ? t('資格逾期')
                        : $_licenseState(license.last_version.valid_end_date) == 1
                          ? t('資格風險')
                          : t('')}
                    </WsTag>
                  )}
              </View>

              {license.name && (
                <WsText style={{ marginTop: 8 }}>{license.name}</WsText>
              )}

              {license.last_version &&
                license.last_version.taker_text ? (
                <WsFlex style={{ marginTop: 8 }}>
                  <WsDes style={{ marginRight: 8 }}>
                    {t('持有人')}
                  </WsDes>
                  <WsDes>
                    {license.last_version?.taker_text
                      ? license.last_version.taker_text
                      : '無'}
                  </WsDes>
                </WsFlex>
              ) : (
                license.contractor &&
                license.contractor.name) && (
                <WsFlex style={{ marginTop: 8 }}>
                  <WsDes style={{ marginRight: 8 }}>
                    {t('持有人')}
                  </WsDes>
                  <WsDes>
                    {license.contractor.name
                      ? license.contractor.name
                      : '無'}
                  </WsDes>
                </WsFlex>
              )}

              {license.last_version &&
                license.last_version.license_number && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}>
                    <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                      {t('證號')}
                    </WsDes>
                    <WsDes>{`${license.last_version.license_number}`}</WsDes>
                  </WsFlex>
                )}

              {license.last_version &&
                license.last_version.approval_letter && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}>
                    <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                      {t('核准函號')}
                    </WsDes>
                    <WsDes>{`${license.last_version.approval_letter}`}</WsDes>
                  </WsFlex>
                )}

              {license.last_version &&
                (license.last_version.valid_start_date || license.last_version.valid_end_date) && (
                  <WsFlex style={{ marginTop: 8 }}>
                    <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                      {t('效期')}
                    </WsDes>
                    <WsDes>
                      {`${moment(license.last_version.valid_start_date, moment.ISO_8601, true).isValid()
                        ? moment(license.last_version.valid_start_date).format('YYYY-MM-DD')
                        : t('無')
                        } ~ ${moment(license.last_version.valid_end_date, moment.ISO_8601, true).isValid()
                          ? moment(license.last_version.valid_end_date).format('YYYY-MM-DD')
                          : t('無')
                        }`}
                    </WsDes>
                  </WsFlex>
                )}


              {license.last_version &&
                license.last_version.reminder &&
                license.last_version.reminder.name && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}>
                    <WsDes color={$color.gray3d} style={{ marginRight: 8 }}>
                      {t('管理者')}
                    </WsDes>
                    <WsDes>{license.last_version.reminder.name}</WsDes>
                  </WsFlex>
                )}

            </WsPaddingContainer>

            {license.last_version &&
              license.last_version.remind_date && (
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
                    {license.last_version.remind_date
                      ? moment(license.last_version.remind_date).format('YYYY-MM-DD')
                      : t('無')}
                  </WsText>
                </WsFlex>
              )}
          </WsCard>
        )}
      </TouchableOpacity>
    </>
  )
}

export default LlContractorLicenseCard001
