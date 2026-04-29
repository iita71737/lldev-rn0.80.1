import React from 'react'
import { View, Platform, TouchableOpacity } from 'react-native'
import { WsFlex, WsText, WsIconBtn, WsState } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'

interface SearchSuggestionItem {
  id?: string | number;
  label?: string;
  title?: string;
  subtitle?: string;
}

interface WsHeaderSearchProps {
  height?: number;
  title: string;
  iconRight?: string;
  iconLeft?: string;
  showRightBtn: boolean;
  rightOnPress?: () => void;
  leftOnPress?: () => void;
  showLeftBtn?: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  borderRadius?: number;
  backgroundColor?: string;
  iconLeftColor?: string;
  onSearchFocus?: () => void;
  onSearchBlur?: () => void;
  showSearchSuggestions?: boolean;
  searchSuggestions?: SearchSuggestionItem[];
  searchSuggestionLoading?: boolean;
  onPressSearchSuggestion?: (item: SearchSuggestionItem) => void;
  searchTriggerOnRight?: boolean;
}

const WsHeaderSearch: React.FC<WsHeaderSearchProps> = props => {
  const { windowWidth } = layouts

  // Props
  const {
    height = Platform.OS == 'ios' ? 56 : 56,
    title,
    iconRight,
    showRightBtn,
    rightOnPress,

    iconLeft,
    leftOnPress,
    showLeftBtn = false,
    searchValue,
    setSearchValue,
    borderRadius = 20,
    backgroundColor = $color.primary,
    iconLeftColor = $color.white,
    onSearchFocus,
    onSearchBlur,
    showSearchSuggestions = false,
    searchSuggestions = [],
    searchSuggestionLoading = false,
    onPressSearchSuggestion,
    searchTriggerOnRight = false
  } = props

  // State
  const [isSearch, setIsSearch] = React.useState(false)

  // Render
  return (
    <>
      <View
        style={{
          backgroundColor: backgroundColor,
          width: windowWidth,
          paddingHorizontal: 16,
        }}>
        <WsFlex
          justifyContent="center"
          style={{
          }}
        >
          <View
            style={{
              width: 28,
            }}>
            {showLeftBtn && !isSearch && (
              <WsIconBtn
                name={iconLeft ? iconLeft : 'ws-outline-search'}
                color={iconLeftColor}
                size={24}
                padding={0}
                onPress={() => {
                  if (leftOnPress) {
                    leftOnPress()
                    return
                  }
                  if (!searchTriggerOnRight) {
                    setIsSearch(true)
                  }
                }}
              />
            )}
            {showLeftBtn && isSearch && (
              <WsIconBtn
                name={iconLeft ? iconLeft : 'ws-outline-arrow-left'}
                color={iconLeftColor}
                padding={0}
                size={24}
                onPress={() => {
                  if (leftOnPress) {
                    leftOnPress()
                    return
                  }
                  setIsSearch(false)
                  setSearchValue('')
                }}
              />
            )}
          </View>
          <View
            style={{
              flex: 1,
              position: 'relative'
            }}>
            {!isSearch && (
              <WsFlex
                justifyContent="center"
                style={{
                  height: 40
                }}>
                <WsText color={$color.white} size={18}>
                  {title}
                </WsText>
              </WsFlex>
            )}
            {isSearch && (
              <WsFlex
                justifyContent="center"
                style={{
                  height: 40
                }}>
                <WsState
                  type="search"
                  stateStyle={{
                    width: windowWidth * 0.6,
                    height: Platform.OS == 'ios' ? 35 : 40,
                    borderRadius: borderRadius
                  }}
                  value={searchValue}
                  onChange={(e: any) => {
                    setSearchValue(e)
                  }}
                  onFocus={() => {
                    onSearchFocus?.()
                  }}
                  onBlur={() => {
                    onSearchBlur?.()
                  }}
                />
              </WsFlex>
            )}
            {isSearch && showSearchSuggestions && (searchSuggestionLoading || searchSuggestions.length > 0) && (
              <View
                style={{
                  position: 'absolute',
                  top: 44,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  backgroundColor: $color.white,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: $color.gray4l,
                  overflow: 'hidden',
                }}
              >
                {searchSuggestionLoading && (
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <WsText color={$color.gray}>{'Loading...'}</WsText>
                  </View>
                )}
                {!searchSuggestionLoading && searchSuggestions.map((item, idx) => {
                  const _label = item?.label || item?.title || ''
                  const _subtitle = item?.subtitle
                  return (
                    <TouchableOpacity
                      key={`${item?.id || _label}-${idx}`}
                      onPress={() => {
                        onPressSearchSuggestion?.(item)
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          borderBottomWidth: idx === searchSuggestions.length - 1 ? 0 : 1,
                          borderBottomColor: $color.gray5l,
                        }}
                      >
                        <WsText numberOfLines={1}>{_label}</WsText>
                        {!!_subtitle && (
                          <WsText size={12} color={$color.gray} numberOfLines={1}>
                            {_subtitle}
                          </WsText>
                        )}
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
          <View
            style={{
              width: 24
            }}>
            {showRightBtn && (
              <WsIconBtn
                name={isSearch ? 'md-cancel' : iconRight}
                color={$color.white}
                size={24}
                onPress={() => {
                  if (searchTriggerOnRight) {
                    if (isSearch) {
                      setIsSearch(false)
                      setSearchValue('')
                    } else {
                      setIsSearch(true)
                    }
                    rightOnPress?.()
                    return
                  }
                  rightOnPress?.()
                }}
                padding={0}
              />
            )}
          </View>
        </WsFlex>
      </View>
    </>
  )
}

export default WsHeaderSearch
