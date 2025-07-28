import moment from 'moment'
import store from '@/store'
import i18next from 'i18next'
import S_Wasa from '@/__reactnative_stone/services/wasa'

export default {
  fieldsOrder: [
    'license_template',
    'name',
    'license_type',
    'system_classes',
    'last_version.using_status',
    'last_version.license_status_number',
    'last_version.taker',
    'last_version.remind_date_radio',
    'last_version.remind_date'
  ],
  getFactoryId() {
    const state = store.getState()
    return state.data.currentFactory.id
  },

  getFields() {
    const _factoryId = this.getFactoryId()
    return {
      name: {
        label: i18next.t('證照名稱'),
        rules: 'required'
      },
      image: {
        type: 'image',
        uploadUrl: `factory/${_factoryId}/license_version/image`
      },
      license_type: {
        type: 'belongsto',
        label: i18next.t('類型'),
        nameKey: 'name',
        modelName: 'license_type',
        parentId: _factoryId
      },
      system_classes: {
        type: 'belongstomany'
      },
      system_subclasses: {
        type: 'belongstomany'
      },
      license_status_number: {
        label: i18next.t('辦理狀態'),
        type: 'radio',
        items: [
          { label: i18next.t('已核准'), value: 1 },
          { label: i18next.t('辦理中'), value: 0 }
        ]
      },
      using_status: {
        type: 'radio',
        label: i18next.t('使用狀態'),
        items: [
          { label: i18next.t('使用中'), value: 1 },
          { label: i18next.t('已停用'), value: 0 }
        ],
        defaultValue: 1
      },
      agents: {
        type: 'belongsto',
        label: i18next.t('代理人'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      },
      setup_license: {
        parentId: _factoryId,
        nameKey: 'name',
        type: 'belongsto',
        label: i18next.t('核定設置證照'),
        modelName: 'license',
        params: { license_type: 1 }
      },
      approval_letter: {
        type: 'text',
        label: i18next.t('核准函號'),
        placeholder: i18next.t('輸入')
      },
      valid_start_date: {
        type: 'date',
        label: i18next.t('有效起日'),
        rules: 'required'
      },
      valid_end_date: {
        type: 'date',
        label: i18next.t('有效迄日'),
        rules: 'required'
      },
      remind_date: {
        type: 'radio',
        items: [
          {
            label: `${i18next.t('系統自動設定')}（ ${i18next.t('建議法定展延期限前{number}天', { number: 32 })} ）`,
            value: moment().add(-32, 'days').format('YYYY-MM-DD')
          },
          { label: i18next.t('自訂提醒日'), value: 'remindDate' }
        ]
      },
      reminder: {
        type: 'user',
        label: i18next.t('管理者'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      },
      remark: {
        type: 'text',
        placeholder: i18next.t('輸入')
      },
      taker: {
        type: 'user',
        label: i18next.t('持有人'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      },
      license_template: {
        type: 'belongsto',
        label: i18next.t('類型'),
        nameKey: 'name',
        modelName: 'license_template',
        parentId: _factoryId
      },
      attaches: {
        type: 'filesAndImages',
        label: i18next.t('附件'),
        uploadUrl: `factory/${_factoryId}/license_version/image`
      }
    }
  },
  getStepSettings(fieldsValue) {
    return [
      {
        getShowFields(fieldsValue) {
          if (
            fieldsValue &&
            fieldsValue.license_type &&
            fieldsValue.license_type.show_fields
          ) {
            const _showfields = [
              'name',
              'remind_date_radio',
              ...getShowFieldsFromApiShowFields(
                fieldsValue.license_type.show_fields,
                this.getFields(),
                this.fieldsOrder
              )
            ]
          } else {
            return ['image', 'license_status_number', 'using_status', 'agents']
          }
        }
      }
    ]
  }
}
