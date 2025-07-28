import moment from "moment"
import i18next from 'i18next'

export default {
  getTags(item, tagType) {
    let result = null
    let text = ''
    const dateToCheck = moment(item.last_version.updated_at)
    const toData = moment(new Date())
    const dateDifference = toData.diff(dateToCheck, 'days')

    if (dateDifference <= 30) {
      text = i18next.t('近{number}個月更新', { number: 1 })
    }
    if (dateDifference > 30 && dateDifference <= 90) {
      text = i18next.t('近{number}個月更新', { number: 3 })
    }
    if (dateDifference > 90 && dateDifference <= 180) {
      text = i18next.t('近{number}個月更新', { number: 6 })
    }
    if (tagType === 'props' && text) {
      result = text
    } else if (tagType === 'props' && text === '') {
      // result = i18next.t('無')
      result = false
    }
    if (tagType === 'badge' && text) {
      result = [
        {
          color: "yellow",
          text,
        }
      ]
    } else if (tagType === 'badge' && text === '') {
      result = []
    }
    return result;
  },
}