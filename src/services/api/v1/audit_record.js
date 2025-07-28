import axios from 'axios'
import config from '@/__config'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import moment from 'moment'
import S_Processor from '@/services/app/processor'
import gColor from '@/__reactnative_stone/global/color'
import ServiceAudit from '@/services/api/v1/audit'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import i18next from 'i18next'

export default {
  async index({ parentId, params }) {
    return base.index({
      parentName: 'audit',
      parentId: parentId,
      modelName: 'audit_record',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async factoryIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'audit_record',
      params: params
    })
  },
  getDateFormat(date) {
    if (!date) {
      return ''
    }
    return moment(date).format('YYYY-MM-DD')
  },
  getIconBgc(allScore) {
    return allScore.some(score => score === 23)
      ? gColor.danger11l
      : allScore.some(score => score === 22)
        ? gColor.yellow11l
        : allScore.some(score => score === 21)
          ? gColor.parimary11l
          : gColor.green11l
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
  getFormatted(auditRecord) {
    const riskStandard = [
      {
        value: 'major',
        score: 23
      },
      {
        value: 'minor',
        score: 22
      },
      {
        value: 'ofi',
        score: 21
      }
    ]
    let _riskScore = {}
    riskStandard.forEach(standard => {
      _riskScore[standard.value] = auditRecord.audit_record_answers.filter(
        answer => answer.score === standard.score
      ).length
    })
    const formatDate = moment(auditRecord.record_at).format('YYYY-MM')
    let allScore = auditRecord.audit_record_answers.map(answer => answer.score)
    const format = {
      id: auditRecord.id,
      title: auditRecord.name,
      systemSubclasses: auditRecord.system_subclasses,
      result: allScore.every(score => score === 25 || score === 20)
        ? 'ws-filled-check-circle'
        : 'ws-filled-risk-high',
      risk: allScore.some(score => score === 23)
        ? gColor.danger
        : allScore.some(score => score === 22)
          ? gColor.yellow
          : allScore.some(score => score === 21)
            ? gColor.parimary
            : gColor.green,
      iconBgc: this.getIconBgc(allScore),
      monthTitle: formatDate,
      record_remark: auditRecord.record_remark
        ? auditRecord.record_remark
        : null,
      review_remark: auditRecord.review_remark
        ? auditRecord.review_remark
        : null,
      // review_images: auditRecord.review_images ? auditRecord.review_images : null,
      file_review_images: auditRecord.file_review_images ? auditRecord.file_review_images : [],
      // review_attaches: auditRecord.review_attaches ? auditRecord.review_attaches : null,
      file_review_attaches: auditRecord.file_review_attaches ? auditRecord.file_review_attaches : [],
      chapters: auditRecord.chapters,
      riskScore: _riskScore,
      auditors: auditRecord.auditors,
      auditees: auditRecord.auditees,
      record_at: auditRecord.record_at,
      review_at: auditRecord.review_at,
      // images: auditRecord.images
      file_images: auditRecord.file_images ? auditRecord.file_images : [],
    }
    return format
  },

  getDateKeyFormat(auditRecords) {
    const _formatList = {}
    auditRecords.forEach((item, itemIndex) => {
      let formatDate = moment(item.date).format('YYYY-MM')
      if (_formatList[formatDate]) {
        _formatList[formatDate].push(item)
      } else {
        _formatList[formatDate] = [item]
      }
    })

    return _formatList
  },

  async $_getAuditVersion(versionId, record = false) {
    try {
      const version = await ServiceAudit.getVersion(versionId)
      if (record) {
        this.recordAuditVersion = version
        this.recordTemplateIds = ServiceAudit.getTemplateQuesIds(
          version.audit_question_templates
        )
      } else {
        this.auditContent.templateVersionId = version.audit_template_version
          ? version.audit_template_version.id
          : null
        this.auditVersion = version
        this.templateQuesIds = ServiceAudit.getTemplateQuesIds(
          version.audit_question_templates
        )
      }
    } catch (error) {
      alert(i18next.t('取得稽核表版本錯誤'))
    }
  },

  async $_getAuditQuestions(versionId, update = false) {
    const params = {
      audit_versions: versionId
    }
    try {
      const ques = await ServiceAudit.getQuesLatest(params)
      // const recordVersionQues =[]
      if (update) {
        this.recordVersionQues = ques
      } else {
        this.latestVersionQues = ques
      }
    } catch (error) {
      alert(i18next.t('取得稽核表題目錯誤'))
    }
  },

  getRecordList(list) {
    const _list = list.map((item, itemIndex) => {
      return this.getFormatted(item)
    })
    return _list
  },

  async $_getChapterContent() {
    let chapterList = []
    await this.$_getAuditVersion(this.auditContent.versionId)
    await this.$_getAuditQuestions(this.auditContent.versionId)
    chapterList = serviceAudit.getChaptersWithQues(
      this.auditVersion,
      this.latestVersionQues
    )
    const _chaptersList = serviceAudit.getChapterSelectTemplate(
      this.templateQuesIds,
      chapterList
    )
    this.chapterList = _chaptersList
  },
  // Show
  async show({ modelId, params }) {
    return base.show({
      // preUrl: preUrl.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'audit_record',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      },
      callback: true
    })
  },
  // Update
  async update({ modelId, data }) {
    return base.update({
      modelName: 'audit_record',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },

  async updateReviewRemark({ modelId, data }) {
    return base.patch({
      parentName: 'audit_record',
      parentId: modelId,
      modelName: 'review_remark',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },

  getTimeFormat(date) {
    if (!date) {
      return ''
    }
    return moment(date).format('YYYY-MM-DD HH:MM:SS').split('-').join('.')
  },

  // Answer

  async answerIndex({ recordId, params }) {
    //取得record內容
    return await S_AuditRecordAns.index({
      parentId: recordId,
      params: params
    })
  },

  getRecordAnswers(answers) {
    const _answers = answers.map(answer => {
      return {
        questionId: answer.audit_question.id,
        questionVersionId: answer.audit_question_version
          ? answer.audit_question_version.id
          : null,
        templateId: answer.audit_question_template
          ? answer.audit_question_template.id
          : null,
        templateVersionId: answer.audit_question_template_version
          ? answer.audit_question_template_version.id
          : null,
        type: answer.audit_question_template ? 'template' : 'custom',
        articles: answer.articles,
        acts: answer.acts,
        riskSignal: answer.effects,
        title: answer.title,
        payload: answer.payload,
        id: answer.id,
        images: answer.images,
        remark: answer.remark,
        score: answer.score,
        keypoint: answer.keypoint,
        riskLevel: answer.risk_level
      }
    })
    return _answers
  },

  getChaptersWithAnswers(chapters, answers) {
    if (
      !chapters ||
      !answers ||
      chapters.length === 0 ||
      answers.length === 0
    ) {
      return []
    }
    const _quesInChapters = []
    chapters.forEach(chapter => {
      const _quesInSections = []
      chapter.sections.forEach(section => {
        const _questionsFilter = []
        section.questions.forEach(question => {
          answers.forEach(answer => {
            if (answer.questionId === question.id) {
              _questionsFilter.push({
                ...answer
              })
            }
          })
        })
        if (_questionsFilter.length > 0)
          _quesInSections.push({
            badId: section.badId,
            title: section.title,
            sectionTitle: section.sectionTitle,
            questionList: _questionsFilter
          })
      })
      if (_quesInSections.length > 0)
        _quesInChapters.push({
          badId: chapter.badId,
          title: chapter.title,
          chapterTitle: chapter.chapterTitle,
          sectionList: _quesInSections
        })
    })
    return _quesInChapters
  },

  getCustomedIndex(list) {
    let _list = JSON.parse(JSON.stringify(list))
    _list.forEach(chapter => {
      const cIndex = _list.indexOf(chapter) + 1
      chapter.chapterCustomedIndex = `${cIndex}` + '.'
      chapter.sectionList.forEach(section => {
        const sIndex = chapter.sectionList.indexOf(section) + 1
        section.sectionCustomedIndex = `${cIndex}` + '-' + `${sIndex}` + '.'
        section.questionList.forEach(question => {
          const qIndex = section.questionList.indexOf(question) + 1
          question.questionCustomedIndex =
            `${cIndex}` + '-' + `${sIndex}` + '-' + `${qIndex}` + '.'
        })
      })
    })
    return _list
  },

  async $_getRecordAuditVersion(versionId) {
    let chapterList = []
    try {
      await this.$_getAuditVersion(versionId, true)
      await this.$_getAuditQuestions(versionId, true)
      chapterList = serviceAudit.getChaptersWithQues(
        this.auditVersion,
        this.latestVersionQues
      )
      const chaptersWithQuesSelect = serviceAudit.getChaptersWithQuesSelect(
        chapterList,
        this.recordTemplateIds
      )
      this.recordChaptersWithQuesSelect = chaptersWithQuesSelect
    } catch (err) {
      alert(i18next.t('取得紀錄版本錯誤'))
    }
  },

  async create(parentId, data) {
    return base.create({
      parentName: 'audit',
      parentId: parentId,
      modelName: 'audit_record',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  getRiskColor(risk_level) {
    return risk_level == 23
      ? gColor.danger
      : risk_level == 22
        ? gColor.yellow
        : risk_level == 21
          ? gColor.primary
          : gColor.green
  },
  getRiskIcon(risk_level) {
    return risk_level == 25 || risk_level == 20
      ? 'ws-filled-check-circle'
      : 'ws-filled-risk-high'
  },
  getRiskBgColor(risk_level) {
    return risk_level == 23
      ? gColor.danger11l
      : risk_level == 22
        ? gColor.yellow11l
        : risk_level == 21
          ? gColor.primary11l
          : gColor.green11l
  },
  getRiskEachCount(data) {
    let num = {
      ofi: 0, // 21
      minor: 0, // 22
      major: 0,// 23
      score20Count: 0, // 20
      score25Count: 0 // 25
    }

    data.forEach(item => {
      if (item.score === 25) {
        num.score25Count++;
      } else if (item.score === 21) {
        num.ofi++;
      } else if (item.score === 22) {
        num.minor++;
      } else if (item.score === 23) {
        num.major++;
      } else if (item.score === 20) {
        num.score20Count++;
      }
    });

    return num
  },
}
