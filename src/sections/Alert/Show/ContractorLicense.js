import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsFlex,
  WsBtn,
  WsBtnLeftIconCircle,
  WsPaddingContainer,
  WsIcon,
  WsText,
  WsInfo,
  LlAlertCard001,
  WsTag
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const AlertShowContractorLicense = props => {
  const { t, i18n } = useTranslation()
  // Props
  const { apiAlert, alert } = props

  // Function
  const $_fetchSystemSubclassesName = () => {
    return apiAlert.payload.system_subclasses.map((subClass, subClassIndex) => {
      return (
        <WsTag key={`subClass${subClassIndex}`} img={subClass.icon}>
          {t(subClass.name)}
        </WsTag>
      )
    })
  }

  // Render
  return (
    <>
      {apiAlert && alert && (
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            marginTop: 8
          }}>
          <WsText size={24} fontWeight={'700'} style={{ marginBottom: 16 }}>
            {t('資格證資訊')}
          </WsText>

          <WsFlex
            flexWrap={'wrap'}
          >
            <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('領域')}</WsText>
            {$_fetchSystemSubclassesName()}
          </WsFlex>

          <WsFlex
            style={{
              marginTop: 16
            }}>
            <WsInfo
              label={t('名稱')}
              value={apiAlert.payload.name}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            />
          </WsFlex>

          <WsFlex
            style={{
              marginTop: 16
            }}>
            <WsInfo
              label={t('類型')}
              value={apiAlert.payload.license_template.name}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            />
          </WsFlex>

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              label={t('有效起迄')}
              value={
                apiAlert.payload?.last_version?.valid_start_date && apiAlert.payload?.last_version?.valid_end_date ?
                  `${moment(apiAlert.payload?.last_version?.valid_start_date).format('YYYY-MM-DD')} - ${moment(apiAlert.payload?.last_version?.valid_end_date).format('YYYY-MM-DD')}` :
                  apiAlert.payload?.last_version?.valid_start_date ?
                    `${moment(apiAlert.payload?.last_version?.valid_start_date).format('YYYY-MM-DD')} - ${t('無')}` :
                    `${t('無')}`
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>

          <WsFlex
            style={{
              marginTop: 16
            }}>
            <WsInfo
              label={t('續辦提醒')}
              value={
                apiAlert.payload.last_version.remind_date
                  ? apiAlert.payload.last_version.remind_date
                  : t('永久有效')
              }
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            />
          </WsFlex>

        </WsPaddingContainer>
      )}
    </>
  )
}

export default AlertShowContractorLicense
