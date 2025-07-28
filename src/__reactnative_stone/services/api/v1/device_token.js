import axios from 'axios'
import config from '@/__config'
import S_Auth from '@/__reactnative_stone/services/app/auth'
import { Platform, Alert } from 'react-native'

export default {
  apiUrl: axios.defaults.baseURL,
  active({ deviceToken }) {
    return new Promise(resolve => {
      const url = `${this.apiUrl}/device_token`
      axios
        .post(url, {
          device_token: deviceToken
        })
        .then(res => {
          resolve(res.data.data)
        })
        .catch(error => {
          if (error.response) {
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log("Error request", error.request);
          } else {
            console.log('Error', error.message);
          }
          console.error(error, 'device_token active error111')
        })
    })
  },
  deactive({ deviceToken }) {
    return new Promise((resolve, reject) => {
      const url = `${this.apiUrl}/device_token`;
      axios
        .delete(url, {
          data: {
            device_token: deviceToken
          }
        })
        .then(res => {
          resolve(res.data.data)
        })
        .catch(error => {
          if (error.response) {
            console.log('aaaaa');
            console.log("Error data", error.response.data);
          } else if (error.request) {
            console.log('bbbbb');
            console.log("Error request", error.request);
          } else {
            console.log(url, 'cccccc111');
            console.log(deviceToken,'cccccc222');
            console.log(axios.defaults.headers.common['Authorization'], 'ccccAuthorization333');
            console.log('Error:', error.message);
          }
          console.error(error, 'deviceToken deactive error');
          reject(error);
        });
    });
  }
}
