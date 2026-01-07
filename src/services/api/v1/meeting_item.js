import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async importMeetingItemWord({ params }) {
    return base.createWithFormData({
      modelName: `meeting_item_group/${params?.meeting_item_group_id}/meeting_item`,
      data: params.formData
    })
  },
  async index({ params }) {
    return base.index({
      modelName: `meeting_item_group/${params?.meeting_item_group_id}/meeting_item`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'meeting_item',
      params: S_Processor.getFactoryParams()
    })
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: `meeting_item`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async updateMeetingItemWord({ params }) {
    return base.createWithFormData({
      modelName: `meeting_item/${params?.meeting_item_it}/update/original_attach`,
      data: params.formData
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'meeting_item',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async meetingIndexAll({ params }) {
    return base.index({
      modelName: `meeting/${params?.meetingId}/meeting_item/index/all`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
