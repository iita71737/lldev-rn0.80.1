import React from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIconCircle,
  WsIconBtn,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsAnalyzeCard = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    icon,
    title,
    count,
    isAlert,
    isPercent,
    padding = 12,
    alertTextColor = $color.danger1l,
    alertIconColor = $color.danger,
    alertBackgroundColor = $color.danger11l,
    onPress,
    upperRightOnPress,
    style,
    disabled,
    iconSize = 48
  } = props

  // Render
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            flexGrow: 1,
          },
          style
        ]}
        padding={padding}>
        <WsIconBtn
          testID={title}
          underlayColor={$color.primary}
          color={$color.white}
          isRound={false}
          padding={4}
          size={24}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 10,
          }}
          iconRotate={'-45deg'}
          name="bih-arrow-go"
          onPress={upperRightOnPress}
        ></WsIconBtn>

        <WsFlex
          style={{
            height: 50,
            alignItems: 'center',
          }}
        >
          {/* 左欄：icon 固定寬 */}
          <View style={{ alignItems: 'center' }}>
            {isPercent ? (
              <WsIconCircle
                style={{
                  position: 'absolute',
                  left: 0
                }}
                color={isAlert ? alertIconColor : undefined}
                progressTintColor={isAlert ? alertIconColor : undefined}
                backgroundColor={isAlert ? alertBackgroundColor : undefined}
                name={icon}
                size={20}
                hasProgress={true}
                count={count}
              />
            ) : (
              <WsIconCircle
                padding={10}
                iconSize={28}
                style={{
                  position: 'absolute',
                  left: 0
                }}
                name={icon}
                size={28}
              />
            )}
          </View>

          {/* 中欄：count 置中 */}
          <View style={{
            flex: 1,
            alignItems: 'center',
          }}>
            {count != undefined ? (
              <WsText
                style={[
                  isAlert ? { color: alertTextColor } : null,
                  { textAlign: 'center', marginLeft: 8 }
                ]}
                size="24"
                fontWeight="bold"
              >
                {count}
              </WsText>
            ) : (
              <WsLoading />
            )}
          </View>

          {/* 右欄：與左欄等寬的空白占位，確保真正水平置中 */}
          <View style={{}} />
        </WsFlex>

        <WsText
          style={[
            {
              alignSelf: 'center',
              marginTop: 6
            }
          ]}>
          {t(title)}
        </WsText>
      </WsCard>
    </TouchableOpacity >
  )
}

export default WsAnalyzeCard
