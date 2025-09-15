import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      modelName: 'alliance',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  // async show({ modelId }) {
  //   return base.show({
  //     modelName: 'announcement',
  //     modelId: modelId,
  //     params: {
  //       ...S_Processor.getFactoryParams()
  //     },
  //     callback: true
  //   })
  // },
  // async collectIndex({ params }) {
  //   const unit = params?.factory
  //   return base.index({
  //     preUrl: S_Processor.getFactoryPreUrl(),
  //     modelName: 'collect/announcement',
  //     params: {
  //       ...params,
  //       ...S_Processor.getFactoryParams(unit),
  //       ...S_Processor.getLocaleParams()
  //     }
  //   })
  // },
  // async removeMyCollect({ params }) {
  //   const modelId = params?.id
  //   const unit = params?.factory
  //   base.create({
  //     modelName: `uncollect/announcement/${modelId}`,
  //     data: {
  //       ...S_Processor.getFactoryParams(unit),
  //       ...S_Processor.getLocaleParams()
  //     }
  //   })
  // },
  // async addMyCollect({ params }) {
  //   const modelId = params?.id
  //   const unit = params?.factory
  //   base.create({
  //     modelName: `collect/announcement/${modelId}`,
  //     modelId: modelId,
  //     data: {
  //       ...S_Processor.getFactoryParams(unit),
  //       ...S_Processor.getLocaleParams()
  //     }
  //   })
  // },
}
