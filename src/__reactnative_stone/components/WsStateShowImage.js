import React from 'react'
import { ScrollView, View, TouchableOpacity, Image } from 'react-native'
import {
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsInfoImage,
  WsIcon,
  WsModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsStateShowImage = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // State
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  const { value, style, iconSize = 100 } = props

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
          alignItems: 'center',
          style
        }}>
        {value &&
          value.map(r => (
            <View
              style={{
                backgroundColor: $color.danger10l,
                borderRadius: 10,
                width: iconSize,
                height: iconSize,
                marginRight: 14,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <Image
                style={{
                  width: 32,
                  height: 32
                }}
                source={{ uri: r.icon }}
              />
              <WsText color={$color.danger} size={12}>{r.name}</WsText>
            </View>
          ))}
      </View>
    </>
  )
}

export default WsStateShowImage
