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
    if (rule.includes('max')) {
      return 'max'
    } else if (rule.includes('min')) {
      return 'min'
    } else {
      return rule
    }
  },
  getRuleParam(rule) {
    return rule.split(':')[1]
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
