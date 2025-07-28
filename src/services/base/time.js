import moment from 'moment'

export default {
  getTimeFormat(date, format) {
    if (!date) {
      return ''
    }
    return moment(date).format(format)
  },
  getTimeFormat(date, format) {
    return this.getTimeFormat(date, format)
  },
  getDateMonth(date) {
    return moment(date).format('M')
  },
  getSeasonStartDate(date, currentMonth, season) {
    const num = season.indexOf(parseInt(currentMonth))
    const _date = moment(date).startOf('month').subtract(num, 'months')
    return _date
  }
}
