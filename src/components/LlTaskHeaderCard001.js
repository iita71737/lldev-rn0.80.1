import React from 'react'
import { View, Text } from 'react-native'
import { WsFlex, WsTag, WsPaddingContainer, WsText, WsAvatar } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const LlTaskHeaderCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    title,
    systemSubclasses = [],
    task
  } = props
  return (
    <>
      <WsPaddingContainer
        style={{
          backgroundColor: $color.white
        }}>
        <WsFlex alignItems="flex-start">
          <WsText
            size={24}
            style={{
              // flex: 1
            }}>
            {title}
          </WsText>
        </WsFlex>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
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
        </View>
        {task && (
          <View
            style={{
              marginTop: 16,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center'
            }}>
            {task.creator ? (
              <WsAvatar
                size={40}
                source={task.creator.avatar ? task.creator.avatar : ''}
              />
            ) : (
              <WsAvatar
                size={40}
                source={
                  'https://i1.jueshifan.com/7b077d83/78067d8b/31073d8a09acfa4c9c38.png'
                }
              />
            )}
            <View
              style={{
                marginLeft: 8
              }}>
              {task.creator ? (
                <WsText size={12} color={$color.gray}>{t(task.creator.name)}</WsText>
              ) : (
                <WsText color={$color.gray}>{t('曹阿毛')}</WsText>
              )}
              <WsText size={12} color={$color.gray}>
                {t('建立時間')}{' '}
                {task.created_at
                  ? moment(task.created_at).format('YYYY-MM-DD HH:mm:ss')
                  : moment().format('YYYY-MM-DD HH:mm')}
              </WsText>
            </View>
          </View>
        )}
      </WsPaddingContainer>
    </>
  )
}

export default LlTaskHeaderCard001
