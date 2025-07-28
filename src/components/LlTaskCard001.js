import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsNumberCircle,
  WsDes,
  WsInfo
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import moment from 'moment'

const LlTaskCard001 = props => {
  // Props
  const { item, onPress, style, testID } = props

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
    const doneRaw = item?.sub_tasks_done_count
    const totalRaw = item?.sub_tasks_count
    const done = Number(doneRaw)
    const total = Number(totalRaw)
    if (
      !isFinite(done) ||
      !isFinite(total) ||
      isNaN(done) ||
      isNaN(total) ||
      total <= 0
    ) {
      return 0
    }
    const ratio = (done / total) * 100
    return Math.min(Math.max(Math.round(ratio * 10) / 10, 0), 100) // 限定 0~100
  }

  return (
    <>
      {item && (
        <TouchableOpacity
          testID={testID}
          onPress={onPress}
          style={{
            marginTop: 8
          }}
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

              {item?.sub_tasks_count > 0 && (
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
                  flex: 1
                }}
              >

                {item.created_at && (
                  <WsFlex
                    style={{
                      marginBottom: 4,
                      left: -2
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
                      {'  '}
                      {moment(item.created_at).format('YYYY-MM-DD')}
                    </WsDes>
                  </WsFlex>
                )}

                <WsText>{item?.name}</WsText>

                {item?.factory_tags &&
                  item?.factory_tags?.length > 0 && (
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
                  )}

                <WsFlex style={{ marginTop: 4 }} justifyContent="space-between">
                  <View
                    style={{
                      flexDirection: 'row'
                    }}>
                    <WsDes style={{ marginRight: 4 }}>{i18next.t('負責人')}</WsDes>
                    <WsDes>
                      {item.taker && item.taker?.name ? item.taker?.name : '無'}
                    </WsDes>
                  </View>
                  <View>
                    <WsIcon size={24} name="md-chevron-right" />
                  </View>
                </WsFlex>


                <WsFlex style={{ marginTop: 8 }} justifyContent="space-between">
                  {item.expired_at && (
                    <WsFlex>
                      <WsIcon
                        name={$_isExpired() ? 'md-date-available' : "md-date-busy"}
                        size={18}
                        style={{
                          marginRight: 4,
                          left: -2
                        }}
                        color={$_isExpired() ? $color.gray : $color.danger}
                      />
                      <WsDes
                        size={12}
                        color={$_isExpired() ? $color.white9d : $color.danger}
                      >
                        {i18next.t('期限')}{moment(item.expired_at).format('YYYY-MM-DD')}
                      </WsDes>
                    </WsFlex>
                  )}

                  {item.sub_tasks &&
                    item.sub_tasks?.length > 0 && (
                      <WsFlex>
                        <WsIcon
                          name="ws-filled-check-circle"
                          size={18}
                          color={$color.gray}
                          style={{ marginRight: 4 }}
                        />
                        <WsText size={12} color={$color.gray}>
                          {$_isDone()}/{item.sub_tasks.length}
                        </WsText>
                      </WsFlex>
                    )}
                </WsFlex>

              </View>
            </WsFlex>
          </WsCard>
        </TouchableOpacity>
      )}
    </>
  )
}

export default LlTaskCard001
