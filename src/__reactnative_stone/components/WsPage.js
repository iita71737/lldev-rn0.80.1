import React, { useState } from 'react'
import {
  View,
  // SafeAreaView
  StatusBar,
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
    showLeftBtn,
    showRightBtn,
    btnTextRight,
    onSearchFocus,
    onSearchBlur,
    showSearchSuggestions,
    searchSuggestions,
    searchSuggestionLoading,
    onPressSearchSuggestion,
    searchTriggerOnRight
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
          showLeftBtn={showLeftBtn != undefined ? showLeftBtn : !hideLeftBtn}
          rightOnPress={rightOnPress}
          showRightBtn={showRightBtn}
          setSearchValue={setSearchValue}
          searchValue={searchValue}
          borderRadius={borderRadius}
          onSearchFocus={onSearchFocus}
          onSearchBlur={onSearchBlur}
          showSearchSuggestions={showSearchSuggestions}
          searchSuggestions={searchSuggestions}
          searchSuggestionLoading={searchSuggestionLoading}
          onPressSearchSuggestion={onPressSearchSuggestion}
          searchTriggerOnRight={searchTriggerOnRight}
        />
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  )
}

export default WsPage
