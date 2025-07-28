import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: `guideline_article/${params.guideline_article}/guideline_article_version`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'guideline_article_version',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async indexByGuidelineVersion({ params }) {
    return base.index({
      modelName: `guideline_version/${params.guideline_version_id}/guideline_article_version/index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexAnnounce({ params }) {
    return base.index({
      modelName: `guideline_article/${params.guideline_article_id}/guideline_article_version/index/announce`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  // 法規內頁的相關內規條文
  async indexByAct({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `guideline_article_version/index/act`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexFactory({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `guideline_article_version/index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}