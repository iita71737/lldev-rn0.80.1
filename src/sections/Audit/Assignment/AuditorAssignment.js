import React, { useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlAuditListCard002
} from '@/components'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

const AuditAssignmentRequest = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation, currentUser } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)

  const [params, setParams] = useState({
    auditors: currentUser && currentUser.id,
    order_by: 'record_at',
    order_way: 'desc'
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_AuditRequest}
        parentId={factory.id}
        serviceIndexKey="factoryIndex"
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <View>
              <LlAuditListCard002
                testID={`LlAuditListCard002-${index}`}
                recordDraft={item.record_draft}
                bottomBtnText={
                  item.record_draft ? t('繼續稽核') : t('開始稽核')
                }
                name={item.name}
                auditees={item.auditees}
                auditors={item.auditors}
                recordAt={moment(item.record_at).format('YYYY-MM-DD')}
                onPress={() => {
                  navigation.navigate({
                    name: 'AuditAssignmentIntroduction',
                    params: {
                      requestId: item.id,
                      auditId: item.audit_id
                    }
                  })
                }}
                style={[index != 0 ? { marginTop: 16 } : null]}
              />
            </View>
          )
        }}
      />
    </>
  )
}

export default AuditAssignmentRequest
