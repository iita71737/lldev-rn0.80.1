import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'file_folder',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexAll({ params }) {
    return base.index({
      modelName: 'file_folder/index/all',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'file_folder',
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'file_folder',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async indexWithFile({ params }) {
    return base.index({
      modelName: 'file_folder/index/with_file',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexToShare({ params }) {
    return base.index({
      modelName: 'file_folder/index/to_share',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexFromShare({ params }) {
    return base.index({
      modelName: 'file_folder/index/from_share',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexSystem({ params }) {
    return base.index({
      modelName: 'file_folder/index/system',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
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
  getFormattedCreateData(data, file_folder) {
    const _data = {
      name: data.name,
      is_secret: data.is_secret ? 1 : 0,
      is_public: data.is_public ? 1 : 0,
      module: '',
      share_factories: data.share_factories && data.share_factories.length > 0 ? data.share_factories.map(_fac => _fac.id) : [],
      users: data.users && data.users.length > 0 ? data.users.map(_user => _user.id) : [],
      user_factory_roles: data.file_folder_with_role && data.file_folder_with_role.length > 0 ?
        this.getArrayByUserFactoryRole(data.file_folder_with_role) : [],
      user_factory_role_templates: data.file_folder_with_role && data.file_folder_with_role.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(data.file_folder_with_role) : [],
      file_folder: file_folder ? file_folder : undefined
    }
    return _data
  },
  async create({ params }) {
    return base.create({
      modelName: `file_folder`,
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getFormattedForField(data) {
    const _data = {
      ...data,
      id: data.id,
      name: data.name,
      is_secret: data.is_secret ? 1 : 0,
      is_public: data.is_public ? 1 : 0,
      module: '',
      share_factories: data.share_factories ? data.share_factories : [],
      users: data.users ? data.users : [],
      file_folder_with_role: data.user_factory_roles && data.user_factory_role_templates ? [
        ...data.user_factory_roles.map(item => ({ id: item.id, name: item.name, role_type: 'factory' })),
        ...data.user_factory_role_templates.map(item => ({ id: item.id, name: item.name, role_type: 'template' }))
      ] : []
    }
    return _data
  },
  getFormattedUpdateData(data) {
    const _data = {
      name: data.name,
      is_secret: data.is_secret ? 1 : 0,
      is_public: data.is_public ? 1 : 0,
      module: '',
      share_factories: data.share_factories && data.share_factories.length > 0 ? data.share_factories.map(_fac => _fac.id) : [],
      users: data.users && data.users.length > 0 ? data.users.map(_user => _user.id) : [],
      user_factory_roles: data.file_folder_with_role && data.file_folder_with_role.length > 0 ?
        this.getArrayByUserFactoryRole(data.file_folder_with_role) : [],
      user_factory_role_templates: data.file_folder_with_role && data.file_folder_with_role.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(data.file_folder_with_role) : [],
    }
    return _data
  },
  async indexAll({ params }) {
    return base.index({
      modelName: 'file_folder/index/all',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async updatePath({ params }) {
    return base.create({
      modelName: `file_folder/${params.now_path}/update/path`,
      data: {
        file_folder: params.to_path,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async getUserScope({ params }) {
    return base.index({
      modelName: `file_folder/${params.file_folder_id}/user/scope`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: `file_folder`,
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
}
