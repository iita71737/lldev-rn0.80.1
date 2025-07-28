import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsCenter,
  WsTitle,
  WsInfiniteScroll,
  LlAuditResultCard,
  LlAuditListCard003
} from '@/components'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

const AuditAuditorResult = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation } = props

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)

  // STATES
  const [params] = React.useState({
    auditors: currentUser && currentUser.id ? currentUser.id : null,
    order_by: 'record_at',
    order_way: 'desc'
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_AuditRecord}
        serviceIndexKey="factoryIndex"
        serviceFormatKey="getRecordList"
        params={params}
        renderItem={({ item, index, items }) => {
          const lastItem = index == 0 ? item : items[index - 1]
          return (
            <>
              <LlAuditListCard003
                testID={`LlAuditListCard003-${index}`}
                bottomBtnText={t('查看結果')}
                name={item.title ? item.title : item.name ? item.name : '???'}
                auditors={item.auditors}
                auditees={item.auditees}
                recordAt={moment(item.record_at).format('YYYY-MM-DD HH:mm:ss')}
                iconColor={item.risk}
                num={item.riskScore}
                icon={item.result}
                iconBgc={item.iconBgc}
                onPress={() => {
                  navigation.push('AuditRecordsShow', {
                    id: item.id,
                  })
                }}
                date={moment(item.date).format('YYYY-MM-DD')}
                style={{
                  marginVertical: 8
                }}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default AuditAuditorResult
