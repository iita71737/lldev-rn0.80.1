import moment from 'moment'
import store from '@/store'
import i18next from 'i18next'

export default {
  getFactoryId() {
    const state = store.getState()
    return state.data.currentFactory.id
  },
  getCurrentUser() {
    const state = store.getState()
    return state.stone_auth.currentUser
  },
  getFields() {
    const factoryId = this.getFactoryId()
    const currentUser = this.getCurrentUser()
    return {
      contact_person: {
        type: 'text',
        label: i18next.t('聯絡人姓名'),
        placeholder: i18next.t('輸入'),
        hasMarginTop: false,
        autoFocus: true,
        rules: 'required',
        defaultValue: currentUser.name
      },
      contact_way: {
        type: 'picker',
        label: i18next.t('聯絡方式'),
        rules: 'required',
        items: [
          { label: i18next.t('信箱'), value: 'email' },
          { label: i18next.t('手機'), value: 'tel' }
        ],
        updateValueOnChange: (event, value, field, fields) => {
          if (event === 'tel') {
            fields.tel.rules = 'required'
            delete fields.email.rules
          } else if (event === 'email') {
            fields.email.rules = 'required'
            delete fields.tel.rules
          }
        }
      },
      tel: {
        type: 'tel',
        label: i18next.t('手機號碼'),
        placeholder: i18next.t('輸入'),
        displayCheck(fieldsValue) {
          if (fieldsValue.contact_way == 'tel') {
            return true
          } else {
            return false
          }
        }
      },
      email: {
        type: 'email',
        label: i18next.t('信箱'),
        placeholder: i18next.t('輸入'),
        rules: 'email',
        displayCheck(fieldsValue) {
          if (fieldsValue.contact_way === 'email') {
            return true
          } else {
            return false
          }
        }
      },
      contact_for: {
        type: 'radio',
        label: i18next.t('詢問主旨'),
        rules: 'required',
        items: [
          { label: i18next.t('緊急法律協助'), value: 'legalAssistance' },
          { label: i18next.t('系統操作協助'), value: 'operationTutorial' }
        ]
      },
      remark: {
        textCounter: true,
        maxLength: 3000,
        rules: 'required',
        type: 'text',
        label: i18next.t('簡述'),
        placeholder: i18next.t('輸入'),
        multiline: true
      },
      attaches: {
        type: 'filesAndImages',
        label: i18next.t('附件'),
        uploadUrl: `factory/${factoryId}/sos_request/attach`
      }
    }
  }
}
