import React from 'react';

import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native'

const WsInvertedScrollView = ({
  children,
  style,
  onScroll,
  onReachTop,
  readTopDis = 20
}) => {

  // Function
  const $_onScroll = ($event) => {
    if (onScroll) {
      onScroll($event)
    }
    const layoutMeasurement = $event.nativeEvent.layoutMeasurement
    const contentOffset = $event.nativeEvent.contentOffset
    const contentSize = $event.nativeEvent.contentSize
    if ((layoutMeasurement.height + contentOffset.y >=
      contentSize.height - readTopDis) && onReachTop) {
      onReachTop()
    }
  }

  return (
    <ScrollView
      onScroll={$_onScroll}
      style={[
        styles.ScrollView,
      ]}
      scrollEventThrottle={500}
    >
      <View
        style={[
          styles.ScrollViewChildView,
          style
        ]}
      >
        {children}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  ScrollView: {
    transform: [
      { scaleY: -1 },
    ],
  },
  ScrollViewChildView: {
    flexDirection: 'column-reverse',
    transform: [
      { scaleY: -1 },
    ],
  },
})

export default WsInvertedScrollView