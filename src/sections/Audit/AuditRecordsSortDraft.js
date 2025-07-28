import React, { useState, useEffect } from 'react'
import { ScrollView, View, StatusBar, SafeAreaView, FlatList } from 'react-native'
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
  LlAuditSortedResultDraftCard001,
  WsSkeleton,
  WsEmpty
} from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import moment from 'moment'
import S_Audit from '@/services/api/v1/audit'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'
import $color from '@/__reactnative_stone/global/color'

const AuditRecordsSortDraft = props => {

  // Props
  const { answers, questions, auditId, requestId, navigation } = props

  // STATE
  const [isLoading, setIsLoading] = useState(false);

  // HELPER
  const $_validation = (score, remark) => {
    if (score && score == 25) {
      return $color.white
    }
    if (score != 25 && !remark) {
      return $color.danger11l
    }
  }

  const renderSkeleton = () => {
    return (
      <WsSkeleton />
    );
  };

  // Render
  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <>
        <ScrollView
          style={{
          }}
        >
          {isLoading ? (
            renderSkeleton()
          ) : (
            <FlatList
              data={answers}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item, index }) => {
                return (
                  <View
                    style={{
                    }}
                  >
                    <WsFlex
                      style={{
                        marginVertical: 16
                      }}>
                      <WsIcon
                        size={24}
                        name={item.icon}
                        color={item.color}
                        style={{
                          marginLeft: 16,
                          marginRight: 8
                        }}
                      />
                      <WsText
                        size={12}
                        style={{
                          fontWeight: 'bold'
                        }}>
                        {item.title}
                      </WsText>
                    </WsFlex>
                    <FlatList
                      data={item.ques}
                      keyExtractor={(item, index) => item + index}
                      renderItem={({ item: question, index: questionIndex }) => {
                        return (
                          <LlAuditSortedResultDraftCard001
                            item={question}
                            cardColor={$_validation(question.score, question.remark)}
                            onPress={() => {
                              navigation.navigate({
                                name: 'AuditAssignmentProcedure',
                                params: {
                                  requestId: requestId,
                                  auditId: auditId,
                                  selectedIndex: questionIndex,
                                  questionId: question.id,
                                  allQuestions: questions ? questions : [],
                                }
                              })
                            }}
                            isFocus={
                              question.last_version && question.last_version.keypoint && question.last_version.keypoint == 1 ? true : false
                            }
                            no={question.questionCustomedIndex}
                            title={question.title}
                            id={question.id}
                            score={question.score}
                            remark={question.remark}
                            style={[
                              questionIndex != 0
                                ? {
                                  marginTop: 8
                                }
                                : null
                            ]}
                          />
                        )
                      }}
                    />
                  </View>
                )
              }}
            />
          )}

        </ScrollView>
      </>
    </>
  )
}

export default AuditRecordsSortDraft
