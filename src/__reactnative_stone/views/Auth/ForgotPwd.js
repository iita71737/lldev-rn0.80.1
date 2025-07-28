import React from 'react'
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  ImageBackground,
  Alert,
  Platform
} from 'react-native'
import {
  WsIcon,
  WsLoading,
  WsText,
  WsCircle,
  WsFlex,
  WsState,
  WsErrorMessage,
  WsFastImage,
  WsStateFormView,
  WsPageScrollView,
  WsStateForm,
  WsBtn,
  WsIconBtn
} from '@/components'
import { SendMail } from '@/__reactnative_stone/sections'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import { useTranslation } from 'react-i18next'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import gLayout from '@/__reactnative_stone/global/layout'
import $config from '@/__config'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import { ScrollView } from 'react-native-gesture-handler'

const ForgotPwd = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    source = $config.component.SendMail.source,
    content = $config.component.SendMail.content,
    bannerText = $config.component.SendMail.bannerText,
    title = $config.component.SendMail.title,
    bannerLogo = $config.component.SendMail.logo
  } = props

  // States
  const [captchaInputNumber, setCaptchaInputNumber] = React.useState()
  const [captcha, setCaptcha] = React.useState()
  const [value, onChange] = React.useState()
  const [errorMessage, setErrorMessage] = React.useState()

  // Function
  const $_onChange = $event => {
    const _value = {}
    _value.email = $event
    onChange(_value)
  }

  // Services
  const $_getCaptcha = async () => {
    try {
      const _res = await S_API_Auth.getCaptcha()
      setCaptcha(_res.data)
    } catch (e) {
      console.error(e);
    }
  }
  const $_onSubmit = async () => {
    const _validation = S_Auth.IsEmail(value.email)
    if (!_validation) {
      setErrorMessage(t('信箱輸入錯誤'))
    }
    if (_validation && captchaInputNumber) {
      setErrorMessage('')
      try {
        const data = {
          email: value.email,
          key: captcha.captcha && captcha.captcha.key,
          captcha: captchaInputNumber
        }
        // console.log(data, 'data=');
        const res = await S_Auth.forgetPasswordRequest(data)
        Alert.alert(t(`密碼重設信發送成功，\n請至信箱點選密碼重設信`))
        navigation.goBack()
      } catch (e) {
        Alert.alert(t(`嘗試次數過多。\n為保護您的帳戶，\n目前暫時無法寄出重設密碼信。\n請稍後再試一次，\n或透過另一部裝置嘗試。`))
      }
    }
  }

  React.useEffect(() => {
    $_getCaptcha();
  }, []);

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
        }}
      >
        <StatusBar barStyle={'dark-content'} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{
            flex: 1,
            backgroundColor: 'white'
          }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                flex: 1
              }}
            >
              <ImageBackground
                style={{
                  position: 'absolute',
                  flex: 1,
                  alignItems: 'center',
                  width: '100%',
                  height: gLayout.windowWidth * 0.442,
                  resizeMode: 'contain'
                }}
                source={source}
              >
                <View style={styles.heroOverlay} />
              </ImageBackground>
              <WsFlex
                justifyContent="center"
                style={[
                  {
                    paddingTop: gLayout.windowWidth * 0.221 - 15
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
                {!bannerLogo && (
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
                  paddingVertical: 24,
                  paddingHorizontal: 16,
                  // borderWidth: 1,
                }}>
                <WsText size="18" fontWeight="bold" textAlign="center">
                  {t(title)}
                </WsText>
                <WsText
                  style={{
                    marginVertical: 32
                  }}
                  size="18">
                  {t(content)}
                </WsText>

                <WsState
                  type="email"
                  rules="required"
                  errorMessage={!value?.email ? [t('此項目為必填')] : !S_Auth.IsEmail(value?.email) ? [t('email格式不符')] : ''}
                  label={t('Email')}
                  placeholder={t('輸入')}
                  autoFocus={true}
                  value={value?.email}
                  onChange={(e) => {
                    $_onChange(e)
                  }}
                >
                </WsState>

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
                      marginTop: 16,
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

                <WsBtn
                  style={{
                    marginTop: 30
                  }}
                  onPress={() => {
                    $_onSubmit()
                  }}
                  borderRadius={30}>
                  {i18next.t('送出')}
                </WsBtn>
                <WsBtn
                  style={{
                    marginTop: 16,
                    borderWidth: 0.5,
                    borderColor: $color.primary
                  }}
                  textColor={$color.primary}
                  color={$color.white}
                  onPress={() => {
                    navigation.goBack()
                  }}
                  borderRadius={30}>
                  {i18next.t('返回')}
                </WsBtn>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScrollView>
    </>
  )
}

export default ForgotPwd

const styles = StyleSheet.create({
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
});
