import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async showAll(datas) {
    return base.showAll({
      datas: S_Processor.getDatasWithFactory(datas),
      modelName: 'change_item_version'
    })
  },
  async getChangeItemVersion(params) {
    const _params = {
      ...S_Processor.getFactoryParams(),
      ...params,
    };
    const res = await base.index({
      modelName: 'change_item_version',
      params: _params,
    });
    return res.data;
  },
}
