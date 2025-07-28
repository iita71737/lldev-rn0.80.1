import axios from 'axios'
import { useSelector } from 'react-redux'
import ServiceWasa from '@/__reactnative_stone/services/wasa'
import { get } from 'react-native/Libraries/Utilities/PixelRatio'
import config from '@/__config'
import moment from 'moment'

export default {
  // endpoints: 'https://d7or2lz7ey276.cloudfront.net/chat/',
  endpoints: 'https://chatroom-service.wasa.wasateam.com/api/v2/',
  // endpoints: 'http://localhost:3000/api/v1',

  async get(chatroomId, token) {
    try {
      const res = await axios.get(`${this.endpoints}/chatroom/${chatroomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return res.data
    } catch (error) {
      console.error(`Chatroom List error. ${error}`)
    }
  },

  async list(token, params = null) {
    try {
      const res = await axios.get(`${this.endpoints}/chatroom`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: params
      })
      return res.data
    } catch (error) {
      console.error(`Chatroom List error. ${error}`)
    }
  },
  async getMessage(chatroomId, token, params = null) {
    try {
      const res = await axios.get(
        `${this.endpoints}/chatroom/${chatroomId}/message`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          params: params
        }
      )
      return res.data
    } catch (error) {
      console.error(`getMessage error. ${error}`)
    }
  },
  getChatroomName(chatroom) {
    if (config.chatroom.getChatroomNameFromPayload) {
      return config.chatroom.getChatroomNameFromPayload(chatroom.payload)
    } else {
      return chatroom.name
    }
  },
  getChatroomAvatar(chatroom) {
    if (config.chatroom.getChatroomAvatarFromPayload) {
      return config.chatroom.getChatroomAvatarFromPayload(chatroom.payload)
    } else {
      return chatroom.avatar
    }
  },
  getMemberAvatar(member) {
    if (config.chatroom.getMemberAvatarFromPayload) {
      return config.chatroom.getMemberAvatarFromPayload(member.payload)
    } else {
      return member.avatar
    }
  },
  getMemberName(member) {
    if (config.chatroom.getMemberNameFromPayload) {
      return config.chatroom.getMemberNameFromPayload(member.payload)
    } else {
      return member.name
    }
  },
  getTimeText(time) {
    if (!time) {
      return null
    }
    const momentNow = moment()
    const momentTime = moment(time)
    const diffSeconds = momentNow.diff(momentTime, 'seconds')
    const diffMinutes = momentNow.diff(momentTime, 'minutes')
    const diffHours = momentNow.diff(momentTime, 'hours')
    const diffDays = momentNow.diff(momentTime, 'days')
    const diffWeeks = momentNow.diff(momentTime, 'weeks')
    const diffMonths = momentNow.diff(momentTime, 'months')
    if (diffSeconds < 10) {
      return '剛剛';
    } else if (diffSeconds < 60) {
      return `${diffSeconds}秒前`
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分鐘前`
    } else if (diffHours < 24) {
      return `${diffHours}小時前`
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else if (diffWeeks < 3) {
      return '兩週前';
    } else if (diffWeeks < 4) {
      return '三週前';
    } else if (diffMonths < 2) {
      return '上月';
    } else {
      return `${momentTime.format('YYYY年M月')}`
    }
  }
}
