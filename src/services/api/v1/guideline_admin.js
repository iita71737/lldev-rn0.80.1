import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store'
import factory from './factory'
import moment from "moment-timezone";

export default {
  async index({ params }) {
    return base.index({
      preUrl: `admin/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'guideline',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: `admin/guideline`,
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async create({ data }) {
    const res = await base.create({
      preUrl: `admin/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'guideline',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async update({ modelId, data }) {
    const res = await base.patch({
      modelName: `admin/guideline/${modelId}`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'admin/guideline',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
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
  transformArticleVersions(articleVersions) {
    return articleVersions.map(version => {
      const actVersionId = version.act_versions[0]?.id || null;
      const articleId = version.article?.id || null;
      return {
        article_version_id: version.id,
        article_id: articleId,
        act_version_id: actVersionId,
      }
    })
  },
  transformActVersionAlls(actVersionAlls) {
    return actVersionAlls.map(version => {
      const actVersionId = version.id || null;
      const actId = version.act?.id || null;
      return {
        act_id: actId,
        act_version_id: actVersionId,
      }
    })
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
    const _currentUserId = state.stone_auth.currentUser.id
    let _data = {
      has_unreleased: _postData?.has_unreleased,
      name: _postData?.name,
      sequence: _postData?.sequence,
      announce_at: _postData?.announce_at ? moment(_postData?.announce_at, "YYYY-MM-DD").utc().toISOString() : null,
      effect_at: _postData?.effect_at ? moment(_postData?.effect_at, "YYYY-MM-DD").utc().toISOString() : null,
      remark: _postData?.remark,
      reference_link: _postData?.reference_link,
      owner: _postData?.owner,
      guideline_status: _postData?.guideline_status?.id,
      users: _postData?.users ?? [],
      user_factory_roles: _postData?.user_factory_roles_all && _postData?.user_factory_roles_all.length > 0 ?
        this.getArrayByUserFactoryRole(_postData.user_factory_roles_all) : [],
      user_factory_role_templates: _postData?.user_factory_roles_all && _postData?.user_factory_roles_all.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(_postData.user_factory_roles_all) : [],
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      attaches: _postData.file_attaches ? this.formattedForFileStore(_postData.file_attaches) : [],
      act_version_alls: [],
      article_versions: [],
      related_guidelines: []
    };
    _postData?.related_acts_articles?.forEach(act => {
      // 法規
      if (act.last_version) {
        _data.act_version_alls.push({
          act_id: act.id,
          act_version_id: act.last_version.id
        });
      }
      // 法規
      else if (act.act_id) {
        _data.act_version_alls.push({
          act_id: act.act_id,
          act_version_id: act.act_version_id
        });
      }
      // 法條
      else if (act.article) {
        _data.article_versions.push({
          article_id: act.article.id,
          article_version_id: act.id,
          act_version_id: act.article.act_version.id
        });
      }
      // 法條
      else if (act.article_id) {
        _data.article_versions.push({
          article_id: act.article_id,
          article_version_id: act.article_version_id,
          act_version_id: act.act_version_id
        });
      }
    });
    _postData?.related_guidelines_articles?.forEach(item => {
      // 最新版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'last_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item.id,
        });
      }
      // 特定版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'specific_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
        });
      }
      if (
        // 最新版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'last_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
        });
      }
      if (
        // 特定版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'specific_ver'
      ) {
        _data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
          guideline_article_version_id: item?.id,
        });
      }
    })
    return _data
  },
  formattedDataForEdit(_postData) {
    const _data = {
      owner: _postData?.owner,
      factory_tags: _postData?.factory_tags?.map(_ => _.id) ?? [],
      guideline_status: _postData?.guideline_status?.id,
      // 檢閱權限-依成員
      users: _postData?.users ?? [],
      // 權限-依角色
      user_factory_roles: _postData?.user_factory_roles_all && _postData?.user_factory_roles_all.length > 0 ?
        this.getArrayByUserFactoryRole(_postData.user_factory_roles_all) : [],
      user_factory_role_templates: _postData?.user_factory_roles_all && _postData?.user_factory_roles_all.length > 0 ?
        this.getArrayByUserFactoryRoleTemplate(_postData.user_factory_roles_all) : [],
    }
    return _data
  },
  formattedBeforeEdit(_postData) {
    const _data = {
      ..._postData,
      user_factory_roles_all: [],
      // 附件
      file_attaches: _postData.attaches ? _postData.attaches : [],
      related_acts_articles: [],
      related_guidelines_articles: [],
    }
    _postData?.act_version_alls?.forEach(act => {
      // 法規
      _data.related_acts_articles.push(act)
    });
    _postData?.article_versions?.forEach(article => {
      // 法規
      _data.related_acts_articles.push(article)
    });
    // 限閱權限
    _data.user_factory_roles_all = [...(_postData?.user_factory_roles || []), ...(_postData?.user_factory_role_templates || [])];
    // 關聯內規（我綁他人）
    _postData?.related_guidelines?.forEach(item => {
      if (item.guideline_article_version) {
        // 綁特定版本條文
        _data.related_guidelines_articles.push({
          ...item.guideline_article_version,
          guideline_id: item?.guideline?.id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: item?.guideline_article,
          guideline_article_version_id: item?.guideline_article_version?.id,
          bind_version: 'specific_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_article) {
        // 綁最新版本條文
        _data.related_guidelines_articles.push({
          ...item.guideline_article.last_version,
          guideline_id: item?.guideline?.id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: {
            ...item?.guideline_article?.last_version,
            id: item?.guideline_article?.id
          },
          bind_version: 'last_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_version) {
        // 綁特定版本整部內規
        _data.related_guidelines_articles.push({
          ...item.guideline_version,
          guideline_id: item?.guideline?.id,
          guideline_version: item?.guideline_version,
          bind_version: 'specific_ver',
          bind_type: 'whole_guideline'
        })
      }
      else if (item.guideline) {
        // 綁最新版本整部內規
        _data.related_guidelines_articles.push({
          ...item.guideline,
          guideline_id: item?.guideline?.id,
          bind_version: 'last_ver',
          bind_type: 'whole_guideline'
        })
      }
    });
    return _data
  },
}