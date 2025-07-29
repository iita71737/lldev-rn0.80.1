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

  // States
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [shouldShowToggle, setShouldShowToggle] = React.useState(false)

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

      {type === 'array' && (() => {
        const childrenArray = React.Children.toArray(children)
        if (!childrenArray || childrenArray.length === 0) return null

        const hasExtra = childrenArray.length > 6
        const alwaysVisible = childrenArray.slice(0, 6)
        const collapsiblePart = childrenArray.slice(6)

        return (
          <>
            {/* 永遠顯示前 6 筆 */}
            {alwaysVisible}

            {/* 超過部分收合 */}
            {hasExtra && (
              <WsCollapsible isCollapsed={isCollapsed}>
                {collapsiblePart}
              </WsCollapsible>
            )}

            {/* 展開/收起按鈕 */}
            {hasExtra && (
              <TouchableOpacity onPress={toggleCollapse}>
                <WsFlex style={{ marginTop: 16 }}>
                  <WsText color={$color.primary} size={14} style={{ marginRight: 8 }}>
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
        )
      })()}


    </>
  )
}

export default WsPassageCollapse
