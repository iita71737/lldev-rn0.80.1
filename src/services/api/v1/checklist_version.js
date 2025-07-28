import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_CheckList from '@/services/api/v1/checklist'
import S_ChecklistQuestion from '@/services/api/v1/checklist_question'
import S_ChecklistQuestionTemplate from '@/services/api/v1/checklist_question_template'
import S_Processor from '@/services/app/processor'

export default {
  async create({ parentId, data }) {
    return base.create({
      parentId: parentId,
      parentName: 'checklist',
      modelName: 'checklist_version',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'checklist_version',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async createWithQuestions(
    oldQuestionVersions,
    newQuestions,
    data,
    checklistId
  ) {
    const questionVersions = this.getQuestionsWithNewAndOldQues(
      oldQuestionVersions,
      newQuestions,
      data
    )
    const _questions = this.putNewQuesInQuestions(
      data.checklist_question_with_version,
      newQuestions
    )
    const _data = {
      checklist_template_version: data.checklist_template_version,
      checklist_question_templates: data.checklist_question_templates,
      checklist_questions: questionVersions.checklist_questions,
      checklist_question_versions: questionVersions.checklist_question_versions,
      questions: _questions
    }
    return await this.create({
      parentId: checklistId,
      data: _data
    })
  },
  getQuestionsWithNewAndOldQues(oldQuestionVersions, newQuestions, data) {
    const _questionIds = [...data.checklist_questions]
    const _questionVersionIds = []
    oldQuestionVersions.forEach(oldQuestion => {
      _questionVersionIds.push(oldQuestion.data.data.id)
    })
    newQuestions.forEach(newQuestion => {
      _questionIds.push(newQuestion.data.data.id)
      _questionVersionIds.push(newQuestion.data.data.last_version.id)
    })

    return {
      checklist_questions: _questionIds,
      checklist_question_versions: _questionVersionIds
    }
  },
  putNewQuesInQuestions(questions, newQuestions) {
    const _questions = []
    questions.forEach(question => {
      let newQuesIndex = 0
      if (question.uuid) {
        _questions.push({
          id: newQuestions[newQuesIndex].data.data.id,
          type: 'custom'
        })
        newQuesIndex++
      } else {
        _questions.push({
          id: question.id,
          type: 'template'
        })
      }
    })
    // newQuestions.forEach(newQuestion => {
    //   _questions.push({
    //     id: newQuestion.data.data.id,
    //     type: 'custom'
    //   })
    // })
    return _questions
  },
  async createVersion({ checklistId, data }) {
    return base.create({
      parentName: 'checklist',
      parentId: checklistId,
      modelName: 'checklist_version',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async createChecklistVersion(data, questions, checklist) {
    const _checklistQuesIds = []
    const _questions = []
    const _questionVersions = []
    questions.forEach(question => {
      _checklistQuesIds.push(question.data.data.id)
      _questions.push({
        id: question.data.data.id,
        type: question.data.data.type
      })
      _questionVersions.push(question.data.data.last_version.id)
    })
    const _data = {
      questions: _questions,
      checklist_questions: _checklistQuesIds,
      checklist_question_templates: data.checklist_question_templates,
      checklist_question_versions: _questionVersions,
      checklist_template_version: checklist.checklist_template.last_version.id
    }
    return this.create({
      parentId: checklist.id,
      data: _data
    })
  },
  async createFromTemplateUpdate(
    updateValue,
    oldQuestions,
    newQuestions,
    checklistId,
    versoinId
  ) {
    const checklist = await S_CheckList.show({ modelId: checklistId })

    return this.create({
      parentId: checklistId,
      data: {
        checklist_template_version:
          checklist.checklist_template.last_version.id,
        checklist_question_templates: updateValue.checklist_question_templates,
        checklist_question_versions: this.getQuestionVersion(
          updateValue,
          newQuestions
        ),
        questions: this.getQuestions(updateValue, newQuestions),
        checklist_questions: this.getChecklistQuestions(
          updateValue,
          newQuestions
        )
      }
    })
  },
  getQuestionVersion(updateValue, newQuestions) {
    const _questionVersionIds = []
    updateValue.questionsDetail.forEach(question => {
      if (question.status != 'remove') {
        _questionVersionIds.push(question.last_version.id)
      }
    })
    newQuestions.forEach(newQues => {
      _questionVersionIds.push(newQues.data.data.last_version.id)
    })
    return _questionVersionIds
  },
  getQuestions(updateValue, newQuestions) {
    const _questions = []
    updateValue.questionsDetail.forEach(question => {
      if (question.status != 'remove') {
        _questions.push({
          type: question.type ? question.type : 'template',
          id: question.id
        })
      }
    })
    newQuestions.forEach(newQues => {
      _questions.push({
        id: newQues.data.data.id,
        type: newQues.data.data.checklist_question_template
          ? 'template'
          : 'custom'
      })
    })
    return _questions
  },
  getChecklistQuestions(updateValue, newQuestions) {
    const _questions = []
    updateValue.questionsDetail.forEach(question => {
      if (question.status != 'remove') {
        _questions.push(question.id)
      }
    })
    newQuestions.forEach(newQues => {
      _questions.push(newQues.data.data.id)
    })
    return _questions
  },
  // 230830-rm
  // async getQuestionsByCheckListVersion(versionId) {
  //   const _params = {
  //     checklist_versions: versionId,
  //     is_select: 1
  //   }
  //   const questions = await S_ChecklistQuestion.index(_params)

  //   const _questions = questions.data.map(ques => {
  //     return {
  //       ...ques.last_version,
  //       ...ques,
  //     }
  //   })
  //   return _questions
  // }
}
