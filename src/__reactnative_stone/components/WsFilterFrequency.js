
import React from 'react'
import { View } from 'react-native'
import { WsFilterButtons, WsState } from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const WsFilterFrequency = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = {},
    items = [
      {
        label: t('每日'),
        frequency: 'day'
      },
      {
        label: t('每週'),
        frequency: 'week'
      },
      {
        label: t('每月'),
        frequency: 'month'
      },
      {
        label: t('每季'),
        frequency: 'season'
      }
    ],
    onChange
  } = props

  // Function
  const $_onChange = $event => {
    onChange({
      frequency: $event
    })
  }
  const $_emitTime = () => {
    const _target = items.find(e => {
      return value.frequency == e.frequency
    })
    if (!_target) {
      return
    }
    onChange({
      ...value
    })
  }

  React.useEffect(() => {
    setTimeout(() => {
      $_emitTime()
    }, 0)
  }, [value.frequency])

  // Render
  return (
    <>
      <WsFilterButtons
        items={items}
        value={value.frequency}
        onChange={$_onChange}
        valueKey="frequency"
      />
    </>
  )
}

export default WsFilterFrequency
