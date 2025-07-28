import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_AuditQuesTemplates from '@/services/api/v1/audit_question_template'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_Processor from '@/services/app/processor'
import S_Audit from '@/services/api/v1/audit'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'

export default {
  async index(params) {
    return base.index({
      modelName: 'audit_question',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'audit_question',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  // 所有題目含複製與自訂
  async getQuesInChaptersByAuditVersion(versionId) {
    const _questions = await this.index({
      audit_versions: versionId,
      is_select: 0
    })
    const _versions = await S_AuditVersion.show(versionId)

    const _quesInChapters = []
    _versions.chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          _questions.data.forEach(_question => {
            if (question.id === _question.id) {
              _questionsFilter.push({
                ..._question,
                type: question.type ? question.type : 'template'
              })
            }
          })
        })
        _quesInSections.push({
          badId: section.badId,
          sectionTitle: section.title
            ? section.title
            : section.sectionTitle
              ? section.sectionTitle
              : '',
          questions: _questionsFilter
        })
      })
      _quesInChapters.push({
        badId: chapter.badId,
        chapterTitle: chapter.title
          ? chapter.title
          : chapter.chapterTitle
            ? chapter.chapterTitle
            : '',
        sections: _quesInSections
      })
    })
    return _quesInChapters
  },
  // 被挑選的題目
  async getQuesForQuesList(versionId) {
    const _versions = await S_AuditVersion.show(versionId)
    const _params = {
      lang: 'tw',
      audit_versions: versionId
    }
    const _questions = await S_AuditQuestionVersion.indexV2({ params: _params })
    const _selectedQues = []
    _questions.data.forEach(question => {
      _versions.audit_question_templates.forEach(_question => {
        if (question.audit_question && 
          question.audit_question.audit_question_template && 
          question.audit_question.audit_question_template.id) {
          if (question.audit_question.audit_question_template.id === _question.id) {
            _selectedQues.push({
              ...question,
              type: 'template'
            })
          }
        }
      })
      if (question.audit_question && 
        question.audit_question.audit_question_template === null) {
        _selectedQues.push({
          ...question,
          type: 'custom'
        })
      }
    })
    const _quesInChapters = []
    _versions.chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          _selectedQues.forEach(_question => {
            if (question.id === _question.audit_question.id) {
              _questionsFilter.push({
                ..._question,
                type: question.type ? question.type : 'template'
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
  // 以id array篩選出被挑選的章節題目 ex: [84,85]
  getQuesByQuesId(
    name,
    audit_question_with_version,
    audit_question_templates = []
  ) {
    if (name === 'AuditCreate') {
      const _quesInChapters = []
      audit_question_with_version.forEach(chapter => {
        const _quesInSections = []
        chapter.sections.forEach(section => {
          const _questionsFilter = []
          section.questions.forEach(question => {
            audit_question_templates.forEach(_questionId => {
              if (_questionId === question.id) {
                _questionsFilter.push({
                  ...question,
                  type: question.type ? question.type : 'template'
                })
              }
            })
            if (question.type === 'custom') {
              _questionsFilter.push({
                ...question,
                type: 'custom'
              })
            }
          })
          if (_questionsFilter.length > 0) {
            _quesInSections.push({
              badId: section.badId,
              sectionTitle: section.sectionTitle,
              questions: _questionsFilter
            })
          }
        })
        if (_quesInSections.length > 0) {
          _quesInChapters.push({
            badId: chapter.badId,
            chapterTitle: chapter.chapterTitle,
            sections: _quesInSections
          })
        }
      })
      return _quesInChapters
    }
    if (name === 'AuditUpdate') {
      const _quesInChapters = []
      audit_question_with_version.forEach(chapter => {
        const _quesInSections = []
        chapter.sections.forEach(section => {
          const _questionsFilter = []
          section.questions.forEach(question => {
            audit_question_templates.forEach(_questionId => {
              if (question.audit_question_template) {
                if (_questionId === question.audit_question_template.id) {
                  _questionsFilter.push({
                    ...question
                  })
                }
              }
            })
            if (
              question.type === 'custom' &&
              (question.audit_question_template == null ||
                question.audit_question_template == 'custom')
            ) {
              _questionsFilter.push({
                ...question,
                type: 'custom'
              })
            }
          })
          if (_questionsFilter.length > 0) {
            _quesInSections.push({
              badId: section.badId,
              sectionTitle: section.sectionTitle,
              questions: _questionsFilter
            })
          }
        })
        if (_quesInSections.length > 0) {
          _quesInChapters.push({
            badId: chapter.badId,
            chapterTitle: chapter.chapterTitle,
            sections: _quesInSections
          })
        }
      })
      return _quesInChapters
    }
  },
  async getQuesInChaptersToTemplateUpdate(
    audit,
    template,
    questions,
    questionTemplate
  ) {
    let _formatChapters
    _formatChapters = await this.getQuesInChaptersByAuditVersion(
      audit.last_version.id
    )
    _formatChapters = this.getChaptersWithAddQuestions(
      _formatChapters,
      template.last_version.chapters,
      questionTemplate
    )
    _formatChapters = this.getChaptersWithUpdateQuestions(
      _formatChapters,
      template,
      questionTemplate,
      questions
    )
    _formatChapters = this.getChaptersWithDeleteQuestions(
      template,
      _formatChapters
    )
    return _formatChapters
  },
  getChaptersWithDeleteQuestions(template, formatChapters) {
    formatChapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (!question.status) {
            question.status = 'remove'
            template.last_version.audit_question_templates.forEach(
              templateQues => {
                if (question.audit_question_template) {
                  if (templateQues.id == question.audit_question_template.id) {
                    question.status = 'same'
                  }
                }
              }
            )
          }
        })
      })
    })
    return formatChapters
  },

  getChaptersWithAddQuestions(
    auditChapters,
    templateChapters,
    questionTemplates
  ) {
    const _chapters = [...auditChapters]
    auditChapters.forEach((auditChapter, auditChapterIndex) => {
      templateChapters.forEach((templateChapter, templateChapterIndex) => {
        if (auditChapter.badId == templateChapter.badId) {
          auditChapter.sections.forEach((auditSection, auditSectionIndex) => {
            // change keypoint = 0
            auditSection.questions.forEach((auditQues, auditQuesIndex) => {
              _chapters[auditChapterIndex].sections[
                auditSectionIndex
              ].questions[auditQuesIndex].keypoint = 0
            })
            //put new questions in chapter
            templateChapter.sections.forEach(
              (templateSection, templateSectionIndex) => {
                if (auditSection.badId == templateSection.badId) {
                  if (!templateSection.topics) {
                    return
                  }
                  templateSection.topics.forEach(
                    (templateQues, templateQuesIndex) => {
                      const exist = auditSection.questions.find(e => {
                        if (!e.audit_question_template) {
                          return false
                        }
                        return templateQues.id == e.audit_question_template.id
                      })
                      if (!exist) {
                        const _question = questionTemplates.data.find(e => {
                          return e.id == templateQues.id
                        })
                        const _data = {
                          ..._question,
                          title: _question.last_version.title,
                          type: 'template',
                          status: 'add',
                          keypoint: 0,
                          audit_question_template_version:
                            _question.last_version.id,
                          audit_question_template: _question.id
                        }
                        delete _data.id
                        _chapters[auditChapterIndex].sections[
                          auditSectionIndex
                        ].questions.push({
                          ..._data
                        })
                      }
                    }
                  )
                }
              }
            )
          })
        }
      })
    })
    return _chapters
  },
  getChaptersWithUpdateQuestions(
    auditChapters,
    templateChapters,
    questionTemplates,
    questions
  ) {
    const _chapters = [...auditChapters]
    auditChapters.forEach((auditChapter, auditChapterIndex) => {
      auditChapter.sections.forEach((auditSection, auditSectionIndex) => {
        auditSection.questions.forEach((auditQues, auditQuesIndex) => {
          // const _question = questions.find(e => {
          //   return e.id == auditQues.id
          // })
          // auditQues
          if (!auditQues.audit_question_template) {
            return
          }
          const _questionTemplate = questionTemplates.data.find(e => {
            return e.id == auditQues.audit_question_template.id
          })
          if (!_questionTemplate) {
            return
          }
          if (!_questionTemplate.last_version) {
            return
          }
          if (
            auditQues.last_version.audit_question_template_version.id !=
            _questionTemplate.last_version.id
          ) {
            const _data = {
              ..._questionTemplate,
              title: _questionTemplate.last_version.title,
              type: 'template',
              status: 'update',
              audit_question_template_version:
                _questionTemplate.last_version.id,
              audit_question_template: _questionTemplate.id
            }
            delete _data.id
            _chapters[auditChapterIndex].sections[auditSectionIndex].questions[
              auditQuesIndex
            ] = {
              ..._data
            }
          }
        })
      })
    })
    return _chapters
  },

  getChaptersWithRemovedQuestions(chapters, questionTemplates) {
    const _chapters = []
    const _questionIds = []
    audit.last_version.chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          questionTemplates.forEahc(questionTemplate => {
            if (question == questionTemplate) {
            }
          })
        })
      })
    })
  },

  async getSelectQuestionInChapters(auditVersionId, questions) {
    // 已使用過getQuesInChaptersByAuditVersion
    const _versions = await S_AuditVersion.show(auditVersionId)
    const _quesInChapters = []
    questions.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          _versions.audit_question_templates.forEach(questionId => { })
        })
        if (_questionsFilter.length != 0) {
          _quesInSections.push({
            sectionTitle: section.title,
            questions: _questionsFilter
          })
        }
      })
      _quesInChapters.push({
        chapterTitle: chapter.title,
        sections: _quesInSections
      })
    })
    return _quesInChapters
  },

  getQuestionsFromQuestionTemplates(questionTemplates) {
    const _questions = []
    questionTemplates.forEach(questionTemplate => {
      if (!questionTemplate.last_version) {
        return
      }
      _questions.push({
        ...questionTemplate,
        templateId: questionTemplate.id,
        type: 'template',
        templateVersionId: questionTemplate.last_version.id
      })
    })
    return _questions
  },

  getQuessWithChaptersFromQuessAndChapters(quess, chapters) {
    chapters.forEach(chapter => {
      const _sections = []
      chapter.sections.forEach(section => {
        const _questions = []
        quess.forEach(_ques => {
          // if (quesTemplate.last_version && quesTemplate.last_version.payload.sectionId == section.badId) {
          //   _questions.push({
          //     ...quesTemplate,
          //     templateId: quesTemplate.id,
          //     type: 'template',
          //     templateVersionId: quesTemplate.last_version.id,
          //   })
          // }
        })
      })
    })
  },

  async getQuesTemplatesWithChapters(aduitTemplate) {
    const _quesTemplates = await S_AuditQuesTemplates.index({
      audit_template_versions: aduitTemplate.id
    })
    if (_quesTemplates) {
      const _quesTemplatesWithChapters = []
      aduitTemplate.chapters.forEach(chapter => {
        const _questionWithSections = []
        chapter.sections.forEach(section => {
          const _questions = []
          _quesTemplates.data.forEach(quesTemplate => {
            if (
              quesTemplate.last_version &&
              quesTemplate.last_version.payload.sectionId == section.badId
            ) {
              _questions.push({
                ...quesTemplate,
                templateId: quesTemplate.id,
                type: 'template',
                templateVersionId: quesTemplate.last_version.id
              })
            }
          })
          _questionWithSections.push({
            sectionTitle: section.sectionTitle,
            questions: _questions,
            badId: section.badId
          })
        })
        _quesTemplatesWithChapters.push({
          chapterTitle: chapter.chapterTitle,
          sections: _questionWithSections,
          badId: chapter.badId
        })
      })
      return _quesTemplatesWithChapters
    }
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
                id: question.id ? question.id : null,
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
                remark: question.last_version
                  ? question.last_version.remark
                  : question.remark
                    ? question.remark
                    : null,
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
                effects: question.last_version
                  ? question.last_version.effects.map(effect => effect.id)
                  : null,
                acts: question.acts ? question.acts.map(act => act.id) : null,
                keypoint: question.last_version
                  ? question.last_version.keypoint
                  : 0,
                payload: {
                  chapterId: chapter.badId ? chapter.badId : 'other',
                  sectionId: section.badId ? section.badId : 'other'
                },
                article_versions: question.last_version
                  ? question.last_version.article_versions.map(
                    article => article.id
                  )
                  : null,
                act_versions: question.last_version
                  ? question.last_version.act_versions.map(act => act.id)
                  : null,
                status: question.status
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

  getAllQuesForCreateVersion(list, apiQuestions) {
    let countingIndex = 0
    const _chapters = []
    list.forEach((chapter, chapterIndex) => {
      const _sections = []
      chapter.sections.forEach((section, sectionIndex) => {
        const _questions = []
        section.questions.forEach((question, questionIndex) => {
          _questions.push({
            type: question.templateId ? 'template' : 'custom',
            id: apiQuestions[countingIndex].data.data.id
          })
          countingIndex++
        })
        _sections.push({
          badId: section.badId ? section.badId : 'other',
          title: section.sectionTitle,
          questions: _questions
        })
      })
      _chapters.push({
        badId: chapter.badId ? chapter.badId : 'other',
        title: chapter.chapterTitle,
        sections: _sections
      })
    })
    return _chapters
  },

  createQuestionsFromChapters(datas) {
    const chaptersAll = this.getChaptersAll(datas)
    const allQues = this.getAllQues(chaptersAll)
    return this.createAll(allQues)
  },

  async createAll(datas) {
    return base.createAll({
      modelName: 'audit_question_with_version',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async create(data) {
    return base.create({
      modelName: 'audit_question_with_version',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async judgmentCreate(datas) {
    const tasks = []
    datas.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (!question.id) {
            tasks.push(this.create(question))
          } else {
            return null
          }
        })
      })
    })
    return await Promise.all(tasks)
  },
  getNewQuestionsFromChapters(chapters) {
    const _questions = []
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (!question.id) {
            _questions.push({
              payload: question.last_version
                ? question.last_version.payload
                : null,
              images: [],
              attaches: [],
              template_images: [],
              tempalte_attaches: [],
              title: question.title,
              remark: question.last_version
                ? question.last_version.remark
                : null,
              articles: [],
              acts: [],
              effects: [],
              keypoint: question.last_version
                ? question.last_version.keypoint
                : question.keypoint
                  ? question.keypoint
                  : null
            })
          }
        })
      })
    })
    return _questions
  },

  async newQuestionsCreate(chapters) {
    const questions = this.getNewQuestionsFromChapters(chapters)
    const exisetedQuestions = await this.createAll(questions)
    return this.putQuestionsInChapters(chapters, exisetedQuestions)
  },
  putQuestionsInChapters(chapters, questions) {
    const _chapters = [...chapters]
    let countsIndex = 0
    chapters.forEach((chapter, chapterIndex) => {
      chapter.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((_question, _questionIndex) => {
          if (!_question.id) {
            chapters[chapterIndex].sections[sectionIndex].questions[
              _questionIndex
            ] = {
              ...questions[countsIndex].data.data,
              type: 'custom'
            }
            countsIndex++
          }
        })
      })
    })
    return _chapters
  },
  async getUserQuestions(auditId) {
    // 取得稽核表
    const audit = await S_Audit.show({ modelId: auditId })

    // 取得稽核表最新版本所有題目
    const _questions = await this.index({
      audit_versions: audit.last_version.id
    })

    // 被挑選的題目(資料形式包含章＆節)
    const _chapter = await this.getQuesForQuesList(
      audit.last_version.id
    )
    return this.formattedQuesForAssignment(_questions.data, _chapter)
  },
  formattedQuesForAssignment(questions, chapters) {
    let _chapters = [...chapters]
    const _questions = []
    chapters.forEach((chapter, chapterIndex) => {
      chapter.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((chapterQues, chapterQuesIndex) => {
          questions.forEach(question => {
            if (question.id === chapterQues.id) {
              _questions.push({
                ...question
              })
            }
          })
        })
      })
    })
    return _questions
  },
  $_formatDataWithId(data) {
    const result = data.map(r => {
      return r.id
    })
    return result
  },
  // 編輯稽核表StepTwo初始化，被挑選的題目
  getInitSelectedQuestions({ questions, auditVersion }) {
    const _data = [...questions]
    const _quesInChapters = []
    _data.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          if (question.audit_question_template) {
            auditVersion.audit_question_templates.forEach(questionTemplate => {
              if (questionTemplate.id === question.audit_question_template.id) {
                _questionsFilter.push({
                  ...question,
                  type: 'template'
                })
              }
            })
          } else {
            if (question.type === 'custom') {
              _questionsFilter.push({
                ...question,
                type: 'custom'
              })
            }
          }
        })
        if (_questionsFilter.length > 0) {
          _quesInSections.push({
            badId: section.badId,
            sectionTitle: section.sectionTitle,
            questions: _questionsFilter
          })
        }
      })
      if (_quesInSections.length > 0) {
        _quesInChapters.push({
          badId: chapter.badId,
          chapterTitle: chapter.chapterTitle,
          sections: _quesInSections
        })
      }
    })
    return _quesInChapters
  },
  getInitSelectedQuestionsByTemplateId(questions) {
    const questionIds = []
    questions.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (
            question.audit_question_template &&
            question.audit_question_template.id
          ) {
            questionIds.push(question.audit_question_template.id)
          }
        })
      })
    })
    return questionIds
  },
  getQuesTemplates(datas) {
    const questionIds = []
    datas.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.audit_question_template) {
            questionIds.push(question.audit_question_template.id)
          }
        })
      })
    })
    return questionIds
  },
  // 取得一開始章節屬於其他的題目
  getInitOtherQuestions(questions) {
    const _otherQuestions = []
    questions.forEach(chapter => {
      if (chapter.badId === 'other') {
        chapter.sections.forEach(section => {
          section.questions.forEach(question => {
            _otherQuestions.push(question)
          })
        })
      }
    })
    return _otherQuestions
  },
  $_formattedDataById(data) {
    const _data = data.map(r => {
      return r.id
    })
    return _data
  },
  getQuestionWithDraft(questions, draft) {
    if (draft && draft.length > 0) {
      return draft
    } else {
      return questions
    }
  },

  getCount(questions) {
    let count = 0
    if (questions && questions.length > 0) {
      questions.forEach(chapter => {
        if (chapter.sections && chapter.sections.length > 0) {
          chapter.sections.forEach(section => {
            if (section.questions && section.questions.length > 0) {
              count += section.questions.length
            }
          })
        }

      })
    }
    return count
  }
}
