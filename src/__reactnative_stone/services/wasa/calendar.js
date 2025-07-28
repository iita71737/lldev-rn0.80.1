import moment from 'moment'

export default {
  getJourneyItems(resData, journeyItems) {
    const nameKey = resData.nameKey
    const _journeyItems = { ...journeyItems }

    if (resData && resData.items) {
      resData.items.forEach(item => {

        // for debugging
        // console.log(nameKey, 'nameKey--');
        // console.log(JSON.stringify(item), 'item');

        let key = resData.format
          ? moment(item[nameKey]).format(resData.format) // 辦法展延issue
          : item[nameKey]
            ? item[nameKey]
            : item.last_version[nameKey]

        // for debugging
        // console.log(nameKey, 'nameKey-');
        // console.log(key, 'key----');
        // console.log(JSON.stringify(resData), 'resData-----');

        // 250528-續辦提醒
        let _payload
        const remindDate = item?.last_version?.remind_date
        const endDate = item?.last_version?.valid_end_date
        const extensionDate = item?.statitory_extension_date

        if (remindDate == key) {
          _payload = resData.items.filter(item => item?.last_version?.remind_date === key)
        }
        // 250528-辦法展延
        const momentKey = moment(key)
        if (extensionDate && momentKey.isValid()) {
          _payload = resData.items.filter(item => item?.statitory_extension_date)
        }
        // 250528-期限到期
        if (endDate == key) {
          _payload = resData.items.filter(item => item?.last_version?.valid_end_date === key)
        }

        const isValidYYYYMMDD = moment(key, "YYYY-MM-DD", true).isValid();
        const isValidISO8601 = moment(key, moment.ISO_8601, true).isValid();
        if (isValidYYYYMMDD) {
          // console.log("Key 是 YYYY-MM-DD 格式");
        } else if (isValidISO8601) {
          // 回訓issue
          key = moment.utc(key).local().format("YYYY-MM-DD")
          // console.log("Key 是 ISO 8601 格式");
        } else {
          // console.log("Key 不是標準日期格式");
        }

        // for debugging
        // console.log(nameKey, 'nameKey--');
        // console.log(key, 'key--');

        if (!key) {
          return
        }
        if (_journeyItems[key]) {
          if (resData.type == 'enter_record') {
            _journeyItems[key].push({
              type: resData.type,
              icon: resData.icon,
              bgc: resData.bgc,
              text: `${resData.preText}${item.contractor.name}`,
              id: item.id,
              textColor: resData.textColor,
              preText: resData.preText,
            })
          }
          else {
            _journeyItems[key].push({
              type: resData.type,
              icon: resData.icon,
              bgc: resData.bgc,
              text: `${resData.preText}${item.name}`,
              id: item.id,
              textColor: resData.textColor,
              preText: resData.preText,
              payload: _payload
            })
          }
        } else {
          if (resData.type == 'enter_record') {
            _journeyItems[key] = [
              {
                type: resData.type,
                icon: resData.icon,
                bgc: resData.bgc,
                id: item.id,
                text: `${resData.preText}${item.contractor.name}`,
                textColor: resData.textColor,
                preText: resData.preText,
              }
            ]
          } else {
            _journeyItems[key] = [
              {
                type: resData.type,
                icon: resData.icon,
                bgc: resData.bgc,
                id: item.id,
                text: ` ${resData.preText}${item.name}`,
                textColor: resData.textColor,
                preText: resData.preText,
                payload: _payload
              }
            ]
          }
        }
      })
      return _journeyItems
    }
  },
  getmarkedDotsData(resData, markedDots) {
    const nameKey = resData.nameKey
    const _markedDots = { ...markedDots }
    if (resData && resData.items) {
      resData.items.forEach(item => {
        const key = resData.format
          ? moment(item[nameKey]).format(resData.format)
          : item[nameKey]
            ? item[nameKey]
            : item.last_version[nameKey]
        if (!key) {
          return
        }
        if (_markedDots[key]) {
          _markedDots[key].dots.push(resData.dots)
          _markedDots[key].num++
        } else {
          _markedDots[key] = {
            dots: [resData.dots],
            num: 1
          }
        }
      })
      return _markedDots
    }

  },
  getFormattedMarkedDates(markedDotsData, markedDotsType, journeyItems) {
    const _journeyItems = { ...journeyItems }
    const _dot = {}
    for (let key in markedDotsData) {
      const _item = markedDotsType.filter(item => {
        return markedDotsData[key].dots.includes(item.type)
      })
      const myNewArray = _item.concat.apply([], _journeyItems[key])
      _dot[key] = myNewArray
    }
    return _dot
  }
}
