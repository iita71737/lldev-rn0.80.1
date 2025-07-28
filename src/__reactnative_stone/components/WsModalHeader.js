import React from 'react'
import {
  WsText,
  WsIcon,
  WsFlex,
  WsIconBtn,
  WsBtn,
  WsSwipeGestures
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsModalHeader = props => {
  // Props
  const {
    leftOnPress,
    iconLeftName = 'ws-outline-close',
    iconLeftColor = $color[$theme].WsModalHeader.iconLeftColor,
    iconLeftSize = 24,
    RightOnPress,
    RightOnPressIsDisabled,
    colorDisabled,
    iconRightName,
    iconRightColor = $color[$theme].WsModalHeader.iconLeftColor,
    title,
    titleColor,
    style,
    hasReduce = true,
    height = 56,
    headerRightText,
    onSwipeDown
  } = props

  // Render
  return (
    <WsSwipeGestures onSwipeDown={onSwipeDown}>
      <WsFlex
        style={[
          {
            height: height,
            borderBottomWidth: 0.5,
            borderBottomColor: $color.gray2l,
          },
          style
        ]}>
        <WsFlex
          justifyContent="center"
          style={{
            width: 56,
            marginLeft: 4,
          }}>
          <WsIconBtn
            testID={'WsModalClose'}
            onPress={leftOnPress}
            underlayColorPressIn={$color.white2d}
            name={iconLeftName}
            size={iconLeftSize}
            color={iconLeftColor}
          />
        </WsFlex>
        <WsFlex
          flexDirection="column"
          style={{
            flex: 1,
          }}>
          {hasReduce && (
            <WsIcon
              name="ws-outline-reduce"
              size={48}
              color={$color.gray2l}
              style={{
                marginTop: -35,
                marginLeft: -2,
                marginBottom: -10
              }}
            />
          )}
          <WsText
            testID={'標題'}
            color={titleColor}
            numberOfLines={2}
            ellipsizeMode={'tail'}
          >{title}
          </WsText>
        </WsFlex>
        <WsFlex
          justifyContent="center"
          style={{
            width: 56,
          }}>
          {headerRightText && (
            <WsBtn
              testID={headerRightText}
              color="#FFF"
              textColor={$color.primary}
              onPress={RightOnPress}
              isDisabled={RightOnPressIsDisabled}
              colorDisabled={colorDisabled}
              style={{
                width: 100
              }}>
              {headerRightText}
            </WsBtn>
          )}
          {headerRightText == undefined && (
            <WsIconBtn
              testID={iconRightName}
              name={iconRightName}
              onPress={RightOnPress}
              size={24}
              color={iconRightColor}
              style={{
              }}
            />
          )}
        </WsFlex>
      </WsFlex>
    </WsSwipeGestures>
  )
}
export default WsModalHeader
