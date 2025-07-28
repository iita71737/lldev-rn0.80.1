import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
  WsDes,
  WsFastImage,
  LlNumCard001,
  WsInfo,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import H_time from '@/helpers/time';

const LlChecklistGeneralScheduleListCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style
  } = props

  const $_helperFunc = (item) => {
      const _text = H_time.setShow(item);
      return _text.repeatInterval
  }

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <WsCard
          padding={16}
          style={[
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 4,
              shadowOpacity: 0.25,
              elevation: 2
            },
            style
          ]}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('設定者')}
            labelColor={$color.gray}
            type='user'
            value={item.created_user ? item.created_user : t('無')}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('建立日期')}
            labelColor={$color.gray}
            type='dateTime'
            value={item.created_at ? item.created_at : t('無')}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('更新時間')}
            labelColor={$color.gray}
            type='dateTime'
            value={item.updated_at ? item.updated_at : t('無')}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('排程種類')}
            labelColor={$color.gray}
            value={item.type == 'regular' ? t('定期排程') : item.type == 'one_time' ? t('單次') : t('無')}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('排程日期')}
            labelColor={$color.gray}
            value={`${item.start_at ? moment(item.start_at).format('YYYY-MM-DD') : t('無')} ~ ${item.end_at ? moment(item.end_at).format('YYYY-MM-DD') : t('永不結束')}`}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              marginRight: 16,
            }}
            label={t('重複設定')}
            labelColor={$color.gray}
            value={item.frequency ? $_helperFunc(item) : ' '}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('答題者')}
            labelColor={$color.gray}
            type='users'
            value={item.checkers ? item.checkers : t('無')}
          />
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('覆核者')}
            labelColor={$color.gray}
            type='users'
            value={item.reviewers ? item.reviewers : t('無')}
          />
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlChecklistGeneralScheduleListCard001
