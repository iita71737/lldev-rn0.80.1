import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import { create } from 'react-test-renderer'
import S_WaSa from '@/__reactnative_stone/services/wasa/index'
import changeModels from '@/models/change'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'change_item',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async ShowAll(datas) {
    return base.ShowAll({
      modelName: 'change_item',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async createAll(datas) {
    return base.createAll({
      modelName: 'change_item_with_version',
      datas: S_Processor.getDatasWithFactory(datas)
    })
  },
  async createFromFormatedDatas(datas, _change, _changeVersion) {
    const _changeItemDatas = []
    datas.forEach((change, changeIndex) => {
      if (change.other || changeIndex + 1 == datas.length) {
        if (!change.other) {
          return
        }
        change.other.forEach((otherItem, otherItemIndex) => {
          const _formatedOtherChangeItems = S_WaSa.getPostData(
            changeModels.getFields(),
            otherItem
          )
          _changeItemDatas.push({
            description: otherItem.description,
            name: otherItem.name,
            factor_score: 11,
            system_classes: _formatedOtherChangeItems.system_classes,
            system_subclasses: _formatedOtherChangeItems.system_subclasses,
            sequence: changeIndex + 1 + otherItemIndex,
            changes: [_change.id],
            change_versions: [_changeVersion.id]
          })
        })
      } else {
        const _systemClassIds = change.countersign
          ? change.countersign.last_version.system_classes.map(
            systemClass => systemClass.id
          )
          : null
        const _systemSubclassIds = change.countersign
          ? change.countersign.last_version.system_subclasses.map(
            systemSubclass => systemSubclass.id
          )
          : null
        _changeItemDatas.push({
          description: change.countersign
            ? change.countersign.description
            : null,
          name: change.countersign ? change.countersign.name : null,
          factor_score: change.factor_score,
          change_item_template: change.countersign
            ? change.countersign.id
            : null,
          change_item_template_version: change.countersign
            ? change.countersign.last_version.id
            : null,
          system_classes: _systemClassIds,
          system_subclasses: _systemSubclassIds,
          sequence: changeIndex + 1,
          changes: [_change.id],
          change_versions: [_changeVersion.id]
        })
      }
    })
    return await this.createAll(_changeItemDatas)
  },
  //取得change item data -> Assignment
  getChangeItemData(items) {
    const _filterItems = items.filter(
      item => item.last_version && item.last_version.factor_score !== 12
    )
    const _items = _filterItems.map((item, itemIndex) => {
      let _date = {
        id: item.id,
        index: itemIndex + 1,
        lastVersionId: item.last_version ? item.last_version.id : null,
        name: item.last_version ? item.last_version.name : '',
        factorScore: item.last_version ? item.last_version.factor_score : null,
        description: item.last_version ? item.last_version.description : '',
        systemClassIds: item.last_version
          ? item.last_version.system_classes.map(item => item.id)
          : [],
        systemSubclassIds: item.last_version
          ? item.last_version.system_subclasses.map(item => item.id)
          : []
      }
      return _date
    })
    return _items
  }
}
