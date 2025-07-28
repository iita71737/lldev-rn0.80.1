import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsNumberCircle,
  WsDes,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const LlTaskCard002 = props => {
  const { t } = useTranslation()

  // Props
  const { item, onPress, ratio, style, testID } = props

  // Function
  const $_isDone = () => {
    const _isDone = item.sub_tasks.filter(task => {
      return task.done_at
    })
    return _isDone.length
  }

  const $_isExpired = () => {
    return moment().isBefore(item.expired_at)
  }

  // HELPER Function
  const $_ratio = item => {
    return Math.round((item.sub_tasks_done_count / item.sub_tasks_count) * 1000) / 10
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        padding={0}
        style={[
          {
            padding: 16,
            marginHorizontal: 16
          },
          style
        ]}>
        <WsFlex>
          {item?.sub_tasks_count && (
            <WsNumberCircle
              hasProgress={true}
              count={$_ratio(item)}
              animatedWidth={6}
              animatedSize={60}
              text={$_ratio(item)}
              unit="%"
              backgroundColor={$color.white2d}
              style={{
                marginRight: 16
              }}
            />
          )}

          <View
            style={{
              flex: 1,
            }}
          >
            <WsIcon
              name="ll-nav-assignment-filled"
              color={$color.primary}
              size={24}
              style={{
                width: 24,
              }}
            />
            <WsText style={{ marginTop: 4 }}>{item.name}</WsText>
            <WsFlex
              style={{
                marginTop: 4
              }}
            >
              <WsDes size={12} style={{ marginRight: 4 }}>{t('任務狀態')}</WsDes>
              <WsTag
                backgroundColor={(!item.done_at && !alert.checked_at) ? $color.yellow11l : $color.white2d}>
                {!item.done_at && !alert.checked_at ? (
                  <WsText size={12} color={$color.black}>{t('進行中')}</WsText>
                ) : (
                  <WsText size={12} color={$color.gray}>{t('未建立')}</WsText>
                )}
              </WsTag>
            </WsFlex>

            <WsFlex
              style={{
                marginTop: 4
              }}
            >
              <WsIcon
                name="md-date-note"
                size={18}
                style={{
                  marginRight: 4
                }}
                color={$color.gray}
              />
              <WsDes
                size={12}
              >
                {i18next.t('建立日期')}
                {moment(item.created_at).format('YYYY-MM-DD')}
              </WsDes>
            </WsFlex>
          </View>
        </WsFlex>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlTaskCard002
