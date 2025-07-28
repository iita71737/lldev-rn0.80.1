import S_Processor from '@/services/app/processor'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `license_type/${params.license_type}/license_template`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async factoryIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license_template',
      parentId: S_Processor.getFactoryPreUrl().factory,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ params }) {
    const _unit = params?.factory
    const _modelId = params?.license_template
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(_unit),
      modelId: _modelId,
      modelName: 'license_template',
      params: S_Processor.getFactoryParams(_unit),
    })
  },
  getTemplatesWithSystemClass(pickerTemplates, systemClasses) {
    const _systemClasses = []
    systemClasses.forEach(systemClass => {
      const _systemSubclasses = []
      systemClass.system_subclasses.forEach(systemSubclass => {
        const _templates = []
        pickerTemplates.forEach(template => {
          template.system_subclasses.forEach(templateSystemSubclass => {
            if (templateSystemSubclass.id == systemSubclass.id) {
              _templates.push(template)
            }
          })
        })
        _systemSubclasses.push({
          ...systemSubclass,
          templates: _templates
        })
      })
      _systemClasses.push({
        ...systemClass,
        system_subclasses: _systemSubclasses
      })
    })
    return _systemClasses
  }
}
