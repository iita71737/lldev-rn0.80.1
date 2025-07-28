import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import time from '@/services/base/time'
import store from '@/store'
import moment from 'moment'
import S_Processor from '@/services/app/processor'

export default {
  async rankingIndex({ params }) {
    const _params = {
      ...S_Processor.getFactoryParams(),
      ...params
    }
    let preUrl = ''
    if (params.type === 'checklist') {
      preUrl = 'checklist_question/record'
    } else if (params.type === 'checklist-template') {
      preUrl = 'checklist_question_template/record'
    } else if (params.type === 'audit') {
      preUrl = 'audit_question/record'
    } else if (params.type === 'audit-template') {
      preUrl = 'audit_question_template/record'
    }
    return base.index({
      params: _params,
      preUrl: preUrl,
      modelName: 'ranking'
    })
  },
  async rankingVersionIndex({ params }, type, quesId) {
    const currentFactory = store.state.app.factory
    const _params = {
      factory: currentFactory.id,
      ...params
    }
    let preUrl = ''
    if (type === 'checklist') {
      preUrl = 'checklist_question_version/record'
      _params.checklist_question = quesId
    } else if (type === 'checklist-template') {
      preUrl = 'cklist_ques_tmp_ver/record'
      _params.checklist_question_template = quesId
    } else if (type === 'audit') {
      preUrl = 'audit_question_version/record'
      _params.audit_question = quesId
    } else if (type === 'audit-template') {
      preUrl = 'audit_question_template_version/record'
      _params.audit_question_template = quesId
    }
    return base.index({
      params: _params,
      preUrl: preUrl,
      modelName: 'ranking',
      pagination: false
    })
  },
  getRankingParams(type, datas) {
    let params = {}
    let systemClasses = []
    if (datas.systemclass.selectedMenuItem === 'all') {
      systemClasses = datas.systemclass.menuItems
        .filter(item => {
          return item.id !== 'all'
        })
        .map(item => item.id)
        .join(',')
    } else {
      systemClasses = datas.systemclass.selectedMenuItem
    }
    let startTime = ''
    let endTime = ''
    if (datas.durationDropdown.selectedMenuItem === '1') {
      endTime = time.getTimeFormat(new Date(), 'YYYY-MM-DD')
      startTime = time.getTimeFormat(
        moment(endTime).subtract(1, 'years'),
        'YYYY-MM-DD'
      )
    } else if (
      datas.durationDropdown.selectedMenuItem === 'custom' &&
      datas.durationDropdown.durationDate &&
      datas.durationDropdown.durationDate.end
    ) {
      endTime = time.getTimeFormat(
        datas.durationDropdown.durationDate.end,
        'YYYY-MM-DD'
      )
      startTime = time.getTimeFormat(
        datas.durationDropdown.durationDate.start,
        'YYYY-MM-DD'
      )
    } else {
      endTime = time.getTimeFormat(new Date(), 'YYYY-MM-DD')
      startTime = time.getTimeFormat(
        moment(endTime).subtract(1, 'years'),
        'YYYY-MM-DD'
      )
    }
    if (type.includes('checklist')) {
      params = {
        page: datas.page.ingPage,
        frequency: datas.tabs.selectedTabId,
        start_time: startTime,
        end_time: endTime,
        system_classes: systemClasses
      }
    } else {
      params = {
        page: datas.page.ingPage,
        start_time: startTime,
        end_time: endTime,
        system_classes: systemClasses
      }
    }
    return params
  },
  getRankingFetchData(type, datas, ingPage) {
    if (type.includes('checklist')) {
      const _datas = datas.map((data, dataIndex) => {
        let index = (ingPage - 1) * 5 + dataIndex + 1
        return {
          index: index.toString(),
          id: data.id,
          title: data.title,
          num: data.checklist_record_answers_count,
          value: type
        }
      })
      return _datas
    } else if (type.includes('audit')) {
      const _datas = datas.map((data, dataIndex) => {
        let index = (ingPage - 1) * 5 + dataIndex + 1
        return {
          index: index,
          id: data.id,
          title: data.title,
          num: data.audit_record_answers_count,
          value: type
        }
      })
      return _datas
    }
  },
  getRankingVersionFetchData(type, datas) {
    if (type.includes('checklist')) {
      const _datas = datas.map(data => {
        return {
          id: data.id,
          title: data.title,
          number: data.checklist_record_answers_count
        }
      })
      return _datas
    } else if (type.includes('audit')) {
      const _datas = datas.map(data => {
        return {
          id: data.id,
          title: data.title,
          number: data.audit_record_answers_count
        }
      })
      return _datas
    }
  },
  getRankingVersionParams(type, datas) {
    let params = {}
    let startTime = ''
    let endTime = ''
    if (datas.durationDropdown.selectedMenuItem === '1') {
      endTime = time.getTimeFormat(new Date(), 'YYYY-MM-DD')
      startTime = time.getTimeFormat(
        moment(endTime).subtract(1, 'years'),
        'YYYY-MM-DD'
      )
    } else if (
      datas.durationDropdown.selectedMenuItem === 'custom' &&
      datas.durationDropdown.durationDate &&
      datas.durationDropdown.durationDate.end
    ) {
      endTime = time.getTimeFormat(
        datas.durationDropdown.durationDate.end,
        'YYYY-MM-DD'
      )
      startTime = time.getTimeFormat(
        datas.durationDropdown.durationDate.start,
        'YYYY-MM-DD'
      )
    } else {
      endTime = time.getTimeFormat(new Date(), 'YYYY-MM-DD')
      startTime = time.getTimeFormat(
        moment(endTime).subtract(1, 'years'),
        'YYYY-MM-DD'
      )
    }
    if (type.includes('checklist')) {
      params = {
        start_time: startTime,
        end_time: endTime
      }
    } else {
      params = {
        start_time: startTime,
        end_time: endTime
      }
    }
    return params
  }
}
