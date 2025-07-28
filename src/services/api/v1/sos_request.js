import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async create({ params }) {
    const _unitId = params.factory
    console.log(_unitId, '_unitId');
    return base.create({
      modelName: `factory/${_unitId}/sos_request`,
      // preUrl: S_Processor.getFactoryPreUrl(),
      data: {
        ...params,
        // ...S_Processor.getFactoryParams(),
      }
    })
  },
}
