import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index({ params }) {
    return base.index({
      modelName: 'license_type',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: params
    })
  },
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license_type',
      modelId: modelId,
    })
  },
}
