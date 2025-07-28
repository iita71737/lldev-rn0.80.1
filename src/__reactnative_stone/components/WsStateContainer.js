import React from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsStateContainer = ({
  // Prop
  children,
  keyboardShouldPersistTaps = 'always',
  backgroundColor = $theme == 'light' ? $color.white1d : $color.black1l
}) => {
  // Render
  return (
    <ScrollView
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      contentContainerStyle={[
        styles.ScrollView,
        {
          backgroundColor: backgroundColor
        }
      ]}>
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  ScrollView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 40,
    paddingVertical: 40
  }
})

export default WsStateContainer
