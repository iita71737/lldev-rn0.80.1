import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `guideline/${params.guideline}/guideline_version`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'guideline_version',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async indexAnnounce({ params }) {
    return base.index({
      modelName: `guideline/${params.guideline_id}/guideline_version/index/announce`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  // 法規內頁的相關內規
  async indexByAct({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `guideline_version/index/act`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}