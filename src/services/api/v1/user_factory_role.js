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
  async show({ modelId }) {
    return base.show({
      modelName: 'user_factory_role',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user_factory_role',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'user_factory_role',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  getMySubClasses(currentUser, factoryId) {
    const _subClass = []
    if (currentUser.user_factory_system_subclasses) {
      currentUser.user_factory_system_subclasses.forEach(item => {
        if (item.factory.id === factoryId) {
          item.system_subclasses.forEach(subClass => {
            _subClass.push(subClass)
          })
        }
      })
    }
    return _subClass
  }
}
