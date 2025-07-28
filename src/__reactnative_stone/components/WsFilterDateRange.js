
import React from 'react'
import { View } from 'react-native'
import { WsFilterButtons, WsState } from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { number } from 'echarts/core'

const WsFilterDateRange = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = {},
    items = [
      {
        label: t('不限期間'),
        range: 'nolimit',
      },
      {
        label: t('近{number}個月', { number: 1 }),
        range: '1month',
        start_time: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        end_time: moment().format('YYYY-MM-DD')
      },
      {
        label: t('近{number}個月', { number: 3 }),
        range: '3month',
        start_time: moment().subtract(90, 'days').format('YYYY-MM-DD'),
        end_time: moment().format('YYYY-MM-DD')
      },
      {
        label: t('自訂'),
        range: 'custom'
      }
    ],
    onChange
  } = props

  // State
  const [customStartTime, setCustomStartTime] = React.useState(value && value.start_time ? value.start_time : null)
  const [customEndTime, setCustomEndTime] = React.useState(value && value.end_time ? value.end_time : null)

  // Function
  const $_onChange = $event => {
    onChange({
      range: $event
    })
  }
  const $_emitTime = () => {
    if (value.range == 'custom') {
      onChange({
        ...value,
        start_time: customStartTime,
        end_time: customEndTime
      })
    }
  }

  // Computed
  const _maximumDate = value => {
    if (value) {
      return new Date(moment(value).format('YYYY-MM-DD'))
    } else {
      return null
    }
  }
  const _minimumDate = value => {
    if (value) {
      return new Date(moment(value).format('YYYY-MM-DD'))
    } else {
      return null
    }
  }

  React.useEffect(() => {
    $_emitTime()
  }, [value.range])

  // Render
  return (
    <>
      <WsFilterButtons
        items={items}
        value={value.range}
        onChange={$_onChange}
        valueKey="range"
      />
      {value.range == 'custom' && (
        <View
          style={{
            padding: 10
          }}>
          <WsState
            testID={'開始日期'}
            type="date"
            onChange={$event => {
              setCustomStartTime($event)
              onChange({
                ...value,
                range: 'custom',
                start_time: moment($event).format('YYYY-MM-DD')
              })
            }}
            value={customStartTime}
            label={`${t('開始日期')}`}
            maximumDate={_maximumDate(customEndTime)}
          />
          <WsState
            type="date"
            style={{
              marginTop: 10
            }}
            value={customEndTime}
            onChange={$event => {
              setCustomEndTime($event)
              onChange({
                ...value,
                range: 'custom',
                end_time: moment($event).format('YYYY-MM-DD')
              })
            }}
            label={`${t('結束日期')}`}
            minimumDate={_minimumDate(customStartTime)}
          />
        </View>
      )}
    </>
  )
}

export default WsFilterDateRange
