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
  LlAlertCard001
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import i18next from 'i18next'

const AlertShowLicense = props => {
  // Props
  const { apiAlert, alert } = props

  // Render
  return (
    <>
      {apiAlert && alert && (
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            marginTop: 8
          }}>
          <WsFlex>
            <WsInfo
              label={i18next.t('領域')}
              value={'無'}
              style={{ flex: 1 }}
            />
            <WsInfo
              label={i18next.t('證照名稱')}
              value={alert.info.content}
              style={{ flex: 1 }}
            />
          </WsFlex>
          <WsInfo label={i18next.t('負責人')} style={{ flex: 1 }} />
          <WsInfo label="證號" />
          <WsFlex>
            <WsInfo label={i18next.t('有效起日')} style={{ flex: 1 }} />
            <WsInfo label={i18next.t('有效迄日')} style={{ flex: 1 }} />
          </WsFlex>
          <WsFlex>
            <WsInfo label={i18next.t('續辦提醒')} style={{ flex: 1 }} />
            <WsInfo label={i18next.t('負責人')} style={{ flex: 1 }} />
          </WsFlex>
        </WsPaddingContainer>
      )}
    </>
  )
}

export default AlertShowLicense
