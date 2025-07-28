import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { WsText, WsIcon, WsFlex, WsGradientCircle } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

const WsIconCircle = props => {
  // State
  const [borderRadius, setBorderRadius] = useState(0)

  // Prop
  const {
    name,
    iconSize = 20,
    iconStyle,
    size,
    color,
    style,
    count,
    hasProgress = false,
    padding = 16,
    left = -8,
    text,
    textStyle,
    progressTintColor = $color.primary1l,
    backgroundColor = $color.primary11l,
    textColor = $color.white,
    isGradient = false,
    isGradientPosition = 'absolute',
    gradientColor = [$color.primary, $color.primary10l],
    gradientBorder
  } = props

  useEffect(() => {
    setBorderRadius(padding + size / 2)
  }, [size, padding])

  // Render
  return (
    <WsFlex flexDirection="column" justifyContent="center">
      <View
        style={[
          {
            justifyContent: 'center',
            alignItems: 'center',
            padding: padding,
            borderRadius: borderRadius
          },
          !hasProgress &&
          !isGradient && {
            backgroundColor: backgroundColor
          },
          style
        ]}
      >
        {isGradient && (
          <>
            <WsGradientCircle
              style={{
                position: isGradientPosition,
                borderWidth: gradientBorder,
                borderColor: $color.gray3l,
                borderRadius: size / 2
              }}
              colors={gradientColor && gradientColor.length > 0 && gradientColor}
              size={size}
            />
          </>
        )}
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: size
          }}>
          {!hasProgress && (
            <WsIcon
              style={[
                {
                  zIndex: 2,
                },
                iconStyle
              ]}
              name={name}
              size={iconSize}
              color={color}
            />
          )}
          {text && (
            <WsText
              style={[
                {
                  // borderWidth: 1,
                  textAlign: 'center'
                },
                textStyle
              ]}
              size={12}
              color={textColor}>
              {text}
            </WsText>
          )}
          {hasProgress && (
            <AnimatedCircularProgress
              size={36}
              width={2}
              fill={count}
              rotation={0}
              lineCap="round"
              tintColor={progressTintColor}
              backgroundColor={backgroundColor}
              children={() => <WsIcon name={name} size={size} color={color} />}
            />
          )}
        </View>
      </View>
    </WsFlex>
  )
}

export default WsIconCircle
