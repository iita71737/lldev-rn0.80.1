import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'll_broadcast',
      params: {
        ...params,
        // ...S_Processor.getFactoryParams(), // deprecated
        // ...S_Processor.getOrganizationParams()  // deprecated   
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'll_broadcast',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  }
}