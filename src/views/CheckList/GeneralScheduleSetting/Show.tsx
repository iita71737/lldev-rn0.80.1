import React, { useState } from 'react'
import {
  Pressable,
  View,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
  WsDes,
  WsFastImage,
  LlNumCard001,
  WsInfo,
  WsTag,
  WsSkeleton,
  WsPaddingContainer,
  WsInfiniteScroll
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_GeneralSchedule from '@/services/api/v1/general_schedule_setting'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import H_time from '@/helpers/time';

const GeneralScheduleSettingShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const { id, checklistVersionId } = route.params

  // State
  const [schedule, setSchedule] = useState()
  const [params, setParams] = React.useState({
    checklist_version_id: checklistVersionId,
    schedule_setting_id: id,
  })

  // Services
  const $_fetchSchedule = async () => {
    try {
      // 取得排程資料
      const res = await S_GeneralSchedule.show({
        modelId: id
      })
      setSchedule(res)
    } catch (e) {
      console.error(e);
    }
  }

  // HELPER
  const $_helperFunc = (item) => {
    const _text = H_time.setShow(item);
    return _text.repeatInterval
}
  const removeLeadingZeros = (str) => {
    return str.replace(/^0+/, '');
  }

  React.useEffect(() => {
    if (id) {
      $_fetchSchedule()
    }
  }, [id])

  React.useEffect(() => {
    setParams({
      checklist_version_id: checklistVersionId,
      schedule_setting_id: id,
    })
  }, [id, checklistVersionId])

  return (
    <>
      <WsInfiniteScroll
        service={S_CheckListQuestion}
        serviceIndexKey={'IndexByScheduleSetting'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  shadowColor: '#999',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.6,
                  shadowRadius: 4,
                  elevation: 1.5,
                  marginTop: 16,
                }}>
                <WsFlex>
                  <WsText>{item.sequence ? removeLeadingZeros(item.sequence) : index + 1}{' . '}</WsText>
                  <WsText
                    style={{
                      maxWidth: width * 0.8
                    }}
                  >{item.title ? item.title : null}</WsText>
                </WsFlex>
                {item && item.question_setting && item.question_setting.checkers && item.question_setting.checkers.length > 0 && (
                  <WsInfo
                    // labelWidth={100}
                    style={{
                      marginTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                    label={t('答題者')}
                    labelColor={$color.gray}
                    type='users'
                    value={item.question_setting.checkers ? item.question_setting.checkers : []}
                  />
                )}

              </WsPaddingContainer>
            </TouchableOpacity>
          )
        }}
        ListHeaderComponent={() => {
          return (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                borderRadius: 10,
                shadowColor: '#999',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.6,
                shadowRadius: 4,
                elevation: 1.5
              }}>
              {schedule && schedule.created_user && (
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
                  value={schedule.created_user ? schedule.created_user : t('無')}
                />
              )}
              {schedule && schedule.reviewers && schedule.reviewers.length > 0 && (
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
                  value={schedule.reviewers ? schedule.reviewers : t('無')}
                />
              )}
              {schedule && schedule.checkers && schedule.checkers.length > 0 && (
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
                  value={schedule.checkers ? schedule.checkers : t('無')}
                />
              )}
              {schedule && schedule.type && (
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  label={t('排程種類')}
                  labelColor={$color.gray}
                  value={schedule.type == 'regular' ? t('定期') : schedule.type == 'one_time' ? t('單次') : t('無')}
                />
              )}
              {schedule && schedule.start_at && (
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  label={t('排程日期')}
                  labelColor={$color.gray}
                  value={`${schedule.start_at ? moment(schedule.start_at).format('YYYY-MM-DD') : t('無')} ~ ${schedule.end_at ? moment(schedule.end_at).format('YYYY-MM-DD') : t('永不結束')}`}
                />
              )}
              {schedule && schedule.frequency && (
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    // alignItems: 'center',
                    marginRight: 16,
                  }}
                  label={t('重複設定')}
                  labelColor={$color.gray}
                  value={schedule.frequency ? $_helperFunc(schedule) : '-'}
                />
              )}

              {schedule && schedule.created_at && (
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
                  value={schedule.created_at ? schedule.created_at : t('無')}
                />
              )}
            </WsPaddingContainer>
          )
        }}
      />
    </>
  )
}

export default GeneralScheduleSettingShow
