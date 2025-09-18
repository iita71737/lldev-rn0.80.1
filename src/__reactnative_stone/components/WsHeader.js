import React from 'react'
import { View, Platform } from 'react-native'
import { WsFlex, WsText, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import { useNavigation } from '@react-navigation/native'

const WsHeader = props => {
  const navigation = useNavigation()
  const { windowWidth, windowHeight } = layouts
  // Props
  const {
    title,
    iconRight,
    iconLeft,
    leftOnPress,
    rightOnPress,
    hideLeftBtn = false
  } = props

  // Function
  const $_leftOnPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'RoutesApp'
          }
        ],
        key: null
      })
    }
  }

  // Render
  return (
    <>
      <View
        style={{
          backgroundColor: $color.primary,
          width: windowWidth,
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}>
        <WsFlex>

          {!hideLeftBtn && (
            <WsIconBtn
              testID={iconLeft ? '' : 'backButton'}
              name={iconLeft ? iconLeft : 'md-chevron-left'}
              color={$color.white}
              size={24}
              padding={0}
              onPress={leftOnPress ? leftOnPress : $_leftOnPress}
            />
          )}

          <View
            style={{
              flex: 1,
              alignItems: 'center'
            }}>
            <WsText color={$color.white} size={18}>
              {title}
            </WsText>

          </View>

          <View
            style={{
              width: 24
            }}>
            {iconRight && (
              <WsIconBtn
                testID={iconRight}
                name={iconRight}
                color={$color.white}
                onPress={rightOnPress}
                padding={0}
                size={24}
              />
            )}
          </View>
        </WsFlex>
      </View>
    </>
  )
}

export default WsHeader
