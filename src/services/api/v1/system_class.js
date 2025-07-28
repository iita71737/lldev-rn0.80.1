import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'system_class',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getSystemSubclassIdWithSystemClass(system_classes) {
    const systemSubclassId = []
    system_classes.forEach(systemClass => {
      systemClass.system_subclasses.forEach(system_subclass => {
        systemSubclassId.push(system_subclass.id)
      })
    })
    return systemSubclassId
  }
}
