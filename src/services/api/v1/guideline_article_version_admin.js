import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'

export default {
  async index({ params }) {
    return base.index({
      modelName: `admin/guideline_article/${params.guideline_article}/guideline_article_version`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create({ data }) {
    const res = await base.create({
      modelName: `admin/guideline_article/${data.guideline_article}/guideline_article_version`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async show({ params }) {
    return base.show({
      modelName: `admin/guideline_article_version`,
      modelId: params.guideline_article_version,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  async update({ modelId, data }) {
    const res = await base.patch({
      modelName: `admin/guideline_article_version/${modelId}`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams(),
      }
    })
    return res
  },
  async indexAnnounce({ params }) {
    return base.index({
      modelName: `admin/guideline_article/${params.guideline_article_id}/guideline_article_version/index/announce`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  // async delete({ modelId }) {
  //   return base.delete({
  //     modelName: `admin/guideline_article_version`,
  //     modelId: modelId,
  //     params: {
  //       ...S_Processor.getFactoryParams()
  //     }
  //   })
  // },
  async indexByGuidelineVersion({ params }) {
    return base.index({
      modelName: `admin/guideline_version/${params.guideline_version_id}/guideline_article_version/index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async removeByGuidelineVersion({ data }) {
    const res = await base.create({
      modelName: `admin/guideline_article_version/${data.guideline_article_version_id}/remove/guideline_version`,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  categorizeEffects(effectsAll) {
    return effectsAll.reduce((result, item) => {
      if (item.role_type === "factory_effects") {
        result.factory_effects.push(item.id);
      } else if (item.role_type === "effects") {
        result.effects.push(item.id);
      }
      return result;
    }, { factory_effects: [], effects: [] });
  },
  async indexFactory({ params }) {
    return base.index({
      modelName: `admin/${S_Processor.getFactoryPreUrl()}/guideline_article_version/index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
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
  formattedFromShow(data) {
    let _data = {
      ...data,
      id: data?.id,
      guideline_version: data?.guideline_version?.id,
      guideline_article: data?.guideline_article?.id,
      name: data?.name,
      type: data?.type,
      sequence: data?.sequence,
      parent_article_version_id: data?.parent_article_version_id,
      parent_article_version: data?.parent_article_version_id,
      announce_at: data?.announce_at ? moment.utc(data?.announce_at).local().format("YYYY-MM-DD") : null,
      effect_at: data?.effect_at ? moment.utc(data?.effect_at).local().format("YYYY-MM-DD") : null,
      content: data?.content,
      rich_content: data?.rich_content,
      no_text: data?.no_text,
      guideline_status: data?.guideline_status,
      attaches: data?.attaches ?? [],
      effects_all: [...data?.factory_effects, ...data?.effects] ?? [],
      relatedActsArticles: [...data?.article_versions, ...data?.act_version_alls] ?? [],
      // 關聯內規-顯示用（我綁他人）
      related_guidelines_articles: [],
    };
    // 關聯內規-顯示
    data?.related_guidelines?.forEach(item => {
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
  formattedForEdit(data) {
    let _data = {
      guideline_article_version: data?.id,
      name: data?.name,
      type: data?.type,
      announce_at: data?.announce_at,
      effect_at: data?.effect_at,
      content: data?.content,
      rich_content: data?.rich_content,
      no_text: data?.no_text,
      guideline_status: data?.guideline_status?.id,
      sequence: data?.sequence,
      parent_article_version: data?.parent_article_version_id,
      attaches: data?.file_attaches ? this.formattedForFileStore(data.file_attaches) : [],
      factory_effects: data?.effects_all ? this.categorizeEffects(data.effects_all).factory_effects : [],
      effects: data?.effects_all ? this.categorizeEffects(data.effects_all).effects : [],
      act_version_alls: [],
      article_versions: [],
      // 相關內規(要送API的)
      related_guidelines: []
    };
    data?.relatedActsArticles?.forEach(act => {
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
          act_version_id: act.article?.act_version?.id ? act.article.act_version.id : act.act_version?.id ? act.act_version?.id : undefined
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
    // 關聯內規(要送API的)
    data?.related_guidelines_articles?.forEach(item => {
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
  formattedForCreateVersion(data) {
    let _data = {
      id: data?.id,
      guideline_article: data?.guideline_article,
      guideline: data?.guideline,
      guideline_version: data?.guideline_version,
      name: data?.name,
      type: data?.type,
      announce_at: data?.announce_at,
      effect_at: data?.effect_at,
      content: data?.content ? data?.content : undefined,
      rich_content: data?.rich_content ? data?.rich_content : undefined,
      sequence: data?.sequence,
      parent_article_version: data?.parent_article_version_id,
      no_text: data?.no_text,
      guideline_status: data?.guideline_status?.id,
      attaches: data?.file_attaches ? this.formattedForFileStore(data.file_attaches) : [],
      factory_effects: data?.effects_all ? this.categorizeEffects(data.effects_all).factory_effects : [],
      effects: data?.effects_all ? this.categorizeEffects(data.effects_all).effects : [],
      act_version_alls: [],
      article_versions: [],
      related_guidelines: []
    };
    data?.relatedActsArticles?.forEach(act => {
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
          article_id: act.article?.id,
          article_version_id: act.id,
          act_version_id: act.article?.act_version?.id ? act.article.act_version.id : act.act_version?.id ? act.act_version.id : undefined
        });
      }
      // 法條
      else if (act.article_id) {
        console.log('4444');
        _data.article_versions.push({
          article_id: act.article_id,
          article_version_id: act.article_version_id,
          act_version_id: act.act_version_id
        });
      }
    });
    // 關聯內規(要送API的)
    data?.related_guidelines_articles?.forEach(item => {
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
  }
}