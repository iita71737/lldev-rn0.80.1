import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import store from '@/store';
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const res = await base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_license_template',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      },
      // pagination: true,
    });
    return res;
  },
  async show({ modelId }) {
    const res = await base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `contractor_license_template`,
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
    });
    return res;
  },
};
