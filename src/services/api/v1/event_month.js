import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store'
import moment from 'moment';

export default {
  async index({ params }) {
    return base.index({
      modelName: 'analysis/event_month',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      },
    })
  },
}