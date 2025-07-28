import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import i18next from 'i18next'
import moment from 'moment'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_Checklist from '@/services/api/v1/checklist'
import S_ConstantData from '@/services/api/v1/constant_data'
import S_CheckListRecordDraft from '@/services/api/v1/checklist_record_draft'
import S_CheckListRecordAnswerDraft from '@/services/api/v1/checklist_record_answer_draft'

export default {
  async index({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/checklist_assignment`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams(),
      }
    })
  },
  async indexAuth({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/auth/checklist_assignment`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams(),
      }
    })
  },
  async show({ params }) {
    const modelId = params.id
    return base.show({
      modelId: modelId,
      modelName: `v1/checklist_assignment`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexDoneAuth({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/auth/done/checklist_assignment`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async preload({ id, currentLang }) {
    const _data = {
      id: id
    }
    // 取得存於API的RiskLevel & Score
    const $_fetchConstantData = async () => {
      try {
        const _params = {
          model: 'checklist',
          for: 'app'
        }
        const res = await S_ConstantData.index({
          params: _params
        })
        _data.constantData = res.data
      } catch (e) {
        console.error(e);
      }
    }
    // FETCH DATA
    const $_fetchApi = async () => {
      try {
        const _params = {
          id: id,
          lang: currentLang ? currentLang : undefined
        }
        const res = await this.show({
          params: _params
        })
        _data.assignment = res
        if (res.checklist) {
          const _checklistDetail = await S_Checklist.show({
            modelId: res.checklist.id
          })
          if (_checklistDetail &&
            _checklistDetail.factory_tags &&
            _checklistDetail.factory_tags.length > 0) {
            _data.checklist = _checklistDetail
          }
          const _params = {
            checklist_assignment: id,
            checklist_version_id: res.checklist_version.id,
            schedule_setting_id: res.general_schedule_setting.id,
            checklist_record_draft: undefined,
            get_all: 1
          }
          // console.log(_params, 'IndexByScheduleSetting Params');
          const _checklistQuestionVersion = await S_CheckListQuestion.IndexByScheduleSetting({
            params: _params
          })
          // VALIDATE CAN RECORD OR NOT
          let _validateNoNeedToCheck = S_CheckListQuestion.validateNoNeedToCheck(_checklistQuestionVersion.data)
          // FORMATTED FOR VIEW
          let _formattedQuestions = await S_CheckListQuestion.formattedQuestion001(_checklistQuestionVersion.data)
          _data.questions = _formattedQuestions
        }
      } catch (e) {
        console.error(e, 'e');
      }
    }
    await $_fetchConstantData()
    await $_fetchApi()
    return _data
  },
  async preloadDraft({
    _checklistId,
    draftId,
    versionId = null,
    currentFactory
  }) {
    const _data = {
      id: draftId
    }
    const $_fetchModel = async () => {
      try {
        const res = await S_Checklist.show({
          modelId: _checklistId
        })
        _data.assignment = res
        const _params = {}
        if (versionId) {
          _params.checklist_version_id = versionId
        } else if (res) {
          _params.get_all = 1,
            _params.checklists = res.id,
            _params.checklist_version_id = res.last_version.id
        }
        // 取得題目
        const _questions = await S_CheckListQuestion.indexV2({ params: _params })
        // FORMATTED FOR VIEW
        const _formattedQuestions = await S_CheckListQuestion.formattedQuestion002(_questions.data)
        _data.questions = _formattedQuestions
        // 有無草稿
        if (draftId) {
          try {
            // 介紹頁覆核者
            const _checklistRecordDraft = await S_CheckListRecordDraft.showDraft({ draftId: draftId })
            _data.reviewers = _checklistRecordDraft.reviewers
            // 答題過的草稿答案
            const _params = {
              checklist_record_draft: _checklistRecordDraft.id,
              factory: currentFactory.id
            }
            const _checklistRecordAnswerDraft = await S_CheckListRecordAnswerDraft.index({ params: _params })
            // FORMATTED FOR TEMP CHECKLIST
            let _formattedQuestionsWithDraft = await S_CheckListQuestion.formattedQuestionFromTempDraft003(_checklistRecordAnswerDraft.data, _formattedQuestions)
            _data.questions = _formattedQuestionsWithDraft
          } catch (e) {
            console.error(e);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    await $_fetchModel()
    return _data
  }
}
