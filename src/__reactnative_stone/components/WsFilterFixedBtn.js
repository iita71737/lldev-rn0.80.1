import React from 'react'
import { WsIconBtn, WsFilter } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
const WsFilterFixedBtn = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    underlayColor = $color.primary,
    underlayColorPressIn = $color.primary2d,
    fields,
    value,
    onChange,
    defaultFilter
  } = props

  // State
  const [filterVisible, setFilterVisible] = React.useState(false)

  // Render
  return (
    <>
      <WsIconBtn
        name="ws-outline-filter-outline"
        underlayColor={underlayColor}
        underlayColorPressIn={underlayColorPressIn}
        color={$color.white}
        size={24}
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10
        }}
        onPress={() => {
          setFilterVisible(true)
        }}
      />
      <WsFilter
        visible={filterVisible}
        onClose={() => {
          setFilterVisible(false)
        }}
        title={t('篩選條件')}
        fields={fields}
        currentValue={value}
        onSubmit={$event => {
          setFilterVisible(false)
          onChange($event)
        }}
        defaultFilter={defaultFilter}
      />
    </>
  )
}

export default WsFilterFixedBtn
