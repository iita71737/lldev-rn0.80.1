import axios from 'axios'
import config from '@/__config'
import store from '@/store'
import { setDataFail } from '@/store/data'

export default {
  apiFail() {
    store.dispatch(setDataFail(true))
  }
}
