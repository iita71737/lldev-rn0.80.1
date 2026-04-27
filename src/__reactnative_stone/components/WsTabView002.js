import React from 'react'
import { View, useWindowDimensions, Dimensions } from 'react-native'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import { WsIcon, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsTabView = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const layout = useWindowDimensions()

  // Props
  const {
    fixedTabWidth,
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
    tabLabelFullText = false
  } = props

  // State
  const [routes, setRoutes] = React.useState([])
  const [scene, setScene] = React.useState({})
  const [isMounted, setIsMounted] = React.useState(false)

  const renderScene = SceneMap(scene);

  // Functions
  const $_setRoutes = () => {
    let _scene = {}
    const _routes = []
    items.forEach((item, index) => {
      _routes.push({
        key: item.value,
        index: index,
        title: item.label,
        icon: item.icon,
        tabNum: item.tabNum,
        tabAlertBadge: item.tabAlertBadge,
        minWidth: item.tabMinWidth,
        view: item.view,
        props: { ...item.props }
      })
      _scene = {
        ..._scene,
        [item.value]: item.view,
      }
    })
    setRoutes(_routes)
    setScene(_scene)
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
    return screenWidth / visibleTabCount + 24
  }

  // Effect
  React.useEffect(() => {
    $_setRoutes()
    setIsMounted(true)
  }, [items])

  // Render
  return (
    <View
      style={{
        flex: 1
      }}>
      {isMounted && (
        <TabView
          navigationState={{ index, routes, items }}
          onIndexChange={$event => {
            setIndex($event)
          }}
          renderScene={renderScene}
          initialLayout={{ width: layout.width }}
          activeColor="yellow"
          renderTabBar={props => {
            return (
              <>
                {TabBarRender && (
                  <TabBar
                    {...props}
                    inactiveColor={inactiveColor}
                    activeColor={activeColor}
                    pressColor={$color.primary11l}
                    tabStyle={[
                      tabLabelFullText
                        ? { width: 'auto' }
                        : isAutoWidth && fixedTabWidth
                        ? { width: fixedTabWidth }
                        : isAutoWidth
                          ? { width: width / items.length }
                          : { width: 'auto' }
                    ]}
                    indicatorStyle={{
                      backgroundColor: $color.primary5l
                    }}
                    style={[
                      scrollEnabled == false
                        ? {
                          width: 'auto'
                        }
                        : {
                          width: 'auto'
                        },
                      {
                        backgroundColor: $color.white,
                        marginBottom: 8
                      }
                    ]}
                    scrollEnabled={scrollEnabled || tabLabelFullText}
                    renderLabel={({ route, focused, color }) => (
                      <WsFlex>
                        <WsText
                          testID={route.key}
                          style={{
                            color: color,
                            flexWrap: 'nowrap',
                            flexShrink: tabLabelFullText ? 0 : 1,
                            minWidth: getRouteMinWidth(route),
                            textAlign: 'center'
                          }}
                          size={textSize}
                          numberOfLines={tabLabelFullText ? undefined : 1}
                          ellipsizeMode={tabLabelFullText ? undefined : 'tail'}
                        >
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
                        {route.tabNum && (
                          <WsFlex
                            justifyContent={'center'}
                            style={{
                              marginLeft: 4,
                              borderRadius: 25,
                              backgroundColor: $color.primary
                            }}>
                            <WsText
                              color={$color.white}
                              size={14}
                              style={{
                                top: 1,
                                textAlign: 'center',
                                height: 24,
                                width: 24
                              }}>
                              {route.tabNum}
                            </WsText>
                          </WsFlex>
                        )}
                      </WsFlex>
                    )}
                  />
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
