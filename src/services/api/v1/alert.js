import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'alert',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async currentAddIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'alert/current_add',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'alert',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
      callback: true
    })
  },
  setAlertContent(data) {
    if (data && data.from && data.payload) {
      if (data.from === 'event') {
        return {
          id: data.payload.id,
          title: '[' + i18next.t(data.payload.event_type.name) + '] ' + data.payload.name,
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content:
              i18next.t(data.payload.event_type.name) +
              i18next.t('已發生，請通知負責人盡快處理此事件。'),
            attaches: data.payload.attaches
          }
        }
      } else if (data.from === 'exit_checklist') {
        return {
          //進場尚未復歸
          id: data.payload.id,
          title:
            '[' + i18next.t('進場尚未復歸') + '] ' +
            data.payload.contractor.name +
            '-' +
            data.payload.task_content,
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content: i18next.t('此進場作業尚未復歸，詢問相關負責人，瞭解收工檢查狀況。'),
            attaches: []
          }
        }
      } else if (data.from === 'contractor_enter_record') {
        const contractorName = data.payload.contractor
          ? data.payload.contractor.name
          : ''
        return {
          //進場尚未復歸
          id: data.payload.id,
          enterAssignmentDate: moment(data.created_at).format('YYYY-MM-DD'),
          title:
            `[${i18next.t('進場尚未檢查')}]` +
            contractorName +
            '-' +
            data.payload.task_content,
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content: i18next.t('此進場作業尚未收工檢查，通知相關負責人盡快進行收工檢查。'),
            attaches: []
          }
        }
      } else if (data.from === 'contractor_license') {
        const contractorName = data.payload.contractor
          ? data.payload.contractor.name
          : ''
        return {
          //進場尚未復歸
          alertId: data.id,
          contractorId: data.payload.contractor.id,
          id: data.payload.id,
          title:
            `[${i18next.t('承攬商資格到期')}]` + contractorName + '-' + data.payload.name,
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content: i18next.t('此承攬商資格證已到期未辦理，通知相關負責人盡快辦理。'),
            attaches: []
          }
        }
      } else if (data.from === 'license') {
        if (data.type === 'valid_end_date') {
          return {
            //證照有效迄日當日
            id: data.payload.id,
            title: `[${i18next.t('證照到期')}]` + data.payload.name,
            type: data.from,
            subType: data.type,
            info: {
              title: i18next.t('警示說明'),
              content: i18next.t('此證照已到期，通知相關負責人盡快辦理。'),
              attaches: []
            }
          }
        } else if (data.type === 'remind_date') {
          return {
            //證照提醒日
            id: data.payload.id,
            title: `[${i18next.t('證照續辦提醒')}]` + data.payload.name,
            type: data.from,
            subType: data.type,
            info: {
              title: i18next.t('警示說明'),
              content: i18next.t('此證照已屆續辦提醒，通知相關負責人盡快辦理。'),
              attaches: []
            }
          }
        } else {
          return {
            //其他證照
            id: data.payload && data.payload.contractor ? data.payload.contractor.id : null,
            title: `[${i18next.t('證照法定展延期限')}]` + data.payload.name,
            type: data.from,
            subType: data.type,
            info: {
              title: i18next.t('警示說明'),
              content: i18next.t('此證照已屆法定展延期限，通知相關負責人盡快辦理。'),
              attaches: []
            }
          }
        }
      } else if (data.from === 'checklist_record') {
        return {
          //點檢不合規
          id: data.payload.id,
          level: data.payload.risk_level,
          title:
            `[${i18next.t('點檢')}]` +
            data.payload.name +
            `(${i18next.t('平均合規率')}` +
            data.payload.pass_rate +
            `%)${i18next.t('結果')}-` +
            this.getRecordResult(data.payload.risk_level),
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content: i18next.t(
              '此點檢表結果為{risk}，平均合規率為{pass_rate}%，檢視以下異常題目，通知相關人員盡快改善不合規的部分。',
              {
                risk: this.getRecordResult(data.payload.risk_level),
                pass_rate: data.payload.pass_rate,
              }
            ),
            attaches: []
          }
        }
      } else if (data.from === 'audit_record') {
        return {
          //稽核不合規
          id: data.payload.id,
          level: data.payload.risk_level,
          title:
            `[${i18next.t('稽核')}]` +
            data.payload.name +
            `${i18next.t('結果')}-` +
            this.getRecordResult(data.payload.risk_level),
          type: data.from,
          info: {
            title: i18next.t('警示說明'),
            content:
              i18next.t(
                '此稽核表結果為{risk_level}，檢視以下異常題目，通知相關人員盡快改善不合規的部分。',
                { risk_level: this.getRecordResult(data.payload.risk_level) }
              ),
            attaches: []
          }
        }
      } else {
        return {}
      }
    } else if (data && data.id && data.event_type && data.attaches) {
      return {
        id: data.id,
        title: '[' + i18next.t(data.event_type.name) + '] ' + data.name,
        info: {
          title: i18next.t('警示說明'),
          content:
            data.event_type.name + i18next.t('已發生，請通知負責人盡快處理此事件。'),
          attaches: data.attaches ? data.attaches : []
        }
      }
    } else {
      return
    }
  },
  getRecordResult(level) {
    if (level == 23) {
      return '高風險'
    } else if (level == 22) {
      return '中風險'
    } else if (level == 21) {
      return '輕風險'
    } else {
      return ''
    }
  },
  async solveAlert({ alertId }) {
    const _data = {
      ...S_Processor.getFactoryParams()
    }
    const res = await base.create({
      parentName: 'alert',
      parentId: alertId,
      modelName: 'solve',
      data: _data
    })
    return res
  },
  async unSolveAlert({ alertId }) {
    const _data = {
      ...S_Processor.getFactoryParams()
    }
    const res = await base.create({
      parentName: 'alert',
      parentId: alertId,
      modelName: 'unsolve',
      data: _data
    })
    return res
  },
  async tabIndex({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/alert/tab_index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
}
