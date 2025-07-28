import React from 'react'
import { View } from 'react-native'
import { WsIcon, WsText, WsBadgeButton } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next';

const WsBadgeIconButton = props => {
  const { t, i18n } = useTranslation();

  // Props
  const {
    size = 36,
    icon,
    iconColor,
    name,
    badge,
    style,
    onPress,
    textColor = $color.white,
    disable,
    testID
  } = props

  // Render
  return (
    <View
      style={[
        {
          display: 'flex',
          alignItems: 'center',
        },
        style
      ]}>
      <WsBadgeButton badge={badge} onPress={onPress} disable={disable} testID={testID}>
        <WsIcon size={size} name={icon} color={disable ? textColor : $color.primary} />
      </WsBadgeButton>
      <WsText
        size={2}
        color={textColor}
        textAlign={'center'}
      >
        {t(name)}
      </WsText>
    </View>
  )
}

export default WsBadgeIconButton
