import moment from 'moment'
import store from '@/store'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'

export default {
  getFactoryId() {
    const state = store.getState()
    return state.data.currentFactory.id
  },
  getCurrentUserId() {
    const state = store.getState()
    if (!state) {
      return
    }
    return state.data.currentUser?.id
  },
  getFields(evaluatorId) {
    const _factoryId = this.getFactoryId()
    const _currentUserId = this.getCurrentUserId()
    if (_currentUserId === evaluatorId) {
      return {
        changeItemName: {
          type: 'text',
          info: 'true',
          style: {
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 20,
            letterSpace: 1
          }
        },
        changeItemDescription: {
          type: 'text',
          info: 'true',
          style: {
            fontSize: 14,
            lineHeight: 20,
            letterSpace: 1,
            color: $color.gray5d
          }
        },
        name: {
          type: 'text',
          info: 'true',
          style: {
            marginTop: 8,
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 24,
            letterSpace: 0
          }
        },
        approve_score: {
          stateStyle: {
            height: 64,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            shadowOpacity: 0.7,
            shadowOffset: {
              width: 4,
              height: 4
            }
          },
          type: 'toggleBtn',
          items: [
            {
              value: 16,
              label: i18next.t('無條件同意')
            },
            {
              value: 17,
              label: i18next.t('有條件同意')
            },
            {
              value: 18,
              label: i18next.t('不同意')
            }
          ]
        },
        description: {
          label: i18next.t('條件說明'),
          rules: 'required',
          displayCheck(fieldsValue) {
            if (
              fieldsValue?.description === 18 ||
              fieldsValue?.approve_score === 17
            ) {
              return true
            } else {
              return false
            }
          }
        },
        file_attaches: {
          type: 'Ll_filesAndImages',
          label: i18next.t('附件'),
          modelName: 'change_record_answer',
          displayCheck(fieldsValue) {
            if (
              fieldsValue.approve_score === 18 ||
              fieldsValue.approve_score === 17
            ) {
              return true
            } else {
              return false
            }
          }
        }
      }
    } else {
      return {
        changeItemName: {
          type: 'text',
          info: 'true',
          style: {
            fontWeight: '600',
            fontSize: 14,
            lineHeight: 20,
            letterSpace: 1
          }
        },
        changeItemDescription: {
          type: 'text',
          info: 'true',
          style: {
            fontSize: 14,
            lineHeight: 20,
            letterSpace: 1,
            color: $color.gray5d
          }
        },
        name: {
          type: 'text',
          info: 'true',
          style: {
            marginTop: 8,
            fontWeight: '600',
            fontSize: 18,
            lineHeight: 24,
            letterSpace: 0
          }
        },
        description: {
          label: i18next.t('條件說明'),
          rules: 'required',
          displayCheck(fieldsValue) {
            if (
              fieldsValue.approve_score === 18 ||
              fieldsValue.approve_score === 17
            ) {
              return true
            } else {
              return false
            }
          }
        },
        attaches: {
          type: 'filesAndImages',
          label: i18next.t('附件'),
          displayCheck(fieldsValue) {
            if (
              fieldsValue.approve_score === 18 ||
              fieldsValue.approve_score === 17
            ) {
              return true
            } else {
              return false
            }
          }
        }
      }
    }
  },
  getInitValue(value) {
    if (!value.answer) {
      return false
    }
    return {
      ...value,
      approve_score: value.answer.approve_score,
      description: value.answer.description,
      attaches: value.answer.attaches
    }
  }
}
