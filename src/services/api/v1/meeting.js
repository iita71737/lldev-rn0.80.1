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
      modelName: `meeting`,
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
    if (!Array.isArray(attaches)) return [];
    return attaches
      .map(item => {
        const fileId = item?.file?.id ?? item?.file ?? null;
        if (!fileId) return null;
        const fileVersionId =
          item?.file?.last_version?.id ??
          item?.file_version?.id ??
          item?.file_version ??
          null;
        const payload = { file: fileId };
        if (fileVersionId) payload.file_version = fileVersionId;
        return payload;
      })
      .filter(Boolean);
  },
  formattedForSignInForm(input) {
    if (!input) return null;
    // 1) sign_in_form 可能是陣列 -> 取第一筆
    const item = Array.isArray(input) ? input[0] : input;
    if (!item) return null;
    // 2) 你的結構通常是 item.file.id
    const fileId = item?.file?.id ?? item?.file ?? null;
    if (!fileId) return null;
    // 3) file_version 來源優先序：
    const fileVersionId =
      item?.file_version?.id ??
      item?.file?.last_version?.id ??
      item?.file_version ??
      null;

    const payload = { file: fileId };
    if (fileVersionId) payload.file_version = fileVersionId;

    return payload;
  },
  formattedDataForCreate(_postData, currentUserId) {
    const state = store.getState()
    const currentFactoryId = state?.data?.currentFactory?.id ?? null
    const _data = {
      factory: currentFactoryId ? currentFactoryId : undefined,
      name: _postData.name,
      remark: _postData.remark,
      chairperson: _postData.chairperson ? _postData.chairperson : undefined,
      meeting_date: _postData.meeting_date ? _postData.meeting_date : undefined,
      date_format: _postData.date_format ? _postData.date_format : undefined,
      meeting_date_format: _postData.meeting_date_format ? _postData.meeting_date_format : undefined,
      location: _postData.location ? _postData.location : undefined,
      owner: _postData.owner ? _postData.owner : undefined,
      expired_at: _postData.expired_at ? moment(_postData.expired_at).utc() : undefined,
      meeting_item_template: _postData.meeting_item_template ? _postData.meeting_item_template : undefined,
      meeting_template: _postData.meeting_template ? _postData.meeting_template : undefined,
      contents_template: _postData.contents_template ? _postData.contents_template : undefined,
      cover_template: _postData.cover_template ? _postData.cover_template : undefined,
      item_label_type: _postData.item_label_type ? _postData.item_label_type : undefined,
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      attaches: _postData.file_attaches ? this.formattedForFileStore(_postData.file_attaches) : [],
      sign_in_form: _postData.sign_in_form ? this.formattedForSignInForm(_postData.sign_in_form) : undefined,
      users: _postData.users ? _postData.users : [],
      user_factory_roles: _postData.roles && _postData.roles.length > 0 ?
        this.getArrayByUserFactoryRole(_postData.roles) : [],
      user_factory_role_templates: _postData.roles && _postData.roles.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(_postData.roles) : [],
    }
    return _data
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'meeting',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'meeting',
      params: S_Processor.getFactoryParams(),
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'meeting',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async detele({ modelId }) {
    return this.delete({ modelId })
  },
  formattedMeetingForEdit(meeting) {
    const state = store.getState()
    const factoryId = state.data.currentFactory?.id
    const normalizeFileAttach = (attach) => {
      if (!attach) return null
      const file = attach?.file ?? null
      const fileVersion = attach?.file_version ?? null
      if (!file && !fileVersion) return null
      return attach
    }
    const normalizeFileAttachList = (input) => {
      const list = Array.isArray(input) ? input : input ? [input] : []
      return list.map(normalizeFileAttach).filter(Boolean)
    }
    return {
      name: meeting.name ?? undefined,
      remark: meeting.remark ?? undefined,
      chairperson: meeting.chairperson ?? undefined,
      meeting_date: meeting.meeting_date ?? undefined,
      date_format: meeting.date_format ?? undefined,
      meeting_date_format: meeting.meeting_date_format ?? undefined,
      location: meeting.location ?? undefined,
      owner: meeting.owner ?? undefined,
      expired_at: meeting.expired_at ?? undefined,
      meeting_item_template: meeting.meeting_item_template ?? undefined,
      meeting_template: meeting.meeting_template ?? undefined,
      contents_template: meeting.contents_template ?? undefined,
      cover_template: meeting.cover_template ?? undefined,
      item_label_type: meeting.item_label_type ?? undefined,
      factory_tags: meeting?.factory_tags ?? [],
      file_attaches: normalizeFileAttachList(meeting.attaches),
      sign_in_form: normalizeFileAttachList(meeting.sign_in_form).length
        ? normalizeFileAttachList(meeting.sign_in_form)
        : undefined,
      // users: Array.isArray(meeting.users) ? meeting.users.map(pickUser) : [],
      // roles: Array.isArray(meeting.roles) ? meeting.roles : [],
    };
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: 'meeting',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  formattedDataForEdit(_postData, currentUserId) {
    const state = store.getState()
    const currentFactoryId = state?.data?.currentFactory?.id ?? null
    const _data = {
      factory: currentFactoryId ? currentFactoryId : undefined,
      name: _postData.name,
      remark: _postData.remark,
      chairperson: _postData.chairperson ? _postData.chairperson : undefined,
      meeting_date: _postData.meeting_date ? _postData.meeting_date : undefined,
      date_format: _postData.date_format ? _postData.date_format : undefined,
      meeting_date_format: _postData.meeting_date_format ? _postData.meeting_date_format : undefined,
      location: _postData.location ? _postData.location : undefined,
      owner: _postData.owner ? _postData.owner : undefined,
      expired_at: _postData.expired_at ? _postData.expired_at : undefined,
      meeting_item_template: _postData.meeting_item_template ? _postData.meeting_item_template : undefined,
      meeting_template: _postData.meeting_template ? _postData.meeting_template : undefined,
      contents_template: _postData.contents_template ? _postData.contents_template : undefined,
      cover_template: _postData.cover_template ? _postData.cover_template : undefined,
      item_label_type: _postData.item_label_type ? _postData.item_label_type : undefined,
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      attaches: _postData.file_attaches ? this.formattedForFileStore(_postData.file_attaches) : [],
      sign_in_form: _postData.sign_in_form ? this.formattedForSignInForm(_postData.sign_in_form) : undefined,
      users: _postData.users ? _postData.users : [],
      user_factory_roles: _postData.roles && _postData.roles.length > 0 ?
        this.getArrayByUserFactoryRole(_postData.roles) : [],
      user_factory_role_templates: _postData.roles && _postData.roles.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(_postData.roles) : [],
    }
    return _data
  },
  async updateSequence({ modelId, data }) {
    const res = await base.patch({
      modelName: `meeting/${modelId}/update/sequence`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  formattedMeetingForCopyCreate(meeting) {
    const state = store.getState()
    const factoryId = state.data.currentFactory?.id
    const normalizeFileAttach = (attach) => {
      if (!attach) return null
      const file = attach?.file ?? null
      const fileVersion = attach?.file_version ?? null
      if (!file && !fileVersion) return null
      return attach
    }
    const normalizeFileAttachList = (input) => {
      const list = Array.isArray(input) ? input : input ? [input] : []
      return list.map(normalizeFileAttach).filter(Boolean)
    }
    return {
      name: meeting.name + `${'-複製'}` ?? undefined,
      remark: meeting.remark ?? undefined,
      chairperson: meeting.chairperson ?? undefined,
      meeting_date: meeting.meeting_date ?? undefined,
      date_format: meeting.date_format ?? undefined,
      meeting_date_format: meeting.meeting_date_format ?? undefined,
      location: meeting.location ?? undefined,
      owner: meeting.owner ?? undefined,
      expired_at: meeting.expired_at ?? undefined,
      meeting_item_template: meeting.meeting_item_template ?? undefined,
      meeting_template: meeting.meeting_template ?? undefined,
      contents_template: meeting.contents_template ?? undefined,
      cover_template: meeting.cover_template ?? undefined,
      item_label_type: meeting.item_label_type ?? undefined,
      factory_tags: meeting?.factory_tags ?? [],
      file_attaches: [],
      sign_in_form: []
    };
  },
}
