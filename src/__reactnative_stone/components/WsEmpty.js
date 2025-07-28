import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import { WsFlex, WsText, WsFastImage } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import config from '@/__config'
import { useTranslation } from 'react-i18next'

const WsEmpty = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const imageSize = Math.min(width * 0.5, 300);

  // Props
  const {
    image = config.component.WsEmpty && config.component.WsEmpty.image
      ? config.component.WsEmpty.image
      : null,
    isUri,
    emptyTitle = t('目前尚無資料'),
    emptyText = ''
  } = props

  // Render
  return (
    <>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        {image && (
          <WsFastImage
            source={image}
            isUri={isUri}
            widthLoad={imageSize}
            heightLoad={imageSize}
          />
        )}
        <WsFlex flexDirection="column" justifyContent="center">
          <WsText
            testID={'emptyTitle'}
            letterSpacing={1}
            color={$color.gray4d}
            fontWeight="900"
          >
            {t(emptyTitle)}
          </WsText>
          <WsText
            style={{
              marginTop: 8,
              maxWidth: width * 0.65,
            }}
            letterSpacing={1}
            color={$color.gray4d}
            size={14}>
            {t(emptyText)}
          </WsText>
        </WsFlex>
      </View>
    </>
  )
}

export default WsEmpty
