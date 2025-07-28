import React, { useState } from 'react'
import { View, SafeAreaView, StatusBar } from 'react-native'
import { WsToggleTabBar } from '@/components'
import gColor from '@/__reactnative_stone/global/color'

const LlToggleTabBar001 = props => {
  const { items, value, onPress, backgroundColor = gColor.primary, style } = props

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <SafeAreaView>
        <View
          style={[
            {
              backgroundColor: backgroundColor,
              padding: 16
            },
            style
          ]}>
          <WsToggleTabBar items={items} value={value} onPress={onPress} />
        </View>
      </SafeAreaView>
    </>
  )
}

export default LlToggleTabBar001
