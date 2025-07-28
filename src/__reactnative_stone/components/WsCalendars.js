import React from 'react'
import { Calendar } from 'react-native-calendars'
import $color from '@/__reactnative_stone/global/color'

const WsCalendars = props => {
  // Props
  const { value, onChange, markingType = 'multi-dot', markedDotsData } = props

  // States
  const [markedDate, setMarkedDate] = React.useState()
  const [markedDots, setMarkedDots] = React.useState()
  const markedDotsType = [
    {
      type: 'vacation',
      color: $color.danger,
      selectedDotColor: 'red'
    },
    {
      type: 'massage',
      color: $color.primary,
      selectedDotColor: 'blue'
    }
  ]

  // Function
  const $_setMarkedDates = $event => {
    setMarkedDate({
      ...markedDots,
      [$event.dateString]: {
        selected: true
      }
    })
  }
  const $_setMarkedDots = () => {
    const _dot = {}
    for (let key in markedDotsData) {
      const type = markedDotsType.filter(item => {
        return markedDotsData[key].dots.includes(item.type)
      })
      _dot[key] = { dots: type }
    }
    setMarkedDots(_dot)
    setMarkedDate(_dot)
  }

  React.useEffect(() => {
    $_setMarkedDots()
  }, [])

  // Render
  return (
    <>
      <Calendar
        onDayPress={$event => {
          onChange
          $_setMarkedDates($event)
        }}
        current={value}
        markingType={markingType}
        markedDates={markedDate}
      />
    </>
  )
}

export default WsCalendars
