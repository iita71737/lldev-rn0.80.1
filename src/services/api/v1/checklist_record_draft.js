import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_Checklist from '@/services/api/v1/checklist'
import moment from 'moment'
import store from '@/store'
import gColor from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import time from '@/__reactnative_stone/services/wasa/time'
import riskLevel from '@/models/risk-level'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'

export default {
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
      content: _question
    }
  },
  async createDraftV2({ params }) {
    const res = await base.create({
      preUrl: `v2/${S_Processor.getFactoryPreUrl()}`,
      modelName: 'checklist_record_draft',
      data: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
    return res
  },
  async updateDraftV2({ modelId, params }) {
    const res = await base.patch({
      modelName: 'v2/checklist_record_draft',
      modelId: modelId,
      data: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
    return res
  },
  async showDraft({ draftId, params }) {
    const _params = {
      ...params,
      ...S_Processor.getFactoryParams(),
      ...S_Processor.getLocaleParams()
    }
    const res = await base.show({
      modelName: 'checklist_record_draft',
      modelId: draftId,
      params: _params
    })
    return res
  },
  async index({ params }) {
    const res = await base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'checklist_record_draft',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
    return res
  },
  async updateDraft({ modelId, params }) {
    const _params = {
      ...params,
      ...S_Processor.getFactoryParams(),
      ...S_Processor.getLocaleParams()
    }
    const res = await base.update({
      modelName: 'checklist_record_draft',
      modelId: modelId,
      data: _params
    })
    return res
  },
  async delete({ modelId }) {
    return base.delete({
      modelName: 'checklist_record_draft',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  setSubmitValue(
    checklist,
    currentUserId,
    currentFactoryId,
    currentChecklistDraft,
    versionId,
    questions,
    _formattedQuestions,
    draftId
  ) {
    const _submitValue = {
      name: checklist.name,
      system_classes: S_SystemClass.$_formatDataWithId(
        checklist.system_classes
      ),
      system_subclasses: S_SystemClass.$_formatDataWithId(
        checklist.system_subclasses
      ),
      record_at: moment().format('YYYY-MM-DD'),
      checker: currentUserId,
      reviewer: checklist.reviewer && checklist.reviewer.id ? checklist.reviewer.id : null,
      factory: currentFactoryId,
      risk_level: S_CheckListRecord.getRiskLevelFromQuestions(
        currentChecklistDraft ? currentChecklistDraft : questions
      ),
      pass_rate: S_CheckListRecord.getPassRate(
        currentChecklistDraft ? currentChecklistDraft : questions
      ),
      checklist_version: versionId,
      questions: questions,
      checklist_record_answers: _formattedQuestions,
      checklist_record_draft: draftId ? draftId : null
    }
    return _submitValue
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
  getRiskLevelScoreV2(answer) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    const _is_in_stats = answer.is_in_stats
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only') ||
        (_questionType === 'num' && _is_in_stats === 0)
      )
      && answer.answer_value
    ) {
      return 26
    }
    if (
      _questionType === 'single-choice' &&
      _is_in_stats === 0
    ) {
      const _score = answer.answer_value && answer.answer_value.value
      return 26
    }
    if (
      _questionType === 'num' && _answer_setting === 'control-limit'
    ) {
      const _score = S_CheckListRecordAns.getAnsDataScoreV2(answer, answer.answer_value)
      return _score
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = S_CheckListRecordAns.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return _score
    }
    if (
      _questionType === 'single-choice' &&
      _is_in_stats === 1 &&
      answer.answer_value &&
      answer.answer_value[0]
    ) {
      const _score = answer.answer_value && answer.answer_value[0]?.risk_level
      return _score
    }
    else {
      const _score = answer.answer_value?.value
      return _score
    }
  },
  getRiskLevelFromQuestionsV2(answers) {
    const _risks = []
    answers.forEach(ans => {
      _risks.push(ans.risk_level)
    })
    if (_risks.includes('23') || _risks.includes(23)) {
      return 23
    } else if (_risks.includes('22') || _risks.includes(22)) {
      return 22
    } else if (_risks.includes('21') || _risks.includes(21)) {
      return 21
    } else {
      return 25
    }
  },
  setSubmitForDraftV2(
    checklist,
    currentUserId,
    currentFactoryId,
    currentChecklistDraft,
    versionId,
    questions,
    _formattedQuestions,
    draftId,

    checklistAssignmentId,
    remark,
    status,
    reviewers,
  ) {
    const _submitValue = {
      checklist: checklist ? checklist.id : null,
      checklist_assignment: checklistAssignmentId ? checklistAssignmentId : undefined,
      content: "content content",
      checker: currentUserId,
      factory: currentFactoryId,
      reviewers: reviewers ? reviewers.map(_ => _.id) : currentUserId,
      remark: remark ? remark : null,
      status: status ? status : null,
      risk_level: this.getRiskLevelFromQuestionsV2(
        currentChecklistDraft ? currentChecklistDraft : questions
      ),
      checklist_record_answer_drafts: _formattedQuestions,
    }
    return _submitValue
  },
}
