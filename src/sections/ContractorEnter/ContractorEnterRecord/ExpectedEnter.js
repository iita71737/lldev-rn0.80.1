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

const ExpectedEnter = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // STATE
  const [params, setParams] = useState({
    factory: currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory && currentFactory.id ? currentFactory.id : undefined,
    target_factory: currentViewMode === 'organization' && currentOrganization ? currentOrganization.id : currentFactory && currentFactory.id ? currentFactory.id : undefined,
    owner: currentUser.id,
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().add(1, 'month').format('YYYY-MM-DD'),
    order_by: 'enter_end_date',
    order_way: 'asc',
    time_field: 'enter_end_date'
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_ContractorEnterRecord}
        serviceIndexKey={'indexV2'}
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <LlContractorEnterRecordCard001
              style={[index != 0 ? { marginTop: 16 } : null]}
              item={item}
              isTodayEnter={false}
              btnText={t('查看')}
              btnColor={[$color.white, $color.white]}
              textColor={$color.primary}
              borderColor={$color.primary}
              onPress={() => {
                navigation.navigate({
                  name: 'ContractorEnterShow',
                  params: {
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

export default ExpectedEnter
