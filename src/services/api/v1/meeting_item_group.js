import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const meetingId = params?.meetingId ?? params?.meeting?.id ?? params?.meeting
    return base.index({
      modelName: `meeting/${meetingId}/meeting_item_group`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'meeting_item_group',
      params: S_Processor.getFactoryParams()
    })
  },
  async create({ data }) {
    const meetingId = data?.meetingId ?? data?.meeting?.id ?? data?.meeting
    return base.create({
      modelName: `meeting/${meetingId}/meeting_item_group`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: `meeting_item_group`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'meeting_item_group',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
}
