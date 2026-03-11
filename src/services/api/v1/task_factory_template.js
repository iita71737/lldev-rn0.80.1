import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_Task from '@/services/api/v1/task'
import factory from 'helpers/factory'

export default {
  async index({ params, signal }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'task_factory_template',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      },
      signal: signal
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task_factory_template',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'task_factory_template',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async update({ modelId, data }) {
    return await base.update({
      modelName: 'task_factory_template',
      modelId: modelId,
      data: {
        ...S_Processor.getFactoryData(),
        ...data
      }
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'task_factory_template',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async collect(modelId) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    }
    return base.create({
      modelName: `collect/task_factory_template/${modelId}`,
      data: _data
    })
  },
  async unCollect(modelId) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    }
    return base.create({
      modelName: `uncollect/task_factory_template/${modelId}`,
      data: _data
    })
  },
  async authCollectIndex({ params }) {
    return base.index({
      preUrl: `${S_Processor.getFactoryPreUrl()}`,
      modelName: `collect/task_factory_template`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async storeDraft({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task_factory_template/store/draft',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async updateDraft({ modelId, data }) {
    return await base.update({
      modelName: `${S_Processor.getFactoryPreUrl()}/task_factory_template/${modelId}/update/draft`,
      data: {
        ...S_Processor.getFactoryData(),
        ...data
      }
    })
  },
  getId(value) {
    if (value === undefined || value === null) {
      return undefined
    }
    if (typeof value === 'string' || typeof value === 'number') {
      return value
    }
    return value?.id
  },
  toIdArray(value) {
    if (!Array.isArray(value)) {
      return []
    }
    return value
      .map(item => this.getId(item))
      .filter(item => item !== undefined && item !== null)
  },
  formattedForFileStore(attaches) {
    if (!Array.isArray(attaches)) {
      return []
    }
    return attaches.map(item => {
      const newItem = {
        file: item?.file?.id || item?.file
      }
      if (item?.file_version?.id || item?.file_version) {
        newItem.file_version = item?.file_version?.id || item?.file_version
      }
      return newItem
    }).filter(item => item.file)
  },
  getFormattedData(_postData, currentUserId, factoryId) {
    const _subtaskFactoryTemplates = Array.isArray(_postData?.subtask_factory_templates)
      ? _postData.subtask_factory_templates.map((subTask, index) => {
        const _systemClasses = this.toIdArray(subTask?.system_classes)
        const _systemSubclasses = this.toIdArray(subTask?.system_subclasses)
        return {
          ...subTask,
          taker: this.getId(subTask?.taker),
          system_classes: subTask?.system_classes
            ? [...new Set(_systemClasses)]
            : null,
          system_subclasses: subTask?.system_subclasses
            ? _systemSubclasses
            : null,
          attaches: subTask?.attaches
            ? this.formattedForFileStore(subTask.attaches)
            : subTask?.file_attaches
              ? this.formattedForFileStore(subTask.file_attaches)
              : [],
          links: subTask?.links
            ? S_Task.getFormattedLinksObject(subTask.links)
            : subTask?.related_module
              ? S_Task.getFormattedLinksObject(subTask.related_module)
              : [],
          factory: this.getId(_postData?.factory) || factoryId,
        }
      })
      : []
    const _systemClasses = this.toIdArray(_postData?.system_classes)
    const _systemSubclasses = this.toIdArray(_postData?.system_subclasses)
    const _data = {
      id: _postData?.id,
      name: _postData?.name,
      remark: _postData?.remark,
      status: _postData?.status,
      taker: this.getId(_postData?.taker),
      factory: this.getId(_postData?.factory) || factoryId,
      system_classes: _postData?.system_classes
        ? [...new Set(_systemClasses)]
        : null,
      system_subclasses: _postData?.system_subclasses
        ? _systemSubclasses
        : null,
      factory_tags: this.toIdArray(_postData?.factory_tags),
      links: _postData?.links
        ? S_Task.getFormattedLinksObject(_postData.links)
        : _postData?.related_module
          ? S_Task.getFormattedLinksObject(_postData.related_module)
          : [],
      subtask_factory_templates: _subtaskFactoryTemplates,
    }
    return _data
  },
  getTaskCreateDraftFromTemplate(template, options = {}) {
    if (!template) {
      return {}
    }
    const {
      includeSubTaskTaker = false,
      includeTaskTaker = false,
      currentUser = null
    } = options

    const _currentUser = currentUser || null
    const _taskTaker = includeTaskTaker && template?.taker
      ? template.taker
      : _currentUser

    const _subTasks = Array.isArray(template?.subtask_factory_templates)
      ? template.subtask_factory_templates.map((subTask, index) => ({
        sequence: subTask?.sequence || String(index + 1).padStart(3, '0'),
        name: subTask?.name || '',
        remark: subTask?.remark || '',
        taker: includeSubTaskTaker
          ? (subTask?.taker || null)
          : null,
        system_subclasses: subTask?.system_subclasses || [],
        related_module: subTask?.links || [],
        file_attaches: subTask?.attaches || []
      }))
      : []

    return {
      name: template?.name || '',
      remark: template?.remark || '',
      taker: _taskTaker,
      system_subclasses: template?.system_subclasses || [],
      factory_tags: template?.factory_tags || [],
      related_module: template?.links || [],
      sub_tasks: _subTasks,
      status: template?.status || undefined,
      sub_task_scope: template?.sub_task_scope || 'taker'
    }
  },
}
