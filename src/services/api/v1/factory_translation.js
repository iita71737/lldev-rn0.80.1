import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'

export default {
  // async index({ params }) {
  //   return base.index({
  //     modelName: 'content_text',
  //     params: {
  //       ...params,
  //       ...S_Processor.getFactoryParams()
  //     }
  //   })
  // },
  async create({ params }) {
    const res = await base.create({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: 'factory_translation',
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
    async update({ params }) {
      const res = await base.update({
        modelName: `factory_translation/${params.factory_translation}`,
        data: {
          ...params,
          ...S_Processor.getFactoryParams(),
        }
      })
      return res
    },
}
