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
  WsSkeleton,
  WsLoading,
  LlAuditSortedResultDraftCard001,
} from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import moment from 'moment'
import S_Audit from '@/services/api/v1/audit'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'
import $color from '@/__reactnative_stone/global/color'

const AuditChaptersSortDraft = props => {

  // Props
  const { requestId, auditId, navigation, answers, questions } = props

  // STATE
  const [isLoading, setIsLoading] = useState(false);

  const renderSkeleton = () => {
    return (
      <WsSkeleton />
    );
  };

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      {isLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={answers}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item: recordAnswer, index: recordAnswerIndex }) => {
            return (
              <View key={recordAnswerIndex}>
                {recordAnswer.sectionList &&
                  recordAnswer.sectionList[0] &&
                  recordAnswer.sectionList[0].questionList &&
                  recordAnswer.sectionList[0].questionList.length > 0 && (
                    <WsText
                      size={18}
                      style={{
                        fontWeight: 'bold',
                        marginTop: 16,
                        marginLeft: 16
                      }}>
                      {recordAnswer.chapterCustomedIndex}
                      {recordAnswer.title
                        ? recordAnswer.title
                        : recordAnswer.chapterTitle
                          ? recordAnswer.chapterTitle
                          : ''}
                    </WsText>
                  )}
                <FlatList
                  data={recordAnswer.sectionList}
                  keyExtractor={(item, index) => index}
                  renderItem={({ item: section, index: sectionIndex }) => {
                    return (
                      <View key={sectionIndex}>
                        {section.questionList.length > 0 && (
                          <WsText
                            size={14}
                            style={{
                              fontWeight: 'bold',
                              marginVertical: 8,
                              marginLeft: 16
                            }}>
                            {section.sectionCustomedIndex}
                            {section.title
                              ? section.title
                              : section.sectionTitle
                                ? section.sectionTitle
                                : ''}
                          </WsText>
                        )}
                        <FlatList
                          data={section.questionList}
                          keyExtractor={(item, index) => index}
                          renderItem={({ item: question, index: questionIndex }) => {
                            return (
                              <LlAuditSortedResultDraftCard001
                                testID={`LlAuditSortedResultDraftCard001-${questionIndex}`}
                                key={questionIndex}
                                item={question}
                                onPress={() => {
                                  navigation.navigate({
                                    name: 'AuditAssignmentProcedure',
                                    params: {
                                      requestId: requestId,
                                      auditId: auditId,
                                      questionId: question.id,
                                      allQuestions: questions,
                                    }
                                  })
                                }}
                                isFocus={
                                  question.keypoint == 1 ? true : false
                                }
                                no={question.questionCustomedIndex}
                                title={question.title}
                                id={question.id}
                                remark={question.remark}
                                score={question.score}
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
              </View>
            )
          }}
          ListFooterComponent={
            <>
              {
                !answers || answers.length === 0 &&
                (
                  <View
                    style={{
                      transform: [{ rotate: '180deg' }],
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <WsLoading size={30}></WsLoading>
                  </View>
                )
              }
            </>
          }
        />
      )}
    </>
  )
}

export default AuditChaptersSortDraft
