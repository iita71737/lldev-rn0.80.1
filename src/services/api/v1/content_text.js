import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'content_text',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async i18nIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'i18n',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
