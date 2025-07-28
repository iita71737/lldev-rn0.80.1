import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import axios from 'axios'
import config from '@/__config'
import S_Processor from '@/services/app/processor'
import { deleteCollectId, addToCollectIds } from '@/store/data'
import store from '@/store'
import moment from "moment"
import i18next from 'i18next'

export default {
  async index({ params }) {
    return base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'act',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'act',
      params: S_Processor.getFactoryParams()
    })
  },
  async indexAll({ params }) {
    const _page = params?.page
    return base.index({
      parentName: 'factory',
      parentId: S_Processor.getFactoryParams().factory,
      modelName: _page ? `act/index/all?page=${_page}` : `act/index/all`,
      params: params
    })
  },
  async actWithActTypes({ actTypes, parentId, params }) {
    // 開始計時
    const startTime = performance.now();

    const resActs = await this.indexAll({
      parentId: parentId,
      params: params
    })
    const actWithActTypes = []
    actTypes.forEach(actType => {
      const act = []
      resActs.data.forEach(resAct => {
        if (resAct.act_type !== null && resAct.act_type.id == actType.id) {
          act.push({
            id: resAct.id,
            last_version: resAct.last_version
          })
        }
      })
      actWithActTypes.push({
        actType: actType.name,
        icon: actType.icon,
        acts: act
      })
    })
    // 結束計時
    const endTime = performance.now();
    // 計算執行時間（以毫秒為單位）
    const duration = endTime - startTime;
    // console.log('API 執行時間：', duration, '毫秒');
    return actWithActTypes
  },
  actWithSystemClasses({ systemClasses, acts }) {
    const actWithSystemClasses = []

    systemClasses.forEach(systemClass => {
      const actWithSystemClass = acts.map(act => {
        const res = act.system_classes.filter(actSystemClass => {
          return actSystemClass.id == systemClass.id
        })
        return res
      })
      actWithSystemClasses.push({
        systemClass: systemClass.name,
        acts: actWithSystemClass
      })
    })
    return actWithSystemClasses
  },
  async removeMyCollect(modelId) {
    base.removeFromCollect({
      modelName: 'act',
      modelId: modelId
    })
  },
  async addMyCollect(modelId) {
    base.addToCollect({
      modelName: 'act',
      modelId: modelId
    })
  },
  getActUpdateDateBadge(date) {
    if (!date) return;
    const newDate = moment();
    const secondDate = moment(date);
    const month =
      newDate.diff(secondDate, 'months', true) <= 3
        ? 3
        : newDate.diff(secondDate, 'months', true) <= 6
          ? 6
          : 0;
    if (
      newDate.diff(secondDate, 'months', true) <= month &&
      newDate.diff(secondDate, 'months', true) >= 0
    ) {
      return `${i18next.t('近{number}個月異動', { number: month })}`
    } else {
      return '';
    }
  },
  filteredActWithActType(actTypes, actWithActTypes) {
    if (!actWithActTypes) {
      return
    }
    const filteredActTypes = actTypes.filter(actType => actWithActTypes.some(act => act.act_type?.id == actType.id))
    return filteredActTypes
  }
}
