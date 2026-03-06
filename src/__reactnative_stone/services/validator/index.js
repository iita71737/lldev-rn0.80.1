import validator from 'validator'
import gMessage from '@/__reactnative_stone/global/message'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default {
  validate(rulesObj, values) {

    const _erros = {}
    let _valid = true

    for (let fieldKey in rulesObj) {
      const _rules = rulesObj[fieldKey].split('|')
      const _value = values[fieldKey]

      const { valid, errors } = this.itemValidate(_rules, _value)
      if (!valid) {
        _valid = valid
        _erros[fieldKey] = errors
      }

      if (_rules == 'requiredAndCompare' && values && values.task_expired_at) {
        const { valid, errors } = this.itemValidate(_rules, _value, values.task_expired_at)
        if (!valid) {
          _valid = valid
          _erros[fieldKey] = errors
        } else if (valid == 'Alert') {
          _valid = valid
          _erros[fieldKey] = errors
        }
      } else if (_rules == 'requiredAndCompare' && values) {
        const { valid, errors } = this.itemValidate(_rules, _value, values.expired_at)
        _valid = valid
        _erros[fieldKey] = errors
      }
    }

    return {
      errors: _erros,
      isValid: _valid
    }
  },
  itemValidate(rules, value, _dateCompare = null) {
    const _errors = []
    let _valid = true
    rules.forEach(rule => {
      const { valid, error } = this.ruleValidate(rule, value, _dateCompare)

      if (!valid) {
        _valid = false
      }
      if (valid == 'Alert') {
        _valid = 'Alert'
      }
      if (error) {
        _errors.push(error)
      }
    })
    return {
      valid: _valid,
      errors: _errors
    }
  },
  getRuleName(rule) {
    if (!rule) {
      return rule
    }
    return rule.split(':')[0]
  },
  getRuleParam(rule) {
    return rule.split(':')[1]
  },
  getValueByPath(source, path) {
    if (!source || !path) {
      return undefined
    }
    return path.split('.').reduce((acc, key) => {
      if (acc == null) {
        return undefined
      }
      return acc[key]
    }, source)
  },
  isFilled(value) {
    if (value === undefined || value === null) {
      return false
    }
    if (typeof value === 'string') {
      return value.trim() !== ''
    }
    if (Array.isArray(value)) {
      return value.length > 0
    }
    if (typeof value === 'object') {
      if (value.id !== undefined && value.id !== null) {
        return String(value.id).trim() !== ''
      }
      return Object.keys(value).length > 0
    }
    return Boolean(value)
  },
  ruleValidate(rule, value, _dateCompare = null) {
    let _error
    let _valid
    const _value = JSON.stringify(value)
    const ruleName = this.getRuleName(rule)

    if (ruleName == 'required') {
      if (value === undefined || value === '' || (value && value.length == 0)) {
        _valid = false
      } else {
        _valid = !validator.isEmpty(_value, {
          ignore_whitespace: true
        })
      }
      if (!_valid) {
        _error = gMessage['this field is required.']
      }
    } else if (ruleName == 'multi_required') {
      if (
        typeof value !== 'object' || // 确保 value 是对象
        !value || // 检查 value 是否为 null 或 undefined
        value.hours === undefined || value.hours === '' || // 检查 hours 是否有效
        value.years === undefined || value.years === '' // 检查 years 是否有效
      ) {
        _valid = false;
      } else {
        _valid = !validator.isEmpty(`${value.hours}`, { ignore_whitespace: true }) &&
          !validator.isEmpty(`${value.years}`, { ignore_whitespace: true });
      }
      if (!_valid) {
        _error = gMessage['this field is required.'];
      }
    } else if (ruleName == 'requiredAndCompare') {
      if (_dateCompare) {
        const _dateCompareFormat = moment(_dateCompare).utc()
        if (value === undefined || value === '') {
          _error = gMessage['this field is required.']
          _valid = false
        } else {
          _valid = !validator.isEmpty(_value, {
            ignore_whitespace: true
          })
        }
        if (value && _dateCompareFormat && _dateCompareFormat.diff(value, 'days') < 0) {
          _valid = 'Alert'
          _error = gMessage['this expired date is exceed deadline.']
        } else {
          // 待辦期限日不超過任務到期日 
          _valid = 'Alert'
        }
      } else {
        // 未填寫任務到期日
        _error = gMessage['this field is required.']
        _valid = false
      }
    } else if (ruleName == 'email') {
      if (value) {
        _valid = validator.isEmail(value)
      }
      if (!_valid) {
        _error = gMessage['incorrect mail format.']
      }
    } else if (ruleName == 'min') {
      const param = this.getRuleParam(rule)
      _valid = parseFloat(value) >= parseFloat(param) ? true : false
      if (!_valid) {
        _error = gMessage['smaller than min.']
      }
    } else if (ruleName == 'max') {
      const param = this.getRuleParam(rule)
      _valid = parseFloat(value) <= parseFloat(param) ? true : false
      if (!_valid) {
        _error = gMessage['bigger than max.']
      }
    } else if (ruleName == 'at_least') {
      if (!value || (value && value.length === 0)) {
        _error = gMessage['Fill in at least one.']
      }
      if (value && value.length > 0) {
        _valid = true
      }
    } else if (ruleName == 'sub_task_taker_required') {
      if (!Array.isArray(value) || value.length === 0) {
        _valid = true
      } else {
        const _allSubTaskHasTaker = value.every(item => {
          if (!item || !item.taker) {
            return false
          }
          if (typeof item.taker === 'string') {
            return item.taker.trim() !== ''
          }
          if (typeof item.taker === 'object') {
            if (item.taker.id !== undefined && item.taker.id !== null) {
              return String(item.taker.id).trim() !== ''
            }
            return Object.keys(item.taker).length > 0
          }
          return Boolean(item.taker)
        })
        _valid = _allSubTaskHasTaker
        if (!_valid) {
          _error = gMessage['this field is required.']
        }
      }
    } else if (ruleName == 'models_fields_required') {
      const _ruleParam = this.getRuleParam(rule)
      const _requiredPaths = _ruleParam
        ? _ruleParam.split(',').map(_path => _path.trim()).filter(Boolean)
        : []
      if (!Array.isArray(value) || value.length === 0 || _requiredPaths.length === 0) {
        _valid = true
      } else {
        _valid = value.every(item => {
          return _requiredPaths.every(path => {
            const _fieldValue = this.getValueByPath(item, path)
            return this.isFilled(_fieldValue)
          })
        })
        if (!_valid) {
          if (_requiredPaths.length === 1 && _requiredPaths[0] === 'taker') {
            _error = undefined
          } else {
            _error = gMessage['this field is required.']
          }
        }
      }
    } else if (ruleName == 'isMobilePhone') {
      if (value) {
        _valid = validator.isMobilePhone(value, ['zh-TW', 'zh-CN'], { strictMode: false })
      }
      if (!_valid) {
        _error = gMessage['incorrect phone number format.']
      }
    } else if (ruleName == 'isTelephone') {
      // 台灣市話格式
      const phoneNumberRegex = /^0\d{1,2}\d{6,8}$/
      if (value) {
        _valid = phoneNumberRegex.test(value)
      }
      if (!_valid) {
        _error = gMessage['incorrect telephone format.']
      }
    } else if (ruleName == 'allMarkSetting') {
      _valid = true
      // ✅ 新增：meeting_template 的完整性檢查
      // 若 value[0] 同時有 word_fields 與 meeting_template_items，必須長度相等
      if (Array.isArray(value) && value.length > 0) {
        const first = value[0]
        const wf = first?.word_fields
        const items = first?.meeting_template_items
        if (Array.isArray(wf) && Array.isArray(items)) {
          _valid = false
          // 你要的規則：兩者長度必須相等才算 valid
          if (wf.length != items.length) {
            _valid = false
          } else if (wf.length == items.length) {
            _valid = true
          }
        }
      }
    }
    return {
      valid: _valid,
      error: _error
    }
  },
  getRulesObjectFromFields(fields, fieldsValue) {
    const _rules = {}
    for (let key in fields) {
      const _field = fields[key]
      if (_field.rules) {
        // 如果有 _field.displayCheck，判斷它的返回值是否為 true
        if (typeof _field.displayCheck === 'function') {
          if (_field.displayCheck(fieldsValue)) {
            _rules[key] = _field.rules;
          }
        } else {
          // 如果沒有 _field.displayCheck，直接添加 _field.rules
          _rules[key] = _field.rules;
        }
      }
    }
    return _rules
  }
}
