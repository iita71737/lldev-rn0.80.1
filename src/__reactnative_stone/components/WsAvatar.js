import React from 'react'
import { ImageBackground, Image } from 'react-native'

const WsAvatar = props => {
  // Props
  const { size = 50, source, style, isUri = true } = props

  // Function
  const $_getSource = (source, isUri) => {
    if (!source) {
      return require('@/__reactnative_stone/assets/img/avatar.png')
    }
    if (isUri) {
      return { uri: source.uri ? source.uri : source }
    } else {
      return source
    }
  }

  // Render
  return (
    <Image
      style={[
        {
          flex: 0,
          borderRadius: size,
          width: size,
          height: size
        },
        style
      ]}
      imageStyle={{ borderRadius: size / 2 }}
      source={$_getSource(source, isUri)}
    />
  )
}

export default WsAvatar
