import React, { useState } from 'react'
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform
} from 'react-native'
import { WsIconBtn, WsIcon } from '@/components'
import $config from '@/__config'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'

const WsStateInput = React.forwardRef(
  (
    {
      // Prop
      value = '',
      autoFocus = false,
      maxLength,
      multiline,
      keyboardType = 'default',
      placeholder = '',
      minHeight = $config.component.WsStateInput &&
        $config.component.WsStateInput.minHeight
        ? $config.component.WsStateInput.minHeight
        : 48,
      height = 50,
      borderWidth = $config.component.WsStateInput &&
        $config.component.WsStateInput.borderWidth
        ? $config.component.WsStateInput.borderWidth
        : 1,
      placeholderTextColor = $color.gray,
      selectionColor = $color.primary,
      onChange,
      borderRadius = $config.component.WsStateInput &&
        $config.component.WsStateInput.borderRadius
        ? $config.component.WsStateInput.borderRadius
        : 5,
      onFocus,
      onBlur,
      isError,
      inputColor = $theme == 'light' ? $color.black2l : $color.white2d,
      backgroundColor = $config.component.WsStateInput &&
        $config.component.WsStateInput.borderRadius
        ? $config.component.WsStateInput.backgroundColor
        : $color.white,
      clearIconColor = $color.primary,
      leftIcon,
      iconColor,
      borderColor = $theme == 'light' ? $color.gray3l : $color.black3l,
      borderColorFocus = $theme == 'light'
        ? $color.primary1l
        : $color.primary1d,
      borderColorError = $color.danger,
      backgroundColorError = $color.danger11l,
      autoCompleteType,
      textContentType,
      editable = true,
      secureTextEntry = false,
      setSecureTextEntry,
      returnKeyType = $config.component.WsStateInput &&
        $config.component.WsStateInput.returnKeyType
        ? $config.component.WsStateInput.returnKeyType
        : null,
      onSubmitEditing,
      defaultValue,
      style,
      rightIcon,
      testID
    },
    ref
  ) => {
    const { t, i18n } = useTranslation()

    // State
    const [focus, setFocus] = useState(false)
    const [contentSize, setContentSize] = useState(0)

    let _ref = ref
    if (!_ref) {
      _ref = React.useRef()
    }

    React.useEffect(() => {
      if (autoFocus && _ref) {
        setTimeout(() => {
          _ref?.current?.focus()
        }, 100)
      }
    }, [])

    // Render
    return (
      <>
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
              borderStyle: 'solid',
              borderWidth: borderWidth,
              borderColor: borderColor,
              backgroundColor:
                editable === false ? $color.white2d : backgroundColor,
              borderRadius: borderRadius,
            },
            focus
              ? {
                borderColor: borderColorFocus
              }
              : null,
            isError
              ? {
                borderColor: borderColorError,
                backgroundColor: backgroundColorError
              }
              : null,
            style
          ]}>
          {leftIcon && (
            <WsIcon
              size={24}
              name={leftIcon}
              style={{
                marginRight: 8
              }}
              color={iconColor}
            />
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <TextInput
                ref={_ref}
                leftIcon={<WsIcon name="fa-clock" />}
                value={value} // 250429-issue-不能i18n-會影響文案翻譯流程
                style={[
                  {
                    fontSize: multiline ? 14 : 14,
                    letterSpacing: 1,
                    color: editable === false ? $color.gray : inputColor,
                    minHeight: minHeight,
                    paddingTop: multiline ? 8 : Platform.OS === 'android' ? 8 : 0,
                    paddingLeft: multiline ? 0 : 0,
                    height: multiline ? 140 : Math.max(height, contentSize),
                    textAlignVertical: multiline ? 'top' : "center", // Android issue
                    // borderWidth:1,
                  }
                ]}
                editable={editable}
                defaultValue={defaultValue}
                autoCompleteType={autoCompleteType}
                textContentType={textContentType}
                secureTextEntry={secureTextEntry}
                onSubmitEditing={onSubmitEditing}
                multiline={multiline}
                keyboardType={keyboardType}
                maxLength={maxLength}
                numberOfLines={3}
                placeholder={placeholder}
                placeholderTextColor={placeholderTextColor}
                selectionColor={selectionColor}
                onChangeText={onChange}
                onContentSizeChange={$event => {
                  setContentSize($event.nativeEvent.contentSize.height)
                }}
                returnKeyType={returnKeyType}
                testID={testID}
                onFocus={() => {
                  setFocus(true)
                  if (onFocus) {
                    onFocus()
                  }
                }}
                onBlur={() => {
                  setFocus(false)
                  if (onBlur) {
                    onBlur()
                  }
                }}
              />
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
          {rightIcon && value.length > 0 && (
            <WsIconBtn
              name={rightIcon}
              color={clearIconColor}
              onPress={() => {
                setSecureTextEntry(!secureTextEntry)
              }}
              style={{
                marginTop: minHeight / 2 - 17
              }}
            />
          )}
          {value != '' && value != null && value.length > 0 && editable && (
            <WsIconBtn
              testID={'md-close'}
              name="md-close"
              color={clearIconColor}
              onPress={() => {
                onChange('')
              }}
              style={{
                marginTop: minHeight / 2 - 17
              }}
            />
          )}
        </View>
      </>
    )
  }
)

export default WsStateInput
