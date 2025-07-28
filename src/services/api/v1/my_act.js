import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import store from '@/store'
import S_Processor from '@/services/app/processor'

export default {
  async index({ parentId, params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'myact',
      // params: params,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
