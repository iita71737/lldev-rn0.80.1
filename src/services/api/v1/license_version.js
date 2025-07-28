import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const _licenseId = params.licenseId
    return base.index({
      modelName: 'license_version',
      parentId: _licenseId,
      parentName: 'license',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: params
    })
  },
  async create({ parentId, modelId, data }) {
    return base.create({
      modelId: modelId,
      modelName: 'license_version',
      parentId: parentId,
      parentName: 'license',
      preUrl: S_Processor.getFactoryPreUrl(),
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'license_version',
      modelId: modelId,
      preUrl: S_Processor.getFactoryPreUrl()
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'license_version',
      modelId: modelId,
      preUrl: S_Processor.getFactoryPreUrl(),
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
