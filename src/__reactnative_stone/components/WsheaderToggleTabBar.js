import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WsToggleTabBar } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsHeaderToggleTabBar = props => {
  // Props
  const {
    tabFocus,
    toggleTabs,
    setTabFocus,
    backgroundColor = $color.primary
  } = props

  // Render
  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor
        },
        styles.tabBarContainer
      ]}>
      <WsToggleTabBar
        value={tabFocus}
        items={toggleTabs}
        onPress={$event => {
          setTabFocus($event)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    padding: 16,
    paddingTop: 0
  }
})

export default WsHeaderToggleTabBar
