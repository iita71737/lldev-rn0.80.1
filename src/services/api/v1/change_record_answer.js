import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_Risk from '@/services/api/v1/risk'
import moment from 'moment'
import i18next from 'i18next'
import S_ChangeItemVersion from '@/services/api/v1/change_item_version'
import S_Change from '@/services/api/v1/change'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'change_record_answer',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async getAnswersWithSystemClasses(answers, changeVersionId, pickerValue) {
    // Change Items
    const changeItems = await S_ChangeItem.index({
      params: {
        change_versions: changeVersionId,
      }
    })
    // Change Items Version
    const _params = {
      change_versions: changeVersionId,
      factor_score: "11,13",
      order_way: "asc",
      order_by: "sequence",
    };
    const _changeItems = await S_ChangeItemVersion.getChangeItemVersion(_params);
    // Change Assignments
    const changeAssignments = await S_ChangeAssignment.index({
      params: { change_version: changeVersionId }
    })
    // Risk
    const risks = await S_Risk.index({
      params: { change_versions: changeVersionId }
    })
    // Risk Sort by last_version.sequence
    const sortedRisks = risks.data.sort(function (a, b) {
      return parseInt(a.last_version.question_number.replace(/-/g, "").trim()) - parseInt(b.last_version.question_number.replace(/-/g, "").trim())
    });
    // Sort
    const _answers = []
    changeItems.data.forEach((item, itemIndex) => {
      const _answer = {}
      const systemSubClasses = []
      _answer.name = item.last_version ? item.last_version.name : null
      _answer.description = item.last_version.description
      // SubClasses
      item.last_version.system_subclasses.forEach((subClass, subClassIndex) => {
        const _subClass = { ...subClass }
        const _risks = []
        // Assignments
        changeAssignments.data.forEach(assignment => {
          if (assignment.system_subclass.id == subClass.id) {
            _subClass.assignment = assignment
          }
        })
        sortedRisks.forEach((risk, riskIndex) => {
          if (subClass.id == risk.last_version.system_subclass.id) {
            _subClass.name = risk.last_version.system_subclass.name
            _subClass.id = risk.last_version.system_subclass.id
            _subClass.icon = risk.last_version.system_subclass.icon
            // Risks
            const _risk = { ...risk }
            risk.change_item_versions.forEach(_change_item_version => {
              if (_change_item_version.id === item.last_version.id) {
                // Answers
                answers.forEach(answer => {
                  if (answer.risk_version) {
                    if (answer.risk_version.id == risk.last_version.id) {
                      _risk.answer = answer
                    }
                  }
                })
                if (pickerValue !== 'all') {
                  if (_risk.answer) {
                    _risks.push(_risk)
                    _answer.approve_score = _risk.answer.approve_score
                  }
                } else if (pickerValue === 'all') {
                  _risks.push(_risk)
                }
                _subClass.risks = _risks
              }
            })
          }
        })
        systemSubClasses.push(_subClass)
        _answer.system_subclasses = systemSubClasses
      })
      _answers.push(_answer)
    })
    const _final_answers = []
    _changeItems.forEach(changeItem => {
      _answers.forEach(answer => {
        if (pickerValue !== 'all' && changeItem.name === answer.name && answer.approve_score == pickerValue) {
          _final_answers.push(answer)
        } else if (pickerValue === 'all' && changeItem.name === answer.name) {
          _final_answers.push(answer)
        }
      })
    })
    // 排除不涉及變因的評估結果
    const _final_answers_without_factor = _final_answers.filter(
      answer => answer.description !== '不涉及此變因'
    )
    return _final_answers_without_factor
  },
  async getAnswerForResult(
    answers,
    changeVersionId,
    evaluator,
    system_subclass
  ) {
    // Change Items
    const _params = {
      change_versions: changeVersionId,
      system_subclasses: system_subclass.id
    }
    // console.log(_params, '_params==');
    const _changeItems = await S_ChangeItem.index({
      params: _params
    })
    // Change Items Sort by last_version.sequence
    const changeItems = _changeItems.data.sort(function (a, b) {
      return a.last_version.sequence - b.last_version.sequence
    });
    // Change Assignments
    const _paramsChangeAssignments = {
      change_version: changeVersionId,
      evaluator: evaluator,
      system_subclass: system_subclass.id
    }
    const changeAssignments = await S_ChangeAssignment.index({
      params: _paramsChangeAssignments
    })
    // Risk
    const _paramsRisks = {
      change_versions: changeVersionId,
      system_subclass: system_subclass.id
    }
    // console.log(_paramsRisks,'_paramsRisks===');
    const _risks = await S_Risk.index({
      params: _paramsRisks
    })
    // Risk Sort by last_version.sequence
    const risks = _risks.data.sort(function (a, b) {
      return parseInt(a.last_version.question_number.replace(/-/g, "").trim()) - parseInt(b.last_version.question_number.replace(/-/g, "").trim())
    });
    // Sort
    const _answers = []
    const _result = {}
    changeItems.forEach((item, itemIndex) => {
      const _answer = {}
      const systemSubClasses = []

      _answer.name = item.last_version ? item.last_version.name : null
      _answer.description = item.last_version.description
      _answer.sequence = item.last_version ? item.last_version.sequence : null
      if (item.last_version && item.last_version.factor_score !== 12) {

        // SubClasses
        item.last_version.system_subclasses.forEach((subClass, subClassIndex) => {
          if (subClass.id == system_subclass.id) {
            const _subClass = { ...subClass }
            const _risks = []
            // Assignments
            changeAssignments.data.forEach(assignment => {
              if (assignment.system_subclass.id == system_subclass.id) {
                _subClass.assignment = assignment

                // Risk
                risks.forEach((risk, riskIndex) => {
                  if (subClass.id == risk.last_version.system_subclass.id) {
                    _subClass.name = risk.last_version.system_subclass.name
                    _subClass.id = risk.last_version.system_subclass.id
                    _subClass.icon = risk.last_version.system_subclass.icon
                    // Risks
                    const _risk = {
                      ...risk,
                      ...risk.last_version // 231211
                    }
                    _answer._sequence = risk.last_version.question_number.split("-")[0] // 231211
                    const versionLength = risk.change_item_versions.length
                    if (
                      risk.change_item_versions[versionLength - 1].id ==
                      item.last_version.id
                    ) {
                      // Answers
                      answers.forEach(answer => {
                        if (answer.risk_version &&
                          answer.risk_version.id == risk.last_version.id
                        ) {
                          _risk.answer = answer
                        }
                      })
                      _risks.push(_risk)
                      _subClass.risks = _risks
                    }
                  }
                })
              }
            })
            systemSubClasses.push(_subClass)
            _answer.system_subclasses = systemSubClasses
          }
        })
        _answers.push(_answer)
      }
    })
    _result.evaluator = changeAssignments.data[0]
      ? changeAssignments.data[0].evaluator
      : null
    _result.evaluate_at = changeAssignments.data[0]
      ? changeAssignments.data[0].evaluate_at
      : null
    _result.answers = _answers

    return _result
  },
  resultNumCount(answers, risk) {
    let _disagreeNum = 0
    let _agreeNum = 0
    let _conditional_agree_num = 0

    answers.forEach(answer => {
      if (answer.risk_version) {
        if (answer.risk_version.id == risk.last_version.id) {
          if (answer.approve_score == 16) {
            _agreeNum++
          } else if (answer.approve_score == 17) {
            _conditional_agree_num++
          } else {
            _disagreeNum++
          }
        }
      }
    })
    return {
      disagreeNum: _disagreeNum,
      agreeNum: _agreeNum,
      conditional_agree_num: _conditional_agree_num
    }
  },
  getRecordsWithCount(recordAnswers) {
    const _systemSubclasses = []
    recordAnswers.forEach(ans => {
      const systemSubclass = _systemSubclasses.find(subClass => {
        return ans.system_subclass.id == subClass.id
      })
      if (!systemSubclass) {
        const _subclass = {
          ...ans.system_subclass,
          evaluate_at: ans.evaluate_at
        }
        _systemSubclasses.push(ans.system_subclass)
      }
    })
  },

  compareEvaluators(before = [], now) {
    const final = now.map(item => {
      const _before = before.find(
        beforeItem => beforeItem.evaluatorId === item.evaluatorId
      )
      const isSame = before.length === 0 ? true : _before ? true : false //前後一版人員都是同一個人===true
      return {
        ...item,
        isSame: isSame
      }
    })
    return final
  },
  //Assignment
  compareChangeItems(before, now) {
    const final = now.map(item => {
      const _before = before.find(beforeItem => beforeItem.id === item.id)
      const isUpdate =
        before.length === 0
          ? false
          : _before && _before.description !== item.description
            ? true
            : false
      return {
        ...item,
        isUpdate: isUpdate
      }
    })
    return final.filter(item => item.factorScore !== 12)
  },
  //Assignment
  compareRisks(before, now) {
    const final = now.map(item => {
      const _before = before.find(beforeItem => beforeItem.id === item.id)
      const isUpdate =
        before.length === 0
          ? false
          : _before && _before.templateVersionId !== item.templateVersionId
            ? true
            : false
      return {
        ...item,
        isUpdate: isUpdate
      }
    })
    return final
  },
  //將risk 放入change item裡
  getChangeWithRisk(changeItems, risks) {
    let _changeItems = []
    changeItems.forEach(item => {
      const _risks = []
      risks.forEach(risk => {
        if (risk.changeItemVersionIds.includes(item.lastVersionId)) {
          _risks.push(risk)
        }
      })
      const _item = { ...item }
      _item.risks = _risks
      _changeItems.push(_item)
    })
    return _changeItems
  },
  getAssignmentList(
    systemSubclass,
    evaluators,
    changeItems,
    currentUserId,
    beforeAnswers,
    answers
  ) {
    const changeList = this.getChangeBySystem(systemSubclass, changeItems)

    const assignment = evaluators.map(item => {
      return {
        id: item.systemSubclass.id.toString(),
        textLabel: item.systemSubclass.name,
        doneIcon: item.evaluateAt ? true : false,
        evaluator: {
          id: item.evaluator.id,
          name: item.evaluator.name,
          avatar: item.evaluator.avatar
        },
        evaluateDate: item.evaluateAt,
        assignmentList: changeList.map(change => {
          //要過濾掉factor_score === 12
          return {
            index: change.index.toString(),
            title: change.name,
            subtitle: change.description,
            warningText:
              change.isUpdate && currentUserId === item.evaluator.id
                ? i18next.t('變因敘述已修改，請再次評估。')
                : '',
            changeList: change.risks.map(risk => {
              let score = this.setAssignmentAnswer(
                'approveScore',
                'number',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let description = this.setAssignmentAnswer(
                'description',
                'string',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let attaches = this.setAssignmentAnswer(
                'attaches',
                'array',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let answerId = this.setAssignmentAnswer(
                'id',
                'number',
                item,
                risk,
                beforeAnswers,
                answers
              )
              return {
                answerId: answerId,
                index: risk.quesNum,
                title: risk.name,
                score: score,
                updateVersion:
                  risk.isUpdate && currentUserId === item.evaluator.id,
                textareaContent: description,
                attaches: attaches,
                riskVersion: risk.lastVersionId,
                riskTemplateId: risk.riskTemplateId,
                riskTemplateVersionId: risk.templateVersionId,
                systemClass: risk.systemClass
              }
            })
          }
        })
      }
    })
    return assignment
  },
  otherChangeResult(
    evaluators,
    changeItems,
    currentUserId,
    beforeAnswers,
    answers
  ) {
    const assignment = evaluators.map((item, index) => {
      const _changeList = this.getChangeBySubclass(
        item.systemSubclass.id,
        changeItems
      )
      return {
        id: item.systemSubclass.id.toString(),
        textLabel: item.systemSubclass.name,
        subClass: item.systemSubclass,
        doneIcon: item.evaluateAt ? true : false,
        evaluator: {
          id: item.evaluator.id,
          name: item.evaluator.name,
          avatar: item.evaluator.avatar
        },
        evaluateDate: item.evaluateAt,
        assignmentList: _changeList.map(change => {
          //要過濾掉factor_score === 12
          return {
            index: change.index.toString(),
            title: change.name,
            subtitle: change.description,
            warningText:
              change.isUpdate && currentUserId === item.evaluator.id
                ? i18next.t('變因敘述已修改，請再次評估。')
                : '',
            changeList: change.risks.map(risk => {
              let score = this.setAssignmentAnswer(
                'approveScore',
                'number',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let description = this.setAssignmentAnswer(
                'description',
                'string',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let attaches = this.setAssignmentAnswer(
                'attaches',
                'array',
                item,
                risk,
                beforeAnswers,
                answers
              )
              let answerId = this.setAssignmentAnswer(
                'id',
                'number',
                item,
                risk,
                beforeAnswers,
                answers
              )
              return {
                answerId: answerId,
                index: risk.quesNum,
                title: risk.name,
                score: score,
                updateVersion:
                  risk.isUpdate && currentUserId === item.evaluator.id,
                textareaContent: description,
                attaches: attaches,
                riskVersion: risk.lastVersionId,
                riskTemplateId: risk.riskTemplateId,
                systemClass: risk.systemClass,
                systemSubclass: risk.systemSubclass
              }
            })
          }
        })
      }
    })
    return assignment
  },
  //get Answer data -> Assignment
  getAnswerData(answers) {
    const _answers = answers.map(answer => {
      return {
        id: answer.id,
        description: answer.description,
        approveScore: answer.approve_score,
        name: answer.name,
        attaches: answer.attaches,
        quesNum: answer.question_number,
        evaluateAt: answer.evaluate_at ? moment(answer.evaluate_at).format('YYYY-MM-DD') : null,
        systemClass: answer.system_class,
        systemSubclass: answer.system_subclass,
        riskId: answer.risk ? answer.risk.id : null,
        riskVersionId: answer.risk_version ? answer.risk_version.id : null
      }
    })
    return _answers
  },
  //取得answer approveScore,attaches,description=>Assignment
  setAssignmentAnswer(
    field,
    fieldType,
    evaluator,
    risk,
    beforeAnswers,
    answers
  ) {
    let answer = fieldType === 'string' ? '' : fieldType === 'array' ? [] : null
    if (!answers || answers.length === 0) {
      return answer
    }
    if (field === 'attaches') {
      if (
        !evaluator.evaluateAt &&
        evaluator.isSame &&
        beforeAnswers &&
        beforeAnswers.length > 0
      ) {
        const _answer = beforeAnswers.find(
          answer => answer.riskVersionId === risk.lastVersionId
        )
        answer = _answer ? _answer[field] : []
      } else if (!evaluator.evaluateAt) {
        answer = []
      } else {
        const _answer = answers.find(
          answer => answer.riskVersionId === risk.lastVersionId
        )
        answer = _answer ? _answer[field] : []
      }
    } else {
      if (
        !evaluator.evaluateAt &&
        evaluator.isSame &&
        beforeAnswers &&
        beforeAnswers.length > 0
      ) {
        const _answer = beforeAnswers.find(
          answer => answer.riskVersionId === risk.lastVersionId
        )
        answer = _answer ? _answer[field] : null
      } else if (!evaluator.evaluateAt) {
        answer = null
      } else {
        const _answer = answers.find(
          answer => answer.riskVersionId === risk.lastVersionId
        )
        answer = _answer ? _answer[field] : null
      }
    }
    return answer
  },
  //取得同領域的變因、風險 Assignment API開出篩選條件就可以刪除
  getChangeBySystem(subSystemId, changeItems) {
    let _filteredChangeItems = changeItems.filter(item => {
      return item.systemSubclassIds.includes(subSystemId)
    })
    _filteredChangeItems.forEach(item => {
      const _risks = item.risks.filter(risk => {
        return risk.systemSubclass.id === subSystemId
      })
      item.risks = _risks
    })
    return _filteredChangeItems
  },
  async createAll(datas) {
    return base.createAll({
      modelName: 'change_record_answer',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async update({ data, modelId }) {
    return base.update({
      modelId: modelId,
      modelName: 'change_record_answer',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  getAnsHasChangeItems(answers, filterChangeRecordAns, pickerValue) {
    // 先排除不涉及變因的評估結果
    const _answersHasChangeItems = answers.filter(
      answer => answer.description !== '不涉及此變因'
    )
    return _answersHasChangeItems
  },
  getChangeItemsTabsNum(changeItems) {
    const _allRisks = []
    changeItems.forEach(changeItem => {
      changeItem.system_subclasses.forEach(subClass => {
        if (subClass.risks && subClass.risks.length > 0) {
          subClass.risks.forEach(risk => {
            _allRisks.push(risk)
          })
        }
      })
    })
    return _allRisks.length
  },
  countResultNum(changeEvaluateResult) {

    let _changeEvaluateResult = JSON.parse(JSON.stringify(changeEvaluateResult))
    let _disagreeNum = 0
    let _agreeNum = 0
    let _conditional_agree_num = 0

    _changeEvaluateResult.answers.forEach(answer => {
      answer.system_subclasses.forEach(subclass => {
        if (subclass.risks && subclass.risks.length > 0) {
          subclass.risks.forEach(_risk => {
            if (_risk.answer && _risk.answer.approve_score) {
              if (_risk.answer.approve_score == 16) {
                _agreeNum++
              } else if (_risk.answer.approve_score == 17) {
                _conditional_agree_num++
              } else if (_risk.answer.approve_score == 18) {
                _disagreeNum++
              }
            }
          })
        }
      })
    })

    _changeEvaluateResult.agreeNum = _agreeNum
    _changeEvaluateResult.disagreeNum = _disagreeNum
    _changeEvaluateResult.conditional_agree_num = _conditional_agree_num

    return _changeEvaluateResult
  },
  // For 其他領域的評估結果
  getChangeBySubclass(subSystemId, changeItems) {
    const _deepCopy = JSON.parse(JSON.stringify(changeItems))

    let _filteredChangeItems = _deepCopy.filter(item => {
      return item.systemSubclassIds.includes(subSystemId)
    })

    const _arr = _filteredChangeItems.map(item => {
      const _risks = item.risks.filter(risk => {
        return risk.systemSubclass.id === subSystemId
      })
      item.risks = _risks
      return {
        ...item
      }
    })
    return _arr
  },
  countEvalResultNum(changeEvaluateResult) {
    const t0 = performance.now();
    let _changeEvaluateResult = JSON.parse(JSON.stringify(changeEvaluateResult))
    let _count = {}
    let _disagreeNum = 0
    let _agreeNum = 0
    let _conditional_agree_num = 0
    _changeEvaluateResult.forEach(answer => {
      if (answer.approve_score == 16) {
        _agreeNum++
      } else if (answer.approve_score == 17) {
        _conditional_agree_num++
      } else if (answer.approve_score == 18) {
        _disagreeNum++
      }
    })
    _count.agreeNum = _agreeNum
    _count.disagreeNum = _disagreeNum
    _count.conditional_agree_num = _conditional_agree_num
    const t1 = performance.now();
    console.log(`Spent2: ${t1 - t0} ms`);
    return _count
  },
  // 230928
  async updateAnswer({ answerId, data }) {
    const res = await base.update({
      modelName: 'change_record_answer',
      modelId: answerId,
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    });
    return res;
  },
  // 230928
  async createAnswer({ data }) {
    const res = await base.create({
      modelName: 'change_record_answer',
      data: {
        ...data,
        ...S_Processor.getFactoryParams()
      }
    });
    return res;
  },
  formattedAnswers001(assignmentDataList) {
    const _formattedAnswers = []
    assignmentDataList.forEach((assignmentData, assignmentDataIndex) => {
      assignmentData.assignmentList.forEach((changeItem, changeItemIndex) => {
        changeItem.changeList.forEach((changeRisk, changeRiskIndex) => {
          const _perRiskAnswer = {
            ...changeRisk
          }
          _formattedAnswers.push(_perRiskAnswer)
        })
      })
    })
    return _formattedAnswers
  },
  validationQuestionSubmit(_formattedAnswers) {
    return _formattedAnswers.every(item => item.score !== null && item.score !== undefined);
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
}
