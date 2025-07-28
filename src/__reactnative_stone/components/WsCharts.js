import React from 'react'
import { View, Dimensions } from 'react-native'
import {
  WsText,
  WsFlex,
  WsBtnChart,
  WsCard,
  WsTabView,
  WsIconBtn,
  WsChartItem,
  WsChartStackedBarChart,
  WsChartBarChart,
  WsState
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Color from '@/__reactnative_stone/services/app/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const WsCharts = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    label,
    type,
    headerRightIcon,
    headerRightOnPress,
    value,
    items,
    fields,
    paginationText,
    tabItems,
    onTabChange,
    onItemsChange,
    startColor = $color.primary,
    endColor = $color.primary11l,
    paginationBtnColor = $color.gray,
    count,
    max,
    min,
    yAxisTitle,
    dividCount = 5,
    itemType,
    currentDate = moment(),
    style,
    pickerItems,
    pickerValue,
    setPickerValue,
    setPickerValue002,
    placeholder,
    startTime,
    endTime,
    pickerItems002,
    placeholder002,
    pickerValue002,
    pickerLabel001,
    pickerLabel002
  } = props

  // State
  const [C_paginationText, C_SetPaginationText] = React.useState()
  const [C_items, C_SetItems] = React.useState()
  const [C_count, C_SetCount] = React.useState([])
  const [C_fields, C_SetFields] = React.useState({})
  const [C_value, C_SetValue] = React.useState([])
  const [C_TabItems, C_SetTabItems] = React.useState()
  const [tabIndex, settabIndex] = React.useState(0)

  // Function
  const $_setPaginationText = () => {
    C_SetPaginationText(paginationText)
  }

  const $_setItems = () => {
    if (items) {
      C_SetItems(items)
    } else if (itemType == 'date-month') {
    } else if (itemType == 'date-half-year') {
      const _items = []
      for (let i = 0; i < 6; i++) {
        _items.push(
          t(moment(startTime).startOf('month').add(i, 'months').format('M月'))
        )
      }
      C_SetItems(_items)
    }
  }
  const $_setCount = () => {
    const _count = []
    if (count) {
      C_SetCount(count)
    } else if (dividCount && max && min) {
      for (i = 1; i < dividCount; i++) {
        _count.push(Math.round(((max + min) / dividCount) * i))
      }
      C_SetCount(_count)
    } else {
      // Function for value to produce count
      value.forEach((item, index) => { })
    }
  }
  const $_setFields = () => {
    const _fields = {}
    const _length = Object.keys(fields).length
    const _colors =
      _length > 0 ? S_Color.getColors(_length, startColor, endColor) : []
    let i = 0
    for (let key in fields) {
      if (fields[key].color) {
        _fields[key] = fields[key]
      } else {
        _fields[key] = {
          ...fields[key],
          color: _colors[i]
        }
        i++
      }
    }
    C_SetFields(_fields)
  }
  const $_checkValue = () => {
    let hasData = false
    value.forEach(datas => {
      for (let dataKey in datas) {
        const _data = datas[dataKey]
        if (_data != 0) {
          hasData = true
        }
      }
    })
    if (hasData) {
      C_SetValue(value)
    } else {
      C_SetValue([])
    }
  }
  const $_setTabItems = () => {
    const _tabItems = tabItems.map(tabItem => {
      return {
        ...tabItem,
        view: () => {
          return <></>
        }
      }
    })
    C_SetTabItems(_tabItems)
  }

  React.useEffect(() => {
    $_setCount()
  }, [])

  React.useEffect(() => {
    $_setPaginationText()
    $_setItems()
  }, [])

  React.useEffect(() => {
    if (startTime) {
      $_setItems()
    }
  }, [startTime])

  React.useEffect(() => {
    if (paginationText) {
      $_setPaginationText()
    }
  }, [paginationText])

  React.useEffect(() => {
    if (fields) {
      $_setFields()
    }
  }, [fields])

  React.useEffect(() => {
    if (value) {
      $_checkValue()
    }
  }, [value])

  React.useEffect(() => {
    if (tabItems) {
      $_setTabItems()
    }
  }, [tabItems])

  // Render
  return (
    <>
      {value && value.length > 0 && (
        <WsCard style={[style]} borderRadius={16}>
          <View
            style={{
              position: 'relative'
            }}>
            <WsFlex
              style={{
                marginBottom: 8
              }}>
              {label && (
                <WsFlex
                  style={{
                    flex: 1
                  }}
                  justifyContent="center">
                  <WsText
                    testID={label}
                    fontWeight="700"
                    size={18}
                  >
                    {label}
                  </WsText>
                </WsFlex>
              )}
            </WsFlex>
            {headerRightIcon && (
              <WsBtnChart
                testID={`${label}-WsBtnChart`}
                style={{
                  overflow: 'hidden',
                  top: -20,
                  right: -20,
                  zIndex: 1,
                  bottom: 'auto',
                  borderRadius: 0,
                  borderTopRightRadius: 16,
                  borderBottomLeftRadius: 16,
                  shadowColor: 'transparent'
                }}
                size={40}
                icon={headerRightIcon}
                onPress={headerRightOnPress}
              />
            )}
            <View
              style={{
                zIndex: 0
              }}>
              {tabItems && (
                <>
                  <WsTabView
                    textSize={14}
                    index={tabIndex}
                    fixedTabWidth={(width * 0.85) / 2}
                    fixedContainerHeight={60}
                    scrollEnabled={tabItems.length <= 2 ? false : true}
                    isAutoWidth={tabItems.length > 2 ? false : true}
                    setIndex={$event => {
                      settabIndex($event)
                      onTabChange($event)
                    }}
                    items={C_TabItems}
                  />
                </>
              )}
              {pickerItems002 && (
                <WsState
                  label={t(pickerLabel002)}
                  testID={'WsCharts-picker002'}
                  style={{
                    marginTop: 16
                  }}
                  borderRadius={10}
                  borderWidth={0.3}
                  placeholder={placeholder002}
                  type="picker"
                  value={pickerValue002}
                  onChange={$event => {
                    setPickerValue002($event)
                  }}
                  items={pickerItems002}
                />
              )}
              {pickerItems && (
                <WsState
                  label={t(pickerLabel001)}
                  testID={'WsCharts-picker'}
                  style={{
                    marginTop: 16
                  }}
                  borderRadius={10}
                  borderWidth={0.3}
                  placeholder={placeholder}
                  type="picker"
                  value={pickerValue}
                  onChange={$event => {
                    setPickerValue($event)
                  }}
                  items={pickerItems}
                />
              )}
              {type == 'stacked-bar-chart' && (
                <>
                  <WsChartStackedBarChart
                    value={C_value}
                    items={C_items}
                    count={C_count}
                    fields={C_fields}
                    yAxisTitle={yAxisTitle}
                  />
                </>
              )}
            </View>
            <WsFlex justifyContent="space-around">
              <WsIconBtn
                testID={'md-chevron-left'}
                name="md-chevron-left"
                color={paginationBtnColor}
                size={28}
                onPress={() => {
                  onItemsChange('prev')
                }}
              />
              <WsText size={14} letterSpacing={1}>
                {C_paginationText}
              </WsText>
              <WsIconBtn
                testID={'md-chevron-right'}
                name="md-chevron-right"
                color={paginationBtnColor}
                size={28}
                onPress={() => {
                  onItemsChange('next')
                }}
              />
            </WsFlex>
          </View>
        </WsCard>
      )}
    </>
  )
}

export default WsCharts
