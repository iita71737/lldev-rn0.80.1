import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import preUrl from '@/services/app/processor'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_Risk from '@/services/api/v1/risk'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'risk_version',
      // params: params,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
