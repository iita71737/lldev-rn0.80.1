import React from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
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
    disabled
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
            paddingHorizontal: 20,
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
          }}>
          {isPercent && (
            <WsIconCircle
              style={[
                {
                  marginRight: 16
                }
              ]}
              color={isAlert ? alertIconColor : undefined}
              progressTintColor={isAlert ? alertIconColor : undefined}
              backgroundColor={isAlert ? alertBackgroundColor : undefined}
              name={icon}
              size={20}
              hasProgress={true}
              count={count}
            />
          )}
          {!isPercent && (
            <WsIconCircle
              padding={12}
              iconSize={28}
              style={[
                {
                  marginRight: 16
                }
              ]}
              name={icon}
              size={24}
            />
          )}
          {count != undefined ? (
            <WsText
              style={[
                isAlert
                  ? {
                    color: alertTextColor
                  }
                  : null
              ]}
              size="24"
              fontWeight="bold">
              {count}
            </WsText>
          ) : (
            <WsLoading></WsLoading>
          )}
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
