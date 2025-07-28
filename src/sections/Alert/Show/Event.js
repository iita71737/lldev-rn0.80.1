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
  LlNavButton001,
  LlNavButton002,
  WsTag,
  LlTaskCard001,
  LlEventCard001
} from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const AlertShowEvent = (props) => {
  const { t, i18n } = useTranslation()

  // Props
  const { apiAlert, alert, navigation, route } = props

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
            <WsText
              fontWeight={600}
              size={18}
              style={{
              }}
            >{t('事件資訊')}
            </WsText>
            <WsFlex
              style={{
                marginTop: 8
              }}>
              <WsText size={14} fontWeight={'600'} style={{ width: 108 }}>
                {'領域'}
              </WsText>
              <WsFlex
                flexWrap={'wrap'}
                style={{
                }}>
                {apiAlert &&
                  apiAlert.system_subclasses &&
                  apiAlert.system_subclasses.map(
                    (subClass, subClassIndex) => {
                      return (
                        <WsTag
                          key={subClassIndex}
                          img={subClass.icon}
                          style={{ marginRight: 8, marginTop: 8 }}>
                          {subClass.name}
                        </WsTag>
                      )
                    }
                  )}
              </WsFlex>
            </WsFlex>


            <View
              style={{
                marginTop: 4
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('發生日期')}
                value={
                  apiAlert.payload.occur_at
                    ? moment(apiAlert.payload.occur_at).format('YYYY-MM-DD')
                    : '無'
                }
                style={{
                  flexDirection: 'row'
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
                label={t('發生時間')}
                value={
                  apiAlert.payload.occur_at
                    ? moment(apiAlert.payload.occur_at).format('HH:mm')
                    : '無'
                }
                style={{
                  flexDirection: 'row'
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
                label={t('說明')}
                value={apiAlert.payload.remark ? apiAlert.payload.remark : null}
                style={{
                  flexDirection: 'row'
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
                label={t('負責人')}
                type="user"
                value={apiAlert.payload.owner}
                isUri={true}
                style={{
                  flexDirection: 'row'
                }}
              />
            </View>
          </WsPaddingContainer>

          {apiAlert.task && (
            <>
              <View
                style={{
                  marginTop: 16
                }}
              >
                <WsText
                  fontWeight={500}
                  style={{
                    paddingHorizontal: 16,
                  }}
                >{t('相關任務')}
                </WsText>
                <LlTaskCard001
                  item={apiAlert.task}
                  onPress={() => {
                    navigation.push('RoutesTask', {
                      screen: 'TaskShow',
                      params: {
                        id: apiAlert.task.id,
                        apiAlertId: apiAlert.id,
                      }
                    })
                  }}
                />
              </View>

            </>
          )}

          {apiAlert &&
            apiAlert.event && (
              <View
                style={{
                  marginTop: 16
                }}
              >
                <WsText
                  fontWeight={500}
                  style={{
                    paddingHorizontal: 16,
                  }}
                >{t('相關事件')}</WsText>
                <LlEventCard001
                  event={apiAlert.event}
                  style={{
                    marginTop: 8,
                    marginBottom: 8,
                    marginHorizontal: 16
                  }}
                  onPress={() => {
                    navigation.push('RoutesEvent', {
                      screen: 'EventShow',
                      params: {
                        id: apiAlert && apiAlert.event && apiAlert.event.id ? apiAlert.event.id : null,
                        apiAlertId: apiAlert && apiAlert.id ? apiAlert.id : null,
                      }
                    })
                  }}
                />
              </View>
            )}


        </>
      )}
    </>
  )
}

export default AlertShowEvent
