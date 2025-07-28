import messaging from '@react-native-firebase/messaging'

export default {
  async getToken() {
    const fcmToken = await messaging().getToken()
    return fcmToken
  }
}
