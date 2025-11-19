import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      modelName: `${S_Processor.getFactoryPreUrl()}/factory_statistic_group`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async create({ data }) {
    const res = await base.create({
      modelName: `${S_Processor.getFactoryPreUrl()}/factory_statistic_group`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  getArrayByUserFactoryRole(roles) {
    const _user_factory_roles = roles.map(_role => {
      if (_role.role_type === 'user_role' || _role.role_type === 'factory') {
        return {
          role_id: _role.id,
          role_type: 'factory'
        };
      } else {
        return null;
      }
    }).filter(item => item !== null);
    return _user_factory_roles
  },
  getArrayByUserFactoryRoleTemplate(roles) {
    const _user_factory_role_templates = roles.map(_role => {
      if (_role.role_type === 'user_factory_role_template' || _role.role_type === 'template') {
        return {
          role_id: _role.id,
          role_type: 'template'
        };
      } else {
        return null;
      }
    }).filter(item => item !== null);
    return _user_factory_role_templates
  },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  getFormattedData(data, currentFactory, currentUser) {
    const _timeZone = currentUser?.current_factory?.timezone ? currentUser?.current_factory?.timezone : 'Asia/Taipei'
    const _data = {
      name: data.name,
      factory: currentFactory?.id ? currentFactory.id : undefined,
      remark: data.remark,
      owner: data.owner ? data.owner : undefined,
      time_type: data?.date_picker_type === 2 ? 'period' : data?.date_picker_type === 1 ? 'latest' : undefined,
      latest_time_type: data?.latest_time_type ? data.latest_time_type : undefined,
      latest_time_count: data?.latest_time_count ? data.latest_time_count : undefined,
      start_time: data?.start_time ? dayjs(`${data?.start_time}T00:00:00+08:00`).utc().toISOString(): undefined,
      end_time: data?.end_time ?  dayjs(`${data?.end_time}T00:00:00+08:00`).utc().toISOString(): undefined,
      time_interval: data?.time_interval ? data?.time_interval : undefined,
      owner: data?.owner ? data?.owner : undefined,
      users: data?.users ? data?.users : [],
      user_factory_roles: data.roles && data.roles.length > 0 ?
        this.getArrayByUserFactoryRole(data.roles) : [],
      user_factory_role_templates: data.roles && data.roles.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(data.roles) : [],
      factory_tags: data?.factory_tags?.map(_ => _.id) ?? [],
      attaches: data.file_attaches ? this.formattedForFileStore(data.file_attaches) : [],
    }
    return _data
  }
}
