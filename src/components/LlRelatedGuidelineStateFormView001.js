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

const LlRelatedGuidelineStateFormView001 = props => {
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
    actionType,
    remind1,
    remind2,
    setStep2ModalVisible,
    setGuidelineModalVisible,
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

              {remind1 && (
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
                      {remind1}
                    </WsText>
                  </WsFlex>
                </TouchableOpacity>
              )}

              {remind2 && (
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
            justifyContent={'space-between'}
            style={{
              padding: 16,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: $color.white,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                minWidth: 100,
                alignItems: 'center'
              }}
              onPress={() => {
                setStep2ModalVisible(false)
                setGuidelineModalVisible(true)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('上一步')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              disabled={!isSubmittable}
              style={{
                minWidth: 100,
              }}
              onPress={() => {
                onChange(fieldsValue)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </>
      )}
    </>
  )
}

export default React.memo(LlRelatedGuidelineStateFormView001)
