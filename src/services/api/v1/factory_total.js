import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async indexV2({ params }) {
    return base.index({
      modelName: 'v2/analysis/factory_total',
      params: {
        // DO NOT SET IN HERE
        // ...S_Processor.getFactoryParams(),
        // ...S_Processor.getOrganizationParams(),
        ...params,
        ...S_Processor.getLocaleParams()
      }
    })
  },
}
