import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user_checklist',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getCheckListDraftId(allChecklist, checklistId, questions) {
    let _draftId
    allChecklist.forEach(checklist => {
      if (checklist.id === checklistId) {
        if (checklist.record_draft) {
          _draftId = checklist.record_draft.id
        }
      }
    })
    return _draftId
  },
  getFormattedDraft(draft) {
    const _draft = []
    if (draft.content) {
      draft.content.forEach(question => {
        const _data = {
          effects: question.effects ? question.effects : [],
          risk_level: question.answer.risk_level,
          score: question.answer.score,
          ...question.question,
          ...question.answer
        }
        _draft.push(_data)
      })
    }
    return _draft
  }
}
