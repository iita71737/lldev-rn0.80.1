import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsIcon,
  WsText,
  WsDes,
  WsCollapsible,
  WsInfiniteScroll,
  WsFilter,
  WsPaddingContainer,
  LlBtn002,
  LlContractorLicenseCard002,
  WsSkeleton,
  LlAuditListCard001,
  WsCard
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_Audit from '@/services/api/v1/audit'
import moment from 'moment'
import S_AuditRecord from '@/services/api/v1/audit_record'

const LlRelatedAuditRecordCard001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    item
  } = props

  const [auditRecord, setAuditRecord] = useState()

  console.log(auditRecord,'auditRecord--');

  // Service
  const $_fetchAuditRecords = async () => {
    const res = await S_AuditRecord.show({
      modelId: item.id
    })
    setAuditRecord(res)
  }

  useEffect(() => {
    $_fetchAuditRecords()
  }, [])

  return (
    <>
      <WsPaddingContainer
        style={{
          paddingTop: 16,
          paddingHorizontal: 16,
        }}
        padding={0}
      >
        <WsText
          style={{
            marginBottom: 4
          }}
        >{t('相關稽核記錄')}</WsText>
        <WsCard
          padding={16}
          style={{
            backgroundColor: $color.white
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.push('RoutesAlert', {
                screen: 'AlertShow',
                params: {
                  id: alert.id,
                },
              })
            }}
          >
            <WsIcon
              style={{
                alignSelf: 'flex-start'
              }}
              name={'ll-nav-audit-filled'}
              color={$color.primary}
              size={24}
            ></WsIcon>
            <WsText size={14}>{`${auditRecord.name}`}</WsText>
            {auditRecord?.record_at && (
              <WsDes
                size={12}
                style={{
                }}
              >
                {t('稽核時間')}{' '}
                {moment(auditRecord?.record_at ? auditRecord?.record_at : null).format('YYYY-MM-DD HH:mm:ss')}
              </WsDes>
            )}
          </TouchableOpacity>
        </WsCard>
      </WsPaddingContainer>
    </>
  )
}

export default LlRelatedAuditRecordCard001