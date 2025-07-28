import React from 'react'
import { StyleSheet, View } from 'react-native'
import { WsPageScrollView } from '@/components'

const WsInvertedScrollView = props => {
  // Prop
  const { readTopDis, onReachTop, containerStyle, children } = props

  // Render
  return (
    <WsPageScrollView
      onReachBottom={onReachTop}
      readBottomDis={readTopDis}
      style={[styles.ScrollView]}>
      <View style={[styles.ScrollViewChildView, containerStyle]}>
        {children}
      </View>
    </WsPageScrollView>
  )
}

const styles = StyleSheet.create({
  ScrollView: {
    transform: [{ scaleY: -1 }]
  },
  ScrollViewChildView: {
    flexDirection: 'column-reverse',
    transform: [{ scaleY: -1 }]
  }
})

export default WsInvertedScrollView
