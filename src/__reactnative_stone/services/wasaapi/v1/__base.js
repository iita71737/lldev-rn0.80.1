import axios from 'axios'
import apiCallBack from '@/__reactnative_stone/global/apiCallBack'
import Config from "react-native-config";
axios.defaults.baseURL = Config.API_URL
import * as Sentry from "@sentry/react-native";

export default {
  init() {
    this.baseUrlSet()
  },
  baseUrlSet(url) {
    axios.defaults.baseURL = url ? url : Config.API_URL
  },
  async index({
    preUrl,
    parentName = null,
    parentId = null,
    modelName,
    params,
    pagination = true,
    endpoint = axios.defaults.baseURL,
    signal
  }) {
    let url = ''
    if (endpoint) {
      url += `${endpoint}/`
    }
    if (preUrl) {
      url += `${preUrl}/`
    }
    if (parentName) {
      url += `${parentName}/${parentId}/`
    }
    if (modelName) {
      url += `${modelName}`
    }
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: params,
          signal: signal
        })
        .then(res => {
          // console.log('res.data:', JSON.stringify(res.data, null, 2));
          // console.log('✅ 最終 URL:', res.request?.responseURL);
          if (pagination) {
            resolve(res.data)
          } else {
            resolve(res.data.data)
          }
        })
        .catch(err => {
          if (axios.isCancel(err)) {
            console.log('Request canceled', err.message);
          }
          // 詳細錯誤處理
          if (err?.response) {
            // 請求已發出，伺服器回應了狀態碼，但狀態碼不在 2xx 範圍內
            console.error('Error Response Data:', err.response.data);
            console.error('Error Response Status:', err.response.status);
            console.error('Error Response Headers:', err.response.headers);
          }
          else {
            console.error('Error Response Data:', err.response.data);
            console.error('Error Response Status:', err.response.status);
            console.error('Error Response Headers:', err.response.headers);
          }
          Sentry.captureException(err);
          reject(err)
        })
    })
  },
  show({
    preUrl,
    parentName = null,
    parentId = null,
    modelName,
    modelId,
    params,
    endpoint = axios.defaults.baseURL,
    callback = false
  }) {
    let url = ''
    if (endpoint) {
      url += `${endpoint}/`
    }
    if (preUrl) {
      url += `${preUrl}/`
    }
    if (parentName) {
      url += `${parentName}/${parentId}/`
    }
    if (modelName) {
      url += `${modelName}/${modelId}`
    }
    return new Promise((resolve, reject) => {
      axios
        .get(`${url}`, {
          params: params,
        })
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          // 詳細錯誤處理
          if (err.response) {
            // 請求已發出，伺服器回應了狀態碼，但狀態碼不在 2xx 範圍內
            console.error('Error Response Data:', err.response.data);
            console.error('Error Response Status:', err.response.status);
            console.error('Error Response Headers:', err.response.headers);
            if (err.response.status == 403) {
              resolve(err.response.data)
            }
          } else if (err.request) {
            // 請求已發出，但未收到回應
            console.error('No response received:', err.request);
          } else {
            // 發生錯誤時，設定請求時出現錯誤
            console.error('Axios request error:', err.message);
          }
          console.error('Axios config:', err.config);
          Sentry.captureException(err);
          console.error(`${modelName} show error`)
          reject(err)
        })
    })
  },
  delete({
    modelName,
    modelId,
    endpoint = axios.defaults.baseURL,
    preUrl,
    params
  }) {
    let url = ''
    if (preUrl) {
      url = `${endpoint}/${preUrl}/${modelName}/${modelId}`
    } else if (modelName && modelId) {
      url = `${endpoint}/${modelName}/${modelId}`
    } else {
      url = `${endpoint}/${modelName}`
    }
    return new Promise((resolve, reject) => {
      axios
        .delete(url, { params })
        .then(res => {
          resolve(res.data?.message)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} delete error`)
          // 詳細錯誤處理
          if (err.response) {
            // 請求已發出，伺服器回應了狀態碼，但狀態碼不在 2xx 範圍內
            console.error('Error Response Data:', err.response.data);
            console.error('Error Response Status:', err.response.status);
            console.error('Error Response Headers:', err.response.headers);
            if (err.response.status == 403) {
              resolve(err.response.data)
            }
          } else if (err.request) {
            // 請求已發出，但未收到回應
            console.error('No response received:', err.request);
          } else {
            // 發生錯誤時，設定請求時出現錯誤
            console.error('Axios request error:', err.message);
          }
          console.error('Axios config:', err.config);
          if (callback) {
            apiCallBack.apiFail()
          }
          reject(err);
        })
    })
  },
  create({
    parentName = null,
    parentId = null,
    modelName,
    modelId = null,
    data,
    endpoint = axios.defaults.baseURL,
    preUrl
  }) {
    let url = ''
    if (preUrl && parentName && modelName && modelId) {
      url = `${endpoint}/${preUrl}/${parentName}/${modelId}/${modelName}`
    } else if (preUrl && modelName) {
      url = `${endpoint}/${preUrl}/${modelName}`
    } else if (parentName && modelName) {
      url = `${endpoint}/${parentName}/${parentId}/${modelName}`
    } else if (parentName) {
      url = `${endpoint}/${parentName}/${parentId}`
    } else {
      url = `${endpoint}/${modelName}`
    }
    return new Promise(async (resolve, reject) => {
      axios
        .post(url, data, {
        })
        .then(res => {
          if (res.data?.data) {
            resolve(res.data.data)
          } else {
            resolve(res.data)
          }
        })
        .catch(err => {
          Sentry.captureException(err);
          reject(err)
        })
    })
  },
  update({
    parentName = null,
    parentId = null,
    modelName,
    modelId,
    data,
    endpoint = axios.defaults.baseURL,
    preUrl
  }) {
    let url = ''
    if (parentName) {
      url = `${endpoint}/${parentName}/${parentId}/${modelName}`
    } else if (preUrl && parentName) {
      url = `${endpoint}/${preUrl}/${parentName}/${parentId}/${modelName}`
    } else if (preUrl && modelName) {
      url = `${endpoint}/${preUrl}/${modelName}/${modelId}`
    } else if (modelName && modelId) {
      url = `${endpoint}/${modelName}/${modelId}`
    } else if (modelName) {
      url = `${endpoint}/${modelName}`
    }
    return new Promise((resolve, reject) => {
      axios
        .put(url, data)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} update error`)
          reject(err);
        })
    })
  },
  patch({
    parentName = null,
    parentId = null,
    modelName,
    modelId,
    data,
    endpoint = axios.defaults.baseURL,
    preUrl
  }) {
    let url = ''
    if (parentName) {
      url = `${endpoint}/${parentName}/${parentId}/${modelName}`
    } else if (preUrl && parentName) {
      url = `${endpoint}/${preUrl}/${parentName}/${parentId}/${modelName}`
    } else if (preUrl && modelName) {
      url = `${endpoint}/${preUrl}/${modelName}/${modelId}`
    } else if (modelName && modelId) {
      url = `${endpoint}/${modelName}/${modelId}`
    } else if (modelName) {
      url = `${endpoint}/${modelName}`
    }
    return new Promise(resolve => {
      axios
        .patch(url, data)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} update error`)
        })
    })
  },
  createAll({
    parentName = null,
    parentId = null,
    modelName,
    datas,
    preUrl,
    endpoint = axios.defaults.baseURL
  }) {
    let url = ''
    if (preUrl && parentName && parentId) {
      url = `${endpoint}/${preUrl}/${parentName}/${parentId}/${modelName}`
    } else if (parentName && parentId) {
      url = `${endpoint}/${parentName}/${parentId}/${modelName}`
    } else if (parentName) {
      url = `${endpoint}/${parentName}/${modelName}`
    } else if (preUrl && modelName) {
      url = `${endpoint}/${preUrl}/${modelName}`
    } else {
      url = `${endpoint}/${modelName}`
    }
    const axiosTask = []
    datas.forEach(data => {
      axiosTask.push(axios.post(url, data))
    })
    try {
      return Promise.all(axiosTask)
    } catch (err) {
      Sentry.captureException(err);
      console.error(`${modelName} createAll error`)
    }
  },
  updateAll({
    parentName = null,
    parentId = null,
    modelName,
    datas,
    endpoint = axios.defaults.baseURL
  }) {
    const axiosTask = []
    datas.forEach(data => {
      let url = ''
      if (parentName) {
        url = `${endpoint}/${parentName}/${parentId}/${modelName}`
      } else {
        url = `${endpoint}/${modelName}/${data.id}`
      }
      axiosTask.push(axios.patch(url, data))
    })
    try {
      return Promise.all(axiosTask)
    } catch (err) {
      Sentry.captureException(err);
      console.error(`${modelName} updateAll error`)
    }
  },
  showAll({ modelName, datas, preUrl, endpoint = axios.defaults.baseURL }) {
    let axiosTask = []
    datas.forEach(data => {
      let url = `${endpoint}/${modelName}/${data.id}?factory=${data.factory}`
      if (preUrl) {
        url = `${endpoint}/${preUrl}/${modelName}/${data.id}`
      }
      axiosTask.push(axios.get(url))
    })
    try {
      return Promise.all(axiosTask)
    } catch (err) {
      Sentry.captureException(err);
      console.error(`${modelName} showAll error`)
    }
  },
  addToCollect({ modelId, modelName, endpoint = axios.defaults.baseURL }) {
    let url = `${endpoint}/collect/${modelName}/${modelId}`
    return new Promise(resolve => {
      axios
        .post(url)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} create error`)
        })
    })
  },
  removeFromCollect({ modelId, modelName, endpoint = axios.defaults.baseURL }) {
    let url = `${endpoint}/uncollect/${modelName}/${modelId}`
    return new Promise(resolve => {
      axios
        .post(url)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} create error`)
        })
    })
  },
  done({ modelName, modelId, endpoint = axios.defaults.baseURL, data }) {
    let url = `${endpoint}/${modelName}/${modelId}/done`
    return new Promise(resolve => {
      axios
        .post(url, data)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} done error`)
        })
    })
  },
  undo({ modelName, modelId, endpoint = axios.defaults.baseURL, data }) {
    let url = `${endpoint}/${modelName}/${modelId}/undo`
    return new Promise(resolve => {
      axios
        .post(url, data)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} undo error`)
        })
    })
  },
  stop({
    modelName,
    modelId,
    endpoint = axios.defaults.baseURL,
    preUrl,
    parentName,
    parentId
  }) {
    let url = ''
    if (endpoint) {
      url += `${endpoint}/`
    }
    if (preUrl) {
      url += `${preUrl}/`
    }
    if (parentName) {
      url += `${parentName}/${parentId}/`
    }
    if (modelName) {
      url += `${modelName}/${modelId}`
    }
    url += '/stop'
    return new Promise(resolve => {
      axios
        .post(url)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} stop error`)
        })
    })
  },
  restart({
    modelName,
    modelId,
    endpoint = axios.defaults.baseURL,
    preUrl,
    parentName,
    parentId
  }) {
    let url = ''
    if (endpoint) {
      url += `${endpoint}/`
    }
    if (preUrl) {
      url += `${preUrl}/`
    }
    if (parentName) {
      url += `${parentName}/${parentId}/`
    }
    if (modelName) {
      url += `${modelName}/${modelId}`
    }
    url += '/restart'
    return new Promise(resolve => {
      axios
        .post(url)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} restart error`)
        })
    })
  },
  read({
    modelName,
    modelId,
    endpoint = axios.defaults.baseURL,
    preUrl,
    parentName,
    parentId
  }) {
    let url = ''
    if (endpoint) {
      url += `${endpoint}/`
    }
    if (preUrl) {
      url += `${preUrl}/`
    }
    if (parentName) {
      url += `${parentName}/${parentId}/`
    }
    if (modelName) {
      url += `${modelName}/${modelId}`
    }
    return new Promise(resolve => {
      axios
        .post(url)
        .then(res => {
          resolve(res.data.data)
        })
        .catch(err => {
          Sentry.captureException(err);
          console.error(`${modelName} read error`)
        })
    })
  },
  createWithFormData({
    parentName = null,
    parentId = null,
    modelName,
    modelId = null,
    data,
    endpoint = axios.defaults.baseURL,
    preUrl
  }) {
    let url = ''
    if (preUrl && parentName && modelName && modelId) {
      url = `${endpoint}/${preUrl}/${parentName}/${modelId}/${modelName}`
    } else if (preUrl && modelName) {
      url = `${endpoint}/${preUrl}/${modelName}`
    } else if (parentName && modelName) {
      url = `${endpoint}/${parentName}/${parentId}/${modelName}`
    } else if (parentName) {
      url = `${endpoint}/${parentName}/${parentId}`
    } else {
      url = `${endpoint}/${modelName}`
    }
    return new Promise(async (resolve, reject) => {
      axios.post(url, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })
        .then(res => {
          resolve(res.data.data);
        })
        .catch(err => {
          Sentry.captureException(err);
          reject(err);
        });
    });
  }
}
