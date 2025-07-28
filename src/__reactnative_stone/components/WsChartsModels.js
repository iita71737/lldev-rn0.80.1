import React from 'react'
import { WsCharts } from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'

const WsChartsModels = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    service,
    serviceIndexKey = 'index',
    params,
    label,
    type,
    headerRightIcon,
    headerRightOnPress,
    fields,
    tabItems,
    yAxisTitle,
    startColor,
    endColor,
    onTabChange,
    itemType,
    setValueFromModels,
    timeField,
    countKey,
    style,
    pickerItems,
    pickerItems002,
    pickerValue,
    pickerValue002,
    setPickerValue,
    setPickerValue002,
    placeholder,
    placeholder002,
    pickerLabel001,
    pickerLabel002
  } = props

  // State
  const [models, setModels] = React.useState()
  const [value, setValue] = React.useState([])

  const [startTime, setStartTime] = React.useState(
    t(moment().startOf('year').format('YYYY-MM-DD'))
  )
  const [endTime, setEndTime] = React.useState(
    t(moment(startTime).add(5, 'months').endOf('month').format('YYYY-MM-DD'))
  )
  const [paginationText, setPaginationText] = React.useState()

  // Services
  const $_fetchApi = async () => {
    const _params = {
      start_time: startTime,
      end_time: endTime,
      time_field: timeField,
      get_all: 1,
      ...params
    }
    const res = await service[serviceIndexKey]({
      params: _params
    })
    setModels(res.data)
  }

  // Function
  const $_setValue = () => {
    const _valueWithModel = setValueFromModels(
      models,
      countKey,
      startTime,
      endTime
    )
    setValue(_valueWithModel)
  }

  const $_setPaginationText = () => {
    setPaginationText(
      `${t(moment(startTime).format('YYYY'))} - ${t(moment(startTime).format('M月'))} - ${t(moment(endTime).format('M月'))}`
    )
  }

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      if (startTime) {
        $_setPaginationText()
      }
      return () => {
        // Do something when the screen is unfocused
      }
    }, [])
  )

  React.useEffect(() => {
    $_fetchApi()
  }, [startTime, params])

  React.useEffect(() => {
    if (models && startTime && endTime) {
      $_setValue()
    }
  }, [models, startTime, endTime])

  React.useEffect(() => {
    if (startTime) {
      $_setPaginationText()
    }
  }, [startTime])

  // Render
  return (
    <>
      <WsCharts
        pickerLabel001={pickerLabel001}
        pickerLabel002={pickerLabel002}
        pickerValue={pickerValue}
        pickerValue002={pickerValue002}
        setPickerValue={setPickerValue}
        setPickerValue002={setPickerValue002}
        pickerItems={pickerItems}
        pickerItems002={pickerItems002}
        placeholder={placeholder}
        placeholder002={placeholder002}
        label={label}
        headerRightIcon={headerRightIcon}
        headerRightOnPress={headerRightOnPress}
        itemType={itemType}
        value={value}

        max={125}
        startColor={startColor}
        endColor={endColor}
        min={0}
        tabItems={tabItems}
        yAxisTitle={yAxisTitle}
        divideCount={6}
        type={type}
        fields={fields}
        onTabChange={onTabChange}
        paginationText={paginationText}
        style={style}
        onItemsChange={$event => {
          if ($event == 'prev') {
            setStartTime(
              moment(startTime)
                .startOf('month')
                .subtract(6, 'month')
                .format('YYYY-MM-DD')
            )
            setEndTime(
              moment(endTime)
                .subtract(6, 'month')
                .endOf('month')
                .format('YYYY-MM-DD')
            )
          } else {
            setStartTime(
              moment(startTime)
                .startOf('month')
                .add(6, 'months')
                .format('YYYY-MM-DD')
            )
            setEndTime(
              moment(endTime)
                .add(6, 'months')
                .endOf('month')
                .format('YYYY-MM-DD')
            )
          }
        }}
        startTime={startTime}
        endTime={endTime}
      />
    </>
  )
}

export default WsChartsModels
