import React from 'react'
import { InteractionManager, View } from 'react-native'
import { WsCalendarAgendaDate, WsGradientButton, WsLoading, WsText } from '@/components'
import { CalendarList } from 'react-native-calendars'
import layouts from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_Calendar from '@/__reactnative_stone/services/wasa/calendar'

const WsCalendarList = props => {
  const { windowWidth, windowHeight, screenHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    horizontal = false,

    dayComponent,
    monthFormat,
    theme,
    hideExtraDays,

    calendarHeight,
    showWeekNumbers = false,
    journeyItems,

    _onVisibleMonthsChange,
    loading
  } = props

  // States
  const [ingHeaderMonth, setIngHeaderMonth] = React.useState(moment())
  const isNotThisMonth = !moment(ingHeaderMonth).isSame(moment(), 'month')

  // Function
  const onVisibleMonthsChange = monthItem => {

    // 切換的月份
    const selectedMonth = moment(monthItem[0].dateString).month();
    // 当前月份
    const currentMonth = moment().month();
    // 比较选定日期的月份与当前月份
    if (selectedMonth !== currentMonth) {
      _onVisibleMonthsChange(monthItem)
    } else {
      _onVisibleMonthsChange(monthItem)
    }

    InteractionManager.runAfterInteractions(() => {
      if (monthItem.length === 1) {
        let date = moment(monthItem[0].dateString)
        setIngHeaderMonth(date)
      }
    })
  }

  const floatTodayButtonOnPress = () => {
    setIngHeaderMonth(moment().format())
  }

  // Render
  return (
    <>

      {loading && (
        <View
          style={{
            top: windowHeight / 3,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999
          }}
        >
          <WsLoading type={'a'}></WsLoading>
        </View>
      )}
      <CalendarList
        monthFormat={'yyyy年M月'}
        horizontal={horizontal}
        pagingEnabled={horizontal ? true : false}
        calendarHeight={calendarHeight}
        firstDay={0}

        onVisibleMonthsChange={onVisibleMonthsChange}
        current={moment(ingHeaderMonth).format('YYYY-MM-DD')}
        dayComponent={dayComponent}
        markedDates={journeyItems}
        theme={theme}
        renderHeader={(date) => {
          const _date = new Date(date);
          return (
            <View
              style={{
                width: windowWidth,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <WsText>{moment(_date).format('YYYY-MM')}</WsText>
            </View>
          )
        }}
      />
      {isNotThisMonth && (
        <View
          style={{
            position: 'absolute',
            bottom: 100,
            left: windowWidth / 2 - 45,
            bottom: 16,
            zIndex: 99,
            width: 108,
            shadowColor: $color.black3l,
            shadowOffset: {
              width: 0,
              height: 4
            },
            shadowRadius: 5,
            shadowOpacity: 1
          }}>
          <WsGradientButton onPress={floatTodayButtonOnPress} style={{ flex: 1 }}>
            {t('今天')}
          </WsGradientButton>
        </View>
      )}

    </>
  )
}
export default WsCalendarList
