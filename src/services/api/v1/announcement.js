import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      modelName: 'announcement',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'announcement',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async collectIndex({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'collect/announcement',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
}
