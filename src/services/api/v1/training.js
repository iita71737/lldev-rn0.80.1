import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import moment from 'moment'

export default {
  async index({ params, signal }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'internal_training',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit)
      },
      signal: signal
    })
  },
  async indexBoard({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'internal_training/index/board',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'internal_training',
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'internal_training',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },

  async update({ data, modelId }) {
    return base.update({
      preUrl: S_Processor.getFactoryPreUrl(),
      factory: S_Processor.getFactoryParams(),
      modelName: 'internal_training',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'internal_training',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
      preUrl: S_Processor.getFactoryPreUrl()
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
  formattedForFileStore002(attache) {
    if (attache) {
      const transformed = [
        {
          file: attache[0]?.file?.id || null,
          file_version: attache[0]?.file_version?.id || null
        }
      ];
      return transformed;
    }
  },
  getFormattedEditData(data, factoryId, systemClasses) {
    const _update_training_data = {
      factory: factoryId,
      internal_training_template: data.internal_training_template ? data.internal_training_template : null,
      internal_training_template_version:
        data.internal_training_template_version ? data.internal_training_template_version : null,
      name: data.name,
      train_at: data.train_at ? moment(data.train_at).utc().toISOString() : undefined,
      expired_at: data.expired_at ? moment(data.expired_at).utc().toISOString() : undefined,
      // 檔案庫
      images: data.file_images && data.file_images.length > 0 ? this.formattedForFileStore(data.file_images) : [],
      sign_in_form: data.file_sign_in_form && data.file_sign_in_form.length > 0 ? this.formattedForFileStore002(data.file_sign_in_form) : [],
      attaches: data.file_attaches && data.file_attaches.length > 0 ? this.formattedForFileStore(data.file_attaches) : [],
      // 原始格式的pec
      // images: data.images ? data.images : [],
      // sign_in_form: data.sign_in_form ? data.sign_in_form : [],
      // attaches: data.attaches ? data.attaches : [],
      principal: data.principal,
      system_classes: data.system_classes,
      system_subclasses: data.system_subclasses,
      remark: data.remark,
      // 相關內規(要送API的)
      related_guidelines: [],
    }
    // 關聯內規(要送API的)
    data?.related_guidelines_articles?.forEach(item => {
      // 最新版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'last_ver'
      ) {
        _update_training_data.related_guidelines.push({
          guideline_id: item.id,
        });
      }
      // 特定版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'specific_ver'
      ) {
        _update_training_data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
        });
      }
      if (
        // 最新版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'last_ver'
      ) {
        _update_training_data.related_guidelines.push({
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
        _update_training_data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
          guideline_article_version_id: item?.id,
        });
      }
    })
    return _update_training_data
  },
  getFormattedCreateData(data, factoryId, systemClasses) {
    const _update_training_data = {
      factory: factoryId,
      internal_training_template: data.internal_training_template ? data.internal_training_template : null,
      internal_training_template_version:
        data.internal_training_template_version ? data.internal_training_template_version : null,
      name: data.name,
      train_at: data.train_at ? moment(data.train_at).utc().toISOString() : undefined,
      expired_at: data.expired_at ? moment(data.expired_at).utc().toISOString() : undefined,
      // 檔案庫
      images: data.file_images && data.file_images.length > 0 ? this.formattedForFileStore(data.file_images) : [],
      sign_in_form: data.file_sign_in_form && data.file_sign_in_form.length > 0 ? this.formattedForFileStore002(data.file_sign_in_form) : [],
      attaches: data.file_attaches && data.file_attaches.length > 0 ? this.formattedForFileStore(data.file_attaches) : [],
      // 原始格式的pec
      // images: data.images ? data.images : [],
      // sign_in_form: data.sign_in_form ? data.sign_in_form : [],
      // attaches: data.attaches ? data.attaches : [],
      principal: data.principal,
      system_classes: data.system_classes,
      system_subclasses: data.system_subclasses,
      remark: data.remark,
      expired_at: data.expired_at ? moment(data.expired_at).utc().toISOString() : undefined,
      internal_training_groups: data.internal_training_groups ? [data.internal_training_groups] : undefined,
      // 相關內規
      related_guidelines: []
    }
    data?.related_guidelines_articles?.forEach(item => {
      // 最新版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'last_ver'
      ) {
        _update_training_data.related_guidelines.push({
          guideline_id: item.id,
        });
      }
      // 特定版本-整部內規
      if (
        item.bind_type === 'whole_guideline' &&
        item.bind_version === 'specific_ver'
      ) {
        _update_training_data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
        });
      }
      if (
        // 最新版本-層級條文
        item.bind_type === 'specific_layer_or_article' &&
        item.bind_version === 'last_ver'
      ) {
        _update_training_data.related_guidelines.push({
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
        _update_training_data.related_guidelines.push({
          guideline_id: item?.guideline_id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article_id: item?.guideline_article?.id,
          guideline_article_version_id: item?.id,
        });
      }
    })
    return _update_training_data
  }
}
