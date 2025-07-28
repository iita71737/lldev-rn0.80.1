import React from 'react'
import { View, StyleSheet } from 'react-native'
import { WsLoading } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsLoadingView = ({
  // Prop
  size = 'large',
  color = $color.primary
}) => {
  // Render
  return (
    <View style={[styles.container, styles.horizontal]}>
      <WsLoading size={size} color={color} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10
  }
})

export default WsLoadingView
