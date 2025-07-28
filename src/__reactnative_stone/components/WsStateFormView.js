import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Alert
} from 'react-native'
import { WsIconBtn, WsStateForm, WsBtn, WsPageScrollView, WsFlex } from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_Validator from '@/__reactnative_stone/services/validator'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useRoute } from '@react-navigation/native';

const WsStateFormView = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const route = useRoute();

  // Props
  const {
    onSubmit,
    onSubmitDraft,
    backgroundColor = $theme == 'light' ? $color.white : $color.black1l,
    fields,
    initValue,
    onChange,
    headerRightShown = true,
    headerRightBtnText = t('送出'),
    headerRightBtnText002,
    headerLeftBtn = 'md-arrow-back',
    leftBtnOnPress,
    isNavigationOption = true,
    paddingBottom,
  } = props

  // Ref
  const scrollViewRef = useRef(null);

  // States
  const [fieldsValue, setFieldsValue] = useState({})
  const [errorMessages, setErrorMessages] = useState({})
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmitable, setIsSubmitable] = useState(false)

  // Function
  const $_onChange = $event => {
    if (onChange) {
      onChange($event)
    }
    setFieldsValue($event)
  }

  const $_onSubmit = () => {
    const _rules = S_Validator.getRulesObjectFromFields(fields, fieldsValue)
    const { errors, isValid } = S_Validator.validate(_rules, fieldsValue)
    if (!isValid) {
      Alert.alert('有必填欄位尚未填寫')
      setErrorMessages(errors)
    } else {
      setErrorMessages({})
      onSubmit(fieldsValue)
      setIsSubmitable(false)
    }
  }

  const $_onSubmitDraft = () => {
    const _rules = S_Validator.getRulesObjectFromFields(fields, fieldsValue)
    delete _rules.sub_tasks;
    const { errors, isValid } = S_Validator.validate(_rules, fieldsValue)
    console.log(errors,'errors--');
    console.log(isValid,'isValid--');
    if (!isValid) {
      console.log('$_onSubmitDraft');
      Alert.alert('有必填欄位尚未填寫')
      setErrorMessages(errors)
    } else {
      console.log('2222');
      setErrorMessages({})
      // console.log(fieldsValue, 'fieldsValue--');
      onSubmitDraft(fieldsValue)
    }
  }

  const $_valueInit = () => {
    let _fieldsValue = {
      ...fieldsValue
    }
    for (let fieldKey in fields) {
      const _field = fields[fieldKey]

      if (_field.defaultValue != undefined) {
        _fieldsValue = {
          ..._fieldsValue,
          [fieldKey]: _field.defaultValue
        }
      } else if (_field.type == 'picker') {
        _fieldsValue = {
          ..._fieldsValue,
          [fieldKey]: _field.items[0] && _field.items[0].value ? _field.items[0].value : null
        }
      } else if (_field.type == 'radio') {
        _fieldsValue = {
          ..._fieldsValue,
          [fieldKey]: _field.items[0] && _field.items[0].value ? _field.items[0].value : null
        }
      }
    }
    setFieldsValue(_fieldsValue)
    setIsMounted(true)
  }

  const $_submitableCheck = () => {
    const _rules = S_Validator.getRulesObjectFromFields(fields, fieldsValue)
    const { errors, isValid } = S_Validator.validate(_rules, fieldsValue)
    if (!isValid) {
      setErrorMessages(errors)
      setIsSubmitable(false)
    } else if (isValid == 'Alert') {
      setErrorMessages(errors)
      setIsSubmitable(true)
    } else {
      setErrorMessages({})
      setIsSubmitable(true)
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: headerRightShown
        ? () => {
          return (
            <>
              <WsFlex>
                {headerRightBtnText002 && (
                  <WsBtn
                    style={{
                    }}
                    isFullWidth={false}
                    minHeight={40}
                    onPress={() => {
                      $_onSubmitDraft()
                    }}>
                    {headerRightBtnText002}
                  </WsBtn>
                )}
                <WsBtn
                  testID={headerRightBtnText}
                  style={{
                    marginRight: 16
                  }}
                  isFullWidth={false}
                  isDisabled={!isSubmitable}
                  minHeight={40}
                  onPress={() => {
                    $_onSubmit()
                  }}>
                  {headerRightBtnText}
                </WsBtn>
              </WsFlex>
            </>
          )
        }
        : undefined,
      headerLeft: leftBtnOnPress
        ? () => (
          <>
            <WsIconBtn
              name={headerLeftBtn}
              onPress={leftBtnOnPress}
              size={22}
              color={$color.white}
            />
          </>
        )
        : undefined
    })
  }

  // Effect
  React.useEffect(() => {
    $_valueInit()
    // $_setNavigationOption() // 2240603_CHANGE_PWD cfc TASK EDIT, DO NOT USE
  }, [])

  React.useEffect(() => {
    if (initValue) {
      setFieldsValue(initValue)
      $_setNavigationOption()
    }
  }, [initValue])

  React.useEffect(() => {
    $_submitableCheck()
    // $_setNavigationOption() // 240603_CHANGE_PWD cfc TASK EDIT, DO NOT USE
  }, [fieldsValue])

  React.useEffect(() => {
    if (isNavigationOption) {
      $_setNavigationOption()
    }
  }, [isSubmitable])

  // Render
  return (
    <>
      {isMounted && (
        <View
          style={{
            flex: 1, // DO NOT CLEAN
            backgroundColor: backgroundColor,
          }}>
          <KeyboardAwareScrollView
            testID="KeyboardAwareScrollView"
            style={{
              flex: 1, // DO NOT CLEAN
            }}
            contentContainerStyle={[
              {
                margin: 16,
                paddingBottom: paddingBottom != undefined ? paddingBottom : 48 // WIRED
              }
            ]}>
            <WsStateForm
              onChange={$_onChange}
              value={fieldsValue}
              errorMessages={errorMessages}
              fields={fields}
            />
          </KeyboardAwareScrollView>
        </View>
      )}
    </>
  )
}

export default React.memo(WsStateFormView)
