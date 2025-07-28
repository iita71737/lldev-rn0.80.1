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
  WsTag,
  LlNavButton002
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import AuditRecordsSort from '@/sections/Audit/AuditRecordsSort'
import { useTranslation } from 'react-i18next'

const AlertShowAuditRecord = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const { apiAlert, alert, navigation, route } = props

  // STACK
  const _stack = navigation.getState().routes

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
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8,
            }}>
            <WsText size={24} fontWeight={'700'} style={{ marginBottom: 16 }}>
              {t('資訊')}
            </WsText>
            <WsText size={14} color={$color.black} fontWeight={'600'}>
              {t('領域')}
            </WsText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap'
              }}>
              {apiAlert.payload &&
                apiAlert.payload.system_subclasses &&
                apiAlert.payload.system_subclasses.map(
                  (subClass, subClassIndex) => {
                    return (
                      <WsTag
                        style={{
                          marginTop: 8,
                          marginRight: 8
                        }}
                        key={`subClass${subClassIndex}`}
                        img={subClass.icon}>
                        {subClass.name}
                      </WsTag>
                    )
                  }
                )}
            </View>
            <WsFlex
              style={{
                marginTop: 16
              }}>
              <WsInfo
                label={t('稽核日期')}
                value={moment(apiAlert.payload.record_at).format('YYYY-MM-DD')}
              />
            </WsFlex>
            <WsFlex
              alignItems={'flex-start'}
              style={{
                marginTop: 16,
              }}>
              <WsInfo
                type="users"
                label={t('稽核者')}
                value={apiAlert.payload.auditors}
                style={{ maxWidth: width * 0.45 }}
              />
              <WsInfo
                type="users"
                label={t('受稽者')}
                value={apiAlert.payload.auditees}
                style={{ maxWidth: width * 0.45 }}
              />
            </WsFlex>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsText size={24} fontWeight={'700'} style={{ marginBottom: 16 }}>
              {t('題目')}
            </WsText>
            <AuditRecordsSort
              id={apiAlert.payload.id}
              navigation={navigation}
              apiAlertId={apiAlert.id}
            />
          </WsPaddingContainer>

          {apiAlert.task && (
            <LlNavButton002
              backgroundColor={$color.white}
              iconLeft={'ll-nav-assignment-filled'}
              iconLeftColor={$color.primary}
              style={{ marginTop: 8 }}
              onPress={() => {
                navigation.push('RoutesTask', {
                  screen: 'TaskShow',
                  params: {
                    id: apiAlert.task.id,
                    apiAlertId: apiAlert.id,
                  }
                })
              }}>
              {t('相關任務')}
            </LlNavButton002>
          )}
          
          {apiAlert && apiAlert.event && (
            <LlNavButton002
              backgroundColor={$color.white}
              iconLeft={'ll-nav-event-filled'}
              iconLeftColor={$color.primary}
              style={{ marginTop: 8 }}
              onPress={() => {
                navigation.push('EventShow', {
                  id: apiAlert && apiAlert.event && apiAlert.event.id ? apiAlert.event.id : null,
                  apiAlertId: apiAlert && apiAlert.id ? apiAlert.id : null,
                })
              }}>
              {t('相關事件')}
            </LlNavButton002>
          )}
        </>
      )}
    </>
  )
}

export default AlertShowAuditRecord
