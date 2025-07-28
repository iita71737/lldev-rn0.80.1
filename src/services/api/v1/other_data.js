import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async android_app_version({ params }) {
    return base.index({
      modelName: 'minimum/android_app_version/available',
      params: {
        ...params, 
      }
    })
  },
  async android_os_version({ params }) {
    return base.index({
      modelName: 'minimum/android_os_version/required',
      params: {
        ...params, 
      }
    })
  },
  async ios_app_version({ params }) {
    return base.index({
      modelName: 'minimum/ios_app_version/available',
      params: {
        ...params, 
      }
    })
  },
  async ios_os_version({ params }) {
    return base.index({
      modelName: 'minimum/ios_os_version/required',
      params: {
        ...params, 
      }
    })
  },
}