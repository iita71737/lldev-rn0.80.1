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
  WsTag,
  LlChangeResultCard001
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
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'

const ChangeAssignmentQuestionsDraft = props => {
  const navigation = useNavigation()

  // Props
  const {
    answers,
    name,
    changeId,
    changeVersionId,
    systemSubclass,
    changeAssignmentsId
  } = props

  // Render
  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <>
        <ScrollView
          style={{
          }}
        >
          {answers && answers.length > 0 &&
            answers.map((item, itemIndex) => {
              return (
                <View key={itemIndex}>
                  <WsFlex
                    style={{
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
                      {item.textLabel}
                    </WsText>
                  </WsFlex>

                  <FlatList
                    data={item.assignmentList}
                    keyExtractor={(item, index) => index}
                    renderItem={({ item: changeItem, index: changeItemIndex }) => {
                      return (
                        <View key={changeItemIndex}>
                          <>
                            <WsPaddingContainer
                              style={{
                                backgroundColor: $color.primary11l,
                                borderRadius: 10,
                                marginTop: changeItemIndex !== 0 ? 16 : 0
                              }}>
                              <WsFlex alignItems="flex-start">
                                <WsText
                                  letterSpacing={1}
                                  size={12}
                                  style={{
                                    marginRight: 4
                                  }}
                                  fontWeight={'600'}>
                                  {changeItemIndex + 1}
                                  {'.'}
                                </WsText>
                                <View>
                                  <WsText
                                    size={12}
                                    letterSpacing={1}
                                    fontWeight="700"
                                    style={{
                                      marginRight: 16,
                                      marginBottom: 4,
                                    }}>
                                    {changeItem.title}
                                  </WsText>
                                  <WsText letterSpacing={1} size={14}>
                                    {changeItem.subtitle}
                                  </WsText>
                                </View>
                              </WsFlex>
                            </WsPaddingContainer>

                            <FlatList
                              keyExtractor={(item, index) => item + index}
                              data={changeItem.changeList}
                              renderItem={({ item: risk, index: riskIndex }) => {
                                return (
                                  <LlChangeResultCard001
                                    no={risk && risk.index ? risk.index : ''}
                                    text={risk.title}
                                    score={
                                      risk.score
                                        ? risk.score
                                        : null
                                    }
                                    style={{
                                      borderBottomWidth: 0.4,
                                      borderBottomColor: $color.primary,
                                      marginHorizontal: 16,
                                      borderRadius: 8
                                    }}
                                    risk={risk}
                                    onPress={() => {
                                      navigation.push('RoutesChange', {
                                        screen: 'ChangeAssignmentProcedure',
                                        params: {
                                          name: name,
                                          changeId: changeId,
                                          changeVersionId: changeVersionId,
                                          systemSubclass: systemSubclass,
                                          risk: risk,
                                          changeAssignmentsId: changeAssignmentsId,
                                          assignmentDataList: answers
                                        }
                                      })
                                    }}
                                  />
                                )
                              }}
                            />
                          </>
                        </View>
                      )
                    }}
                  />
                </View>
              )
            })}
        </ScrollView>
      </>
    </>
  )
}

export default ChangeAssignmentQuestionsDraft
