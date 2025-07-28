import React from 'react'
import { Alert } from 'react-native'
import { WsStateFormView, WsText, WsLoading } from '@/components'
import S_License from '@/services/api/v1/license'
import S_LicenseVersion from '@/services/api/v1/license_version'
import { useSelector } from 'react-redux'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { setCurrentLicense, setCurrentEditLicense } from '@/store/data'

const LicenseUpdateVersion = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { id, versionId } = route.params

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentLicense = useSelector(state => state.data.currentLicense)
  const currentEditLicense = useSelector(state => state.data.currentEditLicense)

  // State
  const fields = {
    license_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'license_type',
      parentId: factory && factory.id,
      editable: false,
      onPress: () => {
        navigation.navigate('LicenseShow')
      },
      rules: 'required'
    },
    name: {
      label: t('證照名稱'),
      rules: 'required'
    },
    image: {
      type: 'image',
      uploadUrl: factory && factory.id ? `factory/${factory.id}/license_version/image` : null,
      text: t('上傳'),
      icon: 'ws-outline-license'
    },
    taker: {
      type: 'belongsto',
      label: t('持有人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    approval_letter: {
      type: 'text',
      label: t('核准函號'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    license_status_number: {
      label: t('辦理狀態'),
      type: 'radio',
      items: [
        { label: t('已核准'), value: 1 },
        { label: t('辦理中'), value: 0 }
      ],
      rules: 'required'
    },
    using_status: {
      type: 'radio',
      label: t('使用狀態'),
      items: [
        { label: t('使用中'), value: 1 },
        { label: t('已停用'), value: 0 }
      ],
      defaultValue: 1,
      rules: 'required'
    },
    valid_start_date: {
      type: 'date',
      label: t('有效起日'),
      rules: 'required'
    },
    valid_end_date_checkbox: {
      checkboxOnLabelLeft: true,
      type: 'checkbox',
      label: `${t('是否為')} ${t('永久效期')}`,
      updateValueOnCheckboxChange: ($event, value, fields) => {
        if ($event) {
          delete value.valid_end_date
          delete fields.remind_date_radio.rules
          delete fields.remind_date.rules
          delete fields.valid_end_date.rules
        } else if (fields) {
          ; (fields.valid_end_date.rules = 'required'),
            (fields.remind_date_radio.rules = 'required'),
            (fields.remind_date.rules = 'required')
        }
      },
      displayCheckedOrNot(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox) {
          return true
        } else {
          return false
        }
      }
    },
    valid_end_date: {
      type: 'date',
      label: t('有效迄日'),
      rules: 'required',
      getMinimumDate: fieldValue => {
        return fieldValue.valid_start_date
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox === false) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (event && value.statitory_extension_period) {
          const _day = moment(event)
            .add(-value.statitory_extension_period, 'days')
            .format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}）${_day}`
        } else if (event && value.recommend_notify_period) {
          const _day = moment(event)
            .add(-value.recommend_notify_period, 'days')
            .format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}）${_day}`
        }
        if (event && value.remind_date_radio === 1) {
          const _day =
            value.statitory_extension_period + value.recommend_notify_period
          return {
            remind_date: moment(event).add(-_day, 'days').format('YYYY-MM-DD')
          }
        }
      }
    },
    statitory_extension_period: {
      type: 'number'
    },
    recommend_notify_period: {
      type: 'number'
    },
    remind_date_radio: {
      defaultValue: 1,
      label: t('續辦提醒日期'),
      type: 'radio',
      items: [
        { label: t('系統自動設定（建議法定展延期前X天）'), value: 1 },
        { label: t('自訂提醒日'), value: 2 }
      ],
      updateValueOnChange: (event, value, field, fields) => {
        if (value.valid_end_date_checkbox === false) {
          field.rules = 'required'
        }
        if (event === 1) {
          const _valid_end_day = value.valid_end_date
          const _day =
            value.statitory_extension_period + value.recommend_notify_period
          const _remind_data = moment(_valid_end_day)
            .add(-_day, 'days')
            .format('YYYY-MM-DD')
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}）${_remind_data}`
          return {
            remind_date: _remind_data
          }
        } else {
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}）${value.remind_date}`
          return false
        }
      },
      displayCheck(fieldsValue) {
        if (fieldsValue.valid_end_date_checkbox === false) {
          return true
        } else {
          return false
        }
      },
      customizedItems: value => {
        if (
          value.statitory_extension_period &&
          value.recommend_notify_period &&
          value.remind_date_radio === 1
        ) {
          const _statitory_extension_period = value.statitory_extension_period
          const _recommend_notify_period = value.recommend_notify_period
          return [
            {
              label: `${t('系統自動設定')}（${t('建議法定展延期限前{number}天', { number: _recommend_notify_period })}）${value.remind_date}`,
              value: 1
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else if (
          value.recommend_notify_period &&
          value.remind_date_radio === 1
        ) {
          const _day = value.recommend_notify_period
          return [
            {
              label: `${t('系統自動設定')}（${t('建議法定展延期限前{number}天', { number: _day })}）${value.remind_date}`,
              value: 1
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else if (value.recommend_notify_period) {
          const _day = value.recommend_notify_period
          return [
            {
              label: t('系統自動設定（建議法定展延期前' + `${_day}` + '天）'),
              value: 1
            },
            { label: t('自訂提醒日'), value: 2 }
          ]
        } else {
          return [{ label: t('自訂提醒日'), value: 2 }]
        }
      }
    },
    remind_date: {
      type: 'date',
      label: t('自訂提醒日'),
      displayCheck(fieldsValue) {
        if (fieldsValue.remind_date_radio === 2) {
          return true
        } else {
          return false
        }
      },
      updateValueOnChange: (event, value, field, fields) => {
        if (value.valid_end_date_checkbox === false) {
          field.rules = 'required'
        }
        if (event) {
          fields.remind_date_radio.label = `${t('續辦提醒日期')}（${t('法定展延期限')}）${event}`
        }
      }
    },
    reminder: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    remark: {
      type: 'text',
      label: t('備註'),
      placeholder: '輸入'
    },
    attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: factory && factory.id ? `factory/${factory.id}/license_version/image` : null
    }
  }
  const [license, setLicense] = React.useState()
  const [loading, setLoading] = React.useState(false)

  // Services
  const $_fetchLicense = async () => {
    const res = await S_License.show({
      modelId: id
    })
    // 設定來自後台的法定展延期限天數
    let recommend_notify_period
    let statitory_extension_period
    const _license_template = { ...res.license_template }
    recommend_notify_period =
      _license_template.last_version.recommend_notify_period
    statitory_extension_period =
      _license_template.last_version.statitory_extension_period

    setLicense({
      license_type: res.license_type,
      name: res.name,
      image: res.last_version.image,
      license_status_number: res.last_version.license_status_number,
      using_status: res.last_version.using_status,
      agents: res.last_version.agents,
      setup_license: res.last_version.setup_license,
      approval_letter: res.last_version.approval_letter,
      valid_start_date: res.last_version.valid_start_date,
      valid_end_date: res.last_version.valid_end_date,
      remind_date: res.last_version.remind_date,
      remark: res.last_version.remark,
      taker: res.last_version.taker,
      attaches: res.last_version.attaches,
      reminder: res.last_version.reminder,
      valid_end_date_checkbox: res.last_version.valid_end_date ? false : true,
      recommend_notify_period: recommend_notify_period,
      statitory_extension_period: statitory_extension_period
    })
  }

  // Function
  const $_setFields = () => {
    let _fields = {}
    const _showFields = [
      'license_type',
      'license_template',
      'name',
      'image',
      'using_status',
      'license_status_number',
      'license_owner',
      'license_number',
      'approval_letter',
      'valid_start_date',
      'valid_end_date_checkbox',
      'valid_end_date',
      'remind_date_radio',
      'remind_date',
      'taker',
      'remark'
    ]
    if (license.license_type && license.license_type.show_fields) {
      _showFields.forEach(showField => {
        for (let key in fields) {
          if (key === showField) {
            _fields = {
              ..._fields,
              [key]: fields[key]
            }
          }
        }
      })
      return _fields
    } else {
      return fields
    }
  }

  const $_onChange = async $event => {
    const eventChangeData = { ...currentLicense, ...$event }
    setLicense(eventChangeData)
    store.dispatch(setCurrentEditLicense(eventChangeData))
  }

  const $_onSubmit = async $event => {
    setLoading(true)
    const _formattedValue = S_Wasa.getPostData(fields, $event)
    const eventData = {
      name: _formattedValue.name,
      taker: _formattedValue.taker,
      agents: _formattedValue.agents,
      reminder: _formattedValue.reminder ? _formattedValue.reminder : null,
      setup_license: _formattedValue.setup_license,
      license_status_number: _formattedValue.license_status_number,
      using_status: _formattedValue.using_status,
      license_number: _formattedValue.license_number,
      approval_letter: _formattedValue.approval_letter,
      trained_hours: _formattedValue.trained_hours,
      valid_start_date: _formattedValue.valid_start_date,
      valid_end_date: _formattedValue.valid_end_date,
      remind_date: _formattedValue.remind_date
        ? _formattedValue.remind_date
        : moment().add(-60, 'days').format('YYYY-MM-DD'),
      image: _formattedValue.image,
      attaches: _formattedValue.attaches,
      remark: _formattedValue.remark
    }
    $_postApiForLicense(eventData)
  }

  const $_postApiForLicense = async postData => {
    const version = await S_LicenseVersion.create({
      parentId: factory && factory.id,
      modelId: id,
      data: postData
    })

    const license = await S_License.update({
      modelId: id,
      data: postData
    })

    Promise.all([version, license])
      .then(store.dispatch(setCurrentLicense(currentEditLicense)))
      .then(res => {
        Alert.alert(t('更新成功'))
        navigation.navigate({
          name: 'LicenseShow',
          params: {
            id: res[1].id,
            reload: true
          }
        })
      })
      .catch(reason => {
        Alert.alert(t('更新失敗'))
        navigation.navigate({
          name: 'LicenseIndex'
        })
      })
  }

  React.useEffect(() => {
    $_fetchLicense()
    setLicense(currentLicense)
  }, [])

  React.useEffect(() => {
    if (license) {
      $_setFields()
    }
  }, [license, fields])

  // Render
  return (
    <>
      {loading ? (
        <WsLoading
          type="a"
          style={{
            flex: 1,
            backgroundColor: 'rgba(3,13,31,0.15)'
          }}
        />
      ) : (
        <>
          {license && (
            <WsStateFormView
              fields={$_setFields()}
              onChange={$_onChange}
              initValue={license}
              onSubmit={$_onSubmit}
            />
          )}
        </>
      )}
    </>
  )
}

export default LicenseUpdateVersion
