import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_tag',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexV2({ params }) {
    return base.index({
      preUrl: `v2/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_tag',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'v1/factory_tag',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async create({ data }) {
    const res = await base.create({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_tag',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async update({ data }) {
    const tagId = data.id
    const res = await base.patch({
      modelName: `v1/factory_tag/${tagId}`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'v1/factory_tag',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async updateActTag({ params }) {
    const actId = params.id
    const res = await base.patch({
      modelName: `${S_Processor.getFactoryPreUrl()}/act/${actId}/update/factory_tags`,
      data: {
        ...S_Processor.getFactoryParams(),
        ...params
      }
    })
    return res
  },
}