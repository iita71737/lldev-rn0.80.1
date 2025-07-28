import React from 'react'
import { ImageBackground, StyleSheet, TouchableHighlight, View } from 'react-native'
import { WsCard, WsFlex, WsIcon, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
// import RadialGradient from 'react-native-radial-gradient'
import LinearGradient from 'react-native-linear-gradient'
import { useTranslation } from 'react-i18next'

const WsImageBtn = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    title,
    backgroundImg,
    padding = 0,
    onPress,
    icon,
    navigation,
    RadialGradientColors = ['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.2)'],
    LinearGradientColors = [
      'rgba(18, 84, 111, 0.8)',
      'rgba(3, 72, 169, 0.5)',
      'rgba(0, 120, 255, 0.4)'
    ],
    style,
    disable
  } = props

  const _overlayStyle = disable ? styles.disableOverlay : styles.overlay;

  // Render
  return (
    <WsCard style={[style], [styles.Card]} padding={padding}>
      <TouchableHighlight
        onPress={onPress}
        activeOpacity={0.6}
        underlayColor="transparent"
        style={{
          backgroundColor: 'black'
        }}
      >
        <ImageBackground
          style={styles.Image}
          source={backgroundImg}
          imageStyle=
          {{
            opacity: 0.7,
            backgroundColor: $color.primary11l,
            backfaceVisibility: 'visible'
          }}
        >
          <View style={_overlayStyle} />
          {/* <RadialGradient
            style={[styles.overlayer]}
            stops={[0, 1]}
            center={[100, 100]}
            colors={RadialGradientColors}>
            <LinearGradient
              style={[styles.overlayer]}
              start={{x: 0, y: 0}}
              end={{x: 2, y: 1}}
              colors={LinearGradientColors}
            />
          </RadialGradient> */}
          <WsFlex justifyContent="center">
            {icon && (
              <WsIcon
                name={icon}
                size={20}
                color={$color.white}
                style={{
                  marginRight: 4
                }}
              />
            )}
            <WsText
              size="h5"
              fontWeight="bold"
              textAlign={'center'}
              color={$color.white}
              style={styles.text}>
              {t(title)}
            </WsText>
          </WsFlex>
        </ImageBackground>
      </TouchableHighlight>
    </WsCard>
  )
}

const styles = StyleSheet.create({
  Card: {
    overflow: 'hidden',
    margin: 4,
  },
  Image: {
    flex: 1,
    resizeMode: 'cover',
    padding: 20
  },
  overlayer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: 200,
    height: 200
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(8, 96, 172, 0.5)', // 设置遮罩颜色和透明度
  },
  disableOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 设置遮罩颜色和透明度
  },
  text: {
    paddingTop: 8,
    paddingBottom: 8
  }
})

export default WsImageBtn
