import moment from 'moment'

export default {
  getDateMonth(date) {
    return moment(date).format('M')
  },
  getSeasonStartDate(date, currentMonth, season) {
    const num = season.indexOf(parseInt(currentMonth))
    const _date = moment(date).startOf('month').subtract(num, 'months')
    return _date
  }
}
