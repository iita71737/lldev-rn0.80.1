import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store'

export default {
  async create({ params }) {
    return base.create({
      modelName: 'feedback',
      data: {
        ...params,
        ...S_Processor.getFactoryData()
      }
    })
  }
}
