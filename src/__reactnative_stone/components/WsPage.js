import React, { useState } from 'react'
import {
  View,
  // SafeAreaView
  StatusBar,
  Platform
} from 'react-native'
import { WsHeader, WsHeaderSearch } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { SafeAreaView } from 'react-native-safe-area-context';

const WsPage = props => {
  // Props
  const {
    children,
    mode,
    title,
    iconRight,
    iconLeft,
    leftOnPress,
    rightOnPress,
    searchValue,
    setSearchValue,
    borderRadius,
    hideLeftBtn,
    showRightBtn,
    btnTextRight
  } = props

  // Render
  return (
    <View
      style={{
        flex: 1,
      }}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content" // 或 'light-content' 視你的背景色而定
      />
      <SafeAreaView
        edges={['top']}
        style={{
          backgroundColor: $color.primary,
          paddingVertical: Platform.OS === 'android' ? 8 : 0
        }}
      />
      {!mode && (
        <WsHeader
          title={title}
          iconRight={iconRight}
          iconLeft={iconLeft}
          leftOnPress={leftOnPress}
          rightOnPress={rightOnPress}
          hideLeftBtn={hideLeftBtn}
          btnTextRight={btnTextRight}
        />
      )}
      {mode == 'search' && (
        <WsHeaderSearch
          title={title}
          iconRight={iconRight}
          iconLeft={iconLeft}
          leftOnPress={leftOnPress}
          hideLeftBtn={hideLeftBtn}
          rightOnPress={rightOnPress}
          showRightBtn={showRightBtn}
          setSearchValue={setSearchValue}
          searchValue={searchValue}
          borderRadius={borderRadius}
        />
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}

export default WsPage
