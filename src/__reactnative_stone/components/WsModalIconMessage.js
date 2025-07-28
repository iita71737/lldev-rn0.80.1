import React from 'react'
import { Modal, View } from 'react-native'
import { WsText, WsIcon, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsModalIconMessage = props => {
  // Props
  const {
    visible,
    text,
    icon,
    iconColor = $color[$theme].WsModalIconMessage.iconColor,
    textColor = $color[$theme].WsModalIconMessage.textColor
  } = props

  // Render
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <WsFlex
        style={{
          flex: 1
        }}
        alignItems="center"
        justifyContent="center">
        <View
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={{
            width: 160,
            height: 160,
            backgroundColor: 'rgba(0,0,0,.8)',
            borderRadius: 8
          }}>
          <WsIcon name={icon} size={48} color={iconColor} />
          <WsText
            style={{
              marginTop: 16
            }}
            color={textColor}>
            {text}
          </WsText>
        </View>
      </WsFlex>
    </Modal>
  )
}

export default WsModalIconMessage
