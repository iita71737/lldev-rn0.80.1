import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlAuditListCard002,
  LlContractorEnterRecordCard001
} from '@/components'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import S_ExitChecklistAssignment from '@/services/api/v1/exit_checklist_assignment'

const TodayEnterExitAssignment = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  const [params, setParams] = useState({
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
    time_field: 'enter_date',
    order_by: 'enter_date',
    order_way: 'desc',
    factory: factory && factory.id
  })


  return (
    <>
      <WsInfiniteScroll
        service={S_ExitChecklistAssignment}
        serviceIndexKey={'authIndex'}
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <LlContractorEnterRecordCard001
              testID={item.exit_checklist && item.exit_checklist.id ? t('查看結果') : t('開始作業')}
              style={[index != 0 ? { marginTop: 16 } : null]}
              item={item}
              isTodayEnter={true}
              btnText={item.exit_checklist && item.exit_checklist.id ? t('查看結果') : t('開始作業')}
              btnColor={!item.exit_checklists || item.exit_checklists.length == 0 ? [$color.primary5l, $color.primary] : [$color.white, $color.white]}
              textColor={!item.exit_checklists || item.exit_checklists.length == 0 ? $color.white : $color.primary}
              borderColor={!item.exit_checklists || item.exit_checklists.length == 0 ? $color.white : $color.primary}
              onPress={() => {
                item.exit_checklist && item.exit_checklist.id ?
                  navigation.push('RoutesContractorEnter', {
                    screen: 'ExitChecklistShow',
                    params: {
                      id: item.exit_checklist.id
                    }
                  })
                  :
                  navigation.push('RoutesContractorEnter', {
                    screen: 'ExitChecklistIntroduction',
                    params: {
                      enterDate: item.enter_date,
                      id: item.id
                    }
                  })
              }}
            />
          )
        }}
      />
    </>
  )
}

export default TodayEnterExitAssignment
