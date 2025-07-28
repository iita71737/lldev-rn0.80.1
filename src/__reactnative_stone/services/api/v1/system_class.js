import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'system_class',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: params,
      pagination: false
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
  },
  getFilteredTemplate(templatesWithSystemClass, subClasses) {
    const _subClassesId = subClasses.split(',')
    const _templatesWithSystemClass = []
    templatesWithSystemClass.forEach(systemClass => {
      const _systemSubclasses = []
      systemClass.system_subclasses.forEach(_SubClass => {
        _subClassesId.forEach(subClassId => {
          if (_SubClass.id == subClassId) {
            _systemSubclasses.push(_SubClass)
          }
        })
      })
      _templatesWithSystemClass.push({
        ...systemClass,
        system_subclasses: _systemSubclasses
      })
    })
    const _filterBySubClass = _templatesWithSystemClass.filter(
      item => item.system_subclasses.length > 0
    )
    return _filterBySubClass
  },
  getSystemSubclassesBySubclassIds(subclassIds) {
    const state = store.getState()
    const _systemClasses = state.data.systemClasses
    const _subClasses = []
    _systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(subClass => {
        const _hasId = subclassIds.find(subClassId => {
          return subClassId == subClass.id
        })
        if (_hasId) {
          _subClasses.push(subClass)
        }
      })
    })
    return _subClasses
  },
  getSystemSubclassIdsBySubclassIds(subclassIds) {
    const state = store.getState()
    const _systemClasses = state.data.systemClasses
    const _systemClassIds = []
    _systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(subClass => {
        const _hasId = subclassIds.find(subClassId => {
          return subClassId == subClass.id
        })
        if (_hasId) {
          _systemClassIds.push(systemClass.id)
        }
      })
    })
    return _systemClassIds
  },
  getSystemClassBySystemSubclassId(subClassId) {
    const state = store.getState()
    const _systemClasses = state.data.systemClasses
    let _systemClass = {}
    _systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(subClass => {
        if (subClass.id == subClassId) {
          _systemClass = systemClass
        }
      })
    })
    return _systemClass
  },
  getSystemClassesObjectWithSystemSubclasses(systemSubclasses) {
    const state = store.getState()
    const _systemClasses = state.data.systemClasses
    const _formattedSystemClasses = []
    _systemClasses.forEach(systemClass => {
      const _subClasses = []
      systemClass.system_subclasses.forEach(subClass => {
        systemSubclasses.forEach(systemSubclass => {
          if (subClass.id == systemSubclass.id) {
            _subClasses.push(subClass.id)
          }
        })
      })
      if (_subClasses.length != 0) {
        _formattedSystemClasses.push({
          id: systemClass.id,
          name: systemClass.name,
          system_subclasses: _subClasses
        })
      }
    })
    return _formattedSystemClasses
  },
  $_getSystemClassWithId(systemClasses, subSystemClassesArr) {
    const _subById = []
    systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(sub => {
        subSystemClassesArr.forEach(_subId => {
          if (sub.id === _subId) {
            _subById.push(systemClass.id)
          }
        })
      })
    })
    return _subById
  },
  getAllSubSystemClassesId(systemClasses) {
    const _subClasses = []
    systemClasses.forEach(systemClass => {
      systemClass.system_subclasses.forEach(subSystemClass => {
        _subClasses.push(subSystemClass.id)
      })
    })
    return _subClasses
  },
  getSystemClassBySubClassesIds(system_subclasses) {
    const state = store.getState()
    const systemClasses = state.data.systemClasses

    let _systemClasses = []
    systemClasses.forEach(systemClass => {
      let _sub = []
      systemClass.system_subclasses.forEach(subSystemClass => {
        system_subclasses.forEach(subId => {
          if (subSystemClass.id === subId) {
            _sub.push(subSystemClass)
          }
        })
      })
      if (_sub.length != 0) {
        _systemClasses.push({
          id: systemClass.id,
          name: systemClass.name,
          system_subclasses: _sub
        })
      }
    })
    return [...new Set(_systemClasses)]
  },
  $_formatDataWithId(data) {
    const result = data.map(r => {
      return r.id
    })
    return result
  }
}
