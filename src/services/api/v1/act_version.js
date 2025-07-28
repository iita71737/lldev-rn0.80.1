import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import axios from 'axios'
import config from '@/__config'
import S_Processor from '@/services/app/processor'
import { deleteCollectId, addToCollectIds } from '@/store/data'
import store from '@/store'
import moment from "moment"
import i18next from 'i18next'

export default {
  // async index({ params }) {
  //   return base.index({
  //     preUrl: S_Processor.getFactoryPreUrl(),
  //     modelName: 'act',
  //     params: {
  //       ...params,
  //       ...S_Processor.getFactoryParams()
  //     }
  //   })
  // },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'act_version',
      params: S_Processor.getFactoryParams()
    })
  },
  async indexAnnounce({ params }) {
    return base.index({
      modelName: `act/${params.act_id}/act_version/index/announce`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
}
