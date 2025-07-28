import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import factory from './factory'

export default {
  async index({ params }) {
    return base.index({
      preUrl: `factory/${params.factory}`,
      modelName: 'contractor_enter_record',
      params: {
        ...params,
      }
    })
  },
  async indexV2({ params }) {
    const unit = params?.factory ? params?.factory : S_Processor.getFactoryParams().factory
    return base.index({
      modelName: `v2/factory/${unit}/contractor_enter_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
      }
    })
  },
  async indexBoard({ params }) {
    return base.index({
      modelName: `factory/${S_Processor.getFactoryParams().factory}/contractor_enter_record/board/index`,
      params: {
        ...params,
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'contractor_enter_record',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams(),
      }
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_enter_record',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'contractor_enter_record',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async updateEnterRecord({ modelId, data }) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    const res = await base.update({
      modelName: 'contractor_enter_record',
      modelId: modelId,
      data: _data
    })
    return res
  },
  async exitCheckItemUpdate({ id, exit_check_item }) {
    const res = await base.patch({
      modelName: `contractor_enter_record/${id}/exit_check_item`,
      data: {
        ...S_Processor.getFactoryParams(),
        exit_check_item: exit_check_item
      }
    })
    return res
  },
  async remarkUpdate({ id, remark }) {
    const res = await base.patch({
      modelName: `contractor_enter_record/${id}/remark`,
      data: {
        ...S_Processor.getFactoryParams(),
        remark: remark
      }
    })
    return res
  },
  getFormattedDataForEdit(_formattedValue, _currentUserId) {
    const _data = {
      exit_check_item: _formattedValue.exit_check_item,
      exit_check_item_updated_at: _formattedValue.exit_check_item_updated_at
        ? _formattedValue.exit_check_item_updated_at
        : null,
      exit_check_item_updated_user:
        _formattedValue.exit_check_item_updated_user,
      contractor: _formattedValue.contractor,
      enter_period_type: _formattedValue.enter_period_type,
      enter_start_date: _formattedValue.enter_start_date,
      enter_end_date:
        _formattedValue.enter_period_type === 2
          ? _formattedValue.enter_end_date
          : _formattedValue.enter_start_date,
      enter_start_time: _formattedValue.enter_start_time
        ? moment(_formattedValue.enter_start_time).format('HH:mm:ss')
        : null,
      enter_end_time: _formattedValue.enter_end_time
        ? moment(_formattedValue.enter_end_time).format('HH:mm:ss')
        : null,
      operate_location: _formattedValue.operate_location,
      task_content: _formattedValue.task_content,
      attaches: _formattedValue.attaches,
      notify_at: _formattedValue.notify_at,
      remark: _formattedValue.remark,
      remark_updated_at: _formattedValue.remark_updated_at
        ? _formattedValue.remark_updated_at
        : null,
      remark_updated_user: _currentUserId,
      owner: _formattedValue.owner
    }
    return _data
  },
  async getNonReturnCurrentIndex({ params }) {
    //dashboard popup今日未復歸
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_enter_record/current_add',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      }
    })
  },
  async getNonReturnTotalIndex({ params }) {
    //dashboard popup未復歸累計
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_enter_record/total',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      }
    })
  },
  async getNonReturnYesterdayIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'contractor_enter_record/non_return/yesterday',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      }
    })
  },
  // 231005-多日進場
  generateDateRangeData(dataArray = []) {
    const resultArray = [];
    dataArray.forEach((item) => {
      const startDate = new Date(item.enter_start_date);
      const endDate = new Date(item.enter_end_date);
      // 计算日期范围
      const dateRange = [];
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      // 为每个日期生成数据项
      dateRange.forEach((date) => {
        resultArray.push({
          ...item,
          id: item.id,
          enter_start_date: date.toISOString(), // 将日期转换为 ISO 格式字符串
          operate_location: item.operate_location,
          task_content: item.task_content,
          // 其他属性可以根据需求添加
        });
      });
    });
    return resultArray;
  }

}
