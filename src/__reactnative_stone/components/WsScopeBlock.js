import React from 'react'
import { View, Dimensions } from 'react-native'
import component from '@/__config/component'
import { WsText, WsDialog, WsFlex, WsPopup, WsGradientButton } from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const WsScopeBlock = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // Props
  const {
  } = props

  // State
  const [visible, setVisible] = React.useState(true)

  // Render
  return (
    <>
      <WsPopup
        active={visible}
        onClose={() => {
          // setVisible(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: 208,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>
          <>
            <WsText
              size={18}
              color={$color.black}
              style={{
              }}
            >
              {t('您無此權限')}
            </WsText>

            <WsGradientButton
              style={{
                position: 'absolute',
                width: 120,
                right: 16,
                bottom: 16
              }}
              onPress={() => {
                navigation.goBack()
              }}>
              {t('確定')}
            </WsGradientButton>
          </>

        </View>
      </WsPopup>
    </>
  )
}

export default WsScopeBlock
