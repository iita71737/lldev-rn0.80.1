import axios from 'axios'
import config from '@/__config'

export default {
  async get({ url, params }) {
    try {
      const res = await axios.get(url, {
        params: params
      })
      return res.data
    } catch (error) {
      console.log(error)
    }
  },

  async create({ url, postData }) {
    try {
      const res = await axios.post(url, postData)
      return res.data
    } catch (error) {
      console.log(error)
    }
  },

  async update({ url, postdata }) {
    try {
      const res = await axios.patch(url, postdata)
      return res.data
    } catch (error) {
      console.log(error)
    }
  }
}
