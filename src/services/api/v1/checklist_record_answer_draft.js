import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const draftId = params.checklist_record_draft
    const res = await base.index({
      modelName: `checklist_record_draft/${draftId}/checklist_record_answer_draft`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
}
