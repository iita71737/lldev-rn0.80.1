import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Processor from '@/services/app/processor'
import i18next from 'i18next'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'audit',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'audit',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async collect({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/collect/audit`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async removeMyCollect(modelId) {
    return base.create({
      modelName: `v1/uncollect/audit/${modelId}`,
      data: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async addMyCollect(modelId) {
    return base.create({
      modelName: `v1/collect/audit/${modelId}`,
      data: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create({ parentId, params }) {
    return S_AuditRecord.index({
      parentId: parentId,
      params: params
    })
  },
  getFilteredTemplateList(templates) {
    return this.getFormat(templates)
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
        status: template.status,
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

  getChaptersWithQues(version, questionVersions, update = false) {
    //取得所有題目列表 (包含沒辦選取的公版題目)
    //update = true , 用於編輯、更新  ,內頁為update = false
    let questionList = []
    if (version.length === 0) {
      return questionList
    }
    let chapters = version.chapters
    chapters.forEach(chapterItem => {
      //get chapters
      let chapter = {
        title: chapterItem.title,
        badId: chapterItem.badId,
        sectionList: []
      }
      //get sections
      let sections = chapterItem.sections.map(sectionItem => {
        return {
          title: sectionItem.title,
          badId: sectionItem.badId,
          //get questions
          questionList: this.getQuesWithVersion(
            sectionItem.questions,
            questionVersions,
            update
          )
        }
      })
      chapter.sectionList = sections
      questionList.push(chapter)
    })
    return questionList
  },

  getChapterSelectTemplate(templateIds, chapters) {
    //將被選取的公版題目，放入chapters中的selectTemplate,template id 變成 question id
    //已使用過getQuesWithVersion
    let _chapters = JSON.parse(JSON.stringify(chapters))
    _chapters.forEach(chapter => {
      let allChapterQues = []
      chapter.sectionList.forEach(section => {
        allChapterQues = allChapterQues.concat(section.questionList)
      })
      let selectTemplate = allChapterQues
        .filter(
          question =>
            question.templateId && templateIds.includes(question.templateId)
        )
        .map(question => question.id)
      chapter.selectTemplate = selectTemplate
    })
    return _chapters
  },

  async getQuesLatest(params) {
    //取得題目當前版本
    return S_AuditQuestionVersion.index({
      params: params
    })
  },
  getTemplateQuesIds(questions) {
    //取得被選取的公版題目ids
    const templateIds = questions.map(ques => ques.id)
    return templateIds
  },
  async create({ data }) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      ...data
    }
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit',
      data: _data
    })
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'audit',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelId: modelId,
      modelName: 'audit',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async updateVersion({ data, versionId }) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      ...data
    }
    const res = await base.update({
      modelName: 'audit_version',
      modelId: versionId,
      data: _data
    })
    return res
  },
  async copyAudit(auditId, auditName) {
    const auditShow = await this.show({ modelId: auditId })
    const auditVersion = await S_AuditVersion.show(auditShow.last_version.id)
    const auditQuestions = await S_AuditQuestion.index({
      audit_versions: auditShow.last_version.id
    })
    const createAudit = await this.create({
      data: {
        name: auditName,
        audit_template: auditShow.audit_template,
        system_classes: auditShow.system_classes.map(
          systemClass => systemClass.id
        ),
        system_subclasses: auditShow.system_subclasses.map(
          systemSubclass => systemSubclass.id
        ),
        audit_questions: auditQuestions.data.map(ques => ques.id)
      }
    })
    const createAuditVersion = await S_AuditVersion.create({
      parentId: createAudit.id,
      data: {
        audit_template_version: auditVersion.audit_template_version.id,
        audit_question_templates: auditVersion.audit_question_templates.map(
          template => template.id
        ),
        audit_questions: auditQuestions.data.map(ques => ques.id),
        audit_question_versions: auditQuestions.data.map(
          ques => ques.last_version.id
        ),
        chapters: auditVersion.chapters
      }
    })
    return createAudit
  },
  async createVersion({ data, auditId }) {
    const _data = {
      ...S_Processor.getFactoryParams(),
      ...data
    }
    const res = await base.create({
      parentName: 'audit',
      parentId: auditId,
      modelName: 'audit_version',
      data: _data
    })
    return res
  },
  async createAllQuesWithVersion({ questions, auditId, auditVersionId }) {
    //建立多個帶第一個版本的題目
    const axiosTask = []
    questions.forEach(question => {
      let questionData = question
        ; (questionData.factory = S_Processor.getFactoryParams().factory),
          (questionData = question)
      questionData.audits = auditId
      questionData.audit_versions = auditVersionId
      axiosTask.push(questionData)
    })
    const _data = axiosTask.map(item => {
      return {
        ...item
      }
    })
    const res = await base.createAll({
      modelName: 'audit_question_with_version',
      datas: _data
    })
    return res
  },
  async updateAllQues({ questions }) {
    //更新多個題目
    const axiosTask = []
    questions.forEach(question => {
      let quesData = question
      quesData.factory = S_Processor.getFactoryParams().factory
      axiosTask.push(quesData)
    })
    const _data = axiosTask.map(item => {
      return {
        ...item
      }
    })
    const res = await base.updateAll({
      modelName: 'audit_question',
      datas: _data
    })
    return res
  },
  getSortIds({ list, copy = false }) {
    //copy = true用於複製表
    if (list.length === 0 || !list) {
      return []
    }
    const sortIds = []
    list.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (
            !question.id ||
            question.audit_question_template === question.id ||
            copy
          ) {
            sortIds.push(question._id)
          }
        })
      })
    })
    return sortIds
  },
  getSortChapters({ quesIds, sortIds, list }) {
    if (list.length === 0 || !list) {
      return []
    }
    const data = JSON.parse(JSON.stringify(list))
    const chapters = data.map(chapter => {
      return {
        badId: chapter.badId ? chapter.badId : 'other',
        title: chapter.title,
        sections: chapter.sections.map(section => {
          return {
            badId: section.badId ? section.badId : 'other',
            title: section.title,
            questions: section.questions.map(question => {
              const sortId = question._id
              const sortIdIndex = sortIds.findIndex(item => item === sortId)
              if (sortIdIndex > -1) {
                question.id = quesIds[sortIdIndex]
              }
              delete question._id
              return {
                id: question.id,
                type: question.type
              }
            })
          }
        })
      }
    })
    return chapters
  }
}
