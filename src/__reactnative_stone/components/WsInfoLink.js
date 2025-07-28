import React, { useCallback } from 'react'
import { Pressable, TouchableOpacity, Linking, Button, Dimensions, Platform } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsInfoLink = props => {
  const { width, height } = Dimensions.get('window')

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
      <TouchableOpacity
        testID={testID}
        style={[
          {
            // borderWidth:1,
          },
          {
            style
          }
        ]
        }
        onPress={hasExternalLink ? handlePress : onPress}
      >
        <WsFlex
          alignItems="center"
          flexWrap={style?.flexWrap ? style.flexWrap : 'wrap'}
          style={{
          }}
        >
          <WsText size={size} color={color}>
            {value}
          </WsText>
          {iconVisible && (
            <WsIcon
              size={iconSize}
              name={icon}
              style={{ marginLeft: 4 }} // 視情況微調
            />
          )}
        </WsFlex>
      </TouchableOpacity>
    </>
  )
}

export default WsInfoLink
