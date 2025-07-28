import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async delete({ modelId }) {
    return base.delete({
      modelId: modelId,
      modelName: `internal_training_group`,
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: `internal_training_group`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      }
    })
  },
  async create({ params }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `internal_training_group`,
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ params }) {
    return base.update({
      modelName: 'internal_training_group',
      modelId: params.id,
      data: {
        ...params,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'internal_training_group',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
}
