import * as Keychain from 'react-native-keychain'

export default {
  async setData(userData, token) {
    await Keychain.setGenericPassword(JSON.stringify(null), token)
  },

  async getUserData() {
    try {
      const credentials = await Keychain.getGenericPassword()
      if (credentials && credentials.username) {
        return JSON.parse(credentials.username)
      } else {
        return null
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error)
      return null
    }
  },

  async getToken() {
    try {
      const credentials = await Keychain.getGenericPassword()
      // console.log('credentials',credentials)
      if (credentials && credentials.password) {
        return credentials.password
      } else {
        return null
      }
    } catch (error) {
      console.log("Keychain couldn't be accessed!", error)
      return null
    }
  },

  async reset() {
    await Keychain.resetGenericPassword()
  },

  async storeCredentials(email, password) {
    try {
      await Keychain.setInternetCredentials('pwd', email, password);
      // console.log('帳號密碼已存儲');
    } catch (error) {
      // console.error('儲存帳號密碼時發生錯誤:', error);
    }
  },
  async retrieveCredentials() {
    try {
      const credentials = await Keychain.getInternetCredentials('pwd');
      if (credentials?.username && credentials?.password) {
        const { username, password } = credentials;
        return { username, password };
      } else {
        // console.log('未找到儲存的帳號密碼');
        return null;
      }
    } catch (error) {
      // console.error('檢索帳號密碼時發生錯誤:', error);
      return null;
    }
  }
}
