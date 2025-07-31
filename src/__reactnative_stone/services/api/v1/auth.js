import axios from 'axios'
import config from '@/__config'
import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import store from '@/store'
import { setCurrentUser } from '@/store/data'
import AsyncStorage from '@react-native-community/async-storage'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import Config from "react-native-config";
axios.defaults.baseURL = Config.API_URL

console.log(Config.API_URL, 'Config.API_URL---');

export default {
  login({ email, password, key, captcha }) {
    return new Promise((resolve, reject) => {
      const route =
        config.auth && config.auth.login && config.auth.login.url
          ? config.auth.login.url
          : '/auth/login'
      axios
        .post(`${axios.defaults.baseURL}${route}`, {
          email: email,
          password: password,
          key: key,
          captcha: captcha
        })
        .then(loginRes => {
          const jsonString = JSON.stringify(loginRes, null, 2);
          if (loginRes.status == 200) {
            resolve(loginRes.data)
          }
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          // DO NOT CHANGE FOR VALIDATION
          reject(error.response.data.message)
        })
    })
  },
  check({ email, password }) {
    return new Promise((resolve, reject) => {
      const route = `/auth/account/check`
      axios
        .post(`${axios.defaults.baseURL}${route}`, {
          email: email,
          password: password,
        })
        .then(loginRes => {
          if (loginRes.status == 200) {
            resolve(loginRes.data)
          }
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          reject(error)
        })
    })
  },
  getUser() {
    return new Promise(async (resolve, reject) => {
      const token = await S_Keychain.getToken()
      const route =
        config.auth.user && config.auth.user.url
          ? config.auth.user.url
          : '/auth/v2/user_app'
          // : '/auth/v2/user'
      const userKey =
        config.auth.user && config.auth.user.userKey
          ? config.auth.user.userKey
          : 'user'
      axios
        .get(`${axios.defaults.baseURL}${route}`, {
          headers: { Authorization: token }
        })
        .then(res => {
          store.dispatch(setCurrentUser(res.data.data))
          resolve(res.data[userKey])
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          reject(error)
        })
    })
  },
  logout() {
    return new Promise((resolve, reject) => {
      const route = '/auth/signout'
      console.log(`${axios.defaults.baseURL}${route}`, '`${axios.defaults.baseURL}${route}`');
      axios
        .post(`${axios.defaults.baseURL}${route}`)
        .then(res => {
          if (res.status == 200) {
            resolve()
          }
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          if (
            error &&
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            reject(error.response.data.message)
          } else {
            reject('error.')
          }
        })
    })
  },
  async changePwd({ old_pwd, new_pwd, new_pwd_again }) {
    const route =
      config.auth && config.auth.changePwd && config.auth.changePwd.url
        ? config.auth.changePwd.url
        : '/auth/password'
    try {
      const res = await axios.patch(`${axios.defaults.baseURL}${route}`, {
        password: old_pwd,
        new_password: new_pwd,
        new_password_confirmation: new_pwd_again
      })
      return 'change password success'
    } catch (err) {
      return err.response.data.message
    }
  },
  async updateUser({ avatar, locale = "1" }) {
    const route = config.auth ? config.auth.user.url : '/auth/user'
    const _params = {
      avatar: avatar,
      locale: locale
    }
    const res = await base.patch({
      modelName: `auth/user`,
      data: {
        ..._params
      }
    })
    return res
  },
  async appVersionCheck() {
    const minimum_Android_APP_version_available = `/minimum/android_app_version/available`
    const minimum_Android_OS_version_required = `/minimum/android_os_version/required`
    const minimum_iOS_APP_version_available = `/minimum/ios_app_version/available`
    const minimum_iOS_OS_version_required = `/minimum/ios_os_version/required`
    try {
      const Android_APP_version = await axios.get(`${axios.defaults.baseURL}${minimum_Android_APP_version_available}`)
      const Android_OS_version = await axios.get(`${axios.defaults.baseURL}${minimum_Android_OS_version_required}`)
      const iOS_APP_version = await axios.get(`${axios.defaults.baseURL}${minimum_iOS_APP_version_available}`)
      const iOS_OS_version = await axios.get(`${axios.defaults.baseURL}${minimum_iOS_OS_version_required}`)

      Promise.all([Android_APP_version, Android_OS_version, iOS_APP_version, iOS_OS_version])
        .then(res => {

        })
        .catch(err => {
          console.error(err)
        })
    } catch (err) {
      return err.response.data.message
    }
  },
  getCaptcha() {
    return new Promise(async (resolve, reject) => {
      const route = 'auth/get_captcha'
      console.log(`${axios.defaults.baseURL}/${route}`, 'getCaptcha Url');
      axios
        .get(`${axios.defaults.baseURL}/${route}`, {
        })
        .then(res => {
          resolve(res)
        })
        .catch(error => {
          if (error.response) {
            console.error(error);
            console.log("Error data", error.response?.data);
          } else if (error.request) {
            console.log("Error request", error?.request);
          } else {
            console.log('Error', error?.message);
          }
          reject(error)
        })
    })
  },
  loginWithoutCaptcha({ email, password }) {
    return new Promise((resolve, reject) => {
      const route = '/auth/signin_app'
      axios
        .post(`${axios.defaults.baseURL}${route}`, {
          email: email,
          password: password,
        })
        .then(loginRes => {
          const jsonString = JSON.stringify(loginRes, null, 2);
          if (loginRes.status == 200) {
            resolve(loginRes.data)
          }
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          // DO NOT CHANGE FOR VALIDATION
          reject(error.response.data.message)
        })
    })
  },
}
