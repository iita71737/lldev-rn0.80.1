import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_LicenseTemVer from '@/services/api/v1/license_template_version'
import S_Processor from '@/services/app/processor'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import $color from '@/__reactnative_stone/global/color';
import moment from 'moment';
import config from '@/__config'
import axios from 'axios'

export default {
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'license',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
      },
    })
  },
  async indexBoard({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license/index/board',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      },
    })
  },
  async expiredIndex({
    preUrl = S_Processor.getFactoryPreUrl(),
    modelName,
    params,
    pagination = true,
    endpoint = axios.defaults.baseURL
  }) {
    let url = `${endpoint}/${preUrl}/license/index/expired`
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: params
        })
        .then(res => {
          if (pagination) {
            resolve(res.data)
          } else {
            resolve(res.data.data)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  async expiringIndex({
    preUrl = S_Processor.getFactoryPreUrl(),
    modelName,
    params,
    pagination = true,
    endpoint = axios.defaults.baseURL
  }) {
    let url = `${endpoint}/${preUrl}/license/index/expiring`
    return new Promise((resolve, reject) => {
      axios
        .get(url, {
          params: params
        })
        .then(res => {
          if (pagination) {
            resolve(res.data)
          } else {
            resolve(res.data.data)
          }
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  async indexAll({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license/index/all',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    })
  },
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'license',
      params: S_Processor.getFactoryParams(),
    })
  },
  async getLicenseActs({ licenseVersion }) {
    if (licenseVersion.last_version.license_template_version) {
      const TemplateVersion = S_LicenseTemVer.show(licenseVersion.last_version.license_template_version.id)
      const article = TemplateVersion.article_versions
      return article
    } else {
      return null
    }
  },
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'license',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async update({ data, modelId }) {
    return base.update({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'license',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
    })
  },
  async remarkUpdate({ id, remark }) {
    const res = await base.patch({
      modelName: `factory/${S_Processor.getFactoryParams().factory}/license_version/${id}/remark`,
      data: {
        ...S_Processor.getFactoryParams(),
        remark: remark
      }
    })
    return res
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'license',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
      preUrl: S_Processor.getFactoryPreUrl(),
    })
  },

  getLicenseNumWithTemplate(templates, licenses) {
    const _licenseWithTemplate = []
    templates.forEach(template => {
      const _template = { ...template }
      _template.licenseNum = this.getNumWithTemplate(template, licenses)
      _template.licenseDelay = this.getDelayNumWithTemplate(template, licenses)
      _template.licenseConduct = this.getConductNumWithTemplate(template, licenses)
      _template.licenseUsing = this.getUsingNumWithTemplate(template, licenses)
      _template.licensePause = this.getPauseNumWithTemplate(template, licenses)
      _licenseWithTemplate.push(_template)
    })
    return _licenseWithTemplate
  },

  getLicenseNumWithSystemSubclasses(systemClasses, licenses) {
    const _licenseNumWithSystemSubclasses = []
    systemClasses.forEach(systemClass => {
      const _systemSubclasses = []
      systemClass.system_subclasses.forEach(systemSubclass => {
        const _systemSubclass = { ...systemSubclass }
        _systemSubclass.licenseNum = this.getLicenseNum(systemSubclass, licenses)
        _systemSubclass.licenseDelay = this.getLicenseDelay(systemSubclass, licenses)
        _systemSubclass.licenseConduct = this.getLicenseConductNum(systemSubclass, licenses)
        _systemSubclass.licenseUsing = this.getLicenseUsing(systemSubclass, licenses)
        _systemSubclass.licensePause = this.getLicensePause(systemSubclass, licenses)
        _systemSubclasses.push(_systemSubclass)
      })
      const _systemClass = {
        icon: systemClass.icon,
        name: systemClass.name,
        id: systemClass.id,
        system_subclasses: _systemSubclasses,
      }
      _licenseNumWithSystemSubclasses.push(_systemClass)
    })
    return _licenseNumWithSystemSubclasses
  },
  getLicenseNum(systemSubclass, licenses) {
    let _licenseNum = 0
    licenses.forEach(license => {
      license.system_subclasses.forEach(licenseSystemSubclass => {
        if (licenseSystemSubclass.id == systemSubclass.id) {
          _licenseNum += 1
        }
      })
    })
    return _licenseNum
  },
  getNumWithTemplate(template, licenses) {
    let _licenseNum = 0
    licenses.forEach(license => {
      if (license.license_template) {
        if (license.license_template.id == template.id) {
          _licenseNum += 1
        }
      }
    })
    return _licenseNum
  },
  getLicenseConductNum(systemSubclass, licenses) {
    let licenseConduct = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.license_status_number === 0 &&
        license.last_version.using_status !== 0) {
        license.system_subclasses.forEach(licenseSystemSubclass => {
          if (licenseSystemSubclass.id == systemSubclass.id) {
            licenseConduct += 1
          }
        })
      }
    })
    return licenseConduct
  },
  getConductNumWithTemplate(template, licenses) {
    let licenseConduct = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.license_status_number == 0 &&
        license.last_version.using_status !== 0) {
        if (license.license_template) {
          if (license.license_template.id == template.id) {
            licenseConduct += 1
          }
        }
      }
    })
    return licenseConduct
  },
  getLicenseUsing(systemSubclass, licenses) {
    let licenseUsing = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status === 1) {
        license.system_subclasses.forEach(licenseSystemSubclass => {
          if (licenseSystemSubclass.id == systemSubclass.id) {
            licenseUsing += 1
          }
        })
      }
    })
    return licenseUsing
  },
  getUsingNumWithTemplate(template, licenses) {
    let licenseUsing = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status === 1) {
        if (license.license_template) {
          if (license.license_template.id == template.id) {
            licenseUsing += 1
          }
        }
      }
    })
    return licenseUsing
  },
  getLicenseDelay(systemSubclass, licenses) {
    let licenseDelay = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status !== 0 &&
        this.$_adjustOverdue(license.last_version.valid_end_date)) {
        license.system_subclasses.forEach(licenseSystemSubclass => {
          if (licenseSystemSubclass.id == systemSubclass.id) {
            licenseDelay += 1
          }
        })
      }
    })
    return licenseDelay
  },
  getDelayNumWithTemplate(template, licenses) {
    let licenseDelay = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status !== 0 &&
        this.$_adjustOverdue(license.last_version.valid_end_date)) {
        if (license.license_template) {
          if (license.license_template.id == template.id) {
            licenseDelay += 1
          }
        }
      }
    })
    return licenseDelay
  },
  getLicensePause(systemSubclass, licenses) {
    let licensePause = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status === 0) {
        license.system_subclasses.forEach(licenseSystemSubclass => {
          if (licenseSystemSubclass.id == systemSubclass.id) {
            licensePause += 1
          }
        })
      }
    })
    return licensePause
  },
  getPauseNumWithTemplate(template, licenses) {
    let licensePause = 0
    licenses.forEach(license => {
      if (license.last_version && license.last_version.using_status === 0) {
        if (license.license_template) {
          if (license.license_template.id == template.id) {
            licensePause += 1
          }
        }
      }
    })
    return licensePause
  },
  getDataForCreateLicense(_postData, systemClasses) {
    const _data = {
      name: _postData.name,
      license_template: _postData.license_template,
      license_type: _postData.license_type,
      system_classes: S_SystemClass.$_getSystemClassWithId(systemClasses, _postData.system_subclasses),
      system_subclasses: _postData.system_subclasses,
    }
    return _data
  },
  getDataForCreateLicenseVersion(_postData, currentFactory) {
    const _data = {
      // spec：廠證與其他，證照持有人taker為null
      taker: _postData.taker ? _postData.taker : (_postData.license_owner && _postData.license_owner.id) ? _postData.license_owner.id : null,
      agents: _postData.agents ? _postData.agents : null,
      reminder: _postData.reminder ? _postData.reminder : null,
      setup_license: _postData.reminder.setup_license ? _postData.reminder.setup_license : null,
      license_status_number: _postData.license_status_number ? _postData.license_status_number : 0,
      using_status: _postData.using_status ? _postData.using_status : 0,
      license_number: _postData.license_number ? _postData.license_number : null,
      approval_letter: _postData.approval_letter ? _postData.approval_letter : null,
      trained_hours: _postData.trained_hours ? _postData.trained_hours : null,
      // valid_start_date: _postData.valid_start_date ? _postData.valid_start_date : null,
      // valid_end_date: _postData.valid_end_date ? _postData.valid_end_date : null,
      valid_start_date: _postData.valid_start_date
        ? moment(_postData.valid_start_date, 'YYYY-MM-DD').utc().toISOString()
        : null,
      valid_end_date: _postData.valid_end_date
        ? moment(_postData.valid_end_date, 'YYYY-MM-DD').utc().toISOString()
        : null,
      remind_date: _postData.remind_date ? _postData.remind_date : null,
      // 檔案庫
      images: _postData.file_images && _postData.file_images.length > 0 ? this.formattedForFileStore(_postData.file_images) : [],
      attaches: _postData.file_attaches && _postData.file_attaches.length > 0 ? this.formattedForFileStore(_postData.file_attaches) : [],
      // 原始格式的pec
      // image: _postData.image ? _postData.image : null,
      // attaches: _postData.attaches ? _postData.attaches : null,
      remark: _postData.remark ? _postData.remark : null,
      // 回訓相關欄位
      processing_at: _postData.processing_at ? moment(_postData.processing_at).utc() : undefined,
      retraining_at: _postData.retraining_at ? moment(_postData.retraining_at).utc() : undefined,
      retraining_year: _postData.retraining_rule && _postData.retraining_rule.years ? _postData.retraining_rule.years : undefined,
      retraining_hour: _postData.retraining_rule && _postData.retraining_rule.hours ? _postData.retraining_rule.hours : undefined,
      retraining_remind_date: _postData.retraining_remind_date ? moment(_postData.retraining_remind_date).utc() : undefined,
      // 相關內規
      related_guidelines: []
    };
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
  getDataForEditLicense(_formattedValue, factoryId, systemClasses) {
    const _licenseData = {
      factory: factoryId,
      name: _formattedValue.name,
      system_classes: S_SystemClass.$_getSystemClassWithId(systemClasses, _formattedValue.system_classes),
      system_subclasses: _formattedValue.system_subclasses,
    };
    return _licenseData
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
  getDataForEditLicenseVersion(_formattedValue) {
    if (_formattedValue.valid_end_date_checkbox) {
      _formattedValue.valid_end_date = null
    }
    const _data = {
      taker: _formattedValue.license_owner ? null : _formattedValue.taker ? _formattedValue.taker : undefined,
      agents: _formattedValue.agents ? _formattedValue.agents : null,
      reminder: _formattedValue.reminder ? _formattedValue.reminder : null,
      setup_license: _formattedValue.setup_license ? _formattedValue.setup_license : null,
      license_status_number: _formattedValue.license_status_number ? _formattedValue.license_status_number : null,
      using_status: _formattedValue.using_status ? _formattedValue.using_status : 0,
      license_number: _formattedValue.license_number ? _formattedValue.license_number : null,
      approval_letter: _formattedValue.approval_letter ? _formattedValue.approval_letter : null,
      trained_hours: _formattedValue.trained_hours ? _formattedValue.trained_hours : null,
      valid_start_date: _formattedValue.valid_start_date ? _formattedValue.valid_start_date : null,
      valid_end_date: _formattedValue.valid_end_date ? _formattedValue.valid_end_date : null,
      remind_date: _formattedValue.remind_date
        ? _formattedValue.remind_date
        : moment().add(-60, 'days').format('YYYY-MM-DD'),
      remark: _formattedValue.remark ? _formattedValue.remark : null,
      // 原始格式的pec
      // image: _formattedValue.image ? _formattedValue.image : [],
      // attaches: _formattedValue.attaches ? _formattedValue.attaches : [],
      // 檔案庫
      image: _formattedValue.file_image ? this.formattedForFileStore(_formattedValue.file_image) : [],
      attaches: _formattedValue.file_attaches ? this.formattedForFileStore(_formattedValue.file_attaches) : [],
      // 回訓相關欄位
      processing_at: _formattedValue.processing_at ? moment(_formattedValue.processing_at).utc() : undefined,
      retraining_at: _formattedValue.retraining_at ? moment(_formattedValue.retraining_at).utc() : undefined,
      retraining_year: _formattedValue.retraining_rule && _formattedValue.retraining_rule.years ? _formattedValue.retraining_rule.years : undefined,
      retraining_hour: _formattedValue.retraining_rule && _formattedValue.retraining_rule.hours ? _formattedValue.retraining_rule.hours : undefined,
      retraining_remind_date: _formattedValue.retraining_remind_date ? moment(_formattedValue.retraining_remind_date).utc() : undefined,
      // 相關內規
      related_guidelines: []
    };
    _formattedValue?.related_guidelines_articles?.forEach(item => {
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
  getStatusFont(license, t) {
    let _font = '';
    if (license.last_version && license.last_version.license_status_number == 0) {
      _font = t('辦理中')
    } else if (license.last_version && license.last_version.license_status_number == 1) {
      _font = t('已核准');
    } else {
      _font = t('???');
    }
    return _font;
  },
  getStatusFontColor(license) {
    let _color = '';
    if (license.last_version && license.last_version.license_status_number == 0) {
      _color = $color.gray3d;
    } else if (license.last_version && license.last_version.license_status_number == 1) {
      _color = $color.green;
    } else {
      _color = $color.danger;
    }
    return _color;
  },
  getStatusBgColor(license) {
    let _color = '';
    if (license.last_version && license.last_version.license_status_number == 0) {
      _color = $color.yellow11l;
    } else if (license.last_version && license.last_version.license_status_number == 1) {
      _color = $color.green11l;
    } else {
      _color = $color.danger11l;
    }
    return _color;
  },
  getLicenseDataForUpdateVersion(_formattedValue) {
    const _data = {
      name: _formattedValue.name,
      taker: _formattedValue.taker,
      agents: _formattedValue.agents,
      reminder: _formattedValue.reminder ? _formattedValue.reminder : null,
      setup_license: _formattedValue.setup_license,
      license_status_number: _formattedValue.license_status_number,
      using_status: _formattedValue.using_status,
      license_number: _formattedValue.license_number,
      approval_letter: _formattedValue.approval_letter,
      trained_hours: _formattedValue.trained_hours,
      valid_start_date: _formattedValue.valid_start_date,
      valid_end_date: _formattedValue.valid_end_date,
      remind_date: _formattedValue.remind_date
        ? _formattedValue.remind_date
        : moment().add(-60, 'days').format('YYYY-MM-DD'),
      // 舊有spec
      // image: _formattedValue.image,
      // attaches: _formattedValue.attaches,
      // 檔案庫
      image: _formattedValue.file_image ? this.formattedForFileStore(_formattedValue.file_image) : [],
      attaches: _formattedValue.file_attaches ? this.formattedForFileStore(_formattedValue.file_attaches) : [],
      remark: _formattedValue.remark,
      // 回訓相關欄位
      processing_at: _formattedValue.processing_at ? moment(_formattedValue.processing_at).utc() : undefined,
      retraining_at: _formattedValue.retraining_at ? moment(_formattedValue.retraining_at).utc() : undefined,
      retraining_year: _formattedValue.retraining_rule && _formattedValue.retraining_rule.years ? _formattedValue.retraining_rule.years : undefined,
      retraining_hour: _formattedValue.retraining_rule && _formattedValue.retraining_rule.hours ? _formattedValue.retraining_rule.hours : undefined,
      retraining_remind_date: _formattedValue.retraining_remind_date ? moment(_formattedValue.retraining_remind_date).utc() : undefined,
      // 相關內規
      related_guidelines: []
    }
    _formattedValue?.related_guidelines_articles?.forEach(item => {
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
  $_adjustOverdue(date) {
    if (!date) return;
    let today = new Date();
    const newDate = moment(today);
    const secondDate = moment(date);
    if (newDate.diff(secondDate, "days", true) > 1) {
      return true;
    } else {
      return false;
    }
  },
  async tabIndex({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/license/tab_index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}