import React, { useState, useEffect } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import {
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsBtn,
  WsCenter,
  WsTitle,
  LlAuditResultCard
} from '@/components'
import ServiceAuditRecord from '@/services/api/v1/audit_record'
import moment from 'moment'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const AuditResult = props => {
  // i18n
  const { t, i18n } = useTranslation()

  //props
  const { id, navigation } = props
  //state
  const [auditRecords, setAuditRecords] = useState([])
  const [listsFormat, setListsFormat] = useState({})
  const [count, setCount] = React.useState()

  //api資料處理
  const $_fetchAuditRecords = async () => {
    const res = await ServiceAuditRecord.index({
      params: {
        order_by: 'record_at',
        order_way: 'asc'
      },
      parentId: id
    })
    setAuditRecords(res.data)
  }

  const $_getRecordList = async () => {
    if (auditRecords.length !== 0) {
      const resList = await ServiceAuditRecord.getRecordList(auditRecords)
      const _dataKeyFormat = await ServiceAuditRecord.getDateKeyFormat(resList)
      setListsFormat(_dataKeyFormat)
      setCount(resList.length)
    }
  }

  useEffect(() => {
    $_fetchAuditRecords()
  }, [])

  useEffect(() => {
    $_getRecordList()
  }, [auditRecords])

  return (
    <WsPaddingContainer
      padding={0}
      style={{
        backgroundColor: gColor.primary11l
      }}>
      <ScrollView>
        {count && (
          <WsText
            size={14}
            letterSpacing={1}
            fontWeight="700"
            style={{
              marginVertical: 8,
              marginLeft: 16
            }}>
            {t('共{number}筆', { number: count })} {t('記錄')}
          </WsText>
        )
        }
        {Object.keys(listsFormat).map(itemKey => {
          const item = listsFormat[itemKey]

          return (
            <View key={itemKey}>
              <WsCenter>
                <WsTitle
                  fontSize={16}
                  style={{
                    marginTop: 8,
                    padding: 8
                  }}>
                  {moment(itemKey).format('YYYY-MM')}
                </WsTitle>
              </WsCenter>
              {item.map((auditRecord, auditRecordIndex) => {
                return (
                  <View key={auditRecord.id}>
                    <LlAuditResultCard
                      auditResultTitle={auditRecord.title}
                      auditors={auditRecord.auditors ? auditRecord.auditors : null}
                      auditees={auditRecord.auditees ? auditRecord.auditees : null}
                      iconColor={auditRecord.risk}
                      num={auditRecord.riskScore}
                      icon={auditRecord.result}
                      iconBgc={auditRecord.iconBgc}
                      onPress={() => {
                        navigation.navigate({
                          name: 'AuditRecordsShow',
                          params: {
                            id: auditRecord.id
                          }
                        })
                      }}
                      date={moment(auditRecord.record_at).format('YYYY-MM-DD')}
                      style={{
                        marginVertical: 8
                      }}
                    />
                  </View>
                )
              })}
            </View>
          )
        })}
      </ScrollView>
    </WsPaddingContainer>
  )
}

export default AuditResult
