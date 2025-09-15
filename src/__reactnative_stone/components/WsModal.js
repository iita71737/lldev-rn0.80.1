import React from 'react'
import {
  // Modal,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text
} from 'react-native'
import layouts from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { WsModalHeader, WsModalFooter } from '@/components'
import Modal from 'react-native-modal'

const WsModal = props => {
  const { windowWidth, windowHeight } = layouts

  // Props
  const {
    visible = false,
    children,
    onBackButtonPress,
    hasReduce,
    iconLeftColor = $color[$theme].WsModalHeader.iconLeftColor,
    iconRightColor = $color[$theme].WsModalHeader.iconLeftColor,
    iconRightName,
    iconLeftName = 'md-close',
    iconLeftSize,
    headerLeftOnPress,
    headerRightOnPress,
    RightOnPressIsDisabled,
    colorDisabled,
    footerBtnLeftText,
    footerBtnLeftOnPress,
    footerBtnRightText,
    footerBtnRightOnPress,
    animationType = "slide",
    title,
    headerRightText,
    style,
    contentStyle,
    onSwipeDown,
    childrenScroll = false,
    footerBtnRightIcon,
    footerBtnLeftIcon,
    footerDisable,
    btnLeftHidden,
    btnRightDisable,
    remind
  } = props

  if (!visible) return null

  // Render
  return (
    <Modal
      isVisible={visible} // ✅ 注意：prop 是 isVisible，不是 visible
      onBackdropPress={() => onBackButtonPress()} // 點背景關閉
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      style={{
        margin: 0,
        backgroundColor: 'white'
      }} // ✅ 保持全螢幕
    >
      <SafeAreaView
        style={{
          // flex: 1, // DO NOT CLEAR
          flexGrow: 1,
        }}
      >
        <KeyboardAvoidingView
          style={{
            // flex: 1, // DO NOT CLEAR,
            flexGrow: 1,
            // borderWidth:1,
          }}
          enabled
          keyboardVerticalOffset={0}
          behavior={Platform.OS === 'ios' ? 'padding' : null}>
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
          >
            <View
              style={{
                flex: 1 // android-selector-issue
              }}
            >
              <WsModalHeader
                onSwipeDown={onSwipeDown}
                hasReduce={hasReduce}
                iconLeftSize={iconLeftSize}
                iconLeftColor={iconLeftColor}
                iconRightColor={iconRightColor}
                iconRightName={iconRightName}
                iconLeftName={iconLeftName}
                leftOnPress={headerLeftOnPress}
                RightOnPress={headerRightOnPress}
                RightOnPressIsDisabled={RightOnPressIsDisabled}
                colorDisabled={colorDisabled}
                headerRightText={headerRightText}
                title={title}
              />
              {!childrenScroll &&
                <>
                  {children}
                </>
              }
              {childrenScroll && (
                <>
                  <ScrollView
                    style={[
                      {
                        flex: 1, // 250329-限制檢閱權限-依角色-issue
                        paddingBottom: !footerDisable ? 108 : 0,
                        // borderWidth:1,
                      },
                      contentStyle
                    ]}>
                    {children}
                  </ScrollView>
                </>
              )}

              {(footerBtnLeftText || footerBtnRightText) &&
                !footerDisable && (
                  <>
                    <WsModalFooter
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: 'white', // 選擇人員會有底部透明度問題
                      }}
                      btnLeftHidden={btnLeftHidden}
                      btnLeftText={footerBtnLeftText}
                      btnLeftOnPress={footerBtnLeftOnPress}
                      btnLeftIcon={footerBtnLeftIcon}

                      btnRightText={footerBtnRightText}
                      btnRightOnPress={footerBtnRightOnPress}
                      btnRightIcon={footerBtnRightIcon}
                      btnRightDisable={btnRightDisable}
                      remind={remind}
                    />
                  </>
                )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  )
}

export default WsModal
