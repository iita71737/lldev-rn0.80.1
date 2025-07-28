import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment';
import store from '@/store';

export default {
  async remarkUpdate({ id, remark }) {
    const res = await base.patch({
      modelName: `contractor_license_version/${id}/remark`,
      data: {
        ...S_Processor.getFactoryParams(),
        remark: remark
      }
    })
    return res
  },
  async index({ params }) {
    return base.index({
      modelName: `contractor_license/${params.contractor_license}/contractor_license_version`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: `contractor_license_version`,
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams(),
      },
    });
  },
};
