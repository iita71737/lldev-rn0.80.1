import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Processor from '@/services/app/processor'

export default {
  async index({ params }) {
    const res = await base.index({
      modelName: 'audit_question_version',
      // params: params,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async indexV2({ params }) {
    const res = await base.index({
      modelName: 'v2/audit_question_version',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
    return res
  },
  async show(modelId) {
    return base.show({
      modelName: 'audit_question_version',
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
    })
  },
  async create(data) {
    return base.create({
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      },
      modelName: 'audit_question_version'
    })
  },
  async createAll(datas) {
    const _data = []
    datas.forEach(question => {
      _data.push({
        type: question.type,
        audit_question:
          question.last_version && question.last_version.audit_question
            ? question.last_version.audit_question.id
            : question.audit_question
              ? question.audit_question.id
              : question.id
                ? question.id
                : null,

        audit_question_template_version:
          question.last_version &&
            question.last_version.audit_question_template_version &&
            question.last_version.audit_question_template_version.id
            ? question.last_version.audit_question_template_version.id
            : question.audit_question_template_version
              ? question.audit_question_template_version.id
              : question.audit_question_template_version
                ? question.audit_question_template_version
                : null,

        images: question.last_version ? question.last_version.images : null,
        attaches: question.last_version ? question.last_version.attaches : null,
        template_images: question.last_version
          ? question.last_version.template_images
          : null,
        template_attaches: question.last_version
          ? question.last_version.template_attaches
          : null,
        title: question.title,
        remark: question.last_version ? question.last_version.remark : null,
        act_versions: question.last_version
          ? this.$_formattedDataById(question.last_version.act_versions)
          : null,
        article_versions: question.last_version
          ? this.$_formattedDataById(question.last_version.article_versions)
          : null,
        act_version_alls: question.last_version
          ? this.$_formattedDataById(question.last_version.act_version_alls)
          : null,
        effects: question.last_version
          ? this.$_formattedDataById(question.last_version.effects)
          : null,
        keypoint: question.last_version ? question.last_version.keypoint : null,
        payload: question.last_version ? question.last_version.payload : null,
        ...S_Processor.getFactoryData()
      })
    })
    return base.createAll({
      modelName: 'audit_question_version',
      datas: _data
    })
  },

  getExistedQuestionsFromChapters(chapters) {
    const createdQuestion = []
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.id) {
            createdQuestion.push(question)
          }
        })
      })
    })
    return createdQuestion
  },

  async existedQuestionsCreateVersion(chapters) {
    const questions = this.getExistedQuestionsFromChapters(chapters)
    const exisetedQuestions = await this.createAll(questions)
    return this.putQuestionsVersionInChapters(chapters, exisetedQuestions)
  },
  putQuestionsVersionInChapters(chapters, questionVersions) {
    let countsIndex = 0
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.id) {
            question.last_version = questionVersions[countsIndex].data.data
            countsIndex++
          }
        })
      })
    })
    return chapters
  },

  getChaptersAll(list) {
    //整理好可送出api的chapters格式
    const chapters = list.map((chapter, chapterIndex) => {
      return {
        badId: chapter.badId ? chapter.badId : 'other',
        chapterTitle: chapter.chapterTitle,
        sections: chapter.sections.map((section, sectionIndex) => {
          return {
            badId: section.badId ? section.badId : 'other',
            sectionTitle: section.sectionTitle,
            questions: section.questions.map((question, questionIndex) => {
              let data = {
                audit_question: question.id ? question.id : null,
                _id: `${chapterIndex}${sectionIndex}${questionIndex}`,
                audit_question_template:
                  question.type === 'template' && question.templateId
                    ? question.templateId
                    : question.type === 'template' && question.id
                      ? question.id
                      : null,
                audit_question_template_version:
                  question.type === 'template'
                    ? question.templateVersionId
                    : null,
                type: question.type,
                title: question.last_version
                  ? question.last_version.title
                  : question.title,
                remark: question.remark,
                images: question.images
                  ? question.images.map(image =>
                    image.url ? image.url : image
                  )
                  : null,
                attaches: question.attaches
                  ? question.attaches.map(attach =>
                    attach.url ? attach.url : attach
                  )
                  : question.files
                    ? question.files.map(attach =>
                      attach.url ? attach.url : attach
                    )
                    : null,
                articles: question.articles
                  ? question.articles.map(article => article.id)
                  : null,
                effects: question.riskSignal
                  ? question.riskSignal.map(effect => effect.id)
                  : null,
                acts: question.acts ? question.acts.map(act => act.id) : null,
                keypoint: question.focus,
                payload: {
                  chapterId: chapter.badId ? chapter.badId : 'other',
                  sectionId: section.badId ? section.badId : 'other'
                }
              }
              return data
            })
          }
        })
      }
    })
    return chapters
  },
  getAllQues(list) {
    //取得所有已經整理好格式的題目 已使用過 getChaptersAll
    if (list.length === 0 || !list) {
      return []
    }
    const allQues = []
    list.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          let data = question
          if (question.audit_question_template) {
            if (question.images) {
              question.template_images = [...question.images]
            }
            if (question.attaches) {
              question.template_attaches = [...question.attaches]
            }
            question.images = []
            question.attaches = []
          }
          question.payload = {
            chapterId: chapter.badId,
            sectionId: section.badId
          }
          allQues.push(data)
        })
      })
    })
    return allQues
  },
  $_formattedDataById(data) {
    const _data = data.map(r => {
      return r.id
    })
    return _data
  },
  // 230908
  formattedQues(questions, templateIds) {
    let _questions = []
    if (questions && questions.length > 0) {
      questions.forEach(ques => {
        if (ques.audit_question) {
          templateIds.forEach(_item => {
            // 挑出公版題目
            if (ques.audit_question.audit_question_template && ques.audit_question.audit_question_template.id === _item.id) {
              const _formatted = {
                ...ques,
                id: ques.audit_question.id
              }
              _questions.push(_formatted)
            }
          })
          // 挑出自訂題目
          if (ques.audit_question.audit_question_template == null) {
            const _formatted = {
              ...ques,
              id: ques.audit_question.id
            }
            _questions.push(_formatted)
          }
        }
      })
    }
    return _questions
  },
  questionsSorted(questions, chapters) {
    let __questions = []
    if (
      !chapters ||
      !questions ||
      chapters.length === 0 ||
      questions.length === 0
    ) {
      return []
    }
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach((question, index) => {
          questions.forEach(_ques => {
            if (_ques.audit_question && _ques.audit_question.id === question.id) {
              __questions.push({
                ..._ques,
                chapterTitle : chapter.title,
                sectionTitle : `第${index+1}節`,
              })
            }
          })
        })
      })
    })
    return __questions
  }
}
