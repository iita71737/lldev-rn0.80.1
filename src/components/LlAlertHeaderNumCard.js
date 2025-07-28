import React, { useMemo } from 'react'
import { WsCard, WsIcon, WsText, WsFlex, WsLoading } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

const LlAlertHeaderNumCard = props => {
  // Props
  const { text, num, icon, iconColor, style, numLoading } = props

  // Memo
  const _num = React.useMemo(() => {
    return numLoading === false && num !== undefined ? <WsText size={12} fontWeight={600}>{num}{''}</WsText> : <WsLoading size="small" />
  }, [num])

  // Render
  return (
    <>
      <WsCard style={[style]}>
        <WsFlex flexDirection="column">
          {icon && <WsIcon name={icon} color={iconColor} size={24} />}
          <WsText size={12} style={{ marginVertical: 2 }}>
            {text}
          </WsText>
          {_num}
        </WsFlex>
      </WsCard>
    </>
  )
}

export default LlAlertHeaderNumCard
