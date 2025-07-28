import React from 'react'
import { Pressable, Image, TouchableOpacity } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import { WsCard, WsText, WsIcon, WsFlex } from '@/components'
import { useTranslation } from 'react-i18next'

const LlTemplatesCard001 = props => {
  // i18n
  const { t, i18n } = useTranslation()

  const {
    name,
    style,
    fontColor = $color.black,
    fontStyle,
    onPress,
    icon,
    img,
    testID
  } = props

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            alignItems: 'flex-start',
            // Android
            elevation: 1,
            // iOS
            backgroundColor: 'white',
            shadowColor: '#000000',
            shadowOpacity: 0.1,
            shadowRadius: 0.3,
            shadowOffset: {
              height: 1,
              width: 0
            }
          },
          style
        ]}>
        <WsFlex>
          {icon && <WsIcon style={{ marginRight: 8 }} name={icon} />}
          {img && (
            <Image
              style={{
                width: 24,
                height: 24,
                marginRight: 8
              }}
              source={{ uri: img }}
            />
          )}
          <WsText testID={`事件類型`} style={fontStyle} color={fontColor} letterSpacing={1}>
            {t(name)}
          </WsText>
        </WsFlex>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlTemplatesCard001
