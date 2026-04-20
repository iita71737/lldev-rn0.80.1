import React from 'react'
import {
  WsTabView,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsIconCircle,
  WsInfoUser,
  WsCenter,
  LlCheckListRecordCard002,
  LlRiskHeaderCalc,
  WsSkeleton
} from '@/components'
import { useSelector } from 'react-redux'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import $color from '@/__reactnative_stone/global/color'
import S_Effect from '@/services/api/v1/effects'
import S_FactoryEffect from '@/services/api/v1/factory_effects'

const LlEffectWithCheckListCalc = props => {
  const { answers } = props

  // State
  const [riskWithEffect, setRiskWithEffect] = React.useState()
  const [loading, setLoading] = React.useState(true)

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Services
  const $fetchRiskWithEffect = async () => {
    if (!currentFactory?.id || !Array.isArray(answers)) {
      return
    }
    const effects = await S_Effect.index({
      factory: currentFactory.id,
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    })
    const factory_effects = await S_FactoryEffect.index({
      factory: currentFactory.id,
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    })
    const _effects = effects.data.concat(factory_effects.data)
    const res = await S_CheckListRecordAns.getRiskWithEffectV2({
      effects: _effects,
      answers: answers
    })
    setRiskWithEffect(res)
  }

  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!Array.isArray(answers) || !currentFactory?.id) {
        if (isMounted) {
          setLoading(true)
        }
        return
      }
      if (isMounted) {
        setLoading(true)
      }
      try {
        await $fetchRiskWithEffect()
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    run()
    return () => {
      isMounted = false
    }
  }, [answers, currentFactory?.id, currentUser?.locale?.code])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <>
          {(riskWithEffect || []).map((risk, riskIndex) => {
            return (
              <LlCheckListRecordCard002
                key={riskIndex}
                icon={risk.icon}
                label={risk.label}
                items={risk.items}
                num={risk.num}
                iconColor={risk.iconColor}
                style={{
                  marginBottom: 8,
                  paddingHorizontal: 16
                }}
              />
            )
          })}
        </>
      )}
    </>
  )
}

export default LlEffectWithCheckListCalc
