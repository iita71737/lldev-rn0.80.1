import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import { useSelector } from 'react-redux'
import gColor from '@/__reactnative_stone/global/color'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_effect',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create({ data }) {
    const res = await base.create({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_effect',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async update({ data }) {
    const res = await base.patch({
      modelName: `v1/factory_effect/${data.factory_effects}`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'v1/factory_effect',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
}