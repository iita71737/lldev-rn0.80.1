import React from 'react'
import {
  ScrollView,
  Pressable,
  View,
  Dimensions,
  Text,
  TouchableOpacity
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import { WsBtn, WsFlex, WsGradientButton, WsIcon, WsText } from '@/components'
import { useTranslation } from 'react-i18next'

const WsModalFooter = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width

  // Props
  const {
    btnLeftText,
    btnLeftDisable,
    btnLeftOnPress,
    btnLeftIcon,
    btnRightColors = [$color.primary5l, $color.primary],
    btnRightIcon,
    btnRightText,
    btnRightOnPress,
    btnRightDisable,
    btnLeftHidden = false,
    btnRightHidden = false,
    style,
    remind,
    remindColor = $color.danger,
    remindBtnDisabled = false,
    remindOnPress,
    autoFocus = false,
  } = props

  // Render
  return (
    <>
      {remind && (
        <>
          <TouchableOpacity
            onPress={() => {
              if (!remindBtnDisabled && typeof remindOnPress === 'function') {
                remindOnPress()
              }
            }}
            style={{
              width: '100%',
              paddingTop: 8,
              paddingHorizontal: 16,
              marginBottom: 8,
              zIndex: 999,
              borderTopWidth: 0.5,
              borderTopColor: $color.gray2l,
            }}
          >
            <WsFlex
              justifyContent="flex-end"
              style={{
                width: '100%',
                // flexWrap: 'wrap' //260420-checklist-record-issue
              }}
            >
              <WsIcon
                name="md-info-outline"
                color={remindColor}
                style={{
                  marginRight: 4
                }}
                size={20}
              />
              <WsText
                style={{
                  flexShrink: 1,
                  // textAlign: 'right' //260420-checklist-record-issue
                }}
                size={12}
                color={remindColor}>
                {remind}
              </WsText>
            </WsFlex>
          </TouchableOpacity>
        </>
      )}

      <WsFlex
        justifyContent="space-around"
        style={[
          {
            paddingVertical: 16,
            borderTopWidth: 0.5,
            borderTopColor: $color.gray2l,
            // borderWidth:2,
          },
          style
        ]}
      >

        {!btnLeftHidden ? (
          <WsBtn
            testID={btnLeftText}
            isDisabled={btnLeftDisable}
            color={$color.white}
            textColor={$color.primary}
            isFullWidth={false}
            borderRadius={28}
            textSize={14}
            style={{
              marginLeft: 8,
              borderWidth: 1,
              borderColor: $color.primary,
              width: '40%',
              height: 48,
            }}
            onPress={btnLeftOnPress}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              {btnLeftIcon && (
                <WsIcon
                  color={$color.primary}
                  name={btnLeftIcon}
                  size={24}
                  style={{
                    marginRight: 8
                  }}
                />
              )}
              <WsText
                color={$color.primary}
                size={14}
              >
                {btnLeftText}
              </WsText>
            </View>
          </WsBtn>
        ) : (
          <></>
        )}

        {!btnRightHidden ? (
          <WsGradientButton
            testID={btnRightText}
            btnColor={btnRightColors}
            disabled={btnRightDisable}
            isFullWidth={true}
            textSize={14}
            borderRadius={28}
            style={{
              width: '40%',
              // borderWidth:1,
            }}
            onPress={btnRightOnPress}
            renderLeadingIcon={() =>
              btnRightIcon ? (
                <WsIcon
                  color={$color.white}
                  name={btnRightIcon}
                  size={24}
                  style={{ marginRight: 8 }}
                />
              ) : null
            }
          >
            {btnRightText}
          </WsGradientButton>
        ) : (
          <></>
        )}
      </WsFlex>
    </>
  )
}

export default WsModalFooter
