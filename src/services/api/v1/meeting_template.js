import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import store from '@/store'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: `meeting_template`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  getArrayByUserFactoryRole(roles) {
    const _user_factory_roles = roles.map(_role => {
      if (_role.role_type === 'user_role') {
        return {
          role_id: _role.id,
          role_type: 'factory'
        };
      }
      else {
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
  formattedDataForCreate(_postData, currentUserId) {
    const state = store.getState()
    const _currentUserId = state.stone_auth?.currentUser?.id
    let _data = {
      name: _postData?.name,
      meeting_template_type:
        _postData?.meeting_template_type?.id ??
        _postData?.meeting_template_type_id ??
        _postData?.meeting_template_type ??
        null,
      factory:
        _postData?.factory?.id ??
        _postData?.factory ??
        _postData?.file_attaches?.[0]?.meeting_template_items?.[0]?.factory ??
        null,
      remark: _postData?.remark ?? null,
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      attach: null,
      meeting_template_items: []
    }
    // attach：只取第一個（你目前資料結構就是 file_attaches[0]）
    if (_postData?.file_attaches && _postData.file_attaches.length > 0) {
      const _attach = _postData.file_attaches[0]
      const _fileId = _attach?.file?.id ?? null
      const _fileVerId =
        _attach?.file?.last_version?.id ??     // ✅ 你貼的資料在這裡
        _attach?.file_version?.id ??           // 保底（若未來結構不同）
        null

      if (_fileId || _fileVerId) {
        _data.attach = {
          file: _fileId,
          file_version: _fileVerId
        }
      }
      // meeting_template_items：從 attaches 裡的 meeting_template_items 取
      if (_attach?.meeting_template_items && _attach.meeting_template_items.length > 0) {
        _data.meeting_template_items = _attach.meeting_template_items.map(item => {
          return {
            name: item?.name,
            value: item?.value,
            sequence: item?.sequence,
            meeting_template_field: item?.meeting_template_field,
            factory: item?.factory ?? _data.factory,
            has_line_break: item?.has_line_break ?? undefined
          }
        })
      }
    }
    // 若你有可能把 meeting_template_items 放在根層（非 file_attaches 裡）
    if (
      (!_data.meeting_template_items || _data.meeting_template_items.length === 0) &&
      _postData?.meeting_template_items &&
      _postData.meeting_template_items.length > 0
    ) {
      _data.meeting_template_items = _postData.meeting_template_items.map(item => {
        return {
          name: item?.name,
          value: item?.value,
          sequence: item?.sequence,
          meeting_template_field: item?.meeting_template_field,
          factory: item?.factory ?? _data.factory
        }
      })
    }
    return _data
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'meeting_template',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'meeting_template',
      params: S_Processor.getFactoryParams(),
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'meeting_template',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  formattedMeetingTemplateForEdit(_postData) {
    const state = store.getState()
    const factoryId = state.data.currentFactory?.id
    const fileAttach = Array.isArray(_postData?.file_attaches)
      ? _postData.file_attaches[0]
      : null
    return {
      // ===== 基本欄位 =====
      meeting_template_type: _postData?.meeting_template_type ?? null,
      name: _postData?.name ?? null,
      factory: factoryId ?? null,
      remark: _postData?.remark ?? null,
      // ===== 標籤 =====
      factory_tags: Array.isArray(_postData?.factory_tags)
        ? _postData.factory_tags.map(tag => tag.id)
        : [],
      // ===== 檔案 =====
      attach: fileAttach
        ? {
          file: fileAttach?.file?.id ?? null,
          file_version: fileAttach?.file_version?.id ?? null,
        }
        : null,
      // ===== 標記設定（核心）=====
      meeting_templateＦ_items: Array.isArray(fileAttach?.meeting_template_items)
        ? fileAttach.meeting_template_items.map(item => ({
          // ⚠️ edit 時「有 id 就帶，沒有就不帶」
          ...(item.id ? { id: item.id } : {}),

          name: item?.name ?? null,
          value: item?.value ?? null,
          sequence: item?.sequence ?? null,
          meeting_template_field: item?.meeting_template_field ?? null,
          factory: item?.factory ?? factoryId ?? null,
        }))
        : [],
    }
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: 'meeting_template',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
}
