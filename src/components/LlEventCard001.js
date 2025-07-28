import React, { useState } from 'react'
import { Pressable, View, TouchableOpacity, Dimensions } from 'react-native'
import { WsCard, WsText, WsTag, WsDes, WsFlex } from '@/components'
import S_MyAct from '@/services/api/v1/my_act'
import S_Event from '@/services/api/v1/event'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlEventCard001 = props => {
  const { t, i18n } = useTranslation()

  // Dimension
  const { width, height } = Dimensions.get('window')

  //  Props
  const {
    event,
    onPress,
    style,
    testID
  } = props

  // Services
  const $_setStatusFont = event => {
    return S_Event.getStatusFont(event, t)
  }
  const $_setStatusBgc = event => {
    return S_Event.getStatusBgColor(event, t)
  }

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard
          style={
            [
              {
              },
              style
            ]
          }
        >

          <WsFlex>
            <WsTag
              backgroundColor={event ? $_setStatusBgc(event) : ''}
              textColor={$color.gray4d}>
              {event ? $_setStatusFont(event) : ''}
            </WsTag>
            <WsTag
              style={{ marginLeft: 8 }}
              backgroundColor={event.event_type ? '#fbe0b6' : ''}
              textColor={$color.black}>
              {event.event_type ? t(event.event_type.name) : ''}
            </WsTag>
          </WsFlex>

          {event && event.name && (
            <WsText
              style={{
                marginTop: 4
              }}>
              {t(event.name) ? t(event.name) : event.name}
            </WsText>
          )}


          <WsFlex flexWrap="wrap"
            style={{
              marginTop: 4
            }}
          >
            {event?.system_subclasses?.map(
              (systemSubClass, systemSubClassIndex) => {
                return (
                  <WsTag
                    key={systemSubClassIndex}
                    img={systemSubClass.icon}
                    style={{
                      marginTop: 4,
                      marginRight: 8
                    }}
                  >
                    {t(systemSubClass.name)}
                  </WsTag>
                )
              }
            )}
          </WsFlex>

          <WsDes
            style={{
              marginTop: 4,
            }}>
            {t('發生時間')} {moment(event.occur_at).format('YYYY-MM-DD HH:mm')}
          </WsDes>

        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlEventCard001
