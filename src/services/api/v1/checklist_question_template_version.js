import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'cklist_ques_tmp_ver',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  }
}
