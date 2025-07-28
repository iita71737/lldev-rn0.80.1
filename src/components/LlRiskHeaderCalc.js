import React from 'react'
import {
  WsTabView,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsIconCircle,
  WsInfoUser,
  WsCenter,
  LlRiskHeader,
  LlCheckListRecordCard002,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import { useTranslation } from 'react-i18next'
import S_ConstantData from '@/services/api/v1/constant_data'
import { useSelector } from 'react-redux'

const LlRiskHeaderCalc = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    type,
    answers, // 作答頁用
    record // 結果頁與作答頁共用
  } = props

  // Redux
  const currentConstantData = useSelector(state => state.stone_auth.constantData)

  // States
  const [riskStandard, setRiskStandard] = React.useState(null)

  // Services
  const $_fetchRiskStandard = () => {
    if (type === 'audit') {
      const res = S_AuditRecordAns.getRisk(answers)
      setRiskStandard(res)
    } else {
      if (answers && answers.length > 0) {
        const res = S_CheckListRecordAns.getRiskV2(answers, record?.status, currentConstantData)
        setRiskStandard(res)
      } else if (record && record.risk_level) {
        const res = S_CheckListRecordAns.getRiskV3(record.risk_level, record?.status, currentConstantData)
        setRiskStandard(res)
      }
    }
  }

  React.useEffect(() => {
    $_fetchRiskStandard()
  }, [answers, record, record?.status, currentConstantData])

  return (
    <>
      {riskStandard && (
        <>
          <WsCenter>
            <LlRiskHeader
              icon={riskStandard.icon}
              riskLevel={riskStandard.label}
              color={riskStandard.color}
              colors={riskStandard.colors}
              textColor={riskStandard.textColor}
            />
            {record &&
              record.pass_rate != undefined && (
                <WsText
                  fontWeight={'600'}
                  size={14}
                  style={{
                    marginTop: -8,
                    marginBottom: 16
                  }}>
                  {t('合規率')}
                  {'  '}
                  {record.pass_rate}
                  {t('%')}
                </WsText>
              )}
          </WsCenter>
        </>
      )}
    </>
  )
}

export default LlRiskHeaderCalc
