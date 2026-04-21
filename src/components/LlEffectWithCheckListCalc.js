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

const EFFECTS_CACHE = new Map()
const RISK_WITH_EFFECT_CACHE = new Map()

const $_normalizeAnswers = (answers = []) => {
  if (!Array.isArray(answers)) return []
  const flat = []
  answers.forEach(item => {
    if (Array.isArray(item?.ans)) {
      item.ans.forEach(answer => flat.push(answer))
    } else {
      flat.push(item)
    }
  })
  return flat
}

const $_buildAnswersDigest = (answers = []) => {
  const flat = $_normalizeAnswers(answers)
  return flat
    .map(item => {
      const id = item?.id || item?.checklist_question?.id || item?.sequence || item?.title || ''
      const risk = item?.risk_level ?? item?.score ?? ''
      const updatedAt = item?.updated_at || item?.answer_updated_at || ''
      const answerValue = Array.isArray(item?.answer_value)
        ? item.answer_value.map(v => v?.id || v?.value || v).join(',')
        : (item?.answer_value?.id || item?.answer_value?.value || item?.answer_value || '')
      return `${id}:${risk}:${updatedAt}:${answerValue}`
    })
    .join('|')
}

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
      return []
    }
    const _lang = currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    const _effectsCacheKey = `${currentFactory.id}-${_lang}`
    let _effects = EFFECTS_CACHE.get(_effectsCacheKey)
    if (!_effects) {
      const effects = await S_Effect.index({
        factory: currentFactory.id,
        lang: _lang
      })
      const factory_effects = await S_FactoryEffect.index({
        factory: currentFactory.id,
        lang: _lang
      })
      _effects = (effects?.data || []).concat(factory_effects?.data || [])
      EFFECTS_CACHE.set(_effectsCacheKey, _effects)
    }
    const res = await S_CheckListRecordAns.getRiskWithEffectV2({
      effects: _effects,
      answers: answers
    })
    return res || []
  }

  React.useEffect(() => {
    let isMounted = true
    const run = async () => {
      if (!Array.isArray(answers) || !currentFactory?.id) {
        if (isMounted) {
          setRiskWithEffect([])
          setLoading(false)
        }
        return
      }
      const _lang = currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
      const _answersDigest = $_buildAnswersDigest(answers)
      const _riskCacheKey = `${currentFactory.id}-${_lang}-${_answersDigest}`
      const _cachedRiskWithEffect = RISK_WITH_EFFECT_CACHE.get(_riskCacheKey)
      if (_cachedRiskWithEffect) {
        if (isMounted) {
          setRiskWithEffect(_cachedRiskWithEffect)
          setLoading(false)
        }
        return
      }
      if (isMounted) {
        setLoading(true)
      }
      try {
        const _latestRiskWithEffect = await $fetchRiskWithEffect()
        RISK_WITH_EFFECT_CACHE.set(_riskCacheKey, _latestRiskWithEffect || [])
        if (isMounted) {
          setRiskWithEffect(_latestRiskWithEffect || [])
        }
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
