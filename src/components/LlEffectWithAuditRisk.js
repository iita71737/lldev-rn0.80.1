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
  LlRiskHeaderCalc
} from '@/components'
import { useSelector } from 'react-redux'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import $color from '@/__reactnative_stone/global/color'

const LlEffectWithAuditRisk = props => {
  const { answers } = props

  // Redux
  const effects = useSelector(state => state.data.effects)

  // State
  const [riskWithEffect, setRiskWithEffect] = React.useState()

  // Services
  const $fetchRiskWithEffect = () => {
    const res = S_AuditRecordAns.getRiskWithEffect({
      effects: effects ? effects.data : [],
      answers: answers
    })
    setRiskWithEffect(res)
  }

  React.useEffect(() => {
    $fetchRiskWithEffect()
  }, [answers])

  return (
    <>
      {riskWithEffect && (
        <>
          {riskWithEffect.map((risk, riskIndex) => {
            return (
              <LlCheckListRecordCard002
                testID={`LlCheckListRecordCard002-${riskIndex}`}
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

export default LlEffectWithAuditRisk
