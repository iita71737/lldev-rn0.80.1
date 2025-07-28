import React from 'react'
import { View, Dimensions, ScrollView } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlChangeAssignmentCard
} from '@/components'
import ChangeCreateStep from '@/sections/Change/Create/CreateStep'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'

const MyChangeAssignment = () => {
  const navigation = useNavigation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // STATES
  const [params, setParams] = React.useState({
    evaluator: currentUser && currentUser.id ? currentUser.id : null,
    evaluate_at: 'null',
    is_active: 1,
    get_all: 0,
    order_by: 'expired_date',
    order_way: 'desc'
  })
  return (
    <WsInfiniteScroll
      service={S_ChangeAssignment}
      params={params}
      padding={16}
      renderItem={({ item, index }) => {
        return (
          <LlChangeAssignmentCard
            key={index}
            assignment={item}
            btnText={i18next.t('開始評估')}
            style={{ marginBottom: 12 }}
            onPress={
              item.id
                ? () => {
                  navigation.push('RoutesChange', {
                    screen: 'ChangeAssignmentIntroduction',
                    params: {
                      id: item.change.id,
                      changeAssignmentId: item.id
                    }
                  })
                }
                : null
            }
          />
        )
      }}
    />
  )
}

export default MyChangeAssignment
