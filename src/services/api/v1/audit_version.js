import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Processor from '@/services/app/processor'
import S_Audit from '@/services/api/v1/audit'
export default {
  async create({ parentId, data }) {
    return base.create({
      modelName: 'audit_version',
      parentName: 'audit',
      parentId: parentId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'audit_question_version',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'audit_version',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async useQuestionsToCreate({ parentId, data, questions }) {
    const questionVersionIds = []
    const questionIds = []
    questions.forEach(question => {
      questionVersionIds.push(question.data.data.last_version.id)
      questionIds.push(question.data.data.id)
    })
    const allQues = S_AuditQuestion.getAllQuesForCreateVersion(
      data.audit_question_with_version,
      questions
    )
    const _data = {
      audit_template_version: data.audit_template
        ? data.audit_template.last_version.id
        : null,
      audit_question_templates: data.audit_question_templates,
      audit_questions: questionIds,
      audit_question_versions: questionVersionIds,
      chapters: allQues
    }
    return this.create({
      parentId: parentId,
      data: _data
    })
  },
  async createFromChapters(chapters, auditId, questionTemplates) {
    const audit_template_version = await this.getTemplateVerions(auditId)
    return this.create({
      parentId: auditId,
      data: {
        audit_template_version: audit_template_version,
        audit_question_templates: questionTemplates,
        audit_questions: this.getQuestionIdsFromChapters(chapters),
        audit_question_versions:
          this.getQuestionVersionIdsFromChapters(chapters),
        chapters: this.formatChpaters(chapters)
      }
    })
  },
  getQuestionIdsFromChapters(chapters) {
    const ids = []
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          ids.push(question.id)
        })
      })
    })
    return ids
  },
  getQuestionVersionIdsFromChapters(chapters) {
    const ids = []
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          ids.push(question.last_version.id)
        })
      })
    })
    return ids
  },

  async getTemplateVerions(audutId) {
    const res = await S_Audit.show({ modelId: audutId })
    return res.audit_template.last_version.id
  },
  formatChpaters(chapters) {
    return chapters.map(chapter => {
      return {
        badId: chapter.badId,
        chapterTitle: chapter.chapterTitle,
        sections: chapter.sections.map(section => {
          return {
            badId: section.badId,
            sectionTitle: section.sectionTitle,
            questions: section.questions.map(question => {
              return {
                id: question.id,
                type: question.type
              }
            })
          }
        })
      }
    })
  },
  async useQuestionVersionsToCreate({
    parentId,
    data,
    oldQuestions,
    newQuestions
  }) {
    const questionVersionIds = []
    // audit_questions
    const questionIds = []
    data.audit_question_versions.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          questionIds.push(question.id)
        })
      })
    })
    if (newQuestions.length > 0) {
      newQuestions.forEach(question => {
        questionIds.push(question.id)
      })
    }
  }
}
