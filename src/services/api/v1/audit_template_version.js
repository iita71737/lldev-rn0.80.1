import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Processor from '@/services/app/processor'
import S_Audit from '@/services/api/v1/audit'

export default {
  async show(modelId) {
    return base.show({
      modelName: 'audit_template_version',
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
    })
  },
}
