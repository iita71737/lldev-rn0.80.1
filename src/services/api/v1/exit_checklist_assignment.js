import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

export default {
  async index({ params }) {
    const _unit = params?.factory
    return base.index({
      modelName: 'v1/exit_checklist_assignment',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(_unit)
      }
    })
  },
  async authIndex({ params }) {
    return base.index({
      modelName: 'v1/exit_checklist_assignment/auth/index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams(),
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: `v1/exit_checklist_assignment`,
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
}
