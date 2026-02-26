import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import store from '@/store'
import axios from 'axios'

export default {
  async index({ params, signal }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: `task_factory_template/${params?.task_factory_template_id}/subtask_factory_template`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      },
      signal: signal
    })
  },
}