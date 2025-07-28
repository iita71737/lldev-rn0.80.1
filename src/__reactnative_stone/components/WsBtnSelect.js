import React from 'react'
import { Pressable, View, TouchableOpacity, Dimensions } from 'react-native'
import { WsFlex, WsIcon, WsText, WsLoading } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsBtnSelect = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    disabled = false,
    style,
    icon,
    rightIcon = true,
    isError,
    text,
    placeholder = `${t('選擇')}`,
    onPress,
    borderWidth,
    borderColor,
    borderRadius = 5,
    badge,
    loading,
    mode,
    testID,
  } = props

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        disabled={disabled}
        onPress={onPress}
        style={[
          {
          },
          style
        ]
        }
      >
        <WsFlex
          flexWrap={'wrap'}
          justifyContent="space-between"
          style={[
            {
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderWidth: isError ? borderWidth : borderWidth, // 關聯法規
              borderColor: isError ? $color.danger : borderColor,
              backgroundColor: isError ? $color.danger11l : 'transparent', // 關聯法規
              borderRadius: borderRadius,
              width: '100%',
            },
            style
          ]}>
          <WsFlex
            justifyContent={'space-between'}
            style={[
              {
                // borderWidth: 2,
                marginRight: 24
              },
              text && badge ? {
                flex: 1,
              } : null
            ]
            }
          >
            <WsFlex>
              {icon && (
                <WsIcon
                  name={icon}
                  size={24}
                  style={{ marginRight: 8 }}
                  color={isError ? $color.danger : $color.gray}
                />
              )}
              {text ? (
                <WsText
                  numberOfLines={1}
                  color={text && disabled === false ? $color.black : $color.gray}
                  style={{
                    maxWidth: width * 0.65,
                    // borderWidth: 1,
                  }}>
                  {mode == 'time' ? text : t(text)}
                </WsText>
              ) : (
                <WsText
                  color={isError ? $color.danger : $color.gray}
                  style={{
                    marginRight: 8
                  }}>
                  {t(placeholder)}
                </WsText>
              )}
            </WsFlex>
            {badge && !loading && (
              <View
                style={{
                  backgroundColor: $color.primary10l,
                  borderRadius: 25,
                  width: 28,
                  height: 28,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <WsText
                  fontWeight={'600'}
                  size={12}
                  style={{
                    margin: 4
                  }}>
                  {badge}
                </WsText>
              </View>
            )}

            {loading && (
              <WsLoading></WsLoading>
            )}
          </WsFlex>
          {rightIcon && (
            <View
              style={{
                position: 'absolute',
                right: 16
              }}>
              <WsIcon
                name="ws-outline-chevron-down"
                size={24}
                color={$color.gray}
              />
            </View>
          )}
        </WsFlex>
      </TouchableOpacity>
    </>
  )
}

export default WsBtnSelect
