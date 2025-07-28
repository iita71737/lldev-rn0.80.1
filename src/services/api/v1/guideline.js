import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: 'guideline',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'guideline',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async addMyCollect(guideline_id) {
    base.create({
      modelName: `collect/guideline/${guideline_id}`,
      data: {
        ...S_Processor.getFactoryParams()
      },
    })
  },
  async removeMyCollect(guideline_id) {
    base.create({
      modelName: `uncollect/guideline/${guideline_id}`,
      data: {
        ...S_Processor.getFactoryParams()
      },
    })
  },
  async authCollectIndex({ params }) {
    return base.index({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: `collect/guideline`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}