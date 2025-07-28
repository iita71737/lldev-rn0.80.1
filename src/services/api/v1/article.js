import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ parentId, params }) {
    return base.index({
      modelName: 'article',
      // params: params,
      parentId: parentId,
      parentName: 'act_version',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      params: S_Processor.getFactoryParams(),
      modelName: 'article',
      modelId: modelId
    })
  }
}
