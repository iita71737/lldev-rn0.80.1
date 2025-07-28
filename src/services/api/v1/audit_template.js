import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import i18next from 'i18next'
import S_AuditTemplateVersion from '@/services/api/v1/audit_template_version'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import S_AuditQuestionTemplate from '@/services/api/v1/audit_question_template'

export default {
  async index({ params }) {
    return await base.index({
      modelName: 'audit_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getFilteredTemplateList({ parentId, params }) {
    const res = await this.index({
      parentId: parentId,
      params: params
    })
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
        status: template.status,
        last_version: template.last_version,
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
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit_template',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getQuesForQuesList(versionId) {
    const _versions = await S_AuditTemplateVersion.show(versionId)
    const _params = {
      lang: 'tw',
      audit_template_versions: versionId
    }
    const _questions = await S_AuditQuestionTemplate.indexV2({ params: _params })
    // ✅ 若沒有題目資料，直接回傳空陣列
    if (!_questions.data || _questions.data.length === 0) {
      return [];
    }

    const _selectedQues = []
    _questions.data.forEach(question => {
      _versions.audit_question_templates.forEach(_question => {
        if (question.id === _question.id) {
          _selectedQues.push({
            ...question.last_version,
            ...question,
          })
        }
      })
    })
    const _quesInChapters = []
    _versions.chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.topics.forEach(question => {
          _selectedQues.forEach(_question => {
            if (question.id === _question.id) {
              _questionsFilter.push({
                ..._question,
              })
            }
          })
        })
        if (_questionsFilter.length > 0) {
          _quesInSections.push({
            badId: section.badId,
            sectionTitle: section.title
              ? section.title
              : section.sectionTitle
                ? section.sectionTitle
                : '',
            questions: _questionsFilter
          })
        }
      })
      if (_quesInSections.length > 0) {
        _quesInChapters.push({
          badId: chapter.badId,
          chapterTitle: chapter.title
            ? chapter.title
            : chapter.chapterTitle
              ? chapter.chapterTitle
              : '',
          sections: _quesInSections
        })
      }
    })
    return _quesInChapters
  },
}
