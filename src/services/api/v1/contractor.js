import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'contractor',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'contractor',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
      callback: true
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async delete(contractorId) {
    const _params = {
      ...S_Processor.getFactoryData()
    }
    const res = await base.delete({
      modelName: 'contractor',
      modelId: contractorId,
      params: _params
    })
    return res
  },
  async update({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    const res = await base.update({
      modelName: 'contractor',
      modelId: modelId,
      data: _data
    })
    return res
  },
  async remarkUpdate({ id, remark }) {
    const res = await base.patch({
      modelName: `contractor/${id}/remark`,
      data: {
        ...S_Processor.getFactoryParams(),
        remark: remark
      }
    })
    return res
  },
  async tabIndex({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/contractor/tab_index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
