import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlAuditListCard002,
  LlContractorEnterExitCheckRecordCard001
} from '@/components'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

import S_ExitChecklist from '@/services/api/v1/exit_checklist'


const ExitCheckRecord = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // STATE
  const [params, setParams] = useState({
    owner: currentUser && currentUser.id ? currentUser.id : null,
    start_time: moment().subtract(1, 'month').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
    order_by: 'enter_date',
    order_way: 'desc',
    time_field: 'enter_date'
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_ExitChecklist}
        serviceIndexKey={'indexV2'}
        params={params}
        getAll={true}
        hasMeta={false}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <LlContractorEnterExitCheckRecordCard001
              testID={item.task_content}
              style={[index != 0 ? { marginTop: 16 } : null]}
              item={item}
              onPress={() => {
                navigation.push('ExitChecklistShow', {
                  id: item.id
                })
              }}
            />
          )
        }}
      />
    </>
  )
}

export default ExitCheckRecord
