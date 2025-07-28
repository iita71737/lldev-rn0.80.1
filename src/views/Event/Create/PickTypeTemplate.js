import React from 'react'
import { WsPaddingContainer, LlTemplatesCard001, WsSkeleton, WsIconBtn } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Event from '@/services/api/v1/event'
import S_EventType from '@/services/api/v1/event_type'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'

const PickTypeTemplate = ({ navigation }) => {

  // REDUX
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // States
  const [loading, setLoading] = React.useState(true)
  const [eventTypes, setEventTypes] = React.useState()

  // Services
  const $_fetchEventType = async () => {
    const _params = {
      order_by: 'sequence',
      order_way: 'asc',
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    }
    const res = await S_EventType.index({
      params: _params
    })
    setEventTypes(res.data)
    setLoading(false)
  }

  // Function
  const $_templateOnPress = async event_type => {
    await AsyncStorage.setItem(
      'EventCreate',
      JSON.stringify({
        event_status: 1,
        event_type: event_type,
        name: event_type.name,
        owner: currentUser
      })
    )
    navigation.push('RoutesEvent', {
      screen: 'EventCreate'
    })
  }

  React.useEffect(() => {
    $_fetchEventType()
  }, [])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <>
          <WsPaddingContainer>
            {eventTypes && (
              <>
                {eventTypes.map((type, typeIndex) => {
                  return (
                    <LlTemplatesCard001
                      testID={`LlTemplatesCard001-${typeIndex}`}
                      key={typeIndex}
                      onPress={() => {
                        $_templateOnPress(type)
                      }}
                      img={type.icon}
                      name={type.name}
                      style={[typeIndex != 0 ? { marginTop: 8 } : null]}
                    />
                  )
                })}
              </>
            )}
          </WsPaddingContainer>
        </>
      )}
    </>
  )
}

export default PickTypeTemplate
