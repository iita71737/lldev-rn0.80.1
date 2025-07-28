import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user_factory_role',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ params }) {
    return base.show({
      preUrl: S_Processor.getOrganizationPreUrl(),
      modelName: 'user_role',
      params: {
        ...params,
        ...S_Processor.getOrganizationParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'user_role',
      modelId: modelId,
      params: S_Processor.getOrganizationParams()
    })
  },
  async IndexByFile({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user_factory_role/by_file/index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
