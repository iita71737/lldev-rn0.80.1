import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_Factory from '@/services/api/v1/factory'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'notification',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async read(modelId) {
    return base.read({
      modelId: `${modelId}/read`,
      modelName: 'notification'
    })
  },
  async getFactoryByFactoryId(factoryIdFromNotification) {
    if (factoryIdFromNotification) {
      return await S_Factory.show({ modelId: factoryIdFromNotification })
    }
  },
  async readAll() {
    return base.read({
      modelId: 'readall',
      modelName: 'notification'
    })
  },
  async indexUnread({ params }) {
    return base.index({
      modelName: 'notification/unread',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
