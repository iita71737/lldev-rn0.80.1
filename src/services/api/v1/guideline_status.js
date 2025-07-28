import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: 'guideline_status',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create({ data }) {
    const res = await base.create({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: 'guideline_status',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'guideline_status',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async update({ data }) {
    const res = await base.patch({
      modelName: `guideline_status/${data.guideline_status}`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'guideline_status',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
}