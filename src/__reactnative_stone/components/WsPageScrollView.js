import React from 'react'
import {
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Dimensions,
  StyleSheet,
  SafeAreaView,
  View,
} from 'react-native'
const WsPageScrollView = ({
  // Prop
  children,
  onScroll,
  onReachBottom,
  isRefreshing,
  onRefresh,
  style,
  readBottomDis = 20,
  padding = 16,
  keyboardShouldPersistTaps = 'handled'
}) => {
  const { width, height } = Dimensions.get('window')
  // Function
  const $_onScroll = $event => {
    if (onScroll) {
      onScroll($event)
    }
    const layoutMeasurement = $event.nativeEvent.layoutMeasurement
    const contentOffset = $event.nativeEvent.contentOffset
    const contentSize = $event.nativeEvent.contentSize

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - readBottomDis &&
      onReachBottom
    ) {
      onReachBottom()
    }
  }

  // Render
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          scrollEventThrottle={16}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          onScroll={$_onScroll}
          enabled
          refreshControl={
            typeof onRefresh === 'function' ? (
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
            ) : null
          }
          contentContainerStyle={[
            {
              padding: padding,
            },
            style
          ]}>
          {children}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 24,
    flex: 1,
    justifyContent: "flex-end",
  },
  header: {
    fontSize: 36,
    marginBottom: 48,
  },
  input: {
    height: 40,
    borderColor: "#000000",
    borderBottomWidth: 1,
    marginBottom: 36,
  },
  btnContainer: {
    backgroundColor: "white",
    marginTop: 12,
  },
});

export default WsPageScrollView
