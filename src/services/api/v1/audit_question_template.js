import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index(params) {
    return base.index({
      modelName: 'audit_question_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexV2({ params }) {
    return base.index({
      modelName: 'audit_question_template/index/v2',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
