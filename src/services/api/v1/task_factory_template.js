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
}