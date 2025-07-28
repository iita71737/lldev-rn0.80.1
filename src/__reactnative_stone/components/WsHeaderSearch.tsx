import React from 'react'
import { View, Platform } from 'react-native'
import { WsFlex, WsText, WsIconBtn, WsState } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'

interface WsHeaderSearchProps {
  height?: number;
  title: string;
  iconRight?: string;
  iconLeft?: string;
  showRightBtn: boolean;
  rightOnPress?: () => void;
  showLeftBtn?: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  borderRadius?: number;
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
    showLeftBtn = false,
    searchValue,
    setSearchValue,
    borderRadius = 20,
    backgroundColor = $color.primary,
    iconLeftColor = $color.white
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
          height: height,
          padding: 16,
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
                  setIsSearch(true)
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
                  setIsSearch(false)
                  setSearchValue('')
                }}
              />
            )}
          </View>
          <View
            style={{
              flex: 1
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
                />
              </WsFlex>
            )}
          </View>
          <View
            style={{
              width: 24
            }}>
            {showRightBtn && (
              <WsIconBtn
                name={iconRight}
                color={$color.white}
                size={24}
                onPress={rightOnPress}
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
