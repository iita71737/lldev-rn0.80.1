import React from 'react'
import { WsText, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsInfoText = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    children,
    style,
    label,
    emptyText,
    textColor,
    fontWeight,
    textSize,
    testID
  } = props

  // Render
  return (
    <>
      <WsText
        selectable={true}
        testID={testID}
        style={style}
        size={textSize ? textSize : 12}
        color={children && textColor ? textColor : children ? $color.black : $color.gray}
        fontWeight={fontWeight}
      >
        {children ? children : emptyText ? `(${t(emptyText)})` : `${t('無')}`}
      </WsText>
    </>
  )
}
export default WsInfoText
