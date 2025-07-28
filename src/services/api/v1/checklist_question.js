import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_CheckList from '@/services/api/v1/checklist'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_CheckListQuestionTemplate from '@/services/api/v1/checklist_question_template'
import S_Processor from '@/services/app/processor'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import i18next from 'i18next'
import moment from 'moment'
import Geolocation from '@react-native-community/geolocation';

export default {
  async index({ params }) {
    return base.index({
      modelName: 'checklist_question',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getQuestionsWithCheckListTemplate(questionIds, templateId) {
    const _questionsWithTemplate = await S_CheckListQuestionTemplate.index({
      checklist_template_versions: templateId
    })
    if (questionIds) {
      const _question = []
      questionIds.forEach(questionId => {
        _questionsWithTemplate.data.forEach(question => {
          if (question.id == questionId.id) {
            _question.push({
              ...question
            })
          }
        })
      })
      return _question
    }
  },
  async getQuesFromCheckListVersion(checklistVersion) {
    const checklistQuestions = await this.index({
      checklist_versions: checklistVersion.id
    })

    const _questions = []
    checklistVersion.questions.forEach(versionQues => {
      checklistQuestions.data.forEach(question => {
        if (versionQues.id == question.id) {
          _questions.push({
            ...question,
            type: versionQues.type
          })
        }
      })
    })
    return _questions
  },
  async getSelectedQuesFromCheckListVersion(checklistVersion) {
    const checklistQuestions = await this.index({
      checklist_versions: checklistVersion.id,
      is_select: 1
    })
    return checklistQuestions
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'checklist_question',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async showV2({ modelId }) {
    return base.show({
      modelName: 'v2/checklist_question',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  getQuesFromVersionAndTemplate(
    checklistVersion,
    template,
    questions,
    templateQuestions
  ) {
    let _questions = questions.map(ques => {
      if (ques.last_version) {
        return {
          ...ques,
          type: ques.checklist_question_template ? 'template' : 'custom',
          status: 'same'
        }
      } else {
        return null
      }
    })
    // templateRemove
    questions.forEach((question, questionIndex) => {
      if (
        question &&
        question.checklist_question_template &&
        question.checklist_question_template.last_version === null
      ) {
        _questions[questionIndex] = {
          ...question,
          status: 'remove',
          type: 'template'
        }
      }
      if (
        !question.checklist_question_template ||
        !question.last_version.checklist_question_template_version
      ) {
        return
      }
      const has = templateQuestions.find(templateQues => {
        return templateQues.id == question.checklist_question_template.id
      })
      if (!has) {
        _questions[questionIndex] = {
          ...question,
          status: 'remove',
          type: 'template'
        }
      }
    })

    // templateAdd
    templateQuestions.forEach(templateQues => {
      const has = questions.find(question => {
        if (
          !question.checklist_question_template ||
          !question.last_version.checklist_question_template_version
        ) {
          return false
        }
        return templateQues.id == question.checklist_question_template.id
      })
      if (has == undefined) {
        _questions.push({
          ...templateQues,
          status: 'add',
          type: 'template'
        })
      }
    })
    questions.forEach((question, questionIndex) => {
      templateQuestions.forEach((templateQues, templateQuesIndex) => {
        if (
          !question.checklist_question_template ||
          !question.last_version.checklist_question_template_version
        ) {
          return
        }
        // SameQues
        if (question.checklist_question_template.id == templateQues.id) {
          if (
            templateQues &&
            templateQues.last_version &&
            templateQues.last_version.id !=
            question.last_version.checklist_question_template_version.id
          ) {
            // templateUpdate
            _questions[questionIndex] = {
              ...templateQues,
              status: 'update',
              type: question.type ? question.type : 'template'
            }
          }
        }
      })
    })
    _questions = _questions.sort((a, b) => {
      if (a.type == 'template' && b.type == 'custom') {
        return -1
      } else if (a.type == 'custom' && b.type == 'template') {
        return 1
      } else {
        return 0
      }
    })
    return _questions
  },

  //Create
  async create(data) {
    return base.create({
      modelName: 'checklist_question_with_version',
      // data: data,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async createAll(datas) {
    const _datas = []
    datas.forEach(data => {
      _datas.push({
        ...data,
        title: data.title ? data.title : data.last_version.title
      })
    })
    return base.createAll({
      // preUrl: preUrl.getFactoryPreUrl(),
      modelName: 'checklist_question_with_version',
      // datas: _datas,
      datas: S_Processor.getDatasWithFactory(_datas)
    })
  },
  getNewQuestionsFromChapters(questions) {
    const createdQuestion = []
    if (questions) {
      questions.forEach(question => {
        if (!question.id) {
          createdQuestion.push(question)
        }
      })
    }
    return createdQuestion
  },
  async newQuestionsCreate(questions) {
    const _questions = this.getNewQuestionsFromChapters(questions)
    return await this.createAll(_questions)
  },
  async getUserCheckListQuestions(versionId) {
    const questions = await this.index({
      checklist_versions: versionId,
      is_select: 1
    })
    const checklistVersion = await S_CheckListVersion.show(versionId)
    return this.formattedQuestions(questions.data, checklistVersion)
  },
  formattedQuestions(questions, checklistVersion) {
    const _question = []
    checklistVersion.questions.forEach(sortQues => {
      questions.forEach(question => {
        // selected template Ques
        let templateHasQues = false
        if (!question.checklist_question_template) {
          templateHasQues = true
        } else {
          const has = checklistVersion.checklist_question_templates.find(e => {
            return e.id == question.checklist_question_template.id
          })
          if (has) {
            templateHasQues = true
          }
        }
        // SortQues
        if (templateHasQues) {
          if (sortQues.id == question.id) {
            _question.push({
              ...sortQues,
              ...question,
              questionType: question.last_version.question_type
            })
          }
        }
      })
    })
    return _question
  },
  async quesVersionIndex(params) {
    const _params = {
      ...S_Processor.getFactoryParams(),
      ...params
    }
    return base.index({
      modelName: 'checklist_question_version',
      params: _params
    })
  },
  getTemplateQuesIds(questions) {
    //取得被選取的公版題目ids
    const templateIds = questions.map(ques => ques.id)
    return templateIds
  },
  getQuesList(questions, quesVersions, show = false) {
    //show = true用於內頁
    //取得題目列表
    const _quesList = []
    if (!questions || !questions.length) {
      return []
    }
    questions.forEach(ques => {
      if (!ques) {
        return
      }
      const version = quesVersions.find(
        version =>
          version.checklist_question &&
          version.checklist_question.id === ques.id
      )
      if (!version) {
        return
      }
      const attaches =
        version.checklist_question &&
          version.checklist_question.checklist_question_template
          ? version.template_attaches
          : show
            ? version.attaches
            : version.attaches.map(attach => {
              return {
                url: attach
              }
            })
      const images =
        version.checklist_question &&
          version.checklist_question.checklist_question_template
          ? version.template_images
          : show
            ? version.images
            : version.images.map(image => {
              return {
                url: image
              }
            })
      const ocapAttaches = show
        ? version.ocap_attaches
        : version.ocap_attaches.map(attach => {
          return {
            url: attach
          }
        })
      let question = {
        article_versions: version.article_versions,
        act_versions: version.act_versions,
        act_version_alls: version.act_version_alls,
        acts: version.act_version_alls,
        articles: version.article_versions,
        quesType: version.question_type,
        controlLimitData: {
          upper:
            version.control_limit_upper || version.control_limit_upper === 0
              ? version.control_limit_upper.toString()
              : null,
          lower:
            version.control_limit_lower || version.control_limit_lower === 0
              ? version.control_limit_lower.toString()
              : null,
          controlLimitSuggest: version.control_limit_suggest
        },
        specLimitData: {
          upper:
            version.spec_limit_upper || version.spec_limit_upper === 0
              ? version.spec_limit_upper.toString()
              : null,
          lower:
            version.spec_limit_lower || version.spec_limit_lower === 0
              ? version.spec_limit_lower.toString()
              : null,
          specLimitSuggest: version.spec_limit_suggest
        },
        ocapRemark: version.ocap_remark,
        ocapAttaches: ocapAttaches,
        attaches: attaches,
        images: images,
        riskSignal: version.effects,
        subtitle: version.checklist_question_template_version
          ? '建議題目'
          : '自訂題目',
        title: version.title,
        type: version.checklist_question_template_version
          ? 'template'
          : 'custom',
        templateId:
          version.checklist_question &&
            version.checklist_question.checklist_question_template
            ? version.checklist_question.checklist_question_template.id
            : null,
        templateVersionId: version.checklist_question_template_version
          ? version.checklist_question_template_version.id
          : null,
        id: ques.id,
        versionId: version.id,
        focus: version.keypoint,
        remark: version.remark
      }
      _quesList.push(question)
    })
    return _quesList
  },
  getChapterSelectTemplate(templateIds, questions) {
    //將被選取的公版題目，放入chapters中的selectTemplate,template id 變成 question id
    //已使用過getQuesList
    let _chapters = [{ sectionList: [{ questionList: questions }] }]
    _chapters.forEach(chapter => {
      let allChapterQues = []
      chapter.sectionList.forEach(section => {
        allChapterQues = allChapterQues.concat(section.questionList)
      })
      let selectTemplate = allChapterQues
        .filter(
          question =>
            question.templateId &&
            templateIds.includes(question.templateId) &&
            question.type === 'template'
        )
        .map(question => question.id)
      chapter.selectTemplate = selectTemplate
    })
    return _chapters
  },
  getChaptersWithQuesSelect(questions, templateIds) {
    //取得所有題目列表 (不包含未選取的公版題目)
    //用於內頁
    const _questions = questions.filter(
      question =>
        templateIds.includes(question.templateId) || question.type === 'custom'
    )
    return _questions
  },
  getQuestionWithDraft(questions, draft) {
    if (draft) {
      return draft
    } else {
      return questions
    }
  },
  async organizationRankingIndex({ params }) {
    const _params = {
      ...params
    }
    let preUrl = ''
    if (params.type === 'checklist') {
      preUrl = 'checklist_question/organization/record'
    }
    return base.index({
      params: _params,
      preUrl: preUrl,
      modelName: 'ranking'
    })
  },
  async indexV2({ params }) {
    const _checklist_version_id = params.checklist_version_id
    return base.index({
      modelName: `v2/checklist_version/${_checklist_version_id}/checklist_question`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexV3({ params }) {
    const _checklist_version_id = params.checklist_version_id
    return base.index({
      modelName: `v3/checklist_version/${_checklist_version_id}/checklist_question`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async IndexByScheduleSetting({ params }) {
    const _checklist_version_id = params.checklist_version_id
    const _schedule_setting_id = params.schedule_setting_id
    return base.index({
      modelName: `v2/checklist_version/${_checklist_version_id}/schedule_setting/${_schedule_setting_id}/checklist_question`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async IndexByScheduleSettingV3({ params }) {
    const _checklist_version_id = params.checklist_version_id
    const _schedule_setting_id = params.schedule_setting_id
    return base.index({
      modelName: `v3/checklist_version/${_checklist_version_id}/schedule_setting/${_schedule_setting_id}/checklist_question`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async formattedQuestion001(questions) {
    const asyncApiCalls = questions.map(question => {
      // 240424-REFRACTOR
      // const startApiTime = performance.now();

      // const detailedQuestion = await this.show({
      //   modelId: question.id
      // });

      // const endApiTime = performance.now();
      // const duration3 = endApiTime - startApiTime;
      // console.log('API 執行时间3：', duration3, '毫秒');
      const { checklist_record_answer, checklist_record_answer_draft, ...rest } = question;
      if (checklist_record_answer) {
        return {
          ...question.last_version,
          question_qualified_standard: question.last_version?.remark,
          ...checklist_record_answer,
          ...rest,
          done_at: checklist_record_answer.created_at
        };
      } else if (checklist_record_answer_draft) {
        return {
          ...question.last_version,
          question_qualified_standard: question.last_version.remark,
          ...checklist_record_answer_draft,
          checklist_record_answer_draft_id: checklist_record_answer_draft.id,
          ...rest,
        };
      } else {
        return {
          checklist_question_version: question.last_version && question.last_version.id ? question.last_version.id : null,
          ...question.last_version,
          question_qualified_standard: question.last_version.remark,
          ...question,
          remark: '',
        }
      }
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    return formattedQuestions;
  },
  async formattedQuestion002(questions) {
    const asyncApiCalls = questions.map(question => {
      const _perQuestion = {
        ...question.last_version,
        ...question,
      }
      delete _perQuestion.remark
      return _perQuestion
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    return formattedQuestions
  },
  async formattedQuestion003(questions) {
    const asyncApiCalls = questions.map(async question => {
      // const _perQuestion = await this.showV2({
      //   modelId: question.id
      // });
      const __perQuestion = {
        ...question.last_version,
        ...question,
      }
      delete __perQuestion.remark
      return __perQuestion
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    return formattedQuestions
  },
  async formattedOfflineQuestion003(questions) {
    const asyncApiCalls = questions.map(async question => {
      const detailedQuestion = await this.show({
        modelId: question.id
      });
      const { checklist_record_answer, checklist_record_answer_draft, ...rest } = question;
      if (checklist_record_answer) {
        return {
          ...detailedQuestion.last_version,
          question_qualified_standard: detailedQuestion.last_version?.remark,
          ...checklist_record_answer,
          ...rest,
          done_at: checklist_record_answer.created_at
        };
      } else if (checklist_record_answer_draft) {
        return {
          ...detailedQuestion.last_version,
          question_qualified_standard: detailedQuestion.last_version.remark,
          ...checklist_record_answer_draft,
          checklist_record_answer_draft_id: checklist_record_answer_draft.id,
          ...rest,
        };
      } else {
        return {
          checklist_question_version: detailedQuestion.last_version && detailedQuestion.last_version.id ? detailedQuestion.last_version.id : null,
          ...detailedQuestion.last_version,
          question_qualified_standard: detailedQuestion.last_version.remark,
          ...question,
          remark: '',
        }
      }
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    return formattedQuestions;
  },
  async formattedQuestionFromTempDraft003(answer, _questions) {
    const asyncApiCalls = _questions.map(question => {
      return {
        ...question.last_version,
        ...question,
      }
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    formattedQuestions.forEach(question => {
      answer.forEach(ans => {
        if (ans.checklist_question?.id === question.id) {
          question.score = ans.score,
            question.remark = ans.remark,
            question.risk_level = ans.risk_level,
            question.images = ans.images
        }
      })
    });
    return formattedQuestions
  },
  async formattedQuestionFromTempDraft003_V2(answer, _questions) {
    const asyncApiCalls = _questions.map(question => {
      return {
        ...question.last_version,
        ...question,
        // 250115 draft issue
        question_last_version_updated_at: question.last_version.updated_at
      }
    });
    const formattedQuestions = await Promise.all(asyncApiCalls);
    formattedQuestions.forEach(question => {
      answer.forEach(ans => {
        if (ans.checklist_question?.id === question.id) {
          question.answer_value = ans.answer_value,
            question.risk_level = ans.risk_level,
            question.remark = ans.remark,
            question.images = ans.images,
            question.answer_updated_at = ans.updated_at
          if (
            question.question_last_version_updated_at &&
            moment.utc(question.question_last_version_updated_at).isAfter(moment.utc(ans.updated_at))
          ) {
            question.isNeedCheckAns = true
          }
          // 250114-single-choice-issues
          if (Array.isArray(ans.answer_value) &&
            ans.answer_value.length === 1 &&
            ans.question_type_setting?.value === 'single-choice') {
            question.answer_value = {
              id: ans.answer_value[0].id,
              label: ans.answer_value[0].name,
              value: ans.answer_value[0].risk_level
            }
          }
        }
      })
    });
    return formattedQuestions
  },
  getFormattedMyQuestionSortedByResult(answers, userId) {
    let _answer = []
    if (answers && answers.length > 0) {
      answers.forEach(item => {
        if (item.ans && Array.isArray(item.ans)) {
          let _ans = []
          item.ans.forEach(_ques => {
            if (_ques.question_setting) {
              _ques.question_setting.checkers.forEach(checker => {
                if (checker.id === userId) {
                  _ans.push(_ques)
                }
              })
            }
          })
          _answer.push({
            ...item,
            ans: _ans
          })
        }
      });
    }
    return _answer
  },
  getFormattedMyQuestionSortedBySequence(questions, userId) {
    let _answer = []
    questions.forEach(item => {
      if (!item.question_setting || !item.question_setting.checkers) {
        _answer.push(item)
      } else {
        item.question_setting.checkers.forEach(checker => {
          if (checker.id == userId) {
            _answer.push({
              ...item,
            })
          }
        });
      }
    });
    return _answer
  },
  getQualifiedMyQuestions(questions, checkedQuestions, idToMatch, scoreToAdd) {
    const _ques = questions.map(item => {
      const shouldAssign = (
        (item.question_setting &&
          item.question_setting.checkers &&
          item.question_setting.checkers.length > 0 &&
          item.question_setting.checkers.some(checker => checker.id === idToMatch)) ||
        item.question_setting == null
      ) &&
        item.question_type_setting?.value === 'single-choice' &&
        checkedQuestions.includes(item.id);

      // 尋找 risk_level === 25 的選項（包含巢狀）
      let matchedAnswer = null;
      if (Array.isArray(item.question_setting_items)) {
        for (const qsi of item.question_setting_items) {
          if (qsi.risk_level === 25) {
            matchedAnswer = {
              id: qsi.id,
              label: qsi.name || '',
              value: 25,
            };
            break;
          }
          if (Array.isArray(qsi.question_setting_items)) {
            for (const sub of qsi.question_setting_items) {
              if (sub.risk_level === 25) {
                matchedAnswer = {
                  id: sub.id,
                  label: sub.name || '',
                  value: 25,
                };
                break;
              }
            }
          }
          if (matchedAnswer) break;
        }
      }

      if (shouldAssign) {
        return {
          ...item,
          score: scoreToAdd,
          question_setting: {
            ...item.question_setting,
            checkers: (item.question_setting?.checkers || []).map(checker => {
              if (checker.id === idToMatch) {
                return { ...checker };
              }
              return checker;
            })
          },
          risk_level: scoreToAdd,
          answer_value: matchedAnswer ?? {},

        };
      } else {
        return {
          ...item,
        };
      }
    });

    return _ques;
  },

  checkedAllMyQuestions(questions, idToMatch) {
    const _ques = [];

    questions.forEach(item => {
      if (!item) return;

      const isSingleChoice = item.question_type_setting?.value === 'single-choice';
      const checkers = item?.question_setting?.checkers;
      const isCheckerValid =
        (checkers && checkers.length > 0 && checkers.some(c => c?.id === idToMatch)) ||
        !item.question_setting ||
        (checkers && checkers.length === 0);

      // 檢查是否有 risk_level === 25
      // const hasRiskLevel25 = item.question_setting_items?.some(opt =>
      //   opt.risk_level === 25 ||
      //   opt.question_setting_items?.some(subOpt => subOpt.risk_level === 25)
      // );

      if (isSingleChoice && isCheckerValid) {
        _ques.push(item.id ?? '');
      }
    });

    return _ques;
  },
  validateNoNeedToCheck(questions) {
    for (const item of questions) {
      if (item.checklist_record_answer !== null && item.checklist_record_answer !== undefined) {
        return true;
      }
    }
    return false;
  },
  getRiskText(risk_level) {
    if (risk_level === 23) {
      return i18next.t('高風險')
    } else if (risk_level === 22) {
      return i18next.t('中風險')
    } else if (risk_level === 21) {
      return i18next.t('低風險')
    } else if (risk_level === 25) {
      return i18next.t('無異常')
    }
  }
}
