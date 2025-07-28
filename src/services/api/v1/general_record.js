import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async create({ params }) {
    return base.create({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'general_record',
      data: {
        ...S_Processor.getFactoryParams(),
        ...params,
      }
    })
  },
  async indexByChecklist({ params }) {
    return base.index({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: `checklist/${params.checklist_id}`,
      params: {
        ...S_Processor.getFactoryParams(),
        ...params,
      }
    })
  },
  async patch({ params, modelId }) {
    return base.patch({
      preUrl: `v1`,
      modelName: 'general_record',
      modelId: modelId,
      data: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    })
  },
  async delete({ modelId }) {
    return base.delete({
      preUrl: `v1`,
      modelId: modelId,
      modelName: 'general_record',
      params: S_Processor.getFactoryParams(),
    })
  },
}