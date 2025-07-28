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
  LlNavButton002
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'

const AlertShowContractorEnterRecord = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Props
  const { apiAlert, alert } = props
  const greenwichTime = moment.utc(apiAlert.payload.enter_start_date);

  // Render
  return (
    <>
      {apiAlert && alert && (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsText size={24} fontWeight={'700'} style={{ marginBottom: 16 }}>
              {t('進場資訊')}
            </WsText>
            <WsFlex>
              {apiAlert.payload.enter_end_date && (
                <WsInfo
                  label={t('進場日期')}
                  value={moment(apiAlert.payload.enter_start_date).format('YYYY-MM-DD')}
                  style={{ flex: 1 }}
                />
              )}
              {apiAlert.payload.enter_start_time &&
                !apiAlert.payload.enter_end_time && (
                  <WsInfo
                    label={t('進場時間')}
                    value={
                      `${moment(apiAlert.payload.enter_start_time).format('HH:mm')}`
                    }
                    style={{ flex: 1 }}
                  />
                )
              }
              {apiAlert.payload.enter_start_time &&
                apiAlert.payload.enter_end_time && (
                  <WsInfo
                    label={t('進場時間')}
                    value={
                      `${moment(apiAlert.payload.enter_start_time).format('HH:mm')}${' - '}${moment(apiAlert.payload.enter_end_time).format('HH:mm')}`
                    }
                    style={{ flex: 1 }}
                  />
                )
              }
            </WsFlex>
            <WsFlex
              alignItems={'flex-start'}
              style={{
                marginTop: 24
              }}>
              <WsInfo
                label={t('承攬商')}
                style={{
                  flex: 1,
                  marginRight: 16
                }}
                value={
                  apiAlert.payload.contractor
                    ? apiAlert.payload.contractor.name
                    : null
                }
              />
            </WsFlex>
            <WsFlex
              alignItems={'flex-start'}
              style={{
                marginTop: 24
              }}>
              <WsInfo
                label={t('工作內容')}
                style={{ flex: 1 }}
                value={
                  apiAlert.payload.task_content
                    ? apiAlert.payload.task_content
                    : null
                }
              />
              <WsInfo
                label={t('工作地點')}
                style={{ flex: 1 }}
                value={
                  apiAlert.payload.operate_location
                    ? apiAlert.payload.operate_location
                    : null
                }
              />
            </WsFlex>
            <WsFlex
              alignItems={'flex-start'}
              style={{
                marginTop: 24
              }}>
              <WsInfo
                label={t('負責人')}
                type="user"
                value={apiAlert.payload.owner}
                isUri={true}
              />
            </WsFlex>
          </WsPaddingContainer>
          <LlNavButton002
            backgroundColor={$color.white}
            iconLeft={'ll-nav-event-filled'}
            iconLeftColor={$color.primary}
            style={{ marginTop: 8 }}
            onPress={() => {
              navigation.push('RoutesContractorEnter', {
                screen: 'ContractorEnterShow',
                params: {
                  id: apiAlert.contractor_enter_record && apiAlert.contractor_enter_record.id ? apiAlert.contractor_enter_record.id : null,
                  factory: currentFactory && currentFactory.id ? currentFactory.id : null,
                }
              })
            }}>
            {t('相關進場')}
          </LlNavButton002>
        </>
      )}
    </>
  )
}

export default AlertShowContractorEnterRecord
