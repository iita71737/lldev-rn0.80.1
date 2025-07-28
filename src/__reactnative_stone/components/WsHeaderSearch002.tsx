import React from 'react'
import { View, Platform, Dimensions } from 'react-native'
import { WsFlex, WsText, WsIconBtn, WsState } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next';

interface WsHeaderSearchProps {
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
  const { width, height } = Dimensions.get('window')
  const { t } = useTranslation();

  // Props
  const {
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
    iconLeftColor = $color.white,
    searchLabel = t('搜尋')
  } = props

  // State
  const [isSearch, setIsSearch] = React.useState(true)

  // Render
  return (
    <>
      {searchLabel && (
        <WsText
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            color: $color.primary
          }}
        >
          {searchLabel}
        </WsText>
      )}
      <View
        style={{
          backgroundColor: backgroundColor,
          width: width,
          height: 56,
          padding: 16,
        }}>
        <WsFlex
          justifyContent="center"
          style={{
          }}
        >
          <View
            style={{
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
                  height: 40,
                }}>
                <WsText color={$color.white} size={18}>
                  {title}
                </WsText>
              </WsFlex>
            )}
            {isSearch && (
              <WsFlex
                style={{
                  height: 40,
                }}>
                <WsState
                  testID={'search'}
                  type="search"
                  stateStyle={{
                    width: width * 0.9225,
                    height: Platform.OS == 'ios' ? 40 : 40,
                    borderRadius: borderRadius,
                    backgroundColor: $color.white,
                  }}
                  placeholder={t('搜尋')}
                  value={searchValue}
                  onChange={setSearchValue}
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
