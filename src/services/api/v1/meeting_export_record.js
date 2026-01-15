import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `meeting_export/${params?.meeting_export}/meeting_export_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
