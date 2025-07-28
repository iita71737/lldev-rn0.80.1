import React from 'react'
import { Image, View } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsTag = props => {
  // Props
  const {
    icon,
    img,
    children,
    style,
    size = 12,
    iconSize = 16,
    imgSize = 24,
    backgroundColor = $color.primary11l,
    borderRadius = 8,
    paddingLeft = 8,
    paddingRight = 8,
    paddingTop = 4,
    paddingBottom = 4,
    textColor = $color.primary2l,
    iconColor = $color.primary2l,
    dotColor,
    testID
  } = props

  // Render
  return (
    <>
      <WsFlex
        style={[
          {
            backgroundColor,
            borderRadius,
            paddingLeft,
            paddingRight,
            paddingTop,
            paddingBottom,
          },
          style
        ]}>
        {img && (
          <Image
            source={{
              uri: img
            }}
            fadeDuration={0}
            cache="force-cache"
            style={{
              width: imgSize,
              height: imgSize
            }}
          />
        )}
        {icon && (
          <WsIcon
            name={icon}
            size={iconSize}
            color={iconColor ? iconColor : textColor}
            style={{ marginRight: 4 }}
          />
        )}
        {dotColor && (
          <View
            style={{
              backgroundColor: dotColor,
              borderRadius: 25,
              width: 12,
              height: 12,
              marginRight: 4
            }}
          ></View>
        )}
        <WsText
          size={size}
          color={textColor}
          testID={testID}
        >
          {children}
        </WsText>
      </WsFlex>
    </>
  )
}

export default WsTag
