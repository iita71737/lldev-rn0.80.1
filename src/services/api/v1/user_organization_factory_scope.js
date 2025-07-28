import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `user/${params.user?.id}/user_organization_factory_scope`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  // async show({ modelId }) {
  //   return base.show({
  //     modelName: 'user_factory_role',
  //     modelId: modelId,
  //     params: S_Processor.getFactoryParams()
  //   })
  // },
  // async create({ data }) {
  //   return base.create({
  //     preUrl: S_Processor.getFactoryPreUrl(),
  //     modelName: 'user_factory_role',
  //     data: {
  //       ...data,
  //       ...S_Processor.getFactoryData()
  //     }
  //   })
  // },
  // async update({ modelId, data }) {
  //   return base.update({
  //     preUrl: S_Processor.getFactoryPreUrl(),
  //     modelName: 'user_factory_role',
  //     modelId: modelId,
  //     data: {
  //       ...data,
  //       ...S_Processor.getFactoryData()
  //     }
  //   })
  // },
}
