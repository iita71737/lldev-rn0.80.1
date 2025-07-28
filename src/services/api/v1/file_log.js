import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `file/${params.file}/file_log`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'file_log',
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
