import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
      modelName: `general_schedule_setting`,
      params: {
        ...S_Processor.getFactoryParams(),
        ...params,
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: `v1/general_schedule_setting`,
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
    })
  }
  // async create({ params }) {
  //   return base.create({
  //     preUrl: `v1/${S_Processor.getFactoryPreUrl()}`,
  //     modelName: 'general_record',
  //     data: {
  //       ...S_Processor.getFactoryParams(),
  //       ...params,
  //     }
  //   })
  // },
  // async update({ params, modelId }) {
  //   return base.update({
  //     preUrl: `v1`,
  //     modelId: modelId,
  //     modelName: 'general_record',
  //     data: {
  //       ...S_Processor.getFactoryData(),
  //       ...params,
  //     },
  //   })
  // },
  // async delete({ modelId }) {
  //   return base.delete({
  //     preUrl: `v1`,
  //     modelId: modelId,
  //     modelName: 'general_record',
  //     params: S_Processor.getFactoryParams(),
  //   })
  // },
}