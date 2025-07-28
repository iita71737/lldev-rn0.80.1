import React from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
import { WsIcon, WsText, WsFlex, WsIconCircle } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlUpdateBtn = ({
  // Prop
  children,
  minHeight = 60,
  backgroundColor = $color.primary9l,
  borderRadius = 10,
  textColor = $color.primary,
  icon = 'md-backup',
  iconSize = 30,
  onPress,
  style,
  uploadProgress = 0,
  testID
}) => {

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsFlex
          justifyContent="center"
          style={[
            {
              backgroundColor: backgroundColor,
              padding: 16,
              minHeight: minHeight,
              borderRadius: borderRadius,
              borderWidth: 3,
              borderColor: $color.primary8l,
              borderStyle: 'dashed'
            }, { style }
          ]}>
          {uploadProgress === 0 && (
            <>
              <WsIcon
                name={icon}
                size={iconSize}
                style={{
                  marginRight: 16
                }}
              />
              <WsText color={textColor}>
                {children}
              </WsText>
            </>
          )}
          {uploadProgress > 0 && (
            <WsIconCircle
              hasProgress={true}
              count={Math.round(uploadProgress * 100)}
              progressTintColor={$color.primary}
              backgroundColor="transparent"
              size={20}
            />
          )}
        </WsFlex>
      </TouchableOpacity>
    </>
  )
}

export default LlUpdateBtn
