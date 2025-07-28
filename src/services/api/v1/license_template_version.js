import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const _params = {
      ...params
    }
    return base.index({
      parentName: 'license_template',
      parentId: _params.license_template,
      modelName: 'license_template_version',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license_template_version',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  }
}
