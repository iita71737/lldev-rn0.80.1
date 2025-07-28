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
import { LoginSection001 } from '@/__reactnative_stone/sections'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import zh_tw from '@/__reactnative_stone/messages/zh_tw'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import Config from "react-native-config";
import store from '@/store'
import {
} from '@/store/data'

const Login = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')

  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  const $_getStorage = async () => {
    const _factory = await AsyncStorage.getItem('factory')
  }

  //State
  const [isLoading, setIsLoading] = React.useState(false)
  const [topErrorMessage, setTopErrorMessage] = React.useState()

  const {
    autoFocus
  } = route.params

  const $_onSubmit = async $event => {
    try {
      setTopErrorMessage()
      setIsLoading(true)
      if (Config.DETOX_TEST) {
        const loginRes = await S_Auth.loginWithoutCaptcha({
          email: $event.email,
          password: $event.password,
          key: $event.key,
          captcha: $event.captcha
        })
        await AsyncStorage.removeItem('screenLock')
      } else {
        const loginRes = await S_Auth.login({
          email: $event.email,
          password: $event.password,
          key: $event.key,
          captcha: $event.captcha
        })
        await AsyncStorage.removeItem('screenLock')
      }
    } catch (error) {
      console.log(error)
      setTopErrorMessage(zh_tw[error])
    } finally {
      setIsLoading(false)
    }
  }

  const $_onSubmitForgotPwd = () => {
    navigation.navigate('ForgotPwd')
  }

  React.useEffect(() => {
    $_getStorage()
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LoginSection001
          isLoading={isLoading}
          topErrorMessage={topErrorMessage} //this may cause JSX crash if not correct value
          onSubmitForgotPwd={$_onSubmitForgotPwd}
          onSubmit={$_onSubmit}
          navigation={navigation}
          autoFocus={autoFocus}
        />
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default Login
