import moment from 'moment'
// import { useSelector } from 'react-redux'
import store from '@/store'

export default {
  isJSONString(string) {
    try {
      JSON.parse(string)
    } catch (e) {
      return false
    }
    return true
  },
  getRandomString() {
    return Math.random().toString(36).substring(7)
  },
  getFileSize(contentLength, unit = true) {
    const sizeKb = Math.round((contentLength / 1024) * 10) / 10
    if (sizeKb < 1000) {
      if (unit) {
        return `${sizeKb} Kb`
      } else {
        return sizeKb
      }
    }
    sizeMb = Math.round((sizeKb / 1024) * 10) / 10
    if (unit) {
      return `${sizeMb} Mb`
    } else {
      return sizeMb
    }
  },
  getNewFileName() {
    const text = this.getRandomString()
    return `${moment('YYYYMMDDHHmmss')}${text}`
  },
  getFileNameFromUrl(url) {
    if (!url) {
      return null
    }
    return decodeURIComponent(url).split('?')[0].split('/').pop()
  },
  getPostData(fields, fieldsValue) {
    const state = store.getState()
    const postData = {}
    const _object = Object.keys(fieldsValue).filter(key => {
      if (fieldsValue[key]) {
        return fieldsValue[key]
      }
    })
    _object.forEach(fieldsKey => {
      const _value = fieldsValue[fieldsKey]
      const _field = fields[fieldsKey]
      if (!_field) {
        return
      }
      if (_field && _field.type == 'belongsto') {
        if (_value) {
          postData[fieldsKey] = _value.id
        }
      } else if (_field && _field.type == 'belongstomany') {
        const _ids = []
        if (_value) {
          _value.forEach(value => {
            _ids.push(value.id)
          })
          postData[fieldsKey] = _ids
        }
      } else if (_field && _field.type == 'currentUser') {
        postData[fieldsKey] = state.stone_auth.currentUser.id
      } else if (_field && _field.type == 'models') {
        const _modelsValue = []
        fieldsValue[fieldsKey].forEach(fieldsValueItem => {
          _modelsValue.push(this.getPostData(_field.fields, fieldsValueItem))
        })
        postData[fieldsKey] = _modelsValue
      } else if (_field && _field.type == 'date') {
        postData[fieldsKey] = moment(_value).format('YYYY-MM-DD')
      } else if (_field && _field.type == 'modelsSystemClass') {
        const _systemClasses = state.data.systemClasses
        const _systemClassIds = []
        const _systemSubclassIds = []
        _systemClasses.forEach(_systemClass => {
          _systemClass.system_subclasses.forEach(systemSubclass => {
            const hasValue = _value.find(value => {
              return value.id == systemSubclass.id
            })
            if (hasValue) {
              _systemSubclassIds.push(hasValue.id)
              _systemClassIds.push(_systemClass.id)
            }
          })
        })
        postData.system_classes = _systemClassIds
        postData[fieldsKey] = _systemSubclassIds
      } else {
        postData[fieldsKey] = _value
      }
    })
    return postData
  },
  getExtention(filename) {
    return /[.]/.exec(filename) ? /[^.]+$/.exec(filename) : undefined
  },
  getUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
    )
  },
  getShowFieldsFromApiShowFields(fieldsValue, fields, fieldsOrder) {
    for (key in fields) {
      const _field = fields[key]
      if (_field.type == 'version') {
      }
    }
    return []
  }
}
