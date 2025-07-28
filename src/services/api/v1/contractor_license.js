import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment';
import store from '@/store';

export default {
  async index({ parentId, params, pagination = true }) {
    const _params = {
      ...params,
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_license',
      params: _params,
      pagination: pagination,
    });
    return res;
  },
  async show({ modelId, params }) {
    return base.show({
      modelName: 'contractor_license',
      modelId: modelId,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    });
  },
  async create({ factoryId, data }) {
    const _data = {
      ...data,
    };
    const res = await base.create({
      parentName: 'factory',
      parentId: factoryId,
      modelName: 'contractor_license',
      data: _data,
    });
    return res;
  },
  async createVersion({ modelId, data }) {
    const _data = {
      ...data,
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.create({
      parentName: 'contractor_license',
      parentId: modelId,
      modelName: 'contractor_license_version',
      data: _data,
    });
    return res;
  },
  async update({ modelId, data }) {
    const _data = {
      ...data,
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.update({
      modelName: 'contractor_license',
      modelId: modelId,
      data: _data,
    });
    return res;
  },
  async updateVersion({ versionId, data }) {
    const _data = {
      ...data,
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.update({
      modelName: 'contractor_license_version',
      modelId: versionId,
      data: _data,
    });
    return res;
  },
  async delete(id) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.delete({
      modelName: 'contractor_license',
      modelId: id,
      params: _data,
    });
    return res;
  },
  async remarkUpdate(licenseVersionId, data) {
    const _data = {
      factory: store.state.app.factory.id,
      ...data,
    };
    const res = await base.update({
      parentName: 'contractor_license_version',
      parentId: licenseVersionId,
      modelName: 'remark',
      data: _data,
    });
    return res;
  },
  // setLicenseData(data) {
  //   return {
  //     name: data.name || '其他證照',
  //     versions: [],
  //     updateUser: data.last_version.updated_user,
  //     updatedAt: data.last_version.updated_at,
  //     image: data.last_version.image,
  //     systemSubClasses: data.system_subclasses,
  //     templateName: data.license_template ? data.license_template.name : '',
  //     status: this.getDateOverDue(data.last_version.valid_end_date),
  //     taker: data.last_version.taker_text || data.contractor.name || '',
  //     licenseNumber: data.last_version.license_number,
  //     approvalLetter: data.last_version.approval_letter,
  //     validStartDate: data.last_version.valid_start_date,
  //     validEndDate: data.last_version.valid_end_date
  //       ? data.last_version.valid_end_date
  //       : '',
  //     remindDate: data.last_version.remind_date,
  //     contractor: data.contractor,
  //     systemClass: {},
  //     reminder: data.last_version.reminder,
  //     attaches: data.last_version.attaches,
  //     precautions: data.license_template
  //       ? data.license_template.last_version.precautions
  //       : 0,
  //     expiredComment: data.license_template
  //       ? data.license_template.last_version.expired_comment
  //       : 0,
  //   };
  // },
  getDateOverDue(date) {
    if (!date) {
      return { color: 'red', text: '' };
    }
    let today = new Date();
    let todayDate = moment(today, 'YYYY-MM-DD');
    let targetDate = moment(date, 'YYYY-MM-DD');
    if (todayDate.diff(targetDate, 'days') > 0) {
      return { color: 'red', text: '資格逾期' };
    } else {
      return { color: 'red', text: '' };
    }
  },
  compareDate(firstDate, secondDate) {
    if (firstDate.diff(secondDate, 'days', true) > 0) {
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
    } else if (contractEndDate && this.compareDate(contractEndDate, endDate)) {
      //資格風險
      return 1;
    } else {
      return 0;
    }
  },
};
