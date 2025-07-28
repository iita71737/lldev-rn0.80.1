import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_Risk from '@/services/api/v1/risk'
import moment from 'moment'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'change_assignment',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams(),
      }
    })
  },
  async show({ params }) {
    const _modelId = params.change_version
    return base.show({
      modelName: 'change_assignment',
      modelId: _modelId,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'change_assignment',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async createAll(datas) {
    return base.createAll({
      modelName: 'change_assignment',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async updateAll(datas) {
    return base.updateAll({
      modelName: 'change_assignment',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async createDatasFormat(datas, changeId, changeVersionId) {
    const _datas = []
    datas.change_assignment.forEach(change => {
      _datas.push({
        change: changeId,
        change_version: changeVersionId,
        evaluator: change.evaluator,
        system_subclass: change.system_subclass
      })
    })
    await this.createAll(_datas)
  },
  getEvaluatorData(evaluators) {
    const _evaluators = evaluators.map(item => {
      return {
        id: item.id,
        systemSubclass: item.system_subclass,
        evaluatorId: item.evaluator.id,
        evaluator: item.evaluator,
        evaluateAt: moment(item.evaluate_at).format('YYYY-MM-DD')
      }
    })
    return _evaluators
  },
  formatAnswer(_assignmentDataList, _assignment, _risk, systemSubclass) {
    let _assignment_copy = JSON.parse(JSON.stringify(_assignment))
    let _changeList = []
    _assignment.assignmentList.forEach((assignment, assignmentIndex) => {
      assignment.changeList.forEach(risk => {
        if (risk.index == _risk.index) {
          _changeList.push(_risk)
        }
        else {
          _changeList.push(risk)
        }
      })
      _assignment_copy.assignmentList[assignmentIndex].changeList = _changeList
    })
    _assignmentDataList.forEach(assignmentByClass => {
      if (assignmentByClass.id == systemSubclass.id) {
        return _changeList
      }
    })
  },
  // 230928
  async updateEvaluateTime({ evaluatorId, datas }) {
    const res = await base.update({
      modelName: 'change_assignment',
      modelId: evaluatorId,
      data: {
        ...datas,
        ...S_Processor.getFactoryParams()
      },
    });
    return res;
  },
}
