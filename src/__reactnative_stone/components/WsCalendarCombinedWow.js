import React from 'react'
import { WsCalendarCombined, WsSkeleton } from '@/components'
import S_Calendar from '@/__reactnative_stone/services/wasa/calendar'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useFocusEffect } from '@react-navigation/native'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'

const WsCalendarCombinedWow = props => {

  // Props
  const {
    servicesData = [],

    markedDateOnPress,
    onDayPress,
    setFilterLoading
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = React.useState(true)

  const [params, setParams] = React.useState(
    {
      start_time: moment().subtract(0, 'months').startOf('month').format('YYYY-MM-DD'),
      end_time: moment().subtract(0, 'months').endOf('month').format('YYYY-MM-DD')
    }
  )
  const [journeyItems, setJourneyItems] = React.useState()

  const [calendarLoading, setCalendarLoading] = React.useState(false)

  // Services
  const $_fetchApi = async (startTime, endTime) => {
    const asyncData = servicesData.map(async (servicesDataItem) => {
      let _params = {
        ...params,
        get_all: 1,
        ...servicesDataItem.params
      }
      if (servicesDataItem.time_field) {
        _params.time_field = servicesDataItem.time_field;
      }
      if (servicesDataItem.time_type) {
        _params.start_extension_date = startTime;
        delete _params.start_time;
        _params.end_extension_date = endTime;
        delete _params.emd_time;
        _params.time_type = servicesDataItem.time_type;
      }
      // FOR DEBUGGING 
      // console.log(servicesDataItem.preText, '-servicesDataItem.preText--');
      // console.log(_params, '-_params-');

      const res = await servicesDataItem.service[servicesDataItem.serviceIndexKey]({
        params: _params
      });
      return res.data;
    });
    let _allData = await Promise.all(asyncData)
    // HELPER 231005 cfc 250204-license
    // if (_allData[1]) {
    //   const _customEnterData = S_ContractorEnterRecord.generateDateRangeData(_allData[1])
    //   _allData[1] = _customEnterData
    // }
    setItems(_allData)
  };

  // Function
  const setItems = (allData) => {
    let _items = {}
    allData.forEach((dataItem, dataItemIndex) => {
      const _item = S_Calendar.getJourneyItems(
        {
          type: servicesData[dataItemIndex].type ? servicesData[dataItemIndex].type : null,
          bgc: servicesData[dataItemIndex].bgc ? servicesData[dataItemIndex].bgc : null,
          icon: servicesData[dataItemIndex].icon ? servicesData[dataItemIndex].icon : null,
          textColor: servicesData[dataItemIndex].textColor ? servicesData[dataItemIndex].textColor : null,
          nameKey: servicesData[dataItemIndex].nameKey ? servicesData[dataItemIndex].nameKey : null,
          format: servicesData[dataItemIndex].format ? servicesData[dataItemIndex].format : null,
          preText: servicesData[dataItemIndex].preText ? servicesData[dataItemIndex].preText : '',
          items: dataItem,
        },
        _items
      )
      _items = {
        ..._items,
        ..._item
      }
    })
    // console.log(JSON.stringify(_items),'_items---'); // debugging
    setJourneyItems(_items)
    setLoading(false)
    setFilterLoading(false)
    setCalendarLoading(false)
  }

  // 條列模式下觸發
  const $_onDayChange = $event => {

  }

  // 切換月份
  const $_onVisibleMonthsChange = (monthItem) => {
    setCalendarLoading(true)
    const _start_time = moment(monthItem[0].dateString).subtract(0, 'months').startOf('month').format('YYYY-MM-DD')
    const _end_time = moment(monthItem[0].dateString).subtract(0, 'months').endOf('month').format('YYYY-MM-DD')
    const _params = {
      ...params,
      start_time: _start_time,
      end_time: _end_time
    }
    setParams(_params)
  }

  React.useEffect(() => {
    if (servicesData) {
      $_fetchApi()
    }
  }, [params, servicesData])

  // Render
  return (
    <>
      {loading ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <WsCalendarCombined

          journeyItems={journeyItems}

          markedDateOnPress={markedDateOnPress}
          onDayChange={$_onDayChange}
          onDayPress={onDayPress}

          _onVisibleMonthsChange={$_onVisibleMonthsChange}
          calendarLoading={calendarLoading}
        />
      )}
    </>
  )
}

export default WsCalendarCombinedWow
