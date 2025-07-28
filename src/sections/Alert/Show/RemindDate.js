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
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const AlertShowRemindDate = props => {
  const { t, i18n } = useTranslation()

  const currentFactory = useSelector(state => state.data.currentFactory)

  // Props
  const { apiAlert, alert } = props

  // Function
  const $_fetchSystemSubclassesName = () => {
    return apiAlert.payload.system_subclasses.map((subClass, subClassIndex) => {
      return (
        <WsTag key={`subClass${subClassIndex}`} img={subClass.icon}>
          {subClass.name}
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

          <WsText
            size={24}
            fontWeight={'700'}
            style={{
              marginBottom: 8
            }}
          >
            {t('證照資訊')}
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
              label={i18next.t('名稱')}
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
              label={i18next.t('證號')}
              value={
                apiAlert.payload.last_version.license_number
                  ? apiAlert.payload.last_version.license_number
                  : i18next.t('無')
              }
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            />
          </WsFlex>

          <View
            style={{
              marginTop: 8
            }}>
            <WsInfo
              labelWidth={100}
              type="user"
              label={apiAlert.payload?.last_version?.taker ? i18next.t('持有人') : i18next.t('持有單位')}
              value={
                apiAlert.payload?.last_version?.taker
                  ? apiAlert.payload.last_version.taker
                  : currentFactory
              }
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}
            />
          </View>

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

          {/* <WsFlex
            style={{
              marginTop: 16
            }}>
            <WsInfo
              label={i18next.t('有效起日')}
              value={
                apiAlert.payload.last_version.valid_start_date
                  ? apiAlert.payload.last_version.valid_start_date
                  : i18next.t('無')
              }
              style={{ flex: 1 }}
            />
            <WsInfo
              label={i18next.t('有效迄日')}
              value={
                apiAlert.payload.last_version.valid_end_date
                  ? apiAlert.payload.last_version.valid_end_date
                  : i18next.t('永久有效')
              }
              style={{ flex: 1 }}
            />
          </WsFlex> */}

          <WsFlex
            style={{
              marginTop: 16
            }}>
            <WsInfo
              label={i18next.t('續辦提醒')}
              value={
                apiAlert.payload.last_version.remind_date
                  ? apiAlert.payload.last_version.remind_date
                  : i18next.t('永久有效')
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </WsFlex>

        </WsPaddingContainer>
      )}
    </>
  )
}

export default AlertShowRemindDate
