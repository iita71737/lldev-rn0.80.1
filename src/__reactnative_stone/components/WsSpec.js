import React from 'react'
import { WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsSpec = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    title,
    children,
    colorTitle = $color.gray3d,
    colorText = $color.gray,
    style,
    labelWidth,
    titleSize = 12,
    fontSize = 12,
    fontWeight = 400,
    titleFontWeight = 400,
    testID
  } = props

  // Render
  return (
    <WsFlex style={[style]}>
      <WsText
        fontWeight={titleFontWeight}
        size={titleSize}
        color={colorTitle}
        style={{
          marginRight: 8,
          width: labelWidth
        }}>
        {t(title)}
      </WsText>
      <WsText
        testID={testID}
        size={fontSize}
        fontWeight={fontWeight}
        color={colorText}
        style={{ flex: 1 }}
      >
        {children}
      </WsText>
    </WsFlex>
  )
}

export default WsSpec
