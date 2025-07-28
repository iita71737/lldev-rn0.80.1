import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const _params = {
      ...params
    }
    return base.index({
      modelName: 'contractor_customed_type',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: _params
    })
  },
  async create(factoryId, data) {
    const _data = {
      factory: S_Processor.getFactoryParams().factory,
      ...data
    }
    const res = await base.create({
      parentName: 'factory',
      parentId: factoryId,
      modelName: 'contractor',
      data: _data
    })
    return res
  },
  async update(typeId, data) {
    const _data = {
      factory: S_Processor.getFactoryParams().factory,
      ...data
    }
    const res = await base.update({
      url: `factory/${factory.id}/contractor_customed_type/${typeId}`,
      data: _data
    })
    return res
  },
  async show(typeId, params) {
    const _params = {
      factory: S_Processor.getFactoryParams().factory,
      ...params
    }
    const res = await base.show({
      url: `factory/${currentFactory.id}/contractor_customed_type/${typeId}`,
      params: _params
    })
    return res
  },
  async delete(typeId, params) {
    const _params = {
      factory: S_Processor.getFactoryParams().factory,
      ...params
    }
    const res = await base.delete({
      url: `factory/${factory.id}/contractor_customed_type/${typeId}`,
      params: _params
    })
    return res
  }
}
