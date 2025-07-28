import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async show(modelId) {
    return base.show({
      modelName: 'audit_question_template_version',
      modelId: modelId,
      preUrl: S_Processor.getFactoryPreUrl(),
      params: S_Processor.getFactoryParams(),
    })
  },
}
