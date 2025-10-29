import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'
import moment from 'moment'

export default {
  async index({ params }) {
    const _area_id = params?.areaId
    return base.index({
      modelName: `area/${_area_id}/area_section`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
