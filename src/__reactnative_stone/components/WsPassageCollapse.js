import React, { useEffect } from 'react'
import {
  Pressable,
  Animated,
  TouchableOpacity,
  Dimensions,
  UIManager,
  LayoutAnimation
} from 'react-native'
import { WsFlex, WsCollapsible, WsText, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsPassageCollapse = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { passage, type = 'text', children } = props

  const fadeAnim = React.useRef(new Animated.Value(1)).current

  // States
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [shouldShowToggle, setShouldShowToggle] = React.useState(false)

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true)
    }
  }, [])

  const toggleCollapse = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setIsCollapsed(prev => !prev)
  }

  // Render
  return (
    <>
      {type == 'text' && (
        <>
          <WsText
            size={14}
            numberOfLines={isCollapsed ? 3 : undefined}
            style={{ lineHeight: 20 }}
            onTextLayout={(e) => {
              // console.log(e,'e--');
              if (e.nativeEvent.lines.length >= 3) {
                setShouldShowToggle(true)
              }
            }}
          >
            {passage}
          </WsText>

          {shouldShowToggle && (
            <TouchableOpacity onPress={toggleCollapse}>
              <WsFlex justifyContent="center" style={{ marginTop: 16 }}>
                <WsText color={$color.primary} size={14} style={{ marginRight: 8 }}>
                  {isCollapsed ? t('展開') : t('收起')}
                </WsText>
                <WsIcon size={20} name={isCollapsed ? 'md-chevron-down' : 'md-chevron-up'} />
              </WsFlex>
            </TouchableOpacity>
          )}
        </>
      )}
      {type == 'array' && (
        <>
          {isCollapsed ? (
            <WsCollapsible isCollapsed={!isCollapsed}>
              <>{children.slice(0, 6)}</>
            </WsCollapsible>
          ) : (
            <WsCollapsible isCollapsed={isCollapsed}>
              {children}
            </WsCollapsible>
          )}
          {children.length > 6 &&
            children.length != 6 && (
              <TouchableOpacity
                onPress={() => {
                  setIsCollapsed(!isCollapsed)
                }}>
                <WsFlex
                  style={{
                    marginTop: 16,
                  }}>
                  <WsText
                    color={$color.primary}
                    size={14}
                    style={{
                      marginRight: 8
                    }}>
                    {isCollapsed ? t('展開') : t('收起')}
                  </WsText>
                  <WsIcon
                    size={20}
                    name={isCollapsed ? 'md-chevron-down' : 'md-chevron-up'}
                  />
                </WsFlex>
              </TouchableOpacity>
            )}
        </>
      )}
    </>
  )
}

export default WsPassageCollapse
