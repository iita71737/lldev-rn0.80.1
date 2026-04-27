import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
} from 'react-native'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import { WsIcon, WsText, WsFlex, WsBtn, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

const WsTabView = props => {
  const { t, i18n } = useTranslation()
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    fixedTabWidth,
    fixedContainerHeight,
    isAutoWidth = false,
    tabMinWidth,
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
    tabLabelFullText = false,
    lazy = false,
    swipeEnabled = true,
    animationEnabled = false,
    marginBottom = 8,
    title,
    submitText = t('送出'),
    onSubmit,
    setPopupActive,
    tabStyle,
    pointerVisible = false,
    topRightBtn,
    topLeftBtn,
    _onIndexChange
  } = props

  const formatTabNum = (value) => {
    const n = Number(value)
    if (!Number.isFinite(n)) return value
    return n > 99 ? '99+' : String(n)
  }

  const CustomTabBar = ({ navigationState, jumpTo }) => {
    const { t, i18n } = useTranslation()
    const { routes, index } = navigationState;

    return (
      <View
        style={{
          marginTop: 60,
          // borderWidth:1,
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
                if (topLeftBtn) {
                  topLeftBtn()
                }
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
              if (topLeftBtn) {
                topLeftBtn()
              }
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
              if (topRightBtn) {
                topRightBtn()
              }
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
            onPress={() => {
              onSubmit?.()
              topRightBtn?.()
            }}
          >
            {submitText}
          </WsBtn>
        )
        }
      </View >
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
    if (itemIndex === -1 || itemIndex !== index) {
      return null; // 注意返回 null 而不是 undefined，确保返回值的一致性
    }
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
        minWidth: item.tabMinWidth,
      })
    })
    setRoutes(_routes)
  }

  const getRouteMinWidth = route => {
    if (typeof route?.minWidth === 'number') {
      return route.minWidth
    }
    if (typeof tabMinWidth === 'number') {
      return tabMinWidth
    }
    const visibleTabCount = Math.max(1, routes?.length || items?.length || 1)
    const screenWidth = layout?.width || width
    return screenWidth / visibleTabCount + 12
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
              height: fixedContainerHeight ? fixedContainerHeight : layout && layout.height && Platform.OS === 'ios' ? layout.height - 256 : layout.height * 1.25, //checklist-issue
              flex: 1,
              // backgroundColor:'pink'
            },
            tabStyle
          ]
          }
          initialLayout={{
            width: Dimensions.get('window').width,
          }}

          navigationState={{ index, routes }}
          onIndexChange={$event => {
            if ($event == 9223372036854776000) {
              console.log($event, '$event');
              return
            }
            if (_onIndexChange) {
              _onIndexChange()
            }
            C_setIndex($event)
            setIndex($event)
          }}
          renderScene={renderScene}
          activeColor="yellow"
          commonOptions={{
            label: ({ route, labelText, focused, color }) => (
              <WsFlex style={{ flexDirection: 'row', alignItems: 'center' }}>
                <WsText
                  style={{
                    color,
                    flexWrap: 'nowrap',
                    flexShrink: tabLabelFullText ? 0 : 1,
                    minWidth: getRouteMinWidth(route),
                    textAlign: 'center',
                  }}
                  size={textSize}
                  numberOfLines={tabLabelFullText ? undefined : 1}
                  ellipsizeMode={tabLabelFullText ? undefined : 'tail'}
                >
                  {t(labelText ?? route.title)}
                </WsText>

                {!!route.icon && <WsIcon name={route.icon} style={{ marginLeft: 8 }} />}

                {(typeof route.tabNum === 'number' || typeof route.tabNum === 'string') && (
                  <WsFlex
                    justifyContent="center"
                    style={{
                      marginLeft: 2,
                      borderRadius: 12,
                      backgroundColor: $color.primary,
                      paddingHorizontal: 4,
                      minHeight: 24,
                      minWidth: 24
                    }}
                  >
                    <WsText
                      color={$color.white}
                      size={12}
                      style={{
                        includeFontPadding: false,
                        textAlign: 'center',
                        textAlignVertical: 'center',
                      }}
                    >
                      {route.tabNum}
                    </WsText>
                  </WsFlex>
                )}
              </WsFlex>
            ),
          }}
          renderTabBar={props => {
            const { routes, index } = props.navigationState
            return (
              <>
                {TabBarRender ? (
                  <View
                    style={{
                      position: 'relative',
                    }}
                  >
                    {pointerVisible && (
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          left: -4,
                          top: 0,
                          bottom: 0,
                          justifyContent: 'center',
                          zIndex: !isAtStart ? 999 : -999,
                        }}
                        onPress={() =>
                          scrollViewRef.current.scrollTo({ x: 0, animated: true })
                        }
                      >
                        <View
                          style={{
                            paddingVertical: 8,
                          }}
                        >
                          <WsIcon
                            name={"md-chevron-left"}
                            size={24}
                            style={{
                            }}
                          >
                          </WsIcon>
                        </View>
                      </TouchableOpacity>
                    )}
                    <ScrollView
                      contentContainerStyle={{ flexGrow: 1 }}
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
                        tabStyle={[
                          tabLabelFullText
                            ? {
                              width: 'auto',
                            }
                            : fixedTabWidth
                            ? {
                              width: fixedTabWidth
                            }
                            : isAutoWidth
                              ? {
                                width: width / items.length,
                              }
                              : {
                                width: 'auto',
                              }
                        ]}
                        indicatorStyle={{
                          backgroundColor: $color.primary5l
                        }}
                        style={[
                          {
                            backgroundColor: $color.white,
                          }
                        ]}
                        renderTabBar={(props) => (
                          <TabBar
                            {...props}
                            inactiveColor={inactiveColor}
                            activeColor={activeColor}
                            pressColor={$color.primary11l}
                            tabStyle={[/* 你原本的 tabStyle */]}
                            indicatorStyle={{ backgroundColor: $color.primary5l }}
                            style={{ backgroundColor: $color.white }}
                          // ❌ 不要再放 renderLabel
                          />
                        )}
                      />
                    </ScrollView>
                    {pointerVisible && (
                      <TouchableOpacity
                        testID={'right_pointer'}
                        style={[
                          {
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                            zIndex: !isAtEnd ? 999 : -999,
                          },
                        ]}
                        onPress={() =>
                          scrollViewRef.current.scrollToEnd({ animated: true })
                        }>
                        <View
                          style={{
                            paddingVertical: 8,
                          }}
                        >
                          <WsIcon
                            name={"md-chevron-right"}
                            size={24}
                            style={{
                            }}
                          >
                          </WsIcon>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  <>
                    <CustomTabBar {...props} />
                  </>
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
