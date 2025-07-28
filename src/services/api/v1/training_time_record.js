import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
export default {
  async index({ params }) {
    return base.index({
      modelName: `internal_training/${params.internal_training}/training_time_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelId: modelId,
      modelName: `training_time_record`,
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async lackIndexByGroup({ params }) {
    return base.index({
      modelName: `internal_training_group/${params.internal_training_group_id}/training_time_record/index/lack`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexByGroup({ params }) {
    return base.index({
      modelName: `internal_training_group/${params.internal_training_group_id}/training_time_record/index/calculate`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async deleteBatch({ params }) {
    return base.delete({
      modelName: `internal_training/${params.internal_training_id}/delete/batch/training_time_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async importExcel({ params }) {
    return base.createWithFormData({
      modelName: `internal_training/${params.internal_training_id}/import/training_time_record`,
      data: params.formData
    })
  },
  // async create({ params }) {
  //   const _id = params.id
  //   return base.create({
  //     modelName: `license_version/${_id}/retraining_time_record`,
  //     data: {
  //       ...params,
  //       ...S_Processor.getFactoryParams()
  //     }
  //   })
  // },
  // async update({ params }) {
  //   return base.update({
  //     modelName: 'retraining_time_record',
  //     modelId: params.id,
  //     data: {
  //       ...params,
  //       ...S_Processor.getFactoryData()
  //     }
  //   })
  // },
}
