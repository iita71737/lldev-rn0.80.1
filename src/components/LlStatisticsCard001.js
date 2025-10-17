import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsCard,
  WsDes,
  WsSpec,
  WsInfo
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import gColor from '@/__reactnative_stone/global/color'

const LlStatisticsCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    style,
    onPress,
    testID,
    modelName
  } = props

  // Render
  return (
    <WsPaddingContainer
      padding={0}
      style={{
        paddingHorizontal: 16
      }}>
      <TouchableOpacity onPress={onPress} testID={testID}>
        {item && (
          <WsCard style={[style]} padding={0}>
            <WsPaddingContainer>
              <WsText>{item.name}</WsText>

              <View
                style={{
                }}
              >
                <WsInfo
                  style={{
                  }}
                  type="tags"
                  value={item.factory_tags}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  labelSize={12}
                  textSize={12}
                  label={t('狀態')}
                  value={
                    item.date_picker_type === 2 ? t('計算中') : t('停止計算中')
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
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
                  labelSize={12}
                  textSize={12}
                  label={t('管理者')}
                  type={'user'}
                  value={
                    item.owner
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
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
                  labelSize={12}
                  textSize={12}
                  label={t('編輯時間')}
                  value={moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
              </View>

            </WsPaddingContainer>
          </WsCard>
        )}
      </TouchableOpacity>
    </WsPaddingContainer>
  )
}
export default LlStatisticsCard001
