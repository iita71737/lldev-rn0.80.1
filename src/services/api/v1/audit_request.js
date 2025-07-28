import axios from 'axios'
import config from '@/__config'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import moment from 'moment'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import ServiceAudit from '@/services/api/v1/audit'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Processor from '@/services/app/processor'
import i18next from 'i18next'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'

export default {
  // riskStandard: {
  //   major: {
  //     label: i18next.t('高風險'),
  //     riskText: i18next.t('嚴重異常'),
  //     riskIcon: 'md-info',
  //     score: 23,
  //     icon: 'ws-filled-risk-high',
  //     color: $color.danger
  //   },
  //   minor: {
  //     label: i18next.t('中風險'),
  //     riskText: i18next.t('中度異常'),
  //     riskIcon: 'md-info',
  //     score: 22,
  //     icon: 'ws-filled-risk-medium',
  //     color: $color.yellow
  //   },
  //   ofi: {
  //     label: i18next.t('低風險'),
  //     riskText: i18next.t('輕度異常'),
  //     riskIcon: 'md-info',
  //     score: 21,
  //     icon: 'ws-filled-risk-low',
  //     color: $color.primary
  //   },
  //   pass: {
  //     label: i18next.t('合規'),
  //     riskText: i18next.t('合規'),
  //     riskIcon: 'md-check-circle',
  //     score: 25,
  //     icon: 'ws-filled-check-circle',
  //     color: $color.green
  //   }
  // },
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit_request',
      params: {
        ...params,
        ...S_Processor.getLocaleParams()
      },
    })
  },
  async factoryIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit_request',
      params: {
        ...params,
        ...S_Processor.getLocaleParams()
      },
    })
  },
  async indexBoard({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit_request/index/board',
      params: {
        ...params,
        ...S_Processor.getLocaleParams()
      }
    })
  },

  _getNum(risk, ques) {
    const question = ques.filter(question => question.score === risk)
    return question.length
  },

  getChapterList({ chapters, answers }) {
    const list = S_AuditRecord.getChaptersWithAnswers(chapters, answers)
    const listWithIndex = S_AuditRecord.getCustomedIndex(list)
    return listWithIndex
  },

  _allQuesWithScore(chapters) {
    //所有的題目加回答
    return this.getAllQuesResult(chapters)
  },

  getAllQuesResult(chapters) {
    //從章節中取得所有題目
    const allQues = []
    chapters.forEach(chapter => {
      chapter.sectionList.forEach(section => {
        section.questionList.forEach(question => {
          allQues.push({
            ...question,
            sectionCustomedIndex: section.sectionCustomedIndex,
            sectionName: chapter.title,
            chapterName: chapter.title,
            chapterCustomedIndex: chapter.chapterCustomedIndex
          })
        })
      })
    })
    return allQues
  },
  getResultList(effects, questions, scoreStandard) {
    const _effects = JSON.parse(JSON.stringify(effects))
    _effects.data.push({
      id: 'keypoint',
      name: i18next.t('重點關注')
    })
    let effectList = _effects.data.map(effect => {
      let _effect = {
        leadingImage: effect.icon,
        text: effect.name
      }
      scoreStandard.forEach(standard => {
        _effect[`${standard.value}Num`] = this.getEffectNum(
          effect.id,
          questions,
          standard.score
        )
      })
      return _effect
    })
    return effectList
  },

  getEffectNum(effectId, questions, score) {
    const _questions = questions.filter(question => {
      const effects = question.riskSignal.map(effect => effect.id)
      return effects.includes(effectId) && question.score === score
    })
    return _questions.length
  },

  getChapterRiskSort(riskSort, questions) {
    //依照risk排序
    const _riskSort = riskSort.map(sort => {
      sort.questionList = questions.filter(
        question => question.score === sort.score
      )
      return sort
    })
    return _riskSort
  },

  getQuesWithTitle(allQuesWithScore) {
    const titleWithScore = [
      {
        title: i18next.t('未答題'),
        icon: 'md-help',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: null
      },
      {
        title: i18next.t('Major(主要缺失)'),
        icon: 'ws-filled-warning',
        color: $color.danger,
        backgroundColor: $color.danger9l,
        score: 23
      },
      {
        title: i18next.t('Minor(次要缺失)'),
        icon: 'ws-filled-warning',
        color: $color.yellow,
        backgroundColor: $color.yellow11l,
        score: 22
      },
      {
        title: i18next.t('OFI(待改善)'),
        icon: 'ws-filled-warning',
        color: $color.primary,
        backgroundColor: $color.primary11l,
        score: 21
      },
      {
        title: i18next.t('合規'),
        icon: 'md-check-circle',
        color: $color.green,
        backgroundColor: $color.green11l,
        score: 25
      },
      {
        title: i18next.t('不適用'),
        icon: 'scc-liff-close-circle',
        color: $color.gray,
        backgroundColor: $color.gray6l,
        score: 20
      }
    ]
    const data = titleWithScore.map(item => {
      const _ques = allQuesWithScore.filter(question => {
        // return question.score?.value == item.score 
        return question.score == item.score // 250325稽核紀錄內頁-依結果排序
      })


      const title = `${item.title} ${i18next.t('共{number}題', { number: _ques.length })}`

      let allScore = allQuesWithScore.map(answer => answer.score?.value)
      const result = allScore.every(score => score === 25 || score === 20)
        ? 'ws-filled-check-circle'
        : 'ws-filled-risk-high'
      const risk = allScore.some(score => score === 23)
        ? $color.danger
        : allScore.some(score => score === 22)
          ? 'rgb(255,213,0)'
          : allScore.some(score => score === 21)
            ? $color.parimary
            : 'green'

      return {
        title: title,
        icon: item.icon,
        color: item.color,
        backgroundColor: item.backgroundColor,
        tag: item.title,
        result: result,
        risk: risk,
        score: item.score,
        ques: _ques ? _ques : null,
        keypoint: item.keypoint
      }
    })
    return data
  },

  // davidturtle b
  async getSortedResults(id) {
    // ResRecord
    const resAuditRecord = await S_AuditRecord.show({
      modelId: id
    })
    const dateKeyFormat = await S_AuditRecord.getFormatted(resAuditRecord)
    // Ans
    const recordAnswerIndex = await S_AuditRecord.answerIndex({
      recordId: id
    })
    const answers = await S_AuditRecord.getRecordAnswers(recordAnswerIndex.data)

    // ChapterList
    const chapterList = this.getChapterList({
      chapters: dateKeyFormat.chapters,
      answers: answers
    })
    // Question
    const allQuesWithScore = this._allQuesWithScore(chapterList)
    // Data
    const data = this.getQuesWithTitle(allQuesWithScore)
    return data
  },
  formattedQuestionWithDraft(questions, drafts) {
    if (drafts && drafts.length > 0) {
      const _questions = []
      if (questions && questions.length > 0)
        questions.forEach(question => {
          drafts.forEach(draft_question => {
            if (question.id === draft_question.id) {
              const _data = {
                ...question,
                ...draft_question
              }
              _questions.push(_data)
            }
          })
        })
      return _questions
    }
    else {
      return questions
    }
  },
  async getSortedResultsDraft(questions, chapters) {
    if (
      !chapters ||
      !questions ||
      chapters.length === 0 ||
      questions.length === 0
    ) {
      return []
    }
    const _quesInChapters = []
    chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          questions.forEach(_ques => {
            if (_ques.id === question.id) {
              _questionsFilter.push({
                ..._ques
              })
            }
          })
        })
        if (_questionsFilter.length > 0)
          _quesInSections.push({
            badId: section.badId,
            sectionTitle: section.sectionTitle,
            questionList: _questionsFilter
          })
      })
      if (_quesInSections.length > 0)
        _quesInChapters.push({
          badId: chapter.badId,
          chapterTitle: chapter.chapterTitle,
          sectionList: _quesInSections
        })
    })
    // listWithIndex
    const listWithIndex = S_AuditRecord.getCustomedIndex(_quesInChapters)
    // allQuesWithScore
    const allQuesWithScore = this._allQuesWithScore(listWithIndex)
    // Formatted Data With AnswerStatus
    const data = this.getQuesWithTitle(allQuesWithScore)
    return data
  },
  getSortedChapterDraft(questions, chapters) {
    if (
      !chapters ||
      !questions ||
      chapters.length === 0 ||
      questions.length === 0
    ) {
      return []
    }
    const _quesInChapters = []
    chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          questions.forEach(answer => {
            if (answer.id === question.id) {
              _questionsFilter.push({
                ...answer
              })
            }
          })
        })
        if (_questionsFilter.length > 0)
          _quesInSections.push({
            badId: section.badId,
            sectionTitle: section.sectionTitle
              ? section.sectionTitle
              : section.title
                ? section.title
                : '',
            questionList: _questionsFilter
          })
      })
      if (_quesInSections.length > 0)
        _quesInChapters.push({
          badId: chapter.badId,
          chapterTitle: chapter.chapterTitle
            ? chapter.chapterTitle
            : chapter.title
              ? chapter.title
              : '',
          sectionList: _quesInSections
        })
    })
    // listWithIndex
    const listWithIndex = S_AuditRecord.getCustomedIndex(_quesInChapters)
    return listWithIndex
  },
  async getAuditRecordDraft(draftId) {
    const draft = await base.show({
      modelName: 'audit_record_draft',
      modelId: draftId,
      params: S_Processor.getFactoryParams()
    })
    if (draft != null) {
      const _draft = draft.content.record_content.map(question => {
        return {
          effects: question.effects ? question.effects : [],
          risk_level: question.answer.score,
          ...question.question,
          ...question.answer
        }
      })
      return _draft
    } else {
      return []
    }
  },
  async getSortedByQues(id) {
    // ResRecor
    const resAuditRecord = await S_AuditRecord.show({
      modelId: id
    })
    const dateKeyFormat = await S_AuditRecord.getFormatted(resAuditRecord)
    // Ans
    const recordAnswerIndex = await S_AuditRecord.answerIndex({
      recordId: id
    })
    const answers = await S_AuditRecord.getRecordAnswers(recordAnswerIndex.data)
    // ChapterList
    const chapterList = this.getChapterList({
      chapters: dateKeyFormat.chapters,
      answers: answers
    })
    // Question
    const allQuesWithScore = this._allQuesWithScore(chapterList)

    return chapterList
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'audit_request',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async create({ parentId, data }) {
    return base.create({
      parentName: 'audit',
      parentId: parentId,
      modelName: 'audit_request',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async createDraft(data) {
    const _data = {
      ...S_Processor.getFactoryData(),
      ...data
    }
    const res = await base.create({
      parentName: 'factory',
      parentId: S_Processor.getFactoryParams().factory,
      modelName: 'audit_record_draft',
      data: _data
    })
    return res
  },
  getRiskLevelFromQuestions(questions) {
    const _risks = questions.map((question, questionIndex) => {
      return question.score
    })
    if (_risks.includes('23')) {
      return 23
    } else if (_risks.includes('22')) {
      return 22
    } else if (_risks.includes('21')) {
      return 21
    } else {
      return 25
    }
  },
  transformArticleVersions(articleVersions) {
    return articleVersions.map(version => {
      const actVersionId = version.act_versions[0]?.id || null;
      const articleId = version.article?.id || null;
      return {
        article_version_id: version.id,
        article_id: articleId,
        act_version_id: actVersionId,
      }
    })
  },
  transformActVersionAlls(actVersionAlls) {
    return actVersionAlls.map(version => {
      const actVersionId = version.id || null;
      const actId = version.act?.id || null;
      return {
        act_id: actId,
        act_version_id: actVersionId,
      }
    })
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
  transformRelatedGuidelines(related_guidelines) {
    return related_guidelines.map(item => {
      const result = {
        guideline_id: item.guideline?.id
      }
      if (item.guideline_article_version?.id) {
        // 綁特定版本條文
        result.guideline_version_id = item.guideline_article_version.guideline_version?.id
        result.guideline_article_id = item.guideline_article?.id
        result.guideline_article_version_id = item.guideline_article_version.id
      } else if (item.guideline_article?.id) {
        // 綁最新條文
        result.guideline_version_id = item.guideline_version?.id
        result.guideline_article_id = item.guideline_article.id
      } else if (item.guideline_version?.id) {
        // 綁特定版本整部
        result.guideline_version_id = item.guideline_version.id
      }
      // else：只綁 guideline_id（綁最新整部）
      return result
    })
  },
  async formattedQuestionsForAPI(currentDraft) {
    let _questions = []
    if (!currentDraft) {
      return
    }
    for (const question of currentDraft) {
      const _questionShow = await S_AuditQuestion.show(question.id)
      const _formattedArticleVersions = this.transformArticleVersions(_questionShow.last_version.article_versions)
      const _formattedActVersionAlls = this.transformActVersionAlls(_questionShow.last_version.act_version_alls)
      const _formattedRelatedGuidelines = this.transformRelatedGuidelines(_questionShow.last_version.related_guidelines)
      _questions.push({
        factory: S_Processor.getFactoryParams().factory,
        title: question.title,
        keypoint: question.keypoint,
        score: question.score?.value ? question.score?.value : undefined,
        remark: question.remark,
        // images: question.images,
        // 檔案庫spec
        images: question.images ? this.formattedForFileStore(question.images) : [],
        audit_question: question.id,
        audit_question_template: question.audit_question_template
          ? question.audit_question_template.id
          : null,
        risk_level: question.score?.value ? question.score?.value : undefined,
        audit_question_version: question.last_version ? question.last_version.id : null,
        audit_question_template_version: question.last_version && question.last_version.audit_question_template_version ? question.last_version.audit_question_template_version.id : null,
        // 240625-new-spec
        act_version_alls: _formattedActVersionAlls ? _formattedActVersionAlls : undefined,
        article_versions: _formattedArticleVersions ? _formattedArticleVersions : undefined,
        act_versions: question.last_version &&
          question.last_version.act_versions &&
          question.last_version.act_versions.length > 0
          ? question.last_version.act_versions.map(item => item.id)
          : undefined,
        // 相關內規
        related_guidelines: _formattedRelatedGuidelines ? _formattedRelatedGuidelines : undefined
      })
    }
    return _questions
  },
  formattedQuestionsForDraftAPI(currentDraft) {
    const _question = currentDraft.map(question => {
      const _answers = {
        score: question.score,
        remark: question.remark,
        images: question.images
      }
      const _question = {
        ...question
      }
      return {
        question: _question,
        answer: _answers
      }
    })
    return {
      record_content: _question
    }
  },
  // 驗證不合規 AND 不適用題目是否填寫備註
  validationQuestionSubmit(currentDraft = [], auditComments) {

    const isEveryItemValid = currentDraft.every(item => {
      // 檢查是否有score且score等於25
      const hasScore = item.score !== undefined && item.score === "25";
      // 檢查是否有remark
      const hasRemark = item.remark !== undefined;
      return (hasScore || (!hasScore && hasRemark));
    });

    if (isEveryItemValid && auditComments) {
      return '已完成答題'
    } else if (isEveryItemValid && !auditComments) {
      return '稽核總評尚未填寫'
    } else {
      return '尚未完成答題'
    }
  },
  getFormattedData(requestId, request, currentUser, auditId, audit, factory, remark, remarkImages, _formattedQuestions) {
    const submitValue = {
      audit_request: requestId,
      auditors: request && request.auditors ? S_SystemClass.$_formatDataWithId(request.auditors) : null,
      auditees: request && request.auditees ? S_SystemClass.$_formatDataWithId(request.auditees) : null,
      auditor: currentUser && currentUser.id ? currentUser.id : null,
      audit: auditId,
      audit_version: audit && audit.last_version ? audit.last_version.id : null,
      chapters: audit && audit.last_version ? audit.last_version.chapters : null,
      name: audit && audit.name,
      factory: factory.id,
      record_at: moment(),
      record_remark: remark,
      // images: remarkImages,
      // 檔案庫spec
      images: remarkImages && remarkImages.length > 0 ? this.formattedForFileStore(remarkImages) : [],
      risk_level: this.getRiskLevelFromQuestions(_formattedQuestions),
      system_classes: audit && audit.system_classes
        ? S_SystemClass.$_formatDataWithId(audit.system_classes)
        : [],
      system_subclasses: audit && audit.system_subclasses
        ? S_SystemClass.$_formatDataWithId(audit.system_subclasses)
        : [],
      audit_record_answers: _formattedQuestions
    }
    return submitValue
  }
}
