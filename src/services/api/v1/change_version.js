import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const parentId = params.changeId
    return base.index({
      parentId: parentId,
      parentName: 'change',
      modelName: 'change_version',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      params: S_Processor.getFactoryParams(),
      modelName: 'change_version',
      modelId: modelId
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'change_version',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async create({ data, parentId }) {
    const _data = {
      version_number: 1,
      expired_date: data.expired_date,
      attaches: data.attaches,
      system_classes: data.system_classes,
      system_subclasses: data.system_subclasses,
      owner: data.owner,
      ...S_Processor.getFactoryData()
    }
    return base.create({
      modelName: 'change_version',
      data: _data,
      parentId: parentId,
      parentName: 'change'
    })
  }
}
