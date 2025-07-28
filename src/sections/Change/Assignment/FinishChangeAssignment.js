
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

const FinishChangeAssignment = () => {
  const navigation = useNavigation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // Function
  const $getFormattedModels = $event => {
    const _models = []
    $event.forEach(assignment => {
      if (
        assignment.change.versions_number ==
        assignment.change_version.version_number
      ) {
        _models.push(assignment)
      }
    })
    return _models
  }

  return (
    <WsInfiniteScroll
      service={S_ChangeAssignment}
      params={{
        evaluator: currentUser && currentUser.id ? currentUser.id : null,
        evaluate_at: 'not_null',
        get_all: 0,
        order_by: 'updated_at',
        order_way: 'desc'
      }}
      padding={16}
      getFormattedModels={$getFormattedModels}
      renderItem={({ item, index }) => {
        return (
          <LlChangeAssignmentCard
            key={index}
            assignment={item}
            btnText={i18next.t('查看評估')}
            style={{ marginBottom: 12 }}
            onPress={
              item.id
                ? () => {
                  navigation.push('ChangeAssignmentResult', {
                    name: item.name,
                    changeVersionId: item.change_version.id,
                    system_subclass: item.system_subclass,
                    changeId: item.change.id,
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

export default FinishChangeAssignment
