import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'

export default {
  async indexV2({ params }) {
    return base.index({
      modelName: 'v2/checklist_question_version',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'checklist_question_version',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async createAll(datas) {
    const _datas = []
    datas.map(question => {
      const actAllIds = question.last_version &&
        question.last_version.act_version_alls &&
        question.last_version.act_version_alls.length > 0 ?
        question.last_version.act_version_alls.map(actAll => {
          return actAll.id
        })
        : []
      const _actVersionIds = question.last_version
        ? question.last_version.act_versions.map(act => {
          return act.id
        })
        : []
      const articleVersionIds = question.last_version
        ? question.last_version.article_versions.map(article => {
          return article.id
        })
        : []
      const _effects = question.last_version
        ? question.last_version.effects.map(effect => {
          return effect.id
        })
        : []
      _datas.push({
        checklist_question: question.id,
        checklist_question_template_version:
          question.checklist_question_template_version
            ? question.checklist_question_template_version.last_version.id
            : null,
        effects: _effects,
        act_version_alls: actAllIds,
        article_versions: articleVersionIds,
        act_versions: _actVersionIds,
        ocap_remark: question.last_version
          ? question.last_version.ocap_remark
          : null,
        control_limit_upper: question.last_version
          ? question.last_version.control_limit_upper
          : null,
        control_limit_lower: question.last_version
          ? question.last_version.control_limit_lower
          : null,
        spec_limit_upper: question.last_version
          ? question.last_version.spec_limit_upper
          : null,
        spec_limit_lower: question.last_version
          ? question.last_version.spec_limit_lower
          : null,
        title: question.last_version
          ? question.last_version.title
          : question.title
            ? question.title
            : '無標題',
        ocap_attaches: question.last_version
          ? question.last_version.ocap_attaches
          : null,
        ocap_images: question.last_version
          ? question.last_version.ocap_images
          : null,
        remark: question.last_version ? question.last_version.remark : null,
        template_images: question.last_version
          ? question.last_version.template_images
          : null,
        template_attaches: question.last_version
          ? question.last_version.template_attaches
          : null,
        attaches: question.last_version ? question.last_version.attaches : null,
        images: question.last_version ? question.last_version.images : null,
        ...S_Processor.getFactoryData()
      })
    })
    return base.createAll({
      modelName: 'checklist_question_version',
      datas: _datas
    })
  },
  getExistedQuestionsFromChapters(questions) {
    const createdQuestion = []
    questions.forEach(question => {
      if (question.id || question.status != 'remove') {
        createdQuestion.push(question)
      }
    })
    return createdQuestion
  },
  async existedQuestionsCreateVersion(questions) {
    const _questions = this.getExistedQuestionsFromChapters(questions)
    return await this.createAll(_questions)
  }
}
