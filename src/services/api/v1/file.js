import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'file',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async storeSystem({ params }) {
    return base.create({
      modelName: `file/store/system`,
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async storeSystemFile({ params }) {
    const _filename = params.filename
    return base.createWithFormData({
      modelName: `file/store_system_file/${_filename}`,
      data: params.formData
    })
  },
  async indexFromShare({ params }) {
    return base.index({
      modelName: 'file/share/index',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async checkDeleteScope({ params }) {
    const _id = params.file_id
    return base.index({
      modelName: `file/${_id}/check/delete`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async delete({ params }) {
    return base.delete({
      modelName: 'file',
      modelId: params.file,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'file',
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'file',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  formattedSelectedActForFields(data) {
    const _fieldsValue = {
      act: data,
      name: data.last_version?.name ? data.last_version?.name : null
    }
    return _fieldsValue
  },
  async create({ params }) {
    return base.create({
      modelName: `file`,
      data: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getFileExtension(input) {
    let url = ''
    // 處理 string 類型
    if (typeof input === 'string') {
      url = input
    }
    // 處理 object 類型（支援 file_version 與 file 顛倒）
    else if (typeof input === 'object' && input !== null) {
      url = input?.file_version?.source_url || input?.file?.source_url || ''
    }
    // 若無法取得 URL，回傳 null
    if (typeof url !== 'string' || !url.includes('.')) return null
    // 取得副檔名
    const filename = url.substring(url.lastIndexOf('/') + 1)
    let extension = filename.substring(filename.lastIndexOf('.') + 1)
    extension = extension.split('?')[0]
    return extension.toLowerCase()
  },
  getSourceUrl(input) {
    if (typeof input === 'string') {
      return input
    }
    if (typeof input === 'object' && input !== null) {
      return (
        input?.file_version?.source_url ||
        input?.file?.source_url ||
        null
      )
    }
    return null
  },
  getFormattedCreateData(data) {
    const formattedData = {
      id: data.id,
      name: data.name,
      file_type: this.getFileExtension(data.file_attaches[0]), // Assuming getFileType is a helper function to extract file type
      source_url: this.getSourceUrl(data.file_attaches[0]), // Assuming getSourceUrl is a helper function to get source URL
      des: data.des,
      file_folder: data.file_folder, // Replace with actual file folder ID if available
      remark: data.remark,
      act_version_alls: [],
      article_versions: [],
      share_factories: data.share_factories && data.share_factories.length > 0 ? data.share_factories.map(factory => factory.id) : undefined
    };
    data.related_acts && data.related_acts.length > 0 ? data.related_acts.forEach(act => {
      if (act.last_version) {
        formattedData.act_version_alls.push({
          act_id: act.id,
          act_version_id: act.last_version.id
        });
      } else if (act.article) {
        formattedData.article_versions.push({
          article_id: act.article.id,
          article_version_id: act.article.id,
          act_version_id: act.act_version.id
        });
      }
    }) : undefined;
    return formattedData
  },
  addSourceUrlToFileAttaches(data) {
    const fileAttaches = [];
    const sourceUrl = data.source_url;
    if (sourceUrl) {
      fileAttaches.push(sourceUrl);
    }
    return fileAttaches;
  },
  formattedSelectedFileForFields(data) {
    const file_attaches = [];
    const sourceUrl = data.source_url;
    let result = {
      id: data.id,
      name: data.name,
      file_type: data.file_type,
      des: data.des,
      file_folder: data.file_folder.id,
      remark: data.remark,
      related_acts: [],
      share_factories: data.share_factories,
      file_attaches: data.source_url ? this.addSourceUrlToFileAttaches(data) : []
    };
    data.act_version_alls.forEach(actVersion => {
      result.related_acts.push({
        act_id: actVersion.act.id,
        act_version_id: actVersion.id,
        name: actVersion.name
      });
    });
    data.article_versions.forEach(articleVersion => {
      result.related_acts.push({
        article_id: articleVersion.article.id,
        article_version_id: articleVersion.id,
        act_version_id: articleVersion.act_version.id,
        name: articleVersion.act_version.name + articleVersion.no_text
      });
    });
    return result;
  },
  removeQueryParams(inputString) {
    const index = inputString.indexOf('?');
    if (index !== -1) {
      return inputString.substring(0, index);
    }
    return inputString;
  },
  getFormattedUpdateData(data) {
    // console.log(JSON.stringify(data), 'data');
    let formattedData = {
      id: data.id,
      name: data.name,
      file_type: this.removeQueryParams(data.file_type), // Assuming getFileType is a helper function to extract file type
      des: data.des,
      file_folder: data.file_folder, // Replace with actual file folder ID if available
      remark: data.remark,
      act_version_alls: [],
      article_versions: [],
      share_factories: data.share_factories.map(factory => factory.id)
    };
    data.related_acts.forEach(act => {
      // 法規
      if (act.last_version) {
        formattedData.act_version_alls.push({
          act_id: act.id,
          act_version_id: act.last_version.id
        });
      }
      // 法規
      else if (act.act_id) {
        formattedData.act_version_alls.push({
          act_id: act.act_id,
          act_version_id: act.act_version_id
        });
      }
      // 法條
      else if (act.article) {
        formattedData.article_versions.push({
          article_id: act.article.id,
          article_version_id: act.id,
          act_version_id: act.article.act_version.id
        });
      }
      // 法條
      else if (act.article_id) {
        formattedData.article_versions.push({
          article_id: act.article_id,
          article_version_id: act.article_version_id,
          act_version_id: act.act_version_id
        });
      }
    });
    console.log(JSON.stringify(formattedData), 'formattedData---');
    return formattedData
  },
  getFormattedUploadVersionData(data) {
    let formattedData = {
      id: data.id,
      name: data.name,
      file_type: this.removeQueryParams(data.file_type),
      des: data.des,
      file_folder: data.file_folder,
      remark: data.remark,
      act_version_alls: [],
      article_versions: [],
      share_factories: data.share_factories.map(factory => factory.id),
      source_url: data.file_attaches && data.file_attaches[0] ? data.file_attaches[0] : []
    };
    data.related_acts.forEach(act => {
      // 法規
      if (act.last_version) {
        formattedData.act_version_alls.push({
          act_id: act.id,
          act_version_id: act.last_version.id
        });
      }
      // 法規
      else if (act.act_id) {
        formattedData.act_version_alls.push({
          act_id: act.act_id,
          act_version_id: act.act_version_id
        });
      }
      // 法條
      else if (act.article) {
        formattedData.article_versions.push({
          article_id: act.id,
          article_version_id: act.article.id,
          act_version_id: act.act_version.id
        });
      }
      // 法條
      else if (act.article_id) {
        formattedData.article_versions.push({
          article_id: act.article_id,
          article_version_id: act.article_version_id,
          act_version_id: act.act_version_id
        });
      }
    });
    return formattedData
  },
  async updatePath({ params }) {
    return base.create({
      modelName: `file/${params.now_path}/update/path`,
      data: {
        file_folder: params.to_path,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async remarkUpdate({ id, remark }) {
    const res = await base.patch({
      modelName: `file/${id}/update/remark`,
      data: {
        ...S_Processor.getFactoryParams(),
        remark: remark
      }
    })
    return res
  }
}
