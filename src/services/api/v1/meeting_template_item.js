import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `meeting_template/${params?.meeting_template}/meeting_template_item`,
      params: {
        ...params,
        ...S_Processor.getFactoryData()
      }
    })
  }
}
