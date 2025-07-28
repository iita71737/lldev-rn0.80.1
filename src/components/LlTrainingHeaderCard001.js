import React from 'react'
import { View } from 'react-native'
import { WsFlex, WsTag, WsPaddingContainer, WsText, WsAvatar } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlTrainingHeaderCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    title,
    update,
    systemSubclasses = [],
    lastEditUserImg,
    lastEditUserName
  } = props
  return (
    <>
      <WsPaddingContainer
        style={{
          backgroundColor: $color.white
        }}>
        <WsFlex
          style={{
            border: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
          <WsText
            size={24}
            style={{
              marginTop: 8,
              marginBottom: 4,
              flex: 1
            }}
            fontWeight="600">
            {title}
          </WsText>
        </WsFlex>
        <WsFlex flexWrap={'wrap'}>
          {systemSubclasses.map((systemSubclass, systemSubclassIndex) => {
            return (
              <WsTag
                img={systemSubclass.icon}
                key={systemSubclassIndex}
                style={{
                  marginTop: 8,
                  marginRight: 8
                }}>
                {t(systemSubclass.name)}
              </WsTag>
            )
          })}
        </WsFlex>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: 8
          }}>
          <WsAvatar size={36} source={lastEditUserImg} />
          <View
            style={{
              marginLeft: 8
            }}>
            <WsText color={$color.gray} size={12}>{t(lastEditUserName)}</WsText>
            <WsFlex
              style={{
              }}>
              <WsText
                size={12}
                color={$color.gray}
              >
                {t('編輯時間')}
                {' '}
              </WsText>
              <WsText
                size={12}
                color={$color.gray}
              >
                {moment(update).format('YYYY-MM-DD')}
              </WsText>
              <WsText
                size={12}
                color={$color.gray}
              >
                {' '}
                {moment(update).format('HH:mm:ss')}
              </WsText>
            </WsFlex>
          </View>
        </View>
      </WsPaddingContainer>
    </>
  )
}

export default LlTrainingHeaderCard001
