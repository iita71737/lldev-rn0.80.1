
import React from 'react'
import { View } from 'react-native'
import { WsFilterButtons, WsState } from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'

const WsFilterPicker = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = {},
    placeholder = i18next.t('排序方式'),
    title = i18next.t('排序方式'),
    items = [
      {
        label: i18next.t('依建立日期由近至遠'),
        value: {
          order_way: 'desc',
          order_by: 'created_at'
        }
      },
      {
        label: i18next.t('依期限由舊至新'),
        value: {
          order_way: 'asc',
          order_by: 'expired_at'
        }
      },
      {
        label: i18next.t('依完成度由低至高'),
        value: {
          order_way: 'desc',
          order_by: 'completion_degree'
        }
      }
    ],
    onChange,
    testID
  } = props

  // Render
  return (
    <>
      <WsState
        testID={testID}
        borderRadius={10}
        borderWidth={0.5}
        style={{
          flex: 1,
          borderColor: $color.gray,
          marginHorizontal: 16
        }}
        placeholder={placeholder}
        type="picker"
        items={items}
        value={value}
        onChange={onChange}
      />
    </>
  )
}

export default WsFilterPicker
