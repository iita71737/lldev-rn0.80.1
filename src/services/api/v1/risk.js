import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_WaSa from '@/__reactnative_stone/services/wasa/index'
import changeModels from '@/models/change'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class.js'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'risk',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async createAll(datas) {
    return base.createAll({
      modelName: 'risk_with_version',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async createFromFormatedData(datas, changeItems, _changeVersion) {
    const _riskDatas = []

    datas.forEach((change, changeIndex) => {
      let itemQuesNum = 1
      changeItems.forEach((changeItem, changeItemIndex) => {
        if (changeItem.data.data.change_item_template) {
          if (
            change.countersign &&
            change.countersign.id ==
            changeItem.data.data.change_item_template.id
          ) {
            let systemSubclassQuesNum = 1
            change.countersign.last_version.risk_templates.forEach(
              (risk, riskIndex) => {
                let riskNum = 1
                _riskDatas.push({
                  name: risk.name,
                  risk_template: risk.id,
                  risk_template_version: risk.last_version.id,
                  system_class: risk.system_class.id,
                  system_subclass: risk.system_subclass.id,
                  change_item_versions: [changeItem.data.data.last_version.id],
                  change_versions: [_changeVersion.id],
                  question_number: `${itemQuesNum}-${systemSubclassQuesNum}-${riskNum}`
                })
                if (changeItem.data.data.last_version.factor_score != 12) {
                  systemSubclassQuesNum++
                  riskNum++
                }
              }
            )
          }
          if (changeItem.data.data.last_version.factor_score != 12) {
            itemQuesNum++
          }
        } else {
          let systemSubclassQuesNum = 1
          if (change.other) {
            change.other.forEach((otherItem, otherItemIndex) => {
              const _formatedOtherChangeItems = S_WaSa.getPostData(
                changeModels.getFields(),
                otherItem
              )
              _formatedOtherChangeItems.system_subclasses.forEach(
                (otherSubclass, otherSubclassIndex) => {
                  const _systemClass =
                    S_SystemClass.getSystemClassBySystemSubclassId(
                      otherSubclass
                    )
                  _riskDatas.push({
                    name: otherItem.risk,
                    system_class: _systemClass.id,
                    change_versions: [_changeVersion.id],
                    system_subclass: otherSubclass,
                    change_item_versions: [
                      changeItem.data.data.last_version.id
                    ],
                    question_number: `${itemQuesNum}-${systemSubclassQuesNum}-${otherItemIndex + 1
                      }`
                  })
                  systemSubclassQuesNum++
                }
              )
            })
            itemQuesNum++
          }
        }
      })
    })
    return await this.createAll(_riskDatas)
    // datas.forEach((change, changeIndex) => {
    //   let systemSubclassQuestionNum = 0
    //   if (change.other) {
    //     change.other.forEach((otherItem, otherItemIndex) => {
    //       // Create Risk with version
    //       _formatedOtherChangeItems.system_subclasses.forEach((otherSubclass, otherSubclassIndex) => {
    //         const _systemClass = S_SystemClass.getSystemClassBySystemSubclassId(otherSubclass)
    //         _riskDatas.push({
    //           name: otherItem.risk,
    //           system_class: _systemClass.id,
    //           change_versions: [_changeVersion.id],
    //           system_subclass: otherSubclass.id,
    //           question_number: `${itemQuestionNum}-${systemSubclassQuestionNum}-${otherSubclassIndex + 1}`,
    //         })
    //         systemSubclassQuestionNum++
    //       })
    //       itemQuestionNum++
    //     })
    //   } else {
    //     // Create Risk with version
    //     change.countersign.last_version.risk_templates.map((templateRisk, templateRiskIndex) => {
    //       _riskDatas.push({
    //         name: templateRisk.name,
    //         system_class: templateRisk.system_class.id,
    //         system_subclass: templateRisk.system_subclass.id,
    //         change_versions: [_changeVersion.id],
    //         question_number: `${itemQuestionNum}-${systemSubclassQuestionNum}-${templateRiskIndex + 1}`,
    //       })
    //       systemSubclassQuestionNum++
    //     })
    //     if (change.factor_score != 12) { itemQuestionNum++ }
    //   }
    // })
  },
  //get risk data -> Assignment
  getRiskData(risks) {
    const _risks = risks.map(risk => {
      const lastVersion = risk.last_version
      if (!lastVersion) {
        return
      }
      return {
        id: risk.id,
        changeItemVersionIds: risk.change_item_versions.map(
          version => version.id
        ),
        riskTemplateId: risk.risk_template ? risk.risk_template.id : null,
        templateVersionId:
          risk.last_version && risk.last_version.risk_template_version
            ? risk.last_version.risk_template_version.id
            : null,
        lastVersionId: lastVersion.id,
        attaches: lastVersion.attaches,
        description: lastVersion.description,
        name: lastVersion.name,
        quesNum: lastVersion.question_number,
        systemClass: lastVersion.system_class,
        systemSubclass: lastVersion.system_subclass
      }
    })
    return _risks
  }
}
