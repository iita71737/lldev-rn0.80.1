import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import store from '@/store'
import { setUserSubTasks } from '@/store/data'
import S_Processor from '@/services/app/processor'

export default {
  done(modelId) {
    return base.done({
      modelName: 'sub_task',
      modelId: modelId,
      data: {
        ...S_Processor.getFactoryData()
      }
    })
  },
  undo(modelId) {
    return base.undo({
      modelName: 'sub_task',
      modelId: modelId,
      data: {
        ...S_Processor.getFactoryData()
      }
    })
  },
  update({ modelId, data }) {
    return base.update({
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
      modelName: 'sub_task'
    })
  },
  async show({ subTaskId }) {
    const _params = {
      ...S_Processor.getFactoryData()
    }
    const res = await base.show({
      modelName: 'sub_task',
      modelId: subTaskId,
      params: _params
    })
    return res
  },
  setStoreSubTask(id, data) {
    const state = store.getState()
    let currentSubTask = [...state.data.subtask]
    currentSubTask.forEach((subTask, SubTaskIndex) => {
      if (id == subTask.id) {
        currentSubTask[SubTaskIndex] = data
      }
    })
    store.dispatch(setUserSubTasks(currentSubTask))
  },
  async getAuthSubtasks({ params }) {
    //取得 taker 為自己的 sub_tasks
    const _params = {
      ...S_Processor.getFactoryData(),
      ...S_Processor.getLocaleParams(),
      ...params
    }
    const res = await base.index({
      modelName: 'auth_sub_task',
      params: _params,
    })
    return res
  },
  async subTask_reply_update({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    return await base.create({
      parentName: 'sub_task',
      parentId: modelId,
      modelName: 'reply_update',
      data: _data
    })
  },
  async subTask_review_update({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    return await base.create({
      parentName: 'sub_task',
      parentId: modelId,
      modelName: 'review_update',
      data: _data
    })
  },
  getPickerParams(params, _sortValue = '隱藏已完成項目', _sortValue002 = '依效期由近至遠') {
    let _params = JSON.parse(JSON.stringify(params))
    if (_sortValue === '全部') {
      delete _params.done_at
    }
    if (_sortValue === '隱藏已完成項目') {
      _params.done_at = 'null'
    }
    if (_sortValue002 === '依效期由近至遠') {

    }
    if (_sortValue002 === '依任務排序') {
      delete _params.status
      delete _params.done_at
    }
    return _params
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
}
