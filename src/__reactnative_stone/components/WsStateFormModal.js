import React from 'react'
import {
  Modal,
  View,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Alert
} from 'react-native'
import { WsModal, WsStateFormView } from '@/components'
import S_Validator from '@/__reactnative_stone/services/validator'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import gMessage from '@/__reactnative_stone/global/message'

const WsStateFormModal = (props) => {
  // i18n
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    modalBackgroundColor = $color.white,
    formViewBackgroundColor = $color.white,
    visible,
    animationType = 'slide',
    transparent = true,
    onClose,
    footerBtnLeftText = t('取消'),
    footerBtnRightText = t('送出'),
    footerDisable = false,
    title,
    fields,
    onSubmit,
    initValue,
    onChange,
    headerRightShown = false,
    isNavigationOption = false,
    remind
  } = props

  // States
  const [value, setValue] = React.useState()
  const [errorMessages, setErrorMessages] = React.useState({})
  const [btnRightDisable, setBtnRightDisable] = React.useState(true)

  // Function
  const $_onChange = $event => {
    const _value = {
      ...value,
      ...$event
    }
    setValue(_value)
  }

  const $_onSubmit = () => {
    if (value) {
      const _rules = S_Validator.getRulesObjectFromFields(fields)
      const { errors, isValid } = S_Validator.validate(_rules, value)
      if (!isValid) {
        Alert.alert('有必填欄位尚未填寫')
        setErrorMessages(errors)
      } else {
        onSubmit(value)
      }
    } else {
      onSubmit(initValue)
    }
  }

  React.useEffect(() => {
    if (value) {
      const _rules = S_Validator.getRulesObjectFromFields(fields);
      const { errors, isValid } = S_Validator.validate(_rules, value);
      const containsRequiredField = Object.values(errors).some(value =>
        value.includes("此項目為必填")
      );
      if (containsRequiredField) {
        setBtnRightDisable(true);
      } else {
        setBtnRightDisable(false);
      }
    }
  }, [value]);

  // Render
  return (
    <>
      <WsModal
        remind={remind}
        btnRightDisable={btnRightDisable}
        onBackButtonPress={onClose}
        headerLeftOnPress={onClose}
        animationType={animationType}
        transparent={transparent}
        visible={visible}
        footerBtnRightOnPress={$_onSubmit}
        footerBtnLeftText={footerBtnLeftText}
        footerBtnRightText={footerBtnRightText}
        footerBtnLeftOnPress={onClose}
        footerDisable={footerDisable}
        title={title}
        contentStyle={{
          padding: 16,
          // borderWidth:1,
          backgroundColor: modalBackgroundColor
        }}
        style={{
          backgroundColor: $color.white
        }}>
        <WsStateFormView
          backgroundColor={formViewBackgroundColor}
          _errorMessages={errorMessages}
          onChange={$_onChange}
          initValue={initValue}
          fields={fields}
          headerRightShown={headerRightShown}
          isNavigationOption={isNavigationOption}
        />
        <View
          style={{
            height: 100
          }}
        ></View>
      </WsModal>
    </>
  )
}

export default React.memo(WsStateFormModal);
