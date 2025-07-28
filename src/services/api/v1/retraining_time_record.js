import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async delete({ modelId }) {
    return base.delete({
      modelId: modelId,
      modelName: `retraining_time_record`,
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async index({ params }) {
    return base.index({
      modelName: `license_version/${params.license_version}/retraining_time_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create({ params }) {
    const _id = params.id
    return base.create({
      modelName: `license_version/${_id}/retraining_time_record`,
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ params }) {
    return base.update({
      modelName: 'retraining_time_record',
      modelId: params.id,
      data: {
        ...params,
        ...S_Processor.getFactoryData()
      }
    })
  },
}
