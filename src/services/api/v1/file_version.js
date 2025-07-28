import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `file/${params.file}/file_version`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexByFactory({ params }) {
    return base.index({
      modelName: 'file_version/index/factory',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async shareIndex({ params }) {
    return base.index({
      modelName: 'file_version/index/share',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async updateVersion({ modelId, data }) {
    return base.create({
      modelName: `file/${modelId}/file_version`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
}
