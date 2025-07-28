import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  LlAuditListCard003,
  LlAuditListCard002,
  WsText,
} from '@/components'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

const AuditAssignmentAuditeeRequest = (props) => {
  const { t, i18n } = useTranslation();

  // Props
  const {
    navigation
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory);
  const currentUser = useSelector(state => state.stone_auth.currentUser);

  return (
    <>
      <WsInfiniteScroll
        service={S_AuditRequest}
        parentId={factory.id}
        serviceIndexKey='factoryIndex'
        params={{
          order_by: 'record_at',
          order_way: 'desc',
          auditees: currentUser && currentUser.id ? currentUser.id : null,
          auditee_notify: 1
        }}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <View>
              <LlAuditListCard002
                bottomBtnText={t('查看題目')}
                name={item.name}
                auditees={item.auditees}
                auditors={item.auditors}
                recordAt={moment(item.record_at).format('YYYY-MM-DD')}
                onPress={() => {
                  navigation.navigate({
                    name: 'AuditeeQuestion',
                    params: {
                      requestId: item.id,
                      auditId: item.audit_id
                    }
                  })
                }}
                style={[
                  index > 0 ? {
                    marginTop: 16,
                  } : null
                ]}
              >
              </LlAuditListCard002>
            </View>
          )
        }}
      ></WsInfiniteScroll>
    </>
  )
}

export default AuditAssignmentAuditeeRequest