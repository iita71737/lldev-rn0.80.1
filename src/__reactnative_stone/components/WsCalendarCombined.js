import React from 'react'
import {
  ScrollView,
  Pressable,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView
} from 'react-native'
import {
  WsCalendarList,
  WsCalendarAgenda,
  WsCalendarListDate,
  WsText,
  WsFlex,
  WsState,
  WsModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_Calendar from '@/__reactnative_stone/services/wasa/calendar'

const WsCalendarCombined = props => {
  //Dimensions
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    journeyItems,
    markedDateOnPress,
    onDayPress,
    onDayChange,

    _onVisibleMonthsChange,
    calendarLoading
  } = props

  // State

  const [ingHeaderMonth, setIngHeaderMonth] = React.useState(moment())
  const [type, setType] = React.useState()
  const [calendarListHeight, setCalendarListHeight] = React.useState(0)
  const agendaTheme = {
    calendarBackground: $color.primary11l,
    todayTextColor: $color.white,
    dayTextColor: $color.primary,
    dotColor: $color.primary,
    textDayHeaderFontSize: 15,
    textDayHeaderFontWeight: '500',
    textSectionTitleColor: $color.gray3d,
    textDayFontSize: 15,
    textDayFontWeight: '700',
    todayBackgroundColor: $color.primary,
    selectedDayBackgroundColor: $color.primary9l,
    selectedDayTextColor: $color.primary,
    'stylesheet.agenda.main': styles.agenda_main,
    'stylesheet.calendar.header': styles.calendar_header,
    'stylesheet.calendar.main': styles.calendar_main,
    'stylesheet.calendar-list.main': styles.calendarList_main,
    'stylesheet.day.basic': styles.day_basic
  }

  React.useEffect(() => {
    setType('list')
  }, [journeyItems])

  // Render
  return (
    <>

      <WsFlex
        justifyContent="flex-end"
        style={{
          marginTop: 16,
          marginRight: 16,
        }}>
        <TouchableOpacity
          onPress={() => {
            if (type == 'agenda') {
              setType('list')
            } else {
              setType('agenda')
            }
          }}>
          <WsText color={$color.primary} size={14}>
            {type === 'agenda' ? t('切換日曆模式') : t('切換條列模式')}
          </WsText>
        </TouchableOpacity>
      </WsFlex>

      {type == 'agenda' && (
        <WsCalendarAgenda
          journeyItems={journeyItems}
          markedDateOnPress={markedDateOnPress}
          onDayChange={onDayChange}
        />
      )}

      {type == 'list' && (
        <View
          onLayout={event => {
            setCalendarListHeight(event.nativeEvent.layout.height)
          }}
          style={{
            flex: 1,
          }}>
          <ScrollView
            style={{
              // borderWidth:1,
            }}
          >
            <WsCalendarList
              loading={calendarLoading}
              _onVisibleMonthsChange={_onVisibleMonthsChange}

              calendarHeight={calendarListHeight}
              theme={agendaTheme}
              horizontal={true}
              current={ingHeaderMonth.format('YYYY-MM-DD')}
              journeyItems={journeyItems}
              dayComponent={({ date, state, marking }) => {
                return (
                  <>
                    <WsCalendarListDate
                      key={date.dateString}
                      calendarListHeight={calendarListHeight}
                      date={date}
                      state={state}
                      marking={marking ? marking : []}
                      onDayPress={$event => {
                        onDayPress($event, journeyItems)
                      }}
                      markedDateOnPress={markedDateOnPress}
                    />
                  </>
                )
              }}
            />
          </ScrollView>
        </View>
      )}
    </>
  )
}

export default WsCalendarCombined

const styles = {
  agenda_main: {
    weekdays:
      Platform.OS === 'ios'
        ? {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginLeft: 0,
          marginRight: 0,
          paddingTop: 15,
          paddingBottom: 7,
          backgroundColor: $color.primary11l
        }
        : {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 15,
          paddingBottom: 7,
          backgroundColor: $color.primary11l
        },
    knobContainer: {
      flex: 1,
      position: 'absolute',
      left: 0,
      right: 0,
      height: 22,
      bottom: 0,
      alignItems: 'center',
      paddingTop: 10,
      backgroundColor: $color.primary11l
    },
    reservations: {
      marginTop: 100
    }
  },
  calendar_header:
    Platform.OS === 'ios'
      ? {
        header: {
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 6,
          // borderWidth:1,
        },
        monthText: {
          margin: 10,
          fontSize: 15,
          lineHeight: 22,
          letterSpacing: 1,
          color: $color.gray2d,
        },
        dayTextAtIndex0: {
          color: 'red'
        },
        dayTextAtIndex6: {
          color: 'blue'
        }
      }
      : {
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingLeft: 10,
          paddingRight: 10,
          marginTop: 6,
          alignItems: 'center'
        },
        monthText: {
          margin: 10,
          fontSize: 15,
          lineHeight: 22,
          letterSpacing: 1,
          color: $color.gray2d
        },
        week: {
          marginTop: 2,
          flexDirection: 'row',
          justifyContent: 'space-around'
        },
        dayTextAtIndex0: {
          color: 'red'
        },
        dayTextAtIndex6: {
          color: 'blue'
        }
      },
  calendar_main: {
    container: {
      paddingLeft: 0,
      paddingRight: 0,
    }
  },
  calendarList_main: {
    calendar: {
      paddingLeft: 0,
      paddingRight: 0,
    }
  },
  day_basic: {
    dot: {
      width: 4,
      height: 4,
      marginTop: 11,
      borderRadius: 2
    },
    visibleDot: {
      opacity: 1,
      backgroundColor: $color.primary2l
    },
    selectedDot: {
      backgroundColor: $color.primary2l
    }
  }
}
