import axios from 'axios'
import moment from 'moment'

export default {
  // endpoints: 'https://d7or2lz7ey276.cloudfront.net/chat/',
  endpoints: 'https://chatroom-service.wasa.wasateam.com/api/v2/',
  // endpoints: 'http://localhost:3000/api/v1',

  async get(messageId, token) {
    try {
      const res = await axios.get(`${this.endpoints}/message/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return res.data
    } catch (error) {
      console.error(`getMessage error. ${error}`)
    }
  },

  async list(chatroomId, token, params = null) {
    try {
      const res = await axios.get(
        `${this.endpoints}/chatroom/${chatroomId}/message`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: params
        }
      )
      return res.data
    } catch (error) {
      console.error(`getMessageList error. ${error}`)
    }
  },

  async create(chatroomId, token, messageType, content) {
    // return
    try {
      const res = await axios.post(
        `${this.endpoints}/chatroom/${chatroomId}/message/create`,
        {
          messageType: messageType,
          [messageType]: content
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      return res.data
    } catch (error) {
      console.error(`getMessage error. ${error}`)
    }
  },

  getFakeId(length) {
    return moment().unix() + Math.random() + length
  }
}
