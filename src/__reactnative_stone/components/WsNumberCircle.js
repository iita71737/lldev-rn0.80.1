import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { WsFlex, WsText, WsGradientCircle } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { AnimatedCircularProgress } from 'react-native-circular-progress'

const WsNumberCircle = props => {
  // State
  const [borderRadius, setBorderRadius] = useState(0)

  // Prop
  const {
    size = 40,
    color,
    style,
    count,
    hasProgress = false,
    padding = 8,
    progressTintColor = $color.primary,
    backgroundColor = $color.primary11l,
    isGradient = false,
    animatedWidth = 2,
    animatedSize = 40,
    unit,
    text
  } = props

  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0
  const safeText = typeof text === 'string' || typeof text === 'number'
    ? String(text)
    : '0'


  useEffect(() => {
    setBorderRadius(padding + size / 2)
  }, [size, padding])

  // Render
  return (
    <WsFlex>
      <View
        style={[
          {
            borderRadius: borderRadius
          },
          !hasProgress &&
          !isGradient && {
            backgroundColor: backgroundColor
          },
          style
        ]}>
        {isGradient && (
          <WsGradientCircle
            style={{
              position: 'absolute',
              top: padding - 1,
              left: padding - 1
            }}
            size={size}
          />
        )}
        {!hasProgress && (
          <>
            <WsText color={color}>{text}</WsText>
            {unit && (
              <WsText
                size={12}
                color={$color.gray}
                style={{
                  marginTop: -4
                }}>
                {unit}
              </WsText>
            )}
          </>
        )}
        {hasProgress && (
          <AnimatedCircularProgress
            size={animatedSize}
            width={animatedWidth}
            fill={safeCount}
            rotation={0}
            lineCap="round"
            tintColor={progressTintColor}
            backgroundColor={backgroundColor}
            children={() => (
              <>
                <WsText color={color}>{safeText}</WsText>
                {unit && (
                  <WsText
                    size={12}
                    color={$color.gray}
                    style={{
                      marginTop: -4
                    }}>
                    {unit}
                  </WsText>
                )}
              </>
            )}
          />
        )}
      </View>
    </WsFlex>
  )
}

export default WsNumberCircle
