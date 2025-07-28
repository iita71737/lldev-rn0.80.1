import React, { useState } from 'react'
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native'
import {
  WsIconBtn,
  WsStateForm,
  WsBtn,
  WsPageScrollView,
  WsFlex,
  LlPopupAlert,
  WsGradientButton,
  WsText,
  WsIcon
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_Validator from '@/__reactnative_stone/services/validator'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const LlFileStoreStateFormView = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    onSubmit,
    backgroundColor,
    fields,
    initValue,
    onChange,
    headerRightShown = true,
    headerRightBtnText = t('送出'),
    headerLeftBtn = 'md-arrow-back',
    leftBtnOnPress,
    isNavigationOption = true,
    paddingBottom,
    onClose,
    actionType,
    remind,
    remindColor = $color.gray,
    remind1,
    remind1Color = $color.gray,
    remind2,
  } = props

  // States
  const [fieldsValue, setFieldsValue] = useState({})
  const [errorMessages, setErrorMessages] = useState({})
  const [isMounted, setIsMounted] = useState(false)
  const [isSubmittable, setIsSubmittable] = useState(false)
  const [popupAlertVisible, setPopupAlertVisible] = useState(false)

  // Function
  const $_onChange = $event => {
    setFieldsValue($event)
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
    const _rules = S_Validator.getRulesObjectFromFields(fields)
    const { errors, isValid } = S_Validator.validate(_rules, fieldsValue)
    if (!isValid) {
      setErrorMessages(errors)
      setIsSubmittable(false)
    } else if (isValid == 'Alert') {
      setErrorMessages(errors)
      setIsSubmittable(true)
    } else {
      setErrorMessages({})
      setIsSubmittable(true)
    }
  }

  // Effect
  React.useEffect(() => {
    $_valueInit()
  }, [])

  React.useEffect(() => {
    if (initValue) {
      setFieldsValue(initValue)
    }
  }, [initValue])

  React.useEffect(() => {
    $_submitableCheck()
  }, [fieldsValue])

  // Render
  return (
    <>
      {isMounted && (
        <>
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

              {remind &&
                fieldsValue.is_secret === 1 && (
                  <TouchableOpacity
                    style={{
                      marginTop: 8
                    }}
                    onPress={() => { }}
                  >
                    <WsFlex style={{}}>
                      <WsIcon
                        name="md-info-outline"
                        color={remindColor}
                        style={{
                          marginRight: 6
                        }}
                        size={16}
                      />
                      <WsText
                        style={{
                          paddingRight: 16
                        }}
                        size={12}
                        color={remind1Color}>
                        {remind}
                      </WsText>
                    </WsFlex>
                  </TouchableOpacity>
                )}

              {remind1 &&
                fieldsValue?.share_factories?.length > 0 && (
                  <TouchableOpacity
                    style={{
                      marginTop: 8
                    }}
                    onPress={() => { }}
                  >
                    <WsFlex style={{}}>
                      <WsIcon
                        name="md-info-outline"
                        color={remind1Color}
                        style={{
                          marginRight: 6
                        }}
                        size={16}
                      />
                      <WsText
                        style={{
                          paddingRight: 16
                        }}
                        size={12}
                        color={remind1Color}>
                        {remind1}
                      </WsText>
                    </WsFlex>
                  </TouchableOpacity>
                )}

              {remind2 &&
                fieldsValue?.share_factories?.length > 0 && (
                  <TouchableOpacity
                    style={{
                      marginTop: 16
                    }}
                    onPress={() => { }}
                  >
                    <WsFlex style={{}}>
                      <WsIcon
                        name="md-info-outline"
                        color={$color.gray}
                        style={{
                          marginRight: 6
                        }}
                        size={16}
                      />
                      <WsText
                        style={{
                          paddingRight: 16
                        }}
                        size={12}
                        color={$color.gray}>
                        {remind2}
                      </WsText>
                    </WsFlex>
                  </TouchableOpacity>
                )}
            </KeyboardAwareScrollView>
          </View>

          <WsFlex
            style={{
              marginRight: 8,
              alignSelf: 'flex-end',
              margin:16,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: $color.white,
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                height: 48,
                justifyContent: 'center', // 垂直置中
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupAlertVisible(true)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              disabled={!isSubmittable}
              style={{
                width: 110,
              }}
              onPress={() => {
                onChange(fieldsValue)
              }}>
              {actionType === 'create' ? t('儲存') : actionType === 'edit' ? t('儲存') : actionType === 'createFile' ? t('儲存') : t('儲存')}
            </WsGradientButton>
          </WsFlex>

          <LlPopupAlert
            text={t('確定捨棄嗎？')}
            leftBtnText={t('取消')}
            rightBtnText={t('確定')}
            visible={popupAlertVisible}
            onClose={() => {
              setPopupAlertVisible(false)
            }}
            onPressEnter={() => {
              onClose()
            }}
          >
          </LlPopupAlert>
        </>
      )}
    </>
  )
}

export default React.memo(LlFileStoreStateFormView)
