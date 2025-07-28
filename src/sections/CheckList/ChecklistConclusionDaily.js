import React from 'react'
import { View, Pressable, ScrollView, Image, Dimensions } from 'react-native'
import {
  WsTabView,
  WsText,
  LlRiskHeader,
  LlEffectWithCheckList,
  WsEmpty,
  WsSkeleton,
  WsLoading,
  LlEffectWithCheckListCalc
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListConclusionDaily from '@/services/api/v1/checklist_conclusion_daily'
import moment from 'moment'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'

const ChecklistConclusionDaily = () => {
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // State
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState()

  // Services
  const $_fetchCheckListAnswers = async () => {
    const _params = {
      factory: currentFactory ? currentFactory.id : null,
      start_time: moment().format('YYYY-MM-DD'),
      end_time: moment().format('YYYY-MM-DD'),
      time_field: 'record_date',
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    }
    const res = await S_CheckListConclusionDaily.index(_params)
    setData(res.data[0])
    setLoading(false)
  }

  React.useEffect(() => {
    if (currentFactory) {
      $_fetchCheckListAnswers()
    }
  }, [currentFactory])


  return (
    <ScrollView>
      {loading ? (
        <WsSkeleton />
      ) : (
        <>
          {data ? (
            <>
              <LlRiskHeader
                size={
                  [21, 22, 23].includes(data?.risk_level)
                    ? 100
                    : 120
                }
                passRate={data.pass_rate?.toString() || ' -'}
                icon={
                  data.risk_level == (22 || 23 || 21)
                    ? 'ws-filled-risk-high'
                    : data?.risk_level == null
                      ? 'ws-filled-check-circle'
                      : 'ws-filled-check-circle'
                }
                riskLevel={
                  data.risk_level == 23
                    ? i18next.t('高風險')
                    : data.risk_level == 22
                      ? i18next.t('中風險')
                      : data.risk_level == 21
                        ? i18next.t('低風險')
                        : data.risk_level == 25 && data.pass_rate !== 0
                          ? i18next.t('合規')
                          : i18next.t('不涉及風險或不列入統計')
                }
                colors={
                  data.risk_level == 23
                    ? [$color.danger, $color.danger11l]
                    : data.risk_level == 22
                      ? [$color.yellow, $color.yellow11l]
                      : data.risk_level == 21
                        ? [$color.primary, $color.primary11l]
                        : (data.risk_level == 25 && data.pass_rate != 0)
                          ? [$color.green, $color.green11l]
                          : [$color.gray, $color.white5d]
                }
              />
              <LlEffectWithCheckList
                payload={data.level_payload}
                effect={data.effect_payload}
                keypoint={data.keypoint_payload}
              />
            </>
          ) : (
            <>
              <LlRiskHeader
                size={120}
                passRate={' -'}
                icon={'ws-filled-check-circle'}
                riskLevel={i18next.t('不涉及風險或不列入統計')}
                colors={[$color.gray, $color.white]}
              />
              <LlEffectWithCheckListCalc answers={[]} />
            </>
          )}
        </>
      )}
    </ScrollView>
  )
}

export default ChecklistConclusionDaily
