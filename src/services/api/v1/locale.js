import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'
import moment from 'moment'

export default {
  async index(params) {
    return base.index({
      modelName: 'locale',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexByFactory({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'locale',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  }
}
