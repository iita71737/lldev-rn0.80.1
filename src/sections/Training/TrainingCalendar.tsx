import React from 'react'
import { WsCalendarCombinedWow, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Training from '@/services/api/v1/training'
import { useNavigation } from '@react-navigation/native'


interface TrainingCalendar {
  tabIndex: number;
}

const TrainingCalendar: React.FC = (props) => {
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    tabIndex,
  } = props

  // STATES
  const [filterLoading, setFilterLoading] = React.useState(true)

  // States
  const markedDotsType = [
    {
      type: 'trainDate',
      color: $color.primary
    }
  ]
  const servicesData = [
    {
      time_field: 'train_at',
      dots: 'trainDate',
      service: S_Training,
      serviceIndexKey: 'index',
      bgc: $color.primary11l,
      icon: 'ws-outline-calendar-date',
      nameKey: 'train_at',
      textColor: $color.black,
      format: 'YYYY-MM-DD'
    }
  ]

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: undefined,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [tabIndex])

  return (
    <>
      <WsCalendarCombinedWow
        setFilterLoading={setFilterLoading}
        markedDotsType={markedDotsType}
        servicesData={servicesData}
        onDayPress={() => { }}
        markedDateOnPress={$event => {
          navigation.navigate({
            name: 'TrainingShow',
            params: {
              id: $event.id,
              from: {
                routeName: _stack[0].name,
                routeKey: _stack[0].key,
              },
            }
          })
        }}
      />
    </>
  )
}
export default TrainingCalendar
