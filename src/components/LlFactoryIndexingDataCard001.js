import React, { useState } from 'react'
import { View, Text, ScrollView, Image, Dimensions } from 'react-native'
import { WsCard, WsText, WsIcon, WsFlex } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const LlFactoryIndexingDataCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const { item } = props

  return (
    <>
      <WsCard
        style={{
          marginBottom: 8
        }}>
        <View>
          <WsFlex
            style={{
              marginBottom: 8,
              // borderWidth:1,
            }}>
            <WsText>{item ? item.factory.name : null}</WsText>
          </WsFlex>

          <WsFlex
            style={{
              // borderWidth:1,
            }}
          >
            <WsFlex
              flexWrap={'wrap'}
              style={{
                // width: width * 0.4,
                // borderWidth: 1,
                minWidth: width * 0.45
              }}
              flexDirection="column"
              alignItems="flex-start"
            >
              <WsFlex
                justifyContent="space-between"
                style={{
                  marginBottom: 8,
                }}>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{
                    marginRight: 8
                  }}
                >
                  {t('風險事件處理中')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.event_count}
                </WsText>
              </WsFlex>
              <WsFlex
                justifyContent="space-between"
                style={{
                  marginRight: 34,
                  marginBottom: 8,
                  width: 128
                }}>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{
                    marginRight: 40,
                  }}
                >
                  {t('警示未排除')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.alert_count}
                </WsText>
              </WsFlex>
              <WsFlex
                justifyContent="space-between"
                style={{
                  marginRight: 34,
                  // borderWidth:1,
                  width: 128
                }}>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{
                    marginRight: 40
                  }}
                >
                  {t('任務處理中')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.task_count}
                </WsText>
              </WsFlex>
            </WsFlex>

            <WsFlex
              flexWrap={'wrap'}
              flexDirection="column"
              alignItems="flex-start"
              style={{
                // width: width * 0.4,
                // borderWidth: 1,
              }}
            >
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  flexDirection: 'row',
                  marginBottom: 8,
                  width: 128
                }}>
                <WsText size={12} color={$color.gray} style={{ marginRight: 16 }}>
                  {t('證照即將到期')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.license_count}
                </WsText>
              </WsFlex>
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  marginBottom: 8,
                  width: 128
                }}>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{ marginRight: 16 }}>
                  {t('變動評估中')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.change_count}
                </WsText>
              </WsFlex>
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  // borderWidth: 1,
                  width: 128
                }}>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{ marginRight: 16, width: 75 }}>
                  {t('今日進場')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {item.contractor_enter_record_count}
                </WsText>
              </WsFlex>
            </WsFlex>
          </WsFlex>
        </View>
      </WsCard>
    </>
  )
}

export default LlFactoryIndexingDataCard001
