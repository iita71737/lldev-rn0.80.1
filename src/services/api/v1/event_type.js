import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index({ params }) {
    return base.index({
      modelName: 'event_type',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    })
  },
  manualSort(eventTypes) {
    const originalArray = eventTypes
    let _eventTypes = []
    eventTypes.forEach((_eventType, index) => {
      // 意外事故ID2
      if (_eventType.id == 2) {
        _eventTypes.splice(0, 0, _eventType)
      }
      // 外部查廠ID1
      if (_eventType.id == 1) {
        _eventTypes.splice(1, 0, _eventType)
      }
      // 接獲罰單
      if (_eventType.id == 3) {
        _eventTypes.splice(2, 0, _eventType)
      }
      // 排放異常
      if (_eventType.id == 8) {
        _eventTypes.splice(3, 0, _eventType)
      }
      // 其他
      else if (_eventType.id == 4) {
        _eventTypes.push(_eventType)
      }
    })
    return _eventTypes
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'event_type',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
}