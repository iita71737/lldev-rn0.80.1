import React from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
import { WsCard, WsBottomSheet, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsCardBottomSheetMore = props => {
  // Props
  const {
    children,
    moreText,
    textColor = $color.primary,
    bottomSheetItems = [],
    onBottomSheetItemPress,
    style
  } = props

  // State
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)

  // Render
  return (
    <>
      <WsCard borderRadius={0} style={[style]}>
        {children}
        {moreText && (
          <WsFlex justifyContent="center">
            <TouchableOpacity
              style={{
                marginTop: 16
              }}
              onPress={() => {
                setIsBottomSheetActive(true)
              }}>
              <WsText letterSpacing={1} color={textColor}>
                {moreText}
              </WsText>
            </TouchableOpacity>
          </WsFlex>
        )}
      </WsCard>
      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={onBottomSheetItemPress}
        snapPoints={[148, 308]}
      />
    </>
  )
}

export default WsCardBottomSheetMore
