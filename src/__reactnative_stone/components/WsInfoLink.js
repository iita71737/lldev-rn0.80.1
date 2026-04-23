import React, { useCallback } from 'react'
import { Pressable, TouchableOpacity, Linking, Button, Dimensions, Platform } from 'react-native'
import { createIconSetFromIcoMoon } from 'react-native-vector-icons'
import icoMoonConfig from '@/__reactnative_stone/assets/icomoon/selection.json'
import { WsText } from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const LinkInlineIcon = createIconSetFromIcoMoon(icoMoonConfig, 'icomoon', 'icomoon.ttf')

const WsInfoLink = props => {
  const { width, height } = Dimensions.get('window')
  const { t } = useTranslation()

  // Props
  const {
    color = $color.link,
    value,
    size,
    onPress,
    iconSize = 24,
    icon = 'ws-outline-link',
    hasExternalLink = false,
    iconVisible = true,
    style,
    testID
  } = props

  const [supportedURL, setSupportedURL] = React.useState(value)

  const handlePress = useCallback(async () => {
    // Checking if the link is supported for links with custom URL scheme.
    const supported = await Linking.canOpenURL(supportedURL)
    if (supported) {
      // Opening the link with some app, if the URL scheme is "http" the web link should be opened
      // by some browser in the mobile
      await Linking.openURL(supportedURL)
    } else {
      Alert.alert(`Don't know how to open this URL: ${supportedURL}`)
    }
  }, [supportedURL])

  // Render
  return (
    <>
      {!value ? (
        <WsText size={size} color={$color.gray}>
          {t('無')}
        </WsText>
      ) : (
        <TouchableOpacity
          testID={testID}
          style={[
            {
              // borderWidth:1,
            },
            style
          ]
          }
          onPress={hasExternalLink ? handlePress : onPress}
        >
          <WsText
            size={size}
            color={color}
            style={{
              // borderWidth:1,
            }}
          >
            {value}
            {iconVisible && (
              <LinkInlineIcon
                size={iconSize}
                name={icon}
                color={color}
                style={{ marginLeft: 0 }}
              />
            )}
          </WsText>
        </TouchableOpacity>
      )}
    </>
  )
}

export default WsInfoLink
