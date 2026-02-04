import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async create({ data }) {
    const meetingId = data?.meetingId ?? data?.meeting?.id ?? data?.meeting
    return base.create({
      modelName: `meeting/${meetingId}/meeting_export`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async index({ params }) {
    const meetingId = params?.meetingId ?? params?.meeting?.id ?? params?.meeting
    return base.index({
      modelName: `meeting/${meetingId}/meeting_export`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'meeting_export',
      params: S_Processor.getFactoryParams()
    })
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: 'meeting_export',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'meeting_export',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async download({ params }) {
    return base.index({
      modelName: `meeting_export/${params?.meeting_export_id}/download`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getLastSchedule({ params }) {
    const meetingId = params?.meetingId ?? params?.meeting?.id ?? params?.meeting
    return base.index({
      modelName: `meeting/${meetingId}/meeting_export/last/schedule`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async createSchedule({ data }) {
    const meetingId = data?.meetingId ?? data?.meeting?.id ?? data?.meeting
    return base.create({
      modelName: `meeting/${meetingId}/meeting_export/store/schedule`,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async updateConvertWord({ params }) {
    return base.createWithFormData({
      modelName: `meeting_export/${params?.meeting_export_id}/update/convert_word_attach`,
      data: params.formData
    })
  }
}
