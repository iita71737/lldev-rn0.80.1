import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index(params) {
    return base.index({
      modelName: 'checklist_question_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async showAll(datas) {
    return base.showAll({
      modelName: 'checklist_question_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'checklist_question_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async quesIndexV2({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `checklist_question_template/index/v2`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    });
    return res;
  }
}
