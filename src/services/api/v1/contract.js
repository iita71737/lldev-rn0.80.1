import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store';

export default {
  async index({ factoryId, params }) {
    const _params = {
      ...params,
    };
    const res = await base.index({
      parentName: 'factory',
      parentId: factoryId,
      modelName: 'contract',
      params: _params,
      pagination: true,
    });
    return res;
  },
  async create({ data, factoryId }) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      ...data,
    };
    const res = await base.create({
      parentName: 'factory',
      parentId: factoryId,
      modelName: 'contract',
      data: _data,
    });
    return res;
  },
  async show({ contractId, params }) {
    const _params = {
      ...S_Processor.getFactoryParams(),
      ...params,
    };
    const res = await base.show({
      modelName: 'contract',
      modelId: contractId,
      params: _params,
    });
    return res;
  },
  async update({ contractId, data }) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      ...data,
    };
    const res = await base.update({
      modelName: 'contract',
      modelId: contractId,
      data: _data,
    });
    return res;
  },
  async delete(id) {
    const _params = {
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.delete({
      modelName: 'contract',
      modelId: id,
      params: _params,
    });
    return res;
  },
  compareDate(firstDate, secondDate) {
    if (firstDate && secondDate && firstDate.diff(secondDate, 'days', true) > 0) {
      //firstDate > secondDate
      return true;
    } else {
      return false;
    }
  },
  getLicenseStatus({ nowDate, endDate, contractEndDate = null }) {
    // today > license endDate === 2, 
    // contract endDate > license endDate ===1
    if (this.compareDate(nowDate, endDate)) {
      //資格逾期
      return 2;
    } else if (this.compareDate(contractEndDate, endDate)) {
      //資格風險
      return 1;
    } else {
      return 0;
    }
  },
};
