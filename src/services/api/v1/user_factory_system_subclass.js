import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async create({ parentId, data }) {
    return base.create({
      parentId: parentId,
      parentName: 'user',
      modelName: 'user_factory_system_subclass',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'user_factory_system_subclass',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  }
}
