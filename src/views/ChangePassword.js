import React from 'react'
import { View, Text, NavigatorIOS, Alert } from 'react-native'
import {
  WsStateFormView,
  WsText,
  WsFlex,
  WsTag,
  WsState,
  WsBtn,
  WsIcon
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import Services from '@/services/api/v1/index'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import { useIsFocused } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import S_DeviceToken from '@/__reactnative_stone/services/api/v1/device_token'

const ChangePassword = ({ navigation, route }) => {
  // i18n
  const { t, i18n } = useTranslation()

  // States
  const [deviceToken, setDeviceToken] = React.useState()

  const [eyeClose1, setEyeClose1] = React.useState(true)
  const [eyeClose2, setEyeClose2] = React.useState(true)
  const [eyeClose3, setEyeClose3] = React.useState(true)

  const [validationEqual, setValidationEqual] = React.useState(false)
  const [validationLength, setValidationLength] = React.useState(false)
  const [validationEngAndNum, setValidationEngAndNum] = React.useState(false)

  const fields = {
    old_pwd: {
      type: 'password',
      label: t('舊密碼'),
      placeholder: t('輸入'),
      rules: 'required',
      secureTextEntry: eyeClose1,
      setSecureTextEntry: setEyeClose1
    },
    new_pwd: {
      type: 'password',
      label: t('新密碼'),
      placeholder: t('輸入'),
      rules: 'required',
      secureTextEntry: eyeClose2,
      setSecureTextEntry: setEyeClose2
    },
    new_pwd_again: {
      type: 'password',
      label: t('再次輸入新密碼'),
      placeholder: t('輸入'),
      rules: 'required',
      secureTextEntry: eyeClose3,
      setSecureTextEntry: setEyeClose3
    }
  }

  // States
  const [value, onChange] = React.useState({})
  const [message, setMessage] = React.useState()

  // Services
  const $_onChange = async $event => {
    const eventChangeData = { ...value, ...$event }
    onChange(eventChangeData)
  }

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('fcmToken')
    const _value = JSON.parse(_item)
    setDeviceToken(_value)
  }

  const $_onSubmit = async () => {
    try {
      await S_API_Auth.changePwd({
        old_pwd: value.old_pwd,
        new_pwd: value.new_pwd,
        new_pwd_again: value.new_pwd_again
      }).then(res => {
        if (res === 'password not correct.') {
          setMessage(t('目前密碼輸入錯誤'))
        } else if (res === 'confirmation not match.') {
          setMessage(t('新密碼驗證錯誤'))
        } else if (res === 'change password success') {
          $_logout()
        }
      })
    } catch (e) {
      console.error(e, 'e')
    }
  }

  const $_logout = async () => {
    if (deviceToken != null) {
      try {
        const res = await S_DeviceToken.deactive({
          deviceToken: deviceToken
        });
      } catch (error) {
        console.error(error, '-deactive err-');
      } finally {
        try {
          await S_Auth.setStoreUser(null)
          Alert.alert(t('為了保護您的資料安全，已登出本系統，請重新登入。'))
        } catch (error) {
          console.error(error, 'logout error');
          Alert.alert(t('修改密碼出現異常'))
        }
      }
    }
  }

  const $_validationForm = () => {
    if (value.new_pwd_again === value.new_pwd) {
      setValidationEqual(true)
      if (value.new_pwd_again.length > 7 && value.new_pwd_again.length <= 20) {
        setValidationLength(true)
        const reg = /^(?=.*[a-za-z])(?=.*[1-9])/
        if (reg.test(value.new_pwd_again)) {
          setValidationEngAndNum(true)
        } else {
          setValidationEngAndNum(false)
        }
      } else {
        setValidationEngAndNum(false)
        setValidationLength(false)
      }
    } else {
      setValidationLength(false)
      setValidationEngAndNum(false)
      setValidationEqual(false)
    }
  }

  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    if (value && value.new_pwd && value.new_pwd_again) {
      $_validationForm()
    }
  }, [value])

  return (
    <>
      {message && (
        <WsFlex
          style={{
            marginVertical: 16,
            backgroundColor: $color.primary11l
          }}
          justifyContent={'center'}>
          <WsText size={18} color={$color.danger} fontWeight={'600'}>
            {message}
          </WsText>
        </WsFlex>
      )}
      <WsStateFormView
        backgroundColor={$color.primary11l}
        isNavigationOption={false}
        fields={fields}
        initValue={value}
        onChange={$_onChange}
        onSubmit={$_onSubmit}
        headerRightBtnText={t('儲存')}
      >
      </WsStateFormView>
      <View
        style={{
          position: 'absolute',
          left: 16,
          bottom: 245,
          flexDirection: 'row'
        }}>
        <WsIcon name="ws-outline-check" size={20} style={{ marginRight: 4 }} color={validationEqual ? $color.green : $color.gray} />
        <WsText size={14} color={validationEqual ? $color.green : $color.gray}>
          {t('兩次輸入需要相同')}
        </WsText>
      </View>
      <View
        style={{
          position: 'absolute',
          left: 16,
          bottom: 217,
          flexDirection: 'row'
        }}>
        <WsIcon name="ws-outline-check" size={20} style={{ marginRight: 4 }} color={validationLength ? $color.green : $color.gray} />
        <WsText size={14} color={validationLength ? $color.green : $color.gray}>
          {t('介於6到20個字元')}
        </WsText>
      </View>
      <View
        style={{
          position: 'absolute',
          left: 16,
          bottom: 189,
          flexDirection: 'row'
        }}>
        <WsIcon name="ws-outline-check" size={20} style={{ marginRight: 4 }} color={validationEngAndNum ? $color.green : $color.gray} />
        <WsText size={14} color={validationEngAndNum ? $color.green : $color.gray}>
          {t('字元包含英文與數字')}
        </WsText>
      </View>
    </>
  )
}

export default ChangePassword
