import store from '@/store';
import moment from 'moment-timezone';
import i18next from 'i18next'
import H_time from '@/helpers/time';

// ---------------- 這段是新加的共用小工具 ----------------
const CN_DIGITS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

function toChineseYearDigits(num) {
  // 114 -> "一一四"
  return String(num)
    .split('')
    .map(d => CN_DIGITS[Number(d)])
    .join('');
}

function toChineseIntUnder100(n) {
  // 1~99 -> "一"～"九十九"
  if (n <= 10) {
    return n === 10 ? '十' : CN_DIGITS[n];
  }
  if (n < 20) {
    // 11~19: "十一" ~ "十九"
    return '十' + CN_DIGITS[n % 10];
  }
  const tens = Math.floor(n / 10); // 十位
  const ones = n % 10;            // 個位
  // 20,30,...,90 -> "二十","三十"...
  return CN_DIGITS[tens] + '十' + (ones === 0 ? '' : CN_DIGITS[ones]);
}
// ---------------------------------------------------------

export default {
  getFactoryDayStartEndTime(factoryTimezone) {
    const state = store.getState()
    const timeZone = factoryTimezone
      ? factoryTimezone
      : state.data.currentFactory.timezone;
    // 使用 moment-timezone 處理時區轉換
    const nowInTimeZone = moment.tz(timeZone);
    // 本地日期格式
    const formattedDate = nowInTimeZone.format('YYYY-MM-DD');
    // 本地當天開始和結束時間
    const startOfDay = nowInTimeZone.startOf('day').format('YYYY-MM-DD HH:mm:ss');
    const endOfDay = nowInTimeZone.endOf('day').format('YYYY-MM-DD HH:mm:ss');
    // UTC 偏移量
    const utcOffset = nowInTimeZone.utcOffset();
    // 處理 UTC start_time 和 end_time
    const utcStartTime = moment(`${formattedDate} 00:00:00`, 'YYYY-MM-DD HH:mm:ss').subtract(utcOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    const utcEndTime = moment(`${formattedDate} 23:59:59`, 'YYYY-MM-DD HH:mm:ss').subtract(utcOffset, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    return { start: utcStartTime, end: utcEndTime };
  },
  setWeekday(number) {
    switch (number) {
      case '0':
        return i18next.t('週日');
      case '1':
        return i18next.t('週一');
      case '2':
        return i18next.t('週二');
      case '3':
        return i18next.t('週三');
      case '4':
        return i18next.t('週四');
      case '5':
        return i18next.t('週五');
      case '6':
        return i18next.t('週六');
    }
  },
  getDateDashFormat(time, format, isSourceUtcTime) {
    if (!time) return '';
    return isSourceUtcTime
      ? moment.utc(time).format(format ? format : 'YYYY-MM-DD')
      : moment(time).format(format ? format : 'YYYY-MM-DD');
  },
  getDateDotFormat(time, isSourceUtcTime) {
    if (!time) return '';
    return isSourceUtcTime
      ? moment.utc(time).format('YYYY-MM-DD').split('-').join('.')
      : moment(time).format('YYYY-MM-DD').split('-').join('.');
  },
  getDateDurationFormat(start, end, isSourceUtcTime) {
    const _start = this.getDateDotFormat(start, isSourceUtcTime);
    const _end = this.getDateDotFormat(end, isSourceUtcTime);
    return `${_start} - ${_end}`;
  },
  setShow(rawData) {
    const {
      id,
      created_user: creator,
      created_at: createdAt,
      updated_user: updater,
      updated_at: updatedAt,
      type,
      checkers,
      reviewers,
      record_at: recordAt,
      start_at: startAt,
      end_at: endAt,
      end_type: endType,
      frequency,
      frequency_times: frequencyTimes,
      record_days: recordDays,
      general_time_periods: timePeriods,
      owner
    } = rawData;
    const _type = type === 'regular'
      ? i18next.t('定期')
      : i18next.t('單次');
    let duration = '';
    if (type === 'regular') {
      if (endType === 'date') {
        duration = this.getDateDurationFormat(startAt, endAt, true);
      } else if (endType === 'never') {
        duration = `${H_time.getDateDotFormat(startAt, true)} - ${i18next.t('永不結束')}`
      }
    } else if (type === 'one_time') {
      duration = moment.utc(recordAt).format('YYYY-MM-DD');
    }
    let _frequency = '';
    let _recordDays = null;
    switch (frequency) {
      case 'day':
        _frequency = i18next.t('每{number}天', { number: frequencyTimes });
        break;
      case 'week':
        _frequency = i18next.t('每{number}週', { number: frequencyTimes });
        _recordDays = recordDays.map(item => this.setWeekday(item.record_day)).toString(',');
        break;
      case 'month':
        _frequency = i18next.t('每{number}個月', { number: frequencyTimes });
        _recordDays = recordDays.map(item => item.record_day === 'last_day' ? i18next.t('最後一天') : item.record_day).toString(',');
        break;
      case 'year':
        _frequency = i18next.t('每{number}年', { number: frequencyTimes });
        break;
      default:
        break;
    }
    let _timePeriods = '';
    timePeriods.forEach((period, index, arr) => {
      _timePeriods += `${this.getDateDashFormat(period.start_time, 'HH:mm')} - ${this.getDateDashFormat(period.end_time, 'HH:mm')}`;
      if (index !== arr.length - 1) _timePeriods += '\n';
    });
    const repeatInterval = frequency === 'week' || frequency === 'month'
      ? `${_frequency}\n${_recordDays}\n${_timePeriods}`
      : `${_frequency}\n${_timePeriods}`;
    const result = {
      id,
      creator,
      createdAt: moment(createdAt).format('YYYY-MM-DD HH:mm'),
      updater,
      updatedAt: moment(updatedAt).format('YYYY-MM-DD HH:mm'),
      type: _type,
      checkers,
      reviewers,
      duration,
      owner,
    };
    if (type === 'regular') {
      result.repeatInterval = repeatInterval;
    }
    return result;
  },
  getRocChineseDateTime(time, isSourceUtcTime = false, tz) {
    console.log(time, 'timeQAQ')
    if (!time) return '';
    let m
    if (isSourceUtcTime) {
      m = moment.utc(time)
      if (tz) m = m.tz(tz)        // ✅ UTC → 指定時區（會換時間）
    } else {
      m = tz ? moment.tz(time, tz) : moment(time) // ✅ 用 tz 解析（不換時間）
    }
    // 確保 weekday 是中文（如果你有載入 zh-tw）
    m = m.locale('zh-tw');
    const rocYear = m.year() - 1911;
    const yearText = `${toChineseYearDigits(rocYear)}年`;
    const month = m.month() + 1;
    const day = m.date();
    const monthText = `${toChineseIntUnder100(month)}月`;
    const dayText = `${toChineseIntUnder100(day)}日`;
    const weekdayText = `（${m.format('dddd')}）`;
    const hour = m.hour();
    const meridiem = hour < 12 ? '上午' : '下午';
    const hour12 = Number(m.format('h'));
    const minute = m.format('mm');
    const timeText = `${meridiem}${hour12}時${minute}分`;
    return `${yearText}${monthText}${dayText}${weekdayText}${timeText}`;
  }
}