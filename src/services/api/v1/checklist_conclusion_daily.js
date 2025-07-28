import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index(params) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'checklist_conclusion_daily',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
