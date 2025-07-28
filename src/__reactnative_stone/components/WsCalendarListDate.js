import React from 'react'
import { View, TouchableHighlight, TouchableOpacity } from 'react-native'
import layouts from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import { WsText, WsIcon } from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import 'moment/locale/zh-tw'
moment.updateLocale('zh-tw', {
  weekdays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
})

const WsCalendarListDate = props => {
  const { windowWidth, windowHeight, screenHeight } = layouts
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    state,
    calendarListHeight,
    marking = [],
    date,
    onDayPress,
    markedDateOnPress
  } = props

  const isDisabled = state === 'disabled'
  const isToday = state === 'today'
  const dayText = String(date.day)

  // Function
  const getIconColor = color => {
    switch (color) {
      case 'red':
        return '#dd4e41'
      case 'yellow':
        return '#373737'
      case 'blue':
        return '#0585d3'
    }
  }
  const getIconBackgroundColor = color => {
    switch (color) {
      case 'red':
        return { backgroundColor: '#ffeeec' }
      case 'yellow':
        return { backgroundColor: '#fff7d0' }
      case 'blue':
        return { backgroundColor: '#f2f8fd' }
    }
  }

  // Render
  return (
    <>
      <TouchableOpacity
        key={date.dateString}
        onPress={() => onDayPress(date)}
        style={[
          {
            height: 118,
            alignItems: 'center',
            marginBottom: -12,
            width: (windowWidth - 24) / 7,
            borderRadius: 5,
            backgroundColor: $color.primary10l
          },
          isDisabled ? { backgroundColor: $color.primary9l } : null
        ]}>
        {isToday && (
          <View
            style={{
              position: 'absolute',
              top: 4,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: $color.primary
            }}
          />
        )}
        <WsText
          style={[
            {
              marginTop: 5,
              fontSize: 12,
              lineHeight: 18,
              textAlign: 'center',
              color: $color.gray3d
            },
            isToday ? { color: $color.white } : null
          ]}>
          {dayText}
        </WsText>
        {marking.length > 0 &&
          marking.map((item, index) => {
            if (index < 3) {
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexWrap: 'wrap',
                    overflow: 'hidden',
                    marginTop: 2,
                    width: (windowWidth - 24) / 7 - 6,
                    maxHeight: 20,
                    borderRadius: 5,
                    backgroundColor: item.bgc,
                    // borderWidth:1,
                  }}
                  onPress={() => {
                    markedDateOnPress(item)
                  }}>
                  <WsText
                    style={{
                      fontSize: 10,
                      lineHeight: 18,
                      color: $color.primary
                    }}>
                    {item.text}
                  </WsText>
                </TouchableOpacity>
              )
            } else if (index === 3) {
              return (
                <WsText
                  style={{
                    fontSize: 10
                  }}
                  color={$color.primary}
                >
                  {'+'}
                  {marking.length - index}
                  {t('項')}
                </WsText>
              )
            }
          })}
      </TouchableOpacity>
    </>
  )
}

export default WsCalendarListDate
