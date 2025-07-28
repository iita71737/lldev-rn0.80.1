import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsText, WsTag, WsBtn, WsCard, WsFlex, WsGradientButton } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlChangeAssignmentCard = props => {
  const { t, i18n } = useTranslation()
  // Props
  const { assignment, style, onPress, btnText } = props
  return (
    <>
      <WsCard style={[style]}>
        <WsText letterSpacing={1} style={{ marginBottom: 4 }}>
          {assignment.change.name}
        </WsText>
        <WsFlex style={{ marginVertical: 4 }}>
          <WsTag img={assignment.system_subclass.icon}>
            {t(assignment.system_subclass.name)}
          </WsTag>
        </WsFlex>
        <WsText size={12} color={$color.gray3d} style={{ marginVertical: 4 }}>
          {assignment.change
            ? `${t('版本')} ver.${assignment.change.versions_number}`
            : `${t('版本')} ver.1`}
        </WsText>
        {assignment.evaluate_at && (
          <WsText
            size={12}
            color={$color.gray3d}
            style={{ marginVertical: 4 }}>{`${t('評估日')} ${moment(assignment.evaluate_at).format('YYYY-MM-DD')}`}
          </WsText>
        )}
        <WsText size={12} color={$color.gray3d} style={{ marginVertical: 4 }}>
          {assignment.change_version &&
            assignment.change_version.expired_date
            ? `${t('到期日')} ${moment(assignment.change_version.expired_date).format('YYYY-MM-DD')}`
            : `${t('到期日')} ${t('無')}`}
        </WsText>
        <WsGradientButton style={{ marginVertical: 8 }} borderRadius={28} onPress={onPress}>
          {btnText}
        </WsGradientButton>
      </WsCard>
    </>
  )
}

export default LlChangeAssignmentCard
