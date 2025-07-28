import React, { useState, useEffect } from 'react'
import { ScrollView, View, SafeAreaView } from 'react-native'
import {
  WsBtn,
  WsPaddingContainer,
  WsTitle,
  WsInfoUser,
  WsFlex,
  WsIcon,
  WsText,
  WsTabView,
  WsCard,
  WsSkeleton,
  LlAuditSortedResultCard001,
  LlNavButton002,
  LlRelatedAlertCard001,
  LlTaskCard002
} from '@/components'
import moment from 'moment'
import LlAuditResultCard from '@/components/LlAuditResultCard'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const AuditRecordsSort = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { id, navigation, apiAlertId, auditRecord } = props

  // Redux
  const effects = useSelector(state => state.data.effects)

  // State
  const [loading, setLoading] = React.useState(true)
  const [recordAnswers, setRecordAnswers] = useState([])

  // Service
  const $_getSortedRecords = async id => {
    const res = await S_AuditRequest.getSortedResults(id)
    setRecordAnswers(res)
    setLoading(false)
  }

  // Functions
  useEffect(() => {
    $_getSortedRecords(id)
  }, [])

  // Render
  return (
    <>
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          <ScrollView>
            {recordAnswers.map((item, itemIndex) => {
              if (item.ques && item.ques.length > 0)
                return (
                  <View
                    style={{
                      // borderWidth:2,
                    }}
                    key={itemIndex}
                  >
                    <WsFlex
                      style={{
                        padding: 16,
                        // borderWidth:1
                      }}>
                      <WsIcon
                        size={24}
                        name={item.icon}
                        color={item.color}
                        style={{
                          marginRight: 8
                        }}
                      />
                      <WsText
                        size={18}
                        style={{
                          fontWeight: 'bold'
                        }}>
                        {item.title}
                      </WsText>
                    </WsFlex>
                    {item.ques &&
                      item.ques.length > 0 &&
                      item.ques.map((question, questionIndex) => {
                        return (
                          <LlAuditSortedResultCard001
                            backgroundColor={$color.primary11l}
                            key={questionIndex}
                            onPress={() => {
                              navigation.push('RoutesAudit', {
                                screen: 'AuditRecordsAnsShow',
                                params: {
                                  id: question.id,
                                  apiAlertId: apiAlertId
                                }
                              })
                            }}
                            isFocus={question.keypoint == 1 ? true : false}
                            no={question.questionCustomedIndex}
                            title={question.title}
                            id={question.id}
                            score={question.score}
                            style={[
                              questionIndex == 0
                                ? {
                                  marginHorizontal: 16,
                                  borderRadius: 10,
                                  backgroundColor: $color.white,
                                }
                                : {
                                  backgroundColor: $color.white,
                                  borderRadius: 10,
                                  marginHorizontal: 16,
                                  marginTop: 16,
                                }
                            ]}
                          />
                        )
                      })}
                  </View>
                )
            })}
            {auditRecord && auditRecord.alert && (
              <>
                <LlRelatedAlertCard001
                  alert={auditRecord?.alert}
                ></LlRelatedAlertCard001>
              </>
            )}
            {auditRecord && auditRecord.tasks && auditRecord.tasks.length > 0 && (
              <>
                <WsText
                  style={{
                    paddingHorizontal: 16,
                    marginTop: 16
                  }}
                >{t('相關任務')}</WsText>
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <LlTaskCard002
                    item={auditRecord.tasks[0]}
                    onPress={() => {
                      navigation.push('RoutesTask', {
                        screen: 'TaskShow',
                        params: {
                          id: auditRecord.tasks[0].id
                        }
                      })
                    }}
                  />
                </View>
              </>
            )}
            <View
              style={{
                height: 50,
              }}
            >
            </View>
          </ScrollView>
        </>
      )}
    </>
  )
}

export default AuditRecordsSort
