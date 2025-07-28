
import React from 'react'
import { View } from 'react-native'
import {
  WsFilterButtons,
  WsState
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

interface WsFilterDateRange002Props {
  value?: {
    range: string;
    start_date?: string | null;
    end_date?: string | null;
  };
  items?: {
    label: string;
    range: string;
    start_date?: string;
    end_date?: string;
  }[];
  onChange: (value: {
    range: string;
    start_date?: string | null;
    end_date?: string | null;
  }) => void;
}

const WsFilterDateRange002: React.FC<WsFilterDateRange002Props> = props => {
  // i18n
  const { t } = useTranslation()

  // Props
  const {
    value = {},
    items = [
      {
        label: t('近一年'),
        range: 'nolimit',
      },
      {
        label: t('近一個月'),
        range: '1month',
        start_date: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD')
      },
      {
        label: t('近三個月'),
        range: '3month',
        start_date: moment().subtract(90, 'days').format('YYYY-MM-DD'),
        end_date: moment().format('YYYY-MM-DD')
      },
      {
        label: t('自訂'),
        range: 'custom'
      }
    ],
    onChange
  } = props

  // State
  const [customStartTime, setCustomStartTime] = React.useState(
    value && value.start_date ? value.start_date : moment().subtract(3, 'months').format('YYYY-MM-DD')
  );
  const [customEndTime, setCustomEndTime] = React.useState(
    value && value.end_date ? value.end_date : moment().format('YYYY-MM-DD')
  );

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
        start_date: customStartTime,
        end_date: customEndTime
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
            type="date"
            onChange={$event => {
              setCustomStartTime($event)
              onChange({
                ...value,
                range: 'custom',
                start_date: moment($event).format('YYYY-MM-DD')
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
                end_date: moment($event).format('YYYY-MM-DD')
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

export default WsFilterDateRange002
