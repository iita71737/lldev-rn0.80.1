import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';

import gColor from '@/__reactnative_stone/global/color';
import moment from 'moment';
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
  LlAuditSortedResultCard001,
  LlNavButton002,
  LlRelatedAlertCard001
} from '@/components';
import $color from '@/__reactnative_stone/global/color'
import ServiceAuditRecord from '@/services/api/v1/audit_record';
import S_AuditRequest from '@/services/api/v1/audit_request';
import LlBtn002 from '@/components/LlBtn002';
import S_AuditRecord from '@/services/api/v1/audit_record';
import { useTranslation } from 'react-i18next'

const AuditChaptersSort = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { id, navigation, auditRecord } = props;

  const riskStandard = [
    {
      value: 'major',
      score: 23,
    },
    {
      value: 'minor',
      score: 22,
    },
    {
      value: 'ofi',
      score: 21,
    },
  ];
  const [recordAnswers, setRecordAnswers] = useState(null);

  // Services
  const $_getSortedRecords = async id => {
    try {
      const res = await S_AuditRequest.getSortedByQues(id);
      setRecordAnswers(res);
    } catch (e) {
      console.error(e);
    }
  };

  const $_allQuesWithScore = async () => {
    //所有的題目加回答
    return S_AuditRequest.getAllQuesResult(await $_chapterList());
  };

  const $_chapterList = async () => {
    try {
      const list = await S_AuditRecord.getChaptersWithAnswers(
        auditRecordFormated.chapters,
        recordAnswers,
      );
      const listWithIndex = await S_AuditRecord.getCustomedIndex(list);
      return listWithIndex;
    } catch (e) {
      console.error(e);
    }
  };

  // Function
  useEffect(() => {
    $_getSortedRecords(id);
  }, []);

  return (
    <>
      {recordAnswers && (
        <ScrollView>
          {recordAnswers.map((recordAnswer, recordAnswerIndex) => {
            return (
              <View key={recordAnswerIndex}>
                {recordAnswer.sectionList[0].questionList.length > 0 && (
                  <WsText
                    size={18}
                    style={{
                      fontWeight: 'bold',
                      marginTop: 16,
                      marginLeft: 16,
                    }}>
                    {recordAnswer.chapterCustomedIndex}
                    {recordAnswer.title ? recordAnswer.title : recordAnswer.chapterTitle ? recordAnswer.chapterTitle : ''}
                  </WsText>
                )}
                {recordAnswer.sectionList.map((section, sectionIndex) => {
                  return (
                    <View key={sectionIndex}>
                      {section.questionList && (section.title || section.title || section.sectionTitle || section.sectionTitle) && (
                        <WsText
                          size={14}
                          style={{
                            fontWeight: 'bold',
                            marginVertical: 8,
                            marginLeft: 16,
                          }}>
                          {section.sectionCustomedIndex}
                          {section.title ? section.title : section.sectionTitle ? section.sectionTitle : ''}
                        </WsText>
                      )}
                      {section.questionList && section.questionList.length > 0 && section.questionList.map((question, questionIndex) => {
                        return (
                          <LlAuditSortedResultCard001
                            key={questionIndex}
                            onPress={() => {
                              navigation.push('AuditRecordsAnsShow', {
                                // name: 'AuditRecordsAnsShow',
                                // params: {
                                id: question.id,
                                // },
                              });
                            }}
                            isFocus={question.keypoint == 1 ? true : false}
                            no={question.questionCustomedIndex}
                            title={question.title}
                            id={question.id}
                            score={question.score}
                            style={[
                              questionIndex != 0
                                ? {
                                  marginTop: 8,
                                }
                                : {
                                  marginTop: 8
                                },
                            ]}
                          />
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            );
          })}
          {auditRecord && auditRecord.alert && (
            <>
              {/* <WsText
                style={{ paddingLeft: 16, paddingTop: 16 }}
                fontWeight={'600'}>
                {t('相關警示')}
              </WsText>
              <View
                style={{
                  paddingHorizontal: 16
                }}>
                <LlNavButton002
                  backgroundColor={$color.white}
                  iconLeft={'ws-filled-alert'}
                  iconLeftColor={$color.danger}
                  onPress={() => {
                    navigation.push('RoutesAlert', {
                      screen: 'AlertShow',
                      params: {
                        id: auditRecord.alert.id
                      }
                    })
                  }}>
                  {t('相關警示')}
                </LlNavButton002>
              </View> */}
              <LlRelatedAlertCard001
                alert={auditRecord?.alert}
              ></LlRelatedAlertCard001>
            </>
          )}
          {auditRecord && auditRecord.tasks && auditRecord.tasks.length > 0 && (
            <View
              style={{
                marginTop: 16,
                paddingHorizontal: 16
              }}>
              <WsText fontWeight={'600'}>{t('相關任務')}</WsText>
              <LlNavButton002
                backgroundColor={$color.white}
                iconLeft={'ll-nav-assignment-filled'}
                iconLeftColor={$color.primary}
                onPress={() => {
                  navigation.push('RoutesTask', {
                    screen: 'TaskShow',
                    params: {
                      id: auditRecord.tasks.id
                    }
                  })
                }}>
                {t('相關任務')}
              </LlNavButton002>
            </View>
          )}
          <View
            style={{
              height: 50,
            }}
          >
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default AuditChaptersSort;
