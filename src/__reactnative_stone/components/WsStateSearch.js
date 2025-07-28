import React, { useState, useCallback } from 'react'
import { View, TextInput, Dimensions, Platform } from 'react-native'
import { WsIconBtn, WsIcon } from '@/components'
import $config from '@/__config'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import debounce from 'lodash/debounce';

const windowWidth = Dimensions.get('window').width
const WsStateSearch = React.forwardRef(
  (
    {
      // Props
      autoFocus = false,
      maxLength,
      multiline,
      keyboardType = 'default',
      placeholder = '搜尋',
      minHeight = $config.component.WsStateInput &&
        $config.component.WsStateInput.minHeight
        ? $config.component.WsStateInput.minHeight
        : 48,
      height = 30,
      borderWidth = $config.component.WsStateInput &&
        $config.component.WsStateInput.borderWidth
        ? $config.component.WsStateInput.borderWidth
        : 0,
      placeholderTextColor = $color.gray,
      selectionColor = $color.primary,
      onChange,
      borderRadius = $config.component.WsStateInput &&
        $config.component.WsStateInput.borderRadius
        ? $config.component.WsStateInput.borderRadius
        : 30,
      onFocus,
      onBlur,
      isError,
      inputColor = $theme == 'light' ? $color.black2l : $color.white2d,
      backgroundColor = $color.white,
      clearIconColor = $color.primary,
      leftIcon = 'ws-outline-search',
      iconColor,
      borderColor = $theme == 'light' ? $color.white3d : $color.black3l,
      borderColorFocus = $theme == 'light'
        ? $color.primary1l
        : $color.primary1d,
      borderColorError = $color.danger,
      autoCompleteType,
      textContentType,
      editable,
      secureTextEntry = false,
      returnKeyType = 'search',
      defaultValue,
      style,
      value = '',
      testID
    },
    ref
  ) => {
    // i18n
    const { t, i18n } = useTranslation()

    let _ref = ref
    if (!_ref) {
      _ref = React.useRef()
    }

    // State
    const [focus, setFocus] = useState(false)
    const [_value, setValue] = useState(value)

    const handleInputChange = (text) => {
      if (Platform.OS === 'android') {
        onChange(text);
      }
      setValue(text)
    }

    const handleSubmitEditing = (e) => {
      const text = e.nativeEvent.text.trim();
      onChange(text);
      setValue(text)
    };

    React.useEffect(() => {
      if (autoFocus) {
        setTimeout(() => {
          _ref.current.focus()
        }, 100)
      }
    }, [])

    React.useEffect(() => {
      if (value === '') {
        setValue(null)
      }
    }, [value])

    // Render
    return (
      <>
        <View
          style={[
            {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 10,
              borderStyle: 'solid',
              borderWidth: borderWidth,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              borderRadius: borderRadius
            },
            focus
              ? {
                borderColor: borderColorFocus
              }
              : null,
            isError
              ? {
                borderColor: borderColorError
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
          <TextInput
            testID={testID}
            ref={_ref}
            leftIcon={<WsIcon name="fa-clock" />}
            value={_value}
            style={[
              {
                flex: 1,
                fontSize: 14,
                letterSpacing: 1,
                color: inputColor,
                minHeight: minHeight,
                height: height
              }
            ]}
            editable={editable}
            defaultValue={defaultValue}
            autoCompleteType={autoCompleteType}
            textContentType={textContentType}
            secureTextEntry={secureTextEntry}
            onSubmitEditing={handleSubmitEditing}
            multiline={multiline}
            keyboardType={keyboardType}
            maxLength={maxLength}
            placeholder={t(placeholder)}
            placeholderTextColor={placeholderTextColor}
            selectionColor={selectionColor}
            onChangeText={handleInputChange}
            returnKeyType={returnKeyType}
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
              if (_value) {
                onChange(_value)
              }
            }}
          />
          {_value != '' && _value != null && _value.length > 0 && (
            <WsIconBtn
              testID={'md-close'}
              style={{
              }}
              name="md-close"
              color={clearIconColor}
              onPress={() => {
                onChange(undefined)
                setValue('')
              }}
            />
          )}
        </View>
      </>
    )
  }
)

export default WsStateSearch
