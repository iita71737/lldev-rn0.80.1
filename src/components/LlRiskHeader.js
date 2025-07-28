import React from 'react'
import { WsTabView, WsText, WsIconCircle, WsCenter, WsIcon } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const LlRiskHeader = props => {
  const { t, i18n } = useTranslation()
  
  const { 
    icon, 
    color, 
    colors, 
    riskLevel, 
    passRate,
    textColor = $color.white,
    size = 100
  } = props

  return (
    <>
      <WsCenter>
        <WsIconCircle
          style={{
            marginTop: 16,
            marginBottom: 16
          }}
          name={icon}
          padding={20}
          color={$color.white}
          backgroundColor={color}
          iconSize={40}
          size={size}
          text={riskLevel}
          textColor={textColor}
          isGradient={true}
          gradientColor={colors && colors.length > 0 ? colors : null}
        />
        {passRate !== undefined && (
          <WsText
            fontWeight={'600'}
            size={14}
            style={{
              marginBottom: 16
            }}>
            {`${t('合規率')}${passRate}%`}
          </WsText>
        )}
      </WsCenter>
    </>
  )
}

export default LlRiskHeader
