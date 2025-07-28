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
    textSize = 14
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
                      isAutoWidth && fixedTabWidth
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
                    scrollEnabled={scrollEnabled}
                    renderLabel={({ route, focused, color }) => (
                      <WsFlex>
                        <WsText
                          testID={route.key}
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
