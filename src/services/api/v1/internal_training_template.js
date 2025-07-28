import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index({ params }) {
    return base.index({
      modelName: 'internal_training_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        system_subclasses: params.system_subclasses === "" ? 'null' : params.system_subclasses, // 250602-issue
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'internal_training_template',
      params: S_Processor.getFactoryParams(),
    })
  },
}
