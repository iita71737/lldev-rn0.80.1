// A_A
import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  TouchableHighlight,
  ScrollView,
  Dimensions
} from 'react-native'
import { WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
// wasa
// [證照列表-top]上方segment control區塊(全部, 辦理中, 使用中, 逾期)
const WsFixedTopTabBar = ({
  style, // 樣式 [Object]
  tabStyle, // Tab樣式 [Object]
  enableScroll = false, // 是否可以左右滑動 [Boolean]
  items, // Tab列表 [Array(Object)]
  // [
  //   {textLabel: '逾期'},
  // ]
  value,
  activeTab, // focused Tab index [Number]
  activeTabBorderColor = '#0585d3', // focused Tab底部border顏色 [String]
  colorActive = $color.primary,
  onPress // Tab點擊觸發function
}) => {
  const windowWidth = Dimensions.get('window').width
  const [containerWidth, setContainerWidth] = useState(0)
  const $_getDimensions = event => {
    const { nativeEvent } = event
    const { width } = nativeEvent.layout
    setContainerWidth(width)
  }
  const getTabWidth = () => {
    return containerWidth / items.length
  }

  // Render
  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        {
          backgroundColor: 'black'
        }
      ]}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={enableScroll}>
      {items.map((item, tabKey) => {
        return (
          <TouchableHighlight
            key={tabKey}
            style={[styles.tabBarItem, tabStyle]}
            activeOpacity={1}
            underlayColor="transparent"
            onPress={() => onPress(item.value)}>
            <View style={styles.tabBar}>
              <WsText
                style={[
                  styles.tabBarText,
                  value == item.value
                    ? {
                      color: colorActive
                    }
                    : null
                ]}>
                {item.label}
              </WsText>
            </View>
          </TouchableHighlight>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 50
  },
  FlexView: {
    flexDirection: 'row',
    backgroundColor: '#ffffff'
  },
  activeTabIDBorderBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    borderRadius: 2
  },
  tabBar: {
    backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 14
  },
  tabBarText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: 1,
    textAlign: 'center',
    color: 'rgba(128, 128, 128, 0.6)'
  },
  tabBarTextActive: {
    color: '#0585d3'
  },
  tabBarBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    paddingHorizontal: 7,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(128, 128, 128, 0.6)'
  },
  tabBarBadgeActive: {
    backgroundColor: '#0585d3'
  },
  tabBarBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    textAlign: 'center',
    color: '#ffffff'
  }
})
export default WsFixedTopTabBar
