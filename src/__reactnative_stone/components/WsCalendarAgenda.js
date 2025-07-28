import React from 'react'
import { InteractionManager, View } from 'react-native'
import { Calendar, CalendarList, Agenda } from 'react-native-calendars'
import layouts from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import {
  WsCalendarAgendaDate,
  WsGradientButton,
  WsLoading,
  WsText,
  WsIcon
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_Calendar from '@/__reactnative_stone/services/wasa/calendar'

const WsCalendarAgenda = props => {
  const { windowWidth, windowHeight, screenHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    journeyItems,
    markedDateOnPress,
    onDayChange
  } = props

  // States
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const [knobVisible, setKnobVisible] = React.useState()
  const [ingHeaderMonth, setIngHeaderMonth] = React.useState(
    moment().format('YYYY-MM-DD')
  )
  const isNotThisMonth = !moment(ingHeaderMonth).isSame(moment(), 'month')
  const [isCalendarListLoading, setIsCalendarListLoading] =
    React.useState(false)

  const [items, setItems] = React.useState({})

  const loadItemsForMonth = day => {
    for (let i = -15; i < 85; i++) {
      const time = day.timestamp + i * 24 * 60 * 60 * 1000
      const strTime = timeToString(time)
      if (!items[strTime]) {
        items[strTime] = []
      }
    }
    const newItems = {}
    Object.keys(items).forEach(key => {
      newItems[key] = items[key]
    })

    setIsCalendarListLoading(false)
    setItems({
      ...newItems,
      ...journeyItems
    })
  }
  const timeToString = time => {
    const date = moment(time)
    return date.toISOString().split('T')[0]
  }

  const floatTodayButtonOnPress = () => {
    setIsCalendarListLoading(true)
    setIngHeaderMonth(moment())
  }

  const onVisibleMonthsChange = monthItem => {
    InteractionManager.runAfterInteractions(() => {
      if (monthItem.length === 1) {
        let date = moment(monthItem[0].dateString)
        setIngHeaderMonth(date)
        setTimeout(() => {
          setIsCalendarListLoading(false)
        }, 500)
      }
    })
  }

  const $_onRefresh = () => {
  }

  // Render
  return (
    <>
      {isCalendarListLoading && (
        <>
          <WsLoading />
        </>
      )}
      {!isCalendarListLoading && isNotThisMonth && (
        <View
          style={{
            position: 'absolute',
            bottom: 15,
            left: windowWidth / 2 - 45,
            zIndex: 2,
            width: 90,
            shadowColor: $color.black3l,
            shadowOffset: {
              width: 0,
              height: 4
            },
            shadowRadius: 5,
            shadowOpacity: 1
          }}>
          <WsGradientButton onPress={floatTodayButtonOnPress}>
            {t('今天')}
          </WsGradientButton>
        </View>
      )}
      <Agenda
        items={items}
        // items={{
        //   '2023-10-10': [{ text: 'item 1 - any js object' }],
        //   '2023-10-11': [{ text: 'item 2 - any js object', height: 80 }],
        //   '2023-10-12': [],
        //   '2023-10-13': [{ text: 'item 3 - any js object' }, { text: 'any js object' }]
        // }}
        loadItemsForMonth={month => {
          loadItemsForMonth(month)
        }}
        onCalendarToggled={calendarOpened => {
          setKnobVisible(calendarOpened)
        }}
        onDayPress={day => {
          onDayChange(day.dateString)
          setIngHeaderMonth(moment(day.dateString).format('YYYY-MM-DD'))
        }}
        onDayChange={day => {
          onDayChange(day.dateString)
          setIngHeaderMonth(moment(day.dateString).format('YYYY-MM-DD'))
        }}
        selected={moment(ingHeaderMonth).format('YYYY-MM-DD')}
        minDate={moment().subtract(3, 'months').format('YYYY-MM-DD')}
        maxDate={moment().add(1, 'y').format('YYYY-MM-DD')}
        renderItem={(item, firstItemInDay) => {
        }}
        renderDay={(day, item) => {
          const _date = new Date(day)
          const _indexDate = moment(_date).format('YYYY-MM-DD')
          const _list = items[_indexDate]
          return (
            <>
              <WsCalendarAgendaDate
                date={day}
                marking={_list}
                markedDateOnPress={markedDateOnPress}
              />
            </>
          )
        }}
        renderEmptyDate={() => { }}
        renderKnob={() => (
          <View
            style={{
              marginTop: 8,
              width: 36,
              height: 40,
              borderRadius: 2,
            }}>
            {!knobVisible ? (
              <WsIcon name="md-arrow-downward" />
            ) : (
              <WsIcon name="md-arrow-upward" />
            )}
          </View>
        )}
        rowHasChanged={(r1, r2) => {
          return r1.text !== r2.text
        }}
        showClosingKnob={true}
        onRefresh={$_onRefresh}
        refreshing={isRefreshing}
        markedDates={journeyItems}
        onVisibleMonthsChange={months => onVisibleMonthsChange}
        pastScrollRange={50}
        futureScrollRange={50}
        theme={{
          agendaDayTextColor: $color.gray3d,
          agendaDayNumColor: $color.gray3d,
          agendaTodayColor: $color.primary,
          agendaKnobColor: $color.primary,
          selectedDayBackgroundColor: $color.primary10l,
          dayTextColor: $color.primary,
          selectedDayTextColor: $color.primary,
          backgroundColor: $color.primary11l,
          calendarBackground: $color.primary11l,
          textDayHeaderFontSize: 15,
          textDayFontSize: 15
        }}
      />
    </>
  )
}
export default WsCalendarAgenda
