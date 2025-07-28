import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import axios from 'axios'
import config from '@/__config'
import store from '@/store'
import { useSelector } from 'react-redux'
export default {
  async addMyCollect({ modelId }) {
    return base.addMyCollect({ modelId: modelId })
  },

  async removeMyCollect({ modelId }) {
    return base.addMyCollect({ modelId: modelId })
  },

  collectToggle({ myActId, actId }) {
    if (myActId.includes(actId)) {
      this.removeMyCollect({ modelId: actId })
    } else {
      this.addMyCollect({ modelId: actId })
    }
  }
}
