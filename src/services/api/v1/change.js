import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_Risk from '@/services/api/v1/risk'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'change',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async expiredIndex({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'change/expired',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'change',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async create(data) {
    return base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'change',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ data, modelId }) {
    return base.update({
      modelName: 'change',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async delete(modelId) {
    return base.delete({
      modelName: 'change',
      params: S_Processor.getFactoryParams(),
      modelId: modelId
    })
  },
  async stopChange(modelId) {
    return base.stop({
      modelId: modelId,
      params: S_Processor.getFactoryParams(),
      modelName: 'change',
      preUrl: S_Processor.getFactoryPreUrl()
    })
  },
  async restartChange(modelId) {
    return base.restart({
      params: S_Processor.getFactoryParams(),
      modelId: modelId,
      modelName: 'change',
      preUrl: S_Processor.getFactoryPreUrl()
    })
  },
  async startChange(factoryId, changeId) {
    //啟動變動
    const res = await base.create({
      url: `factory/${factoryId}/change/${changeId}/start`,
    });
    return res;
  },
  //轉換change+version格式 用於作業
  getChangeDataAssignment(change) {
    return {
      id: change.id,
      name: change.name,
      owner: {
        name: change.last_version.owner ? change.last_version.owner.name : null,
        avatar: change.last_version.owner
          ? change.last_version.owner.avatar
          : null
      },
      version:
        change.last_version && change.last_version.version_number
          ? `ver${change.last_version.version_number}.`
          : null,
      lastVersionId: change.last_version.id,
      versions: change.last_versions,
      evaluateExpiredAt: moment(change.last_version.expired_date).format(
        'YYYY-MM-DD'
      ),
      attaches: change.last_version.attaches
    }
  },
  async getVersionChangeItem(versionId, systemSubclass, currentUser) {
    try {
      const t0 = performance.now();
      // 2. 取得屬於此變動計畫的變動項目
      const resChangeItems = await S_ChangeItem.index({
        params: {
          change_versions: versionId,
          order_way: 'asc',
          order_by: 'sequence'
        }
      })
      const t1 = performance.now();
      console.log(`t1 S_ChangeItem.index API Spent!!!: ${t1 - t0} ms`);
      // 3. 取得此變動計畫的所有變動風險
      const resRisks = await S_Risk.index({
        params: {
          change_versions: versionId,
          order_way: 'asc',
          order_by: 'sequence'
        }
      })
      const t2 = performance.now();
      console.log(`t2 S_Risk.index API Spent!!!: ${t2 - t1} ms`);
      // 4. 取得此變動計畫的所有變動作業
      let _params = {
        change_version: versionId,
      }
      if (currentUser) {
        _params = {
          ..._params,
          evaluate_at: 'not_null',
          evaluator: currentUser && currentUser.id ? currentUser.id : undefined
        }
      }
      const resAssignments = await S_ChangeAssignment.index({
        params: _params
      })
      const t3 = performance.now();
      console.log(`t3 S_ChangeAssignment.index API Spent!!!: ${t3 - t2} ms`);
      // 5. 取得此變動計畫所有的 已完成評估的風險
      const resChangeRecordAnswers = await S_ChangeRecordAns.index({
        params: {
          change_version: versionId,
          get_all: 1 //目前還是得全取，不然評估結果會有錯 與 變動作業題目載入可能會有出入
        }
      })
      const t4 = performance.now();
      console.log(`t4 S_ChangeAssignment.index API Spent!!!: ${t4 - t3} ms`);
      await Promise.all([resChangeItems, resRisks, resRisks, resAssignments, resChangeRecordAnswers])
        .then(res => {
          // console.log(res,'res===');
        })
        .catch(err => {
          console.log(err)
          // Alert.alert(t('取得資料失敗'))
        })
      const _versionChangeItem = {}
      const _changeItems = S_ChangeItem.getChangeItemData(resChangeItems.data)
      _versionChangeItem.changeItems = _changeItems
      const _risks = S_Risk.getRiskData(resRisks.data)
      _versionChangeItem.risks = _risks
      const _evaluators = S_ChangeAssignment.getEvaluatorData(resAssignments.data)
      _versionChangeItem.evaluators = _evaluators
      const _answers = S_ChangeRecordAns.getAnswerData(
        resChangeRecordAnswers.data
      )
      _versionChangeItem.answers = _answers
      const t5 = performance.now();
      console.log(`t5 Promise.all API Spent!!!: ${t5 - t4} ms`);
      return _versionChangeItem
    } catch (error) {
      console.error('An error occurred:', error);
    }
  },
  getContent(
    beforeEvaluators,
    evaluators,
    beforeChangeItems,
    changeItems,
    beforeRisks,
    risks,
    systemSubclass,
    currentUser,
    beforeAnswers,
    answers
  ) {
    const finalEvaluators = S_ChangeRecordAns.compareEvaluators(
      beforeEvaluators,
      evaluators
    )
    const finalChangeItems = S_ChangeRecordAns.compareChangeItems(
      beforeChangeItems,
      changeItems
    )
    const finalRisks = S_ChangeRecordAns.compareRisks(beforeRisks, risks)
    const changeItemsWithRisks = S_ChangeRecordAns.getChangeWithRisk(
      finalChangeItems,
      finalRisks
    )
    const _assignmentDataList = S_ChangeRecordAns.getAssignmentList(
      systemSubclass.id,
      finalEvaluators,
      changeItemsWithRisks,
      currentUser.id,
      beforeAnswers,
      answers
    )
    return _assignmentDataList
  },
  getOtherChangeAssignmentWithSystemSubclasses(
    beforeEvaluators,
    evaluators,
    beforeChangeItems,
    changeItems,
    beforeRisks,
    risks,
    systemSubclass,
    currentUser,
    beforeAnswers,
    answers
  ) {
    const finalEvaluators = S_ChangeRecordAns.compareEvaluators(
      beforeEvaluators,
      evaluators
    )

    const finalChangeItems = S_ChangeRecordAns.compareChangeItems(
      beforeChangeItems,
      changeItems
    )

    const finalRisks = S_ChangeRecordAns.compareRisks(beforeRisks, risks)

    const changeItemsWithRisks = S_ChangeRecordAns.getChangeWithRisk(
      finalChangeItems,
      finalRisks
    )

    const _assignmentDataList = S_ChangeRecordAns.otherChangeResult(
      finalEvaluators,
      changeItemsWithRisks,
      currentUser.id,
      beforeAnswers,
      answers
    )

    return _assignmentDataList
  },
  async tabIndex({ params }) {
    return base.index({
      modelName: `v1/${S_Processor.getFactoryPreUrl()}/change/tab_index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
