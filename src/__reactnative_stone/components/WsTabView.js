import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  View,
  useWindowDimensions,
  Dimensions,
  Button,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  StyleSheet,
  PixelRatio
} from 'react-native'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import { WsIcon, WsText, WsFlex, WsBtn, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsTabView = props => {
  const { t, i18n } = useTranslation()
  // Dimension
  const { width, height } = Dimensions.get('window')
  const fontScale = PixelRatio.getFontScale();

  // Props
  const {
    fixedTabWidth,
    fixedContainerHeight,
    isAutoWidth = false,
    items,
    TabBarRender = true,
    index = 0,
    setIndex,
    scrollEnabled = false,
    inactiveColor = $color.gray,
    activeColor = $color.primary,
    onChange,
    itemsState = [],
    itemsViews,
    textSize = 14,
    lazy = false,
    swipeEnabled = true,
    animationEnabled = false,
    marginBottom = 8,
    title,
    submitText = t('送出'),
    onSubmit,
    setPopupActive,
    tabStyle,
    pointerVisible = false
  } = props

  const CustomTabBar = ({ navigationState, jumpTo }) => {
    const { t, i18n } = useTranslation()
    const { routes, index } = navigationState;

    return (
      <View
        style={{
          marginTop: 60,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        {routes.length > 0
          && index > 0 &&
          routes[index] &&
          routes[index].key ? (
          <>
            <WsIconBtn
              key={routes[index].key}
              style={{
                marginLeft: 8,
                zIndex: 999
              }}
              name="ws-outline-arrow-left"
              size={24}
              color={$color.gray5d}
              onPress={() => {
                jumpTo(routes[index - 1].key)
              }}
            />
          </>
        ) : (
          <WsBtn
            colorDisabled={$color.primary10l}
            style={{
              marginLeft: 8,
              zIndex: 999
            }}
            textSize={14}
            textColor={$color.black}
            isFullWidth={false}
            color="transparent"
            onPress={() => {
              setPopupActive(true)
            }}
          >
            {t('回上頁')}
          </WsBtn>
        )}

        <View
          style={{
            position: 'absolute',
            right: 0,
            left: 0,
          }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignContent: 'center',
              // borderWidth:1
            }}
          >
            <WsText textAlign={'center'}>{t(title)}</WsText>
            <WsText size={14} color={$color.gray} textAlign={'center'}>
              {index + 1} / {routes.length}
            </WsText>
          </View>
        </View>

        {routes.length > 0 && index < routes.length - 1 && (
          <WsIconBtn
            testID={'ws-outline-arrow-right'}
            key={routes[index].key}
            style={{
              marginLeft: 8,
              // borderWidth: 1,
              zIndex: 999
            }}
            name="ws-outline-arrow-right"
            size={24}
            color={$color.gray5d}
            onPress={() => {
              jumpTo(routes[index + 1].key)
            }}
          />
        )}
        {(index == routes.length - 1) && routes.length > 1 && (
          <WsBtn
            testID={submitText}
            colorDisabled={$color.primary10l}
            style={{
              marginRight: 8,
            }}
            textSize={14}
            textColor={$color.black}
            isFullWidth={false}
            color="transparent"
            onPress={onSubmit}
          >
            {submitText}
          </WsBtn>
        )}
      </View>
    );
  };

  // State
  const layout = useWindowDimensions()
  const [routes, setRoutes] = React.useState([])
  const [isMounted, setIsMounted] = React.useState(false)
  const [C_index, C_setIndex] = React.useState(index)


  // Variable
  const renderScene = useCallback(({ route }) => {
    const itemIndex = items.findIndex(e => e.value == route.key);
    if (itemIndex === -1) return null;
    const item = items[itemIndex];
    const _view = itemsViews ? itemsViews[itemIndex].view : item.view;

    return (
      <_view
        key={itemIndex}
        {...item.props}
        value={itemsState[itemIndex]}
        onChange={($event, stateKey, item) => {
          onChange(itemIndex, $event, stateKey, item);
        }}
      />
    );
  }, [items, index, itemsViews, itemsState, onChange]);

  // Functions
  const $_setRoutes = () => {
    const _routes = []
    items.forEach(item => {
      _routes.push({
        key: item.value,
        title: item.label,
        icon: item.icon,
        tabNum: item.tabNum,
        width: item.tabWidth,
      })
    })
    setRoutes(_routes)
  }

  // Effect
  React.useEffect(() => {
    $_setRoutes()
  }, [items])

  React.useEffect(() => {
    if (routes) {
      setIsMounted(true)
    }
  }, [routes])

  // SHOW POINTER
  const scrollViewRef = useRef(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const handleScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const contentWidth = event.nativeEvent.contentSize.width;
    const scrollViewWidth = event.nativeEvent.layoutMeasurement.width;
    const atStart = offsetX <= 0;
    const atEnd = offsetX + scrollViewWidth >= contentWidth;
    setIsAtStart(prevAtStart => prevAtStart !== atStart ? atStart : prevAtStart);
    setIsAtEnd(prevAtEnd => prevAtEnd !== atEnd ? atEnd : prevAtEnd);
  }, [setIsAtStart, setIsAtEnd])

  // Render
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {isMounted && (
        <TabView
          animationEnabled={animationEnabled}
          swipeEnabled={swipeEnabled}
          springConfig={{ stiffness: 1000, damping: 500, mass: 3 }}
          swipeVelocityImpact={0.5}
          style={[
            {
              // FIX LIBRARY BUG
              height: fixedContainerHeight ? fixedContainerHeight : layout && layout.height && Platform.OS === 'ios' ? layout.height - 256 : layout.height * 1.25,
            },
            tabStyle
          ]
          }
          navigationState={{ index, routes }}
          onIndexChange={$event => {
            if ($event == 9223372036854776000) {
              console.log($event, '$event');
              return
            }
            C_setIndex($event)
            setIndex($event)
          }}
          renderScene={renderScene}
          initialLayout={{
            width: Dimensions.get('window').width,
          }}
          activeColor="yellow"
          renderTabBar={props => {
            const { routes, index } = props.navigationState
            return (
              <>
                {pointerVisible && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      left: -8,
                      zIndex: !isAtStart ? 999 : -999,
                    }}
                    onPress={() =>
                      scrollViewRef.current.scrollTo({ x: 0, animated: true })
                    }
                  >
                    <View
                      style={{
                        backgroundColor: $color.white,
                        paddingVertical: PixelRatio.getFontScale() !== 1 ? 24 : 12,

                        // height: 48,               // 固定高度
                        // justifyContent: 'center', // 垂直置中
                        // alignItems: 'center',     // 水平置中
                        // backgroundColor: 'transparent',
                        // borderRadius: 18,         // 圓角
                        // marginHorizontal: 4
                      }}
                    >
                      <WsIcon
                        name={"md-chevron-left"}
                        size={24}
                      >
                      </WsIcon>
                    </View>
                  </TouchableOpacity>
                )}
                {TabBarRender ? (
                  <ScrollView
                    contentContainerStyle={{
                      // paddingHorizontal: pointerVisible ? 16 : 0 // 根據左右箭頭寬度來設定
                    }}
                    testID="TabBarScrollView"
                    horizontal
                    ref={scrollViewRef}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    style={[
                      TabBarRender ? {
                        flexGrow: 0
                      } : {
                        flex: 1
                      },
                      {
                        // borderWidth:1,
                        backgroundColor: $color.white
                      }
                    ]}
                  >
                    <TabBar
                      {...props}
                      inactiveColor={inactiveColor}
                      activeColor={activeColor}
                      pressColor={$color.primary11l}
                      scrollEnabled={scrollEnabled}
                      tabStyle={[
                        isAutoWidth && fixedTabWidth
                          ? {
                            width: fixedTabWidth
                          }
                          : isAutoWidth
                            ? {
                              width: width / items.length,
                            }
                            : {
                              width: 'auto',
                            },
                        scrollEnabled == false
                          ? {
                            // width: width / items.length,
                            width: 'auto',
                          }
                          : {
                            width: 'auto',
                          },
                      ]}
                      indicatorStyle={{
                        backgroundColor: $color.primary5l
                      }}
                      style={[
                        {
                          backgroundColor: $color.white,
                        }
                      ]}
                      renderLabel={({ route, focused, color }) => (
                        <>
                          <WsFlex
                            style={{
                            }}
                            key={route}>
                            <WsText
                              testID={route.title}
                              style={{
                                color: color
                              }}
                              size={textSize}>
                              {t(route.title)}
                            </WsText>
                            {route.icon && (
                              <WsIcon
                                name={route.icon}
                                style={{
                                  marginLeft: 8
                                }}
                              />
                            )}
                            {(typeof route.tabNum == 'number' || typeof route.tabNum == 'string') && (
                              <WsFlex
                                justifyContent={'center'}
                                style={{
                                  // 你之所以在不同的 fontScale 下会看起来“偏上”，
                                  // 是因为你把文字的 lineHeight 设成了一个跟字体大小（12pt）有关的值，而这个值会根据系统的 fontScale 拉伸；但是你的容器高度是固定的 24px，两者就不对齐了。
                                  // 最保险、跨 Android/iOS 都能垂直居中的做法是——不要再给文字本身定高度或 lineHeight，
                                  // 而是把文字放在一个刚好 24×24 的 View 容器里，容器做 justifyContent: 'center', alignItems: 'center'。文字就会被真正地「包裹」并且居中。
                                  marginLeft: 4,
                                  borderRadius: 12,        // 半径 = 宽高/2
                                  backgroundColor: $color.primary,
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <WsText
                                  color={$color.white}
                                  size={12}
                                  style={{
                                    includeFontPadding: false, // （Android 专有）去掉默认上下内边距
                                    textAlign: 'center',
                                    textAlignVertical: 'center',
                                  }}>
                                  {route.tabNum}
                                </WsText>
                              </WsFlex>
                            )}
                          </WsFlex>
                        </>
                      )}
                    />
                  </ScrollView>
                ) : (
                  <CustomTabBar {...props} />
                )}

                {pointerVisible && (
                  <TouchableOpacity
                    testID={'right_pointer'}
                    style={{
                      position: 'absolute',
                      right: -8,
                      zIndex: !isAtEnd ? 999 : -999,
                    }}
                    onPress={() =>
                      scrollViewRef.current.scrollToEnd({ animated: true })
                    }>
                    <View
                      style={{
                        backgroundColor: $color.white,
                        paddingVertical: PixelRatio.getFontScale() !== 1 ? 24 : 12,
                        // height: 48,               // 固定高度
                        // justifyContent: 'center', // 垂直置中
                        // alignItems: 'center',     // 水平置中
                        // backgroundColor: 'transparent',
                        // borderRadius: 18,         // 圓角
                        // marginHorizontal: 4
                      }}
                    >
                      <WsIcon
                        name={"md-chevron-right"}
                        size={24}
                      >
                      </WsIcon>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )
          }}
        />
      )}
    </View>
  )
}

export default WsTabView

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0 // Important to make ScrollView scrollable
  },
});