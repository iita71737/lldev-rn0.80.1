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
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

const AuditAuditeeResult = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { navigation } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  return (
    <>
      <WsInfiniteScroll
        service={S_AuditRecord}
        serviceIndexKey="factoryIndex"
        serviceFormatKey="getRecordList"
        params={{
          auditees: currentUser && currentUser.id ? currentUser.id : null,
          order_by: 'record_at',
          order_way: 'desc'
        }}
        renderItem={({ item, index, items }) => {
          const lastItem = index == 0 ? item : items[index - 1]
          return (
            <>
              {/* {(index == 0 || item.monthTitle != lastItem.monthTitle) && (
                <WsCenter>
                  <WsTitle
                    fontSize={16}
                    style={{
                      marginTop: 8,
                      padding: 8
                    }}>
                    {moment(item.date).format('YYYY年MM月')}
                  </WsTitle>
                </WsCenter>
              )} */}
              <LlAuditListCard003
                bottomBtnText={
                  item.review_remark ? t('修改回覆') : t('回覆結果')
                }
                name={item.title ? item.title : item.name ? item.name : ''}
                auditors={item.auditors}
                auditees={item.auditees}
                recordAt={moment(item.record_at).format('YYYY-MM-DD HH:mm:ss')}
                iconColor={item.risk}
                num={item.riskScore}
                icon={item.result}
                iconBgc={item.iconBgc}
                onPress={() => {
                  navigation.navigate({
                    name: 'AuditRecordsShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
                date={moment(item.date).format('YYYY-MM-DD')}
                style={{
                  marginVertical: 8
                }}
                reviewRemark={item.review_remark}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default AuditAuditeeResult
