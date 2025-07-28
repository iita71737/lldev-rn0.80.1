import axios from 'axios'
import store from '@/store'
import {
  setIsMounted,
  setLoginErrorMessage
} from '@/__reactnative_stone/store/app'
import {
  setUserScopes,
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentUser
} from '@/store/data'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import AsyncStorage from '@react-native-community/async-storage'
import Config from "react-native-config";

export default {
  async check() {
    try {
      const token = await S_Keychain.getToken()
      if (!token) {
        return false
      } else {
        this.setAxiosToken(token)
        const userRes = await S_API_Auth.getUser()
        if (!userRes) {
          return false
        }
        await S_Keychain.setData(userRes, token)
        this.setStoreUser(userRes)
        return true
      }
    } catch (error) {
      if (error.response.status == 401) {
        return false
      }
    }
  },
  async login({ email, password, key, captcha }) {
    const loginRes = await S_API_Auth.login({
      email,
      password,
      key,
      captcha
    })
    const token = `Bearer ${loginRes.access_token}`
    const loginTokenExpiresAt = loginRes.expires_at
    await this.setExpiredAt(loginTokenExpiresAt)
    await S_Keychain.setData(null, token)
    this.setAxiosToken(token)
    const userRes = await this.getUser()
    S_Keychain.setData(userRes, token)
    this.setStoreUser(userRes)
    this.setMounted()
  },
  setAxiosToken(token) {
    axios.defaults.headers.common['Authorization'] = token
  },
  async getUser() {
    return await S_API_Auth.getUser()
  },
  setStoreUser(user) {
    store.dispatch(setCurrentUser(user))
  },
  setMounted() {
    store.dispatch(setIsMounted(true))
  },
  async logout() {
    store.dispatch(setIsMounted(true))
    await S_API_Auth.logout()
    await AsyncStorage.removeItem('factory');
    await S_Keychain.reset()
    this.setAxiosToken(null)
    this.setStoreUser(null)
    store.dispatch(setCurrentFactory(null))
    axios.defaults.baseURL = Config.API_URL
  },
  async forgetPasswordRequest(data) {
    return await base.create({
      modelName: 'auth/forgetpassword/request',
      data
    })
  },
  IsEmail(email) {
    let regex =
      /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    if (!regex.test(email)) {
      return false
    } else {
      return true
    }
  },
  // check if any scope on app when login
  checkScopes(user) {
    const _roles = []
    user.user_factory_roles.forEach(factory => {
      factory.scopes.forEach(factoryScope => {
        if (!_roles.includes(factoryScope)) {
          _roles.push(factoryScope)
        }
      })
    })
    return _roles.includes('app-apply')
  },
  async setExpiredAt(expires_at) {
    const _value = JSON.stringify(expires_at)
    await AsyncStorage.setItem('TokenExpireAt', _value)
  },
  async loginWithoutCaptcha({ email, password }) {
    const loginRes = await S_API_Auth.loginWithoutCaptcha({
      email,
      password,
    })
    const token = `Bearer ${loginRes.access_token}`
    const loginTokenExpiresAt = loginRes.expires_at
    await this.setExpiredAt(loginTokenExpiresAt)
    await S_Keychain.setData(null, token)
    this.setAxiosToken(token)
    const userRes = await this.getUser()
    S_Keychain.setData(userRes, token)
    this.setStoreUser(userRes)
    this.setMounted()
  },
}
