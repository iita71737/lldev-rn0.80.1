import React from 'react'
import { LoginSection001 } from '@/__reactnative_stone/sections'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import $config from '@/__config'
import AsyncStorage from '@react-native-community/async-storage'
import zh_tw from '@/__reactnative_stone/messages/zh_tw'
import axios from 'axios'

const Login = ({ navigation }) => {
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessages, setErrorMessages] = React.useState({})
  const [topErrorMessage, setTopErrorMessage] = React.useState('')

  // 全域 axios
  // console.log(axios.defaults.headers.common['Authorization'], 'Axios default Bearer Token');

  // Func
  const $_onSubmit = async $event => {
    setErrorMessages({})
    try {
      setIsLoading(true)
      setTopErrorMessage('')
      await S_Auth.loginWithoutCaptcha({
        email: $event.email,
        password: $event.password,
      })
    } catch (error) {
      console.log(error, 'login error')
      setTopErrorMessage(zh_tw[error])
    } finally {
      setIsLoading(false)
    }
  }

  const $_onSubmitForgotPwd = () => {
    navigation.navigate('ForgotPwd')
  }

  return (
    <LoginSection001
      isLoading={isLoading}
      errorMessages={errorMessages}
      setErrorMessages={setErrorMessages}
      topErrorMessage={topErrorMessage}
      onSubmitForgotPwd={$_onSubmitForgotPwd}
      onSubmit={$_onSubmit}
      title={$config.component.ClosedVersionLogin.title}
      source={$config.component.LoginSection001.source}
      bannerLogo={$config.component.LoginSection001.logo}
      bannerText={$config.component.LoginSection001.bannerText}
      navigation={navigation}
    />
  )
}

export default Login
