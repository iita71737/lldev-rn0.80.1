import React from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
import { WsTag, WsText, WsIcon, WsFlex } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const LlBtnFullFooter001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    text = t('上傳'),
    required = true,
    icon = 'ws-outline-attachment',
    onPress,
    testID
  } = props

  // Rneder
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsFlex
        justifyContent="center"
        style={{
          paddingVertical: 16,
          backgroundColor: $color.primary10l
        }}>
        <WsIcon
          name={icon}
          size={30}
          color={$color.black4l}
          style={{ marginRigth: 8 }}
        />
        <WsText>{text}</WsText>
        {required != undefined && (
          <WsFlex
            style={{
              backgroundColor: $color.danger,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 16,
              marginLeft: 8
            }}>
            <WsText color={$color.white} size={12}>
              {required ? t('必填') : t('選填')}
            </WsText>
          </WsFlex>
        )}
      </WsFlex>
    </TouchableOpacity>
  )
}

export default LlBtnFullFooter001
