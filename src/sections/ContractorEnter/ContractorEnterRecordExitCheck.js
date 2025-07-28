import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, FlatList } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsInfiniteScroll,
  WsIcon,
  WsLoadingDot,
  LlExitChecklistCard001,
  WsSkeleton
} from '@/components'
import i18next from 'i18next'
import S_ExitChecklistAssignment from '@/services/api/v1/exit_checklist_assignment'
import { useSelector } from 'react-redux'

const ContractorEnterRecordExitCheck = props => {

  // Props
  const {
    id,
    navigation,
    factory,
    contractor,
  } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)

  // State
  const params = React.useMemo(() => {
    return {
      contractor_enter_record: id,
      target_factory: factory && factory.id ? factory.id : undefined,
      contractor: contractor && contractor.id ? contractor.id : undefined,
      order_by: 'enter_date',
      order_way: 'desc'
    };
  }, [contractor, factory, id]);


  // helper
  const hasPermission = (permissions, permissionToCheck) => {
    return permissions.includes(permissionToCheck);
  }
  const hasContractorEnterRecordRead = hasPermission(currentUserScope, 'contractor-enter-record-read');

  return (
    <>
      <WsInfiniteScroll
        service={S_ExitChecklistAssignment}
        serviceIndexKey={'index'}
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <LlExitChecklistCard001
              testID={`LlExitChecklistCard001-${index}`}
              key={index}
              item={item}
              btnText={
                hasContractorEnterRecordRead && (item.exit_checklist && item.exit_checklist.id) ?
                  i18next.t('查看結果') :
                  (item.owner && currentUser && item.owner.id === currentUser.id) && moment(item.enter_date).isSame(moment(), 'day') ?
                    i18next.t('開始作業') :
                    ''
              }
              btnColor={
                [$color.primary, $color.primary11l]
              }
              textColor={
                $color.white
              }
              borderColor={
                $color.primary
              }
              style={{ marginBottom: 12 }}
              onPress={() => {
                if (item.exit_checklist && item.exit_checklist.id && hasContractorEnterRecordRead) {
                  navigation.push('RoutesContractorEnter', {
                    screen: 'ExitChecklistShow',
                    params: {
                      id: item.exit_checklist && item.exit_checklist.id ? item.exit_checklist.id : null
                    }
                  })
                } else if (item.owner && currentUser && item.owner.id === currentUser.id) {
                  navigation.navigate('ExitChecklistIntroduction', {
                    enterDate: item.enter_start_date,
                    id: item.id
                  })
                }
              }}
            />
          )
        }}
      />
    </>
  )
}

export default ContractorEnterRecordExitCheck
