import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import store from '@/store'
import axios from 'axios'

export default {
  async index({ params, signal }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'task',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      },
      signal: signal
    })
  },
  async indexBoard({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task/board/index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'task',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async getTaskCurrentExpiredList(params) {
    return await base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task/current_expired',
      params: params,
      pagination: true
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    return await base.update({
      modelName: 'task',
      modelId: modelId,
      data: _data
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'task',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async currentExpiredIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task/current_expired',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getAuthTasks({ params }) {
    //取得 taker 為自己的 task
    const _params = {
      ...S_Processor.getFactoryData(),
      ...params
    }
    const res = await base.index({
      parentName: 'factory',
      parentId: S_Processor.getFactoryData().factory,
      modelName: 'auth_task',
      params: _params,
      pagination: true
    })
    return res
  },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  getFormattedSubTasksForCreate(subTasks, currentUserId) {
    const _subTasks = subTasks.map((subTask, index) => {
      return {
        ...S_Processor.getFactoryData(),
        ...subTask,
        creator: currentUserId,
        // 檔案庫
        attaches: subTask.file_attaches ? this.formattedForFileStore(subTask.file_attaches) : [],
        // 依照 index 排序，並且確保是 3 位數的格式（補零）
        sequence: String(index).padStart(3, '0'), // 使用 padStart 確保為三位數
        links: subTask?.related_module ? this.getFormattedLinksObject(subTask.related_module) : undefined
      }
    })
    return _subTasks
  },
  buildPatternTemplate(pattern, keyMap = {}) {
    return pattern.map(p => {
      const varKey = keyMap[p.key] || p.key
      return p.type === 'const' ? p.key : `\${${varKey}}`
    }).join('/')
  },
  fillPatternTemplate(pattern, data) {
    const keyMap = {
      checklistId: 'id',
      assignmentId: 'id',
      licenseId: 'id',
      trainingId: 'id',
      eventId: 'id',
      contractorId: 'id',
      operationId: 'id',
      operationResultId: 'id',
      taskId: 'id',
      alertId: 'id'
    }
    const template = this.buildPatternTemplate(pattern, keyMap)
    console.log(template, 'templatetemplate');
    // 使用 Function 建立模板函式，插入 data 內容
    const func = new Function(...Object.keys(data), `return \`${template}\`;`)
    return func(...Object.values(data))
  },
  getFormattedLinksObject(relatedModules) {
    if (!Array.isArray(relatedModules)) return []
    return relatedModules.map(item => ({
      id: item.linkId || undefined,
      name: item.custom_name || item.name || '',
      url:
        (item.type === 'domain' && item.url)
          ? item.url
          : item.url_pattern
            ? this.fillPatternTemplate(item.url_pattern, item)
            : item.url || '',
      remark: item.remark || '',
      from_module: item.from_module || '',
      type: item.type ? item.type : 'custom'
    }))
  },
  getFormattedDataForCreate(_postData, currentUserId) {
    const state = store.getState()
    const _currentUserId = state.stone_auth.currentUser.id
    const _data = {
      done_at: _postData?.done_at
        ? moment(_postData?.done_at).format('YYYY-MM-DD')
        : null,
      checked_at: _postData?.checked_at
        ? moment(_postData?.checked_at).format('YYYY-MM-DD')
        : null,
      expired_at: _postData?.expired_at ? moment(_postData?.expired_at).utc() : null,
      name: _postData?.name,
      remark: _postData?.remark,
      taker: _postData?.taker,
      creator: currentUserId ? currentUserId : _currentUserId,
      alert: _postData?.apiAlert ? _postData?.apiAlert.id : null,
      ll_broadcast: _postData?.ll_broadcast ? _postData?.ll_broadcast : null,
      event: _postData?.event ? _postData?.event : null,
      article: _postData?.article ? _postData?.article : null,
      change_version: _postData?.change_version
        ? _postData?.change_version
        : _postData?.relationChange
          ? _postData?.relationChange
          : null,
      system_classes: _postData?.system_classes
        ? [...new Set(_postData?.system_classes)]
        : null,
      system_subclasses: _postData?.system_subclasses
        ? _postData?.system_subclasses
        : null,
      sub_tasks: _postData?.sub_tasks
        ? this.getFormattedSubTasksForCreate(
          _postData?.sub_tasks,
          currentUserId ? currentUserId : _currentUserId
        )
        : [],
      audit_record:
        _postData?.apiAlert && _postData?.apiAlert?.audit_record
          ? _postData?.apiAlert.audit_record.id
          : null,
      checklist_record:
        _postData?.apiAlert && _postData?.apiAlert?.checklist_record
          ? _postData?.apiAlert.checklist_record.id
          : null,
      event: _postData?.relationEvent ? _postData?.relationEvent?.id : null,
      act_version: _postData.act_version ? _postData.act_version : undefined,
      article_version: _postData?.article_version ? _postData?.article_version : null,
      internal_training_group: _postData.internal_training_group ? _postData.internal_training_group : undefined,
      redirect_routes: _postData.redirect_routes ? _postData.redirect_routes : undefined,
      guideline_version: _postData?.guideline_version ? _postData?.guideline_version : null,
      guideline_article_version: _postData?.guideline_article_version ? _postData?.guideline_article_version : null,
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      links: _postData?.related_module ? this.getFormattedLinksObject(_postData.related_module) : undefined,
      status: _postData?.status,
      id: _postData?.id
    }
    return _data
  },
  getFormattedDataForEdit(_postData, currentUserId) {
    const state = store.getState()
    const _currentUserId = state.stone_auth.currentUser.id
    const _data = {
      done_at: _postData?.done_at
        ? moment(_postData.done_at).format('YYYY-MM-DD')
        : null,
      checked_at: _postData?.checked_at
        ? moment(_postData.checked_at).format('YYYY-MM-DD')
        : null,
      expired_at: _postData?.expired_at ? moment(_postData.expired_at).utc() : null,
      name: _postData?.name,
      remark: _postData?.remark,
      taker: _postData?.taker,
      creator: _postData?.creator ? _postData.creator : _currentUserId,
      alert: _postData?.alert ? _postData.alert : null,
      ll_broadcast: _postData?.ll_broadcast ? _postData.ll_broadcast : null,
      event: _postData?.event ? _postData.event : null,
      article: _postData?.article ? _postData.article : null,
      change_version: _postData?.change_version
        ? _postData?.change_version
        : null,
      system_classes: _postData?.system_classes
        ? [...new Set(_postData?.system_classes)]
        : null,
      system_subclasses: _postData?.system_subclasses,
      sub_tasks: _postData?.sub_tasks
        ? this.getFormattedSubTasksForCreate(
          _postData.sub_tasks,
          currentUserId ? currentUserId : _currentUserId
        )
        : [],
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      links: _postData?.related_module ? this.getFormattedLinksObject(_postData.related_module) : undefined
    }
    return _data
  },
  async checkTask(taskId) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    }
    const res = await base.create({
      parentName: 'task',
      parentId: taskId,
      modelName: 'check',
      data: _data,
    });
    return res;
  },
  async uncheckTask(taskId) {
    //uncheck task
    const res = await base.create({
      modelName: `task/${taskId}/uncheck`,
      data: {
        ...S_Processor.getFactoryParams(),
      }
    });
    return res;
  },
  getPickerParams001(params, _sortValue, _sortValue002) {
    let _params = JSON.parse(JSON.stringify(params))
    if (_sortValue === 'all') {
      delete _params.done_at
    }
    if (_sortValue === 'advance') {
      _params.done_at = 'null'
      _params.checked_at = 'null'
    }
    if (_sortValue === 'pending') {
      _params.done_at = 'not_null'
      _params.checked_at = 'null'
    }
    if (_sortValue === 'complete') {
      _params.done_at = 'not_null'
      _params.checked_at = 'not_null'
    }
    if (_sortValue002 === '依期限由近至遠') {
      _params.order_by = 'expired_at'
    }
    if (_sortValue002 === '依進度完成由低至高') {
      delete _params.order_by
      _params.order_by = 'completion_degree'
    }
    return _params
  },
  getPickerParams(params, _sortValue = '隱藏已完成項目', _sortValue002 = '依效期由近至遠') {
    let _params = JSON.parse(JSON.stringify(params))
    if (_sortValue === '全部') {
      delete _params.done_at
    }
    if (_sortValue === '隱藏已完成項目') {
      _params.done_at = 'null'
    }
    return _params
  },
  filterSubTasksWithNullDoneAt(data, sortValue) {
    if (sortValue === '全部') {
      return data.map(item => ({
        ...item,
        sub_tasks: item.sub_tasks.filter(subTask => subTask.done_at != null)
      }));
    } else if (sortValue === '隱藏已完成項目') {
      if (data && data.sub_tasks && data.sub_tasks.length > 0)
        return data.map(item => ({
          ...item,
          sub_tasks: item.sub_tasks.filter(subTask => subTask.done_at == null)
        }));
    }
  },
  async tabIndex({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/task/tab_index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async storeDraft({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task/store/draft',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async updateDraft({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    return await base.update({
      modelName: `${S_Processor.getFactoryPreUrl()}/task/${modelId}/update/draft`,
      data: _data
    })
  },
  async authIndexDraft({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'task/index/draft',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  parseLinkToRelated(link) {
    // console.log(link, 'link---');
    const url = link.url || ''
    const parts = url.replace(/^https?:\/\/[^/]+/, '') // 移除 domain
      .split('/')
      .filter(Boolean)

    const modelId = parts[parts.length - 1] || ''
    const factoryIndex = parts.indexOf('factory')
    const factory = factoryIndex !== -1 ? parts[factoryIndex + 1] : ''
    // const module_page_value = parts[factoryIndex + 2] || ''

    return {
      id: modelId,
      linkId: link.id,
      url: url,
      name: link.name || '',
      custom_name: link.name || '',
      from_module: link.from_module || '',
      factory,
      // module_page_value,
      remark: link.remark || '',
      type: link.type || 'custom',

      url_pattern: link?.url_pattern,
      url_factory_id: factory,
      from_module_id: modelId,
    }
  },
  transformTaskLinksToRelatedModules(task) {
    if (!task || typeof task !== 'object') return task

    // 主任務 links → related_module
    const related_module = Array.isArray(task.links)
      ? task.links.map(this.parseLinkToRelated)
      : undefined

    // 子任務 links → related_module（只保留 id）
    const sub_tasks = Array.isArray(task.sub_tasks)
      ? task.sub_tasks.map(sub => {
        const hasLinks = Array.isArray(sub.links) && sub.links.length > 0

        return {
          ...sub,
          related_module: hasLinks
            ? sub.links.map(this.parseLinkToRelated)
            : undefined
        }
      })
      : task.sub_tasks

    return {
      ...task,
      related_module,
      sub_tasks
    }
  }


}