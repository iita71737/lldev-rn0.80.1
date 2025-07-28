import React from 'react'
import {
  View,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Touchable,
  Dimensions,
  ScrollView,
  Platform
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsBtn,
  WsState,
  WsErrorMessage,
  WsFastImage,
  WsPopup,
  WsDialog,
  WsGradientButton,
  WsIconBtn
} from '@/components'
import gLayout from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import Validator from '@/__reactnative_stone/services/validator'
import $config from '@/__config'
import i18next from 'i18next'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import { useSelector } from 'react-redux'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import Config from "react-native-config";
import axios from 'axios'

const LoginSection001 = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const route = useRoute();
  const rnBiometrics = new ReactNativeBiometrics()
  const rules = {
    email: 'required',
    password: 'required'
  }

  const {
    onSubmit,
    onSubmitForgotPwd,
    isLoading,
    setIsLoading,
    topErrorMessage,
    source = $config.component.LoginSection001.source,
    bannerText = $config.component.LoginSection001.bannerText,
    title = $config.component.LoginSection001.title,
    bannerLogo = $config.component.LoginSection001.logo,
    navigation,
    autoFocus = true
  } = props

  // REDUX
  const version = useSelector(state => state.data.version)

  // States
  const [isSubmittable, setIsSubmittable] = React.useState(false)
  const [apiDomain, setApiDomain] = React.useState('')

  const [captchaInputNumber, setCaptchaInputNumber] = React.useState()
  const [captcha, setCaptcha] = React.useState()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const passwordInput = React.createRef()

  // Function
  const $_submittableCheck = () => {
    const submitValue = {
      email: email,
      password: password,
      apiDomain: apiDomain,
    }
    const { errors, isValid } = Validator.validate(rules, submitValue)
    if (!isValid) {
      setIsSubmittable(false)
    } else {
      setIsSubmittable(true)
    }
  }
  // Submit
  const $_onSubmit = async () => {
    const submitValue = {
      email: email,
      password: password,
      key: route && route.name === 'Login' && captcha.captcha && captcha.captcha.key ? captcha.captcha.key : undefined,
      captcha: route && route.name === 'Login' && captchaInputNumber ? captchaInputNumber : undefined,
    }
    console.log(submitValue, 'submitValue');
    const { errors, isValid } = Validator.validate(rules, submitValue)
    if (!isValid) {
    } else {
      onSubmit(submitValue)
      await S_Keychain.storeCredentials(email, password);
    }
  }
  const $_getCaptcha = async () => {
    if (route?.name === 'Closed_Version_Login') {
      return
    }
    try {
      const _res = await S_API_Auth.getCaptcha()
      setCaptcha(_res.data)
    } catch (e) {
      console.error(e);
    }
  }

  // BIO LOGIN
  const $_onFocus = () => {
    isBiometricSupport()
  }
  const isBiometricSupport = async () => {
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available, biometryType } = resultObject
        if (available && biometryType === BiometryTypes.TouchID) {
          console.log('TouchID is supported')
        } else if (available && biometryType === BiometryTypes.FaceID) {
          console.log('FaceID is supported')
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          console.log('Biometrics is supported')
        } else {
          console.log('Biometrics not supported')
        }
      })

    rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
      .then((resultObject) => {
        const { success } = resultObject
        if (success) {
          $_getPasswordFromKeyChain()
        } else {
          console.log('user cancelled biometric prompt')
        }
      })
      .catch(() => {
        console.log('biometrics failed')
      })
  };
  const $_getPasswordFromKeyChain = async () => {
    try {
      const res = await S_Keychain.retrieveCredentials()
      if (res?.username && res?.password) {
        setEmail(res?.username)
        setPassword(res?.password)
      }
    } catch (error) {
      console.error(error);
    }
  }

  // CHECK KEY CHAIN
  const $_checkKeyChain = async () => {
    try {
      const res = await S_Keychain.retrieveCredentials()
      if (res?.username && res?.password) {
        $_onFocus()
      }
    } catch (error) {
      console.error(error);
    }
  }

  const $_setAPI_DOMAIN = event => {
    const apiBaseUrl = `${event}`;
    setApiDomain(apiBaseUrl);
  };

  // ENDPOINT
  const $_setAPIUrl = async () => {
    if (route.name !== 'Login') {
      base.baseUrlSet(Config.API_URL)
      navigation.replace('Login')
    } else {
      base.baseUrlSet(apiDomain)
      navigation.replace('Closed_Version_Login')
    }
  }

  // helper
  const ensureApiEndpoint = (url) => {
    const suffix = ":5021/api";
    if (url.endsWith(suffix)) {
      return url;
    } else {
      return url + suffix;
    }
  }

  React.useEffect(() => {
    console.log('delete axios.defaults.headers.common');
    delete axios.defaults.headers.common['Authorization'];
    $_getCaptcha();
  }, [apiDomain, route?.name]);

  React.useEffect(() => {
    $_submittableCheck()
  }, [email, password])

  React.useEffect(() => {
    if (route.name !== 'Login') {
      rules.apiDomain = 'required'
    }
  }, [])

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <ImageBackground
          style={{
            position: 'absolute',
            alignItems: 'center',
            width: '100%',
            height: gLayout.windowWidth * 0.442,
            resizeMode: 'contain',
          }}
          source={source}>
          <View style={styles.heroOverlay} />
        </ImageBackground>

        <WsFlex
          justifyContent="center"
          style={[
            {
              paddingTop: gLayout.windowWidth * 0.221 - 15,
            }
          ]}>
          {bannerLogo && (
            <Image
              source={bannerLogo}
              style={{
                width: 132,
                height: 34
              }}
            />
          )}
          {!bannerLogo && bannerText && (
            <WsText size="18" color="white" fontWeight="bold">
              {t(bannerText)}
            </WsText>
          )}
        </WsFlex>

        <View
          style={{
            marginTop: gLayout.windowWidth * 0.221 - 25,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            paddingTop: 16,
            paddingHorizontal: 16
          }}>
          <WsText size="18" fontWeight="bold" textAlign="center" style={{ marginBottom: 16 }}>
            {title ? t(title) : ''}
          </WsText>
          {topErrorMessage && (
            <WsErrorMessage
              style={{
                marginVertical: 8,
              }}>
              {t(topErrorMessage)}
            </WsErrorMessage>
          )}

          {route && route.name !== 'Login' && (
            <WsState
              style={{
                marginVertical: 16,
              }}
              type="text"
              label="API Domain/IP"
              placeholder="請輸入API Domain..."
              autoFocus={autoFocus}
              placeholderTextColor={$color.gray}
              value={apiDomain}
              onChange={event => {
                $_setAPI_DOMAIN(event)
              }}
              onBlur={() => {
                myUrl = ensureApiEndpoint(apiDomain);
                if (myUrl) {
                  $_setAPI_DOMAIN(myUrl)
                  axios.defaults.baseURL = `http://${myUrl}`;
                  $_getCaptcha()
                }
              }}
              onFocus={() => {
                $_setAPI_DOMAIN('')
              }}
            />
          )}
          <WsState
            type="email"
            testID={'account'}
            label={i18next.t('帳號')}
            placeholder={i18next.t('輸入')}
            value={email}
            editable={!isLoading}
            autoFocus={autoFocus}
            onChange={setEmail}
            rules="required"
            errorMessage={!email && [t('此項目為必填')]}
          />
          <WsState
            style={{
              marginTop: 16
            }}
            ref={passwordInput}
            type="password"
            testID={'pwd'}
            label={i18next.t('密碼')}
            placeholder={i18next.t('輸入')}
            editable={!isLoading}
            value={password}
            autoCompleteType="password"
            textContentType="password"
            onSubmitEditing={() => $_onSubmit()}
            onChange={setPassword}
            rules="required"
            errorMessage={!password && [t('此項目為必填')]}
          />

          {route && route.name === 'Login' && (
            <View style={styles.container}>
              <WsFlex>
                {captcha && captcha.captcha && captcha.captcha.img && (
                  <Image
                    style={styles.logo}
                    source={{ uri: captcha.captcha.img }}
                  />
                )}
                <WsIconBtn
                  name={'ws-outline-retry'}
                  size={24}
                  onPress={() => {
                    $_getCaptcha()
                  }}
                />
              </WsFlex>
              <WsState
                style={{
                  marginTop: 8,
                }}
                rules="required"
                errorMessage={!captchaInputNumber && [t('此項目為必填')]}
                label={t('驗證碼')}
                placeholder={t('輸入')}
                value={captchaInputNumber}
                onChange={(e) => {
                  setCaptchaInputNumber(e)
                }}
              >
              </WsState>
            </View>
          )}


          <WsGradientButton
            style={{
              marginTop: 30
            }}
            isLoading={isLoading}
            isDisabled={!isSubmittable}
            onPress={$_onSubmit}
            borderRadius={30}>
            {i18next.t('登入')}
          </WsGradientButton>
          <WsBtn
            minHeight={30}
            textSize={14}
            isFullWidth={false}
            style={{
              paddingVertical: 8,
              marginTop: 16,
              marginHorizontal: 8,
              borderWidth: 0.5,
              borderColor: $color.primary,
              height: 48
            }}
            textColor={$color.primary}
            color={$color.white}
            onPress={() => {
              onSubmitForgotPwd()
            }}
            borderRadius={30}>
            {i18next.t('忘記密碼')}
          </WsBtn>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              margin: 16
            }}>
            <TouchableOpacity
              onPress={() => {
                $_setAPIUrl()
              }}>
              <WsText size={14} color={$color.primary}>
                {route.name !== 'Login' ? i18next.t('雲端版登入') : i18next.t('企業封閉版登入')}
              </WsText>
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{
              alignItems: 'center'
            }}
            onPress={
              () => $_onFocus()
            }
          >
            <Image
              style={{
                width: 72,
                height: 72,
              }}
              source={require('@/__reactnative_stone/assets/img/face-id.png')}
            />
            <WsText size={14} color={$color.primary}>
              {'Face ID'}
            </WsText>
          </TouchableOpacity>

          <WsText
            style={{
              marginTop: 50
            }}
            size={14}
            color={$color.gray}
          >
            {version}
          </WsText>
        </View>
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: gLayout.windowWidth,
    height: gLayout.windowWidth * 0.442,
    backgroundColor: $color.primary,
    opacity: 0.5,
    zIndex: 0
  },
  container: {
    paddingTop: 16,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  logo: {
    width: 200,
    height: 58,
  },
})

export default LoginSection001
