import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_CheckListTemplate from '@/services/api/v1/checklist_template'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_ChecklistQuestion from '@/services/api/v1/checklist_question'
import S_Processor from '@/services/app/processor'
import i18next from 'i18next'
import moment from 'moment'

export default {
  async index({ params }) {
    const _unit = params.factory
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(_unit),
      modelName: 'checklist',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(_unit)
      }
    })
  },
  async indexAll({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'index_all',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async collectIndex({ params }) {
    return base.index({
      preUrl: `v1/` + S_Processor.getFactoryPreUrl(),
      modelName: 'collect/checklist',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'checklist',
      params: S_Processor.getFactoryParams(),
      modelId: modelId,
      callback: true
    })
  },
  async update({ checklistId, checklistData }) {
    const _data = {
      factory: S_Processor.getFactoryParams().factory,
      ...checklistData
    }
    return base.update({
      modelName: 'checklist',
      modelId: checklistId,
      data: _data
    })
  },
  async delete(id) {
    return base.delete({
      modelName: 'checklist',
      modelId: id,
      params: S_Processor.getFactoryParams()
    })
  },
  getChecklistData(data, show = false) {
    // show = true,用於點檢內頁
    const _data = {
      id: data.id,
      versionId: data.last_version.id,
      name: data.name,
      checkers: show ? data.checkers : data.checkers.map(checker => checker.id),
      checkersValue: data.checkers,
      reviewer: show ? data.reviewer : data.reviewer.id,
      reviewerValue: data.reviewer,
      timely: data.frequency,
      remindDate: data.expired_before_days
        ? data.expired_before_days.toString()
        : null,
      template: {
        id: data.checklist_template ? data.checklist_template.id : null,
        name: null,
        versionId: null,
        lastVersionId: null,
        status: data.checklist_template ? data.checklist_template.status : null
      },
      systemSubclasses: show
        ? data.system_subclasses
        : data.system_subclasses.map(item => item.id),
      systemClasses: show
        ? data.system_classes
        : data.system_classes.map(item => item.id)
    }
    return _data
  },

  getTemplateQuesIds(questions) {
    //取得被選取的公版題目ids
    const templateIds = questions.map(ques => ques.id)
    return templateIds
  },

  // Create
  async create({ data }) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'checklist',
      data: data
    })
  },
  async copyChecklist(checklistId, copyName) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      name: copyName
    }
    return base.create({
      parentName: 'checklist',
      parentId: checklistId,
      modelName: 'copy',
      data: _data
    })
  },
  async collect(modelId) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    }
    return base.create({
      modelName: `v1/collect/checklist/${modelId}`,
      data: _data
    })
  },
  async unCollect(modelId) {
    const _data = {
      ...S_Processor.getFactoryParams(),
    }
    return base.create({
      modelName: `v1/uncollect/checklist/${modelId}`,
      data: _data
    })
  },

  getAllQuesData(chapters) {
    //取得要建立的題目資料 //用於create
    const allQues = []
    chapters.forEach(chapter => {
      chapter.sectionList.forEach(section => {
        section.questionList.forEach((ques, quesIndex) => {
          allQues.push({
            id: ques.id ? ques.id : null,
            _id: quesIndex,
            checklist_question_template: ques.templateId
              ? ques.templateId
              : null,
            checklist_question_template_version: ques.templateVersionId
              ? ques.templateVersionId
              : null,
            images: ques.templateId
              ? []
              : ques.images
                ? ques.images.map(image => image.url)
                : [],
            attaches: ques.templateId
              ? []
              : ques.attaches
                ? ques.attaches.map(attach => attach.url)
                : [],
            template_images: ques.templateId ? ques.images : [],
            template_attaches: ques.templateId ? ques.attaches : [],
            ocap_attaches: ques.ocapAttaches
              ? ques.ocapAttaches.map(attach => attach.url)
              : [],
            ocap_remark: ques.ocapRemark,
            title: ques.title,
            remark: ques.remark,
            type: ques.type,
            isNew: ques.isNew,
            spec_limit_lower: ques.specLimitData.lower,
            spec_limit_upper: ques.specLimitData.upper,
            control_limit_lower: ques.controlLimitData.lower,
            control_limit_upper: ques.controlLimitData.upper,
            articles: ques.articles
              ? ques.articles.map(article => article.id)
              : [],
            acts: ques.acts ? ques.acts.map(act => act.id) : [],
            effects: ques.riskSignal
              ? ques.riskSignal.map(effect => effect.id)
              : [],
            keypoint: ques.focus,
            question_type: ques.quesType
          })
        })
      })
    })
    return allQues
  },

  async $_getTemplateVersion(versionId) {
    const res = await servictChecklistTemplate.showVersion(versionId)
    this.templateVersionContent = res
  },

  async $_getTemplateVersionQues(versionId) {
    const res = await servictChecklistTemplate.quesIndex(versionId)
    this.templateQuestions = res
  },

  async $_getTemplate() {
    const res = await S_CheckListTemplate.show(this._checklistTemplateId)
    const templateContent = res
    this.checklistData.systemSubclasses = res.system_subclasses.map(
      item => item.id
    )
    await this.$_getTemplateVersion(res.last_version.id)
    await this.$_getTemplateVersionQues(res.last_version.id)
    const questions = S_CheckListTemplate.getQuestionList(
      this.templateQuestions,
      this.templateVersionContent.questions
    )
    this.chapterList[0].sectionList[0].questionList = questions
  },
  // _checklistTemplatePopupList() {
  //   const templatePopup = {
  //     systemClass: {
  //       placeholder: '篩選點檢表領域',
  //       value: []
  //     },
  //     frequency: {
  //       // placeholder: '不限頻率',
  //       selectedMenuItem: 'all',
  //       menuItems: [
  //         {
  //           id: 'all',
  //           // textLabel: '不限頻率'
  //         },
  //         {
  //           id: 'day',
  //           textLabel: '每日'
  //         },
  //         {
  //           id: 'week',
  //           textLabel: '每週'
  //         },
  //         {
  //           id: 'month',
  //           textLabel: '每月'
  //         },
  //         {
  //           id: 'season',
  //           textLabel: '每季'
  //         }
  //       ]
  //     }
  //   }
  //   if (this._checklistTemplateList.length === 0) {
  //     return []
  //   }
  //   let originalTemplateList = servictChecklistTemplate.getTemplateList(
  //     this._checklistTemplateList
  //   )
  //   originalTemplateList = servictChecklistTemplate.filterTemplateFrequency(
  //     originalTemplateList,
  //     templatePopup.frequency.selectedMenuItem
  //   )
  //   originalTemplateList = servictChecklistTemplate.filterTemplateType(
  //     originalTemplateList,
  //     this._allSystemClass,
  //     templatePopup.systemClass.value
  //   )
  //   return originalTemplateList
  // },
  // Template
  async getFilteredTemplateList(params) {
    const res = await S_CheckListTemplate.index({ params: params })
    return this.getFormat(res.data)
  },

  async getFormat(templates) {
    const _templates = templates.map(template => {
      let _name = ''
      if (template.status === 2) {
        _name = `(${i18next.t('修訂中')}) ` + template.last_version.name
      } else {
        _name = template.last_version.name
      }
      return {
        id: template.id,
        name: _name,
        last_version: template.last_version,
        status: template.status,
        questions: template.last_version.questions,
        frequency: template.frequency,
        system_class: template.system_class ? template.system_class : null,
        system_subclasses: template.system_subclasses
          ? template.system_subclasses
          : null,
        disable: template.status === 2 ? true : false
      }
    })
    return _templates
  },
  weekDateFormat(num) {
    if (num === 0) {
      return '星期日'
    } else if (num === 1) {
      return '星期一'
    } else if (num === 2) {
      return '星期二'
    } else if (num === 3) {
      return '星期三'
    } else if (num === 4) {
      return '星期四'
    } else if (num === 5) {
      return '星期五'
    } else {
      return '星期六'
    }
  },
  async createAllQuesWithVersion(datas) {
    const _datas = datas.map(item => {
      return {
        ...item
      }
    })
    const res = await base.createAll({
      modelName: 'checklist_question_with_version',
      datas: _datas
    })
    return res
  },
  getSortQues(ids, questions) {
    //取得題目排列順序 //用於create
    let _questions = JSON.parse(JSON.stringify(questions))
    const datas = _questions.map((ques, quesIndex) => {
      return {
        id: ids[quesIndex],
        type: ques.checklist_question_template ? 'template' : 'custom'
      }
    })
    return datas
  },
  getSortQuesUpdate(ids, questions) {
    //取得題目排列順序
    //用於update
    const datas = questions.map((ques, quesIndex) => {
      return {
        id: ids[quesIndex],
        type: ques.type === 'template' ? 'template' : 'custom'
      }
    })
    return datas
  },
  async updateVersion(versionId, data) {
    const _data = {
      ...data
    }
    const res = await base.update({
      modelName: 'checklist_version',
      modelId: versionId,
      data: _data
    })
    return res
  },
  getChecklistContentDeadline(frequency, expired_before_days) {
    if (!frequency) {
      return ''
    }
    if (frequency === 'season' || frequency === '每季') {
      return `${i18next.t('每季底前')}${expired_before_days}日`
    } else if (frequency === 'month' || frequency === '每月') {
      return `${i18next.t('每月底前')}${expired_before_days}日`
    } else if (frequency === 'week' || frequency === '每週') {
      return `${i18next.t('每週的')}${this.weekDateFormat(expired_before_days)}`
    } else if (frequency === 'year' || frequency === '每年') {
      return `${i18next.t('每年底前')}${expired_before_days}日`
    } else if (frequency === 'everyTime' || frequency === '每次作業前') {
      return `${i18next.t('每次作業前')}`
    } else {
      return `${i18next.t('每日')}`
    }
  },
  getExpiredDate(frequency, beforeDays) {
    const getDateFormat = date => {
      if (!date) {
        return ''
      }
      return moment(date).format('YYYY-MM-DD')
    }
    let date = new Date()
    if (frequency === 'day') {
      date = getDateFormat(date)
    } else if (frequency === 'week') {
      const weekDate = moment(date).endOf('week').subtract(beforeDays, 'days')
      date = getDateFormat(weekDate)
    } else if (frequency === 'month') {
      const monthDate = moment(date).endOf('month').subtract(beforeDays, 'days')
      date = getDateFormat(monthDate)
    } else if (frequency === 'season') {
      date = getDateFormat(date)
    } else {
      date = getDateFormat(date)
    }
    return date
  },
  getFrequencyChinese(frequency) {
    return frequency === 'week'
      ? i18next.t('每週')
      : frequency === 'month'
        ? i18next.t('每月')
        : frequency === 'season'
          ? i18next.t('每季')
          : frequency === 'day'
            ? i18next.t('每日')
            : ''
  },
  checklistFrequencyFormat(frequency) {
    if (!frequency) {
      return ''
    }
    if (frequency === '每季') {
      return 'season'
    } else if (frequency === '每月') {
      return 'month'
    } else if (frequency === '每週') {
      return 'week'
    } else {
      return 'day'
    }
  },
  getFormattedChecklistData(currentCheckListForEdit) {
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id
      })
      return result
    }
    const _checklistData = {
      name: currentCheckListForEdit.name,
      frequency: this.checklistFrequencyFormat(
        currentCheckListForEdit.frequency
      ),
      expired_before_days: currentCheckListForEdit.expired_before_days
        ? currentCheckListForEdit.expired_before_days
        : 23,
      checkers: $_formatDataWithId(currentCheckListForEdit.checkers),
      reviewers: currentCheckListForEdit.reviewers ? $_formatDataWithId(currentCheckListForEdit.reviewers) : [],
      owner: currentCheckListForEdit.owner.id,
      checklist_template: currentCheckListForEdit.checklist_template.id
        ? currentCheckListForEdit.checklist_template.id
        : null,
      system_subclasses: $_formatDataWithId(
        currentCheckListForEdit.system_subclasses
      ),
      system_classes: $_formatDataWithId(currentCheckListForEdit.system_classes)
    }
    return _checklistData
  },
  formatDataWithIdForVersionData(data) {
    const _result = []
    data.forEach(r => {
      if (r.checklist_question_template) {
        _result.push(r.checklist_question_template.id)
      }
    })
    return _result
  },
  getAllFormattedQuestions(_allQues, checklistId, versionId, factoryId) {
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id
      })
      return result
    }
    _allQues.forEach(ques => {
      ; (ques.checklist_question_template = ques.checklist_question_template
        ? ques.checklist_question_template.id
        : null),
        (ques.checklist_question_template_version = ques.last_version
          .checklist_question_template_version
          ? ques.last_version.checklist_question_template_version.id
          : null),
        (ques.images = ques.last_version.images),
        (ques.attaches = ques.last_version.attaches),
        (ques.template_images = ques.last_version.template_images),
        (ques.template_attaches = ques.last_version.template_attaches),
        (ques.ocap_attaches = ques.last_version.ocap_attaches),
        (ques.ocap_remark = ques.last_version.ocap_remark)
        ; (ques.title = ques.last_version.title),
          (ques.remark = ques.last_version.remark),
          (ques.spec_limit_lower = ques.last_version.spec_limit_lower),
          (ques.spec_limit_upper = ques.last_version.spec_limit_upper),
          (ques.spec_limit_suggest = ques.last_version.spec_limit_suggest),
          (ques.control_limit_suggest = ques.last_version.control_limit_suggest),
          (ques.control_limit_lower = ques.last_version.control_limit_lower),
          (ques.control_limit_upper = ques.last_version.control_limit_upper),
          (ques.articles = ques.last_version.articles),
          (ques.acts = ques.last_version.acts),
          (ques.act_version_alls = ques.last_version.act_version_alls
            ? $_formatDataWithId(ques.last_version.act_version_alls)
            : null),
          (ques.act_versions = ques.last_version.act_versions
            ? $_formatDataWithId(ques.last_version.act_versions)
            : null),
          (ques.article_versions = ques.last_version.article_versions
            ? $_formatDataWithId(ques.last_version.article_versions)
            : null),
          (ques.effects = ques.last_version.effects
            ? $_formatDataWithId(ques.last_version.effects)
            : null),
          (ques.keypoint = ques.last_version.keypoint)
        ; (ques.question_type = ques.last_version.question_type),
          (ques.locales = ques.last_version.question_type),
          (ques.payload = ques.last_version.payload),
          (ques.type = ques.type),
          (ques.checklists = checklistId),
          (ques.checklist_versions = versionId),
          (ques.factory = factoryId)
    })
    return _allQues
  },
  getFormattedChecklistDataForCreate(currentCheckListCreateData) {
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id
      })
      return result
    }
    const _checklistData = {
      name: currentCheckListCreateData.name,
      frequency: this.checklistFrequencyFormat(
        currentCheckListCreateData.frequency
      ),
      expired_before_days: currentCheckListCreateData.expired_before_days
        ? currentCheckListCreateData.expired_before_days
        : 1,
      reviewers: currentCheckListCreateData.reviewers ? $_formatDataWithId(currentCheckListCreateData.reviewers) : [],
      owner: currentCheckListCreateData.owner.id,
      checkers: $_formatDataWithId(currentCheckListCreateData.checkers),
      checklist_template: currentCheckListCreateData.checklist_template.id
        ? currentCheckListCreateData.checklist_template.id
        : null,
      system_subclasses: $_formatDataWithId(
        currentCheckListCreateData.system_subclasses
      ),
      system_classes: currentCheckListCreateData.system_classes
        ? currentCheckListCreateData.system_classes
        : null,
    }
    return _checklistData
  },
  getAllFormattedQuestionsForCreate(
    _allQues,
    checklistId,
    versionId,
    factoryId
  ) {
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id
      })
      return result
    }
    _allQues.forEach(ques => {
      ques.checklist_question_template = ques.id
        ; (ques.checklist_question_template_version = ques.last_version.id),
          (ques.images = ques.last_version.images),
          (ques.attaches = ques.last_version.attaches),
          (ques.template_images = ques.last_version.template_images),
          (ques.template_attaches = ques.last_version.template_attaches),
          (ques.ocap_attaches = ques.last_version.ocap_attaches),
          (ques.ocap_remark = ques.last_version.ocap_remark)
        ; (ques.title = ques.last_version.title),
          (ques.remark = ques.last_version.remark),
          (ques.spec_limit_lower = ques.last_version.spec_limit_lower),
          (ques.spec_limit_upper = ques.last_version.spec_limit_upper),
          (ques.spec_limit_suggest = ques.last_version.spec_limit_suggest),
          (ques.control_limit_suggest = ques.last_version.control_limit_suggest),
          (ques.control_limit_lower = ques.last_version.control_limit_lower),
          (ques.control_limit_upper = ques.last_version.control_limit_upper),
          (ques.articles = ques.last_version.articles),
          (ques.acts = ques.last_version.acts),
          (ques.act_version_alls = ques.last_version.act_version_alls
            ? $_formatDataWithId(ques.last_version.act_version_alls)
            : null),
          (ques.act_versions = ques.act_versions
            ? $_formatDataWithId(ques.last_version.act_versions)
            : null),
          (ques.article_versions = ques.article_versions
            ? $_formatDataWithId(ques.last_version.article_versions)
            : null),
          (ques.effects = ques.effects
            ? $_formatDataWithId(ques.last_version.effects)
            : null),
          (ques.keypoint = ques.last_version.keypoint)
        ; (ques.question_type = ques.last_version.question_type),
          (ques.locales = ques.last_version.question_type),
          (ques.payload = ques.last_version.payload),
          (ques.type = ques.last_version.type),
          (ques.checklists = checklistId),
          (ques.checklist_versions = versionId),
          (ques.factory = factoryId)
    })
    return _allQues
  },
  getFormattedDataWithIdForVersionData(data) {
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id
      })
      return result
    }
    const result = data.filter(r => {
      if (r.id) {
        return r.id
      }
    })
    const _result = $_formatDataWithId(result)
    return _result
  }
}
