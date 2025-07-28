import React from 'react'
import { View, Modal, TouchableOpacity, Dimensions } from 'react-native'
import { WsBtn, WsText } from '@/components'
import { useTranslation } from 'react-i18next'

const WsAlert = ({
  // Props
  animationType = 'none',
  transparent = true,
  active = false,
  onClose,
  title,
  message,
  popupBgRGBA = '#rgba(2,19,5,0.7)',
  contentPadding = 0,
  buttonMinHeight = 40
}) => {
  // i18n
  const { t, i18n } = useTranslation()

  // Data
  const windowSize = Dimensions.get('window')

  // Render
  return (
    <Modal
      animationType={animationType}
      transparent={transparent}
      visible={active}
      onRequestClose={onClose}>
      <View
        style={[
          {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }
        ]}>
        <TouchableOpacity
          style={[
            {
              position: 'absolute',
              width: '100%',
              height: '100%',
              flex: 1,
              zIndex: 0,
              backgroundColor: popupBgRGBA
            }
          ]}
          activeOpacity={1}
          onPressOut={onClose}
        />
        <View
          style={[
            {
              overflow: 'hidden',
              zIndex: 1,
              flexDirection: 'column',
              borderRadius: 4,
              backgroundColor: '#ffffff',
              width: Math.round(windowSize.width) - 80,
              padding: contentPadding
            }
          ]}>
          <View
            style={[
              {
                padding: 16,
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}>
            {title && (
              <WsText
                style={[
                  {
                    marginBottom: 10
                  }
                ]}>
                {title}
              </WsText>
            )}
            {message && <WsText>{message}</WsText>}
          </View>
          <WsBtn borderRadius={0} minHeight={buttonMinHeight} onPress={onClose}>
            {t('確定')}
          </WsBtn>
        </View>
      </View>
    </Modal>
  )
}

export default WsAlert
