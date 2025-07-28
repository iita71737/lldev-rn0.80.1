import React, { useState } from 'react'
import { View, SafeAreaView } from 'react-native'
import { WsHeader, WsHeaderSearch } from '@/components'
import $color from '@/__reactnative_stone/global/color'

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
    showRightBtn
  } = props

  // Render
  return (
    <View
      style={{
        flex: 1
      }}>
      <SafeAreaView
        style={{
          backgroundColor: $color.primary
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
