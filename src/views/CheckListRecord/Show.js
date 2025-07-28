import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View, SafeAreaView, Dimensions } from 'react-native'
import {
  WsTabView,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsIconCircle,
  WsInfoUser,
  WsCenter,
  LlCheckListRecordCard002,
  LlRiskHeaderCalc,
  LlEffectWithCheckListCalc,
  LlNavButton002,
  WsIconBtn,
  WsInfo,
  LlRelatedAlertCard001,
  LlTaskCard002
} from '@/components'
import CheckListQuestionSort from '@/sections/CheckList/CheckListQuestionSort'
import CheckListResultSort from '@/sections/CheckList/CheckListResultSort'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const CheckListRecord = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const id = route.params?.id;
  const from = route.params?.from;

  // State
  const [answers, setAnswers] = useState([])
  const [checklistRecord, setChecklistRecord] = React.useState(null)
  const [tabIndex, settabIndex] = useState(0)

  // Services
  const $_fetchCheckListRecord = async () => {
    try {
      const res = await S_CheckListRecord.show({ modelId: id })
      const format = S_CheckListRecord.getFormatted(res)
      setChecklistRecord(format)
    } catch (e) {
      console.error(e);
    }
  }

  const $_fetchCheckListAnswers = async () => {
    try {
      const res = await S_CheckListRecordAns.index({ parentId: id })
      setAnswers(res.data)
    } catch (e) {
      console.error(e);
    }
  }

  // Function
  const $_getChecker = checklistRecord => {
    return {
      name: checklistRecord.checker.name,
      avatar: { uri: checklistRecord.checker.source },
      des: checklistRecord.record_at
        ? moment(checklistRecord.record_at).format('YYYY-MM-DD HH:MM')
        : t('無')
    }
  }
  const $_getReviewer = checklistRecord => {
    return {
      name: checklistRecord.reviewer.name,
      avatar: { uri: checklistRecord.reviewer.source },
      des: checklistRecord.review_at
        ? moment(checklistRecord.review_at).format('YYYY-MM-DD HH:MM')
        : t('無')
    }
  }


  // React.useEffect(() => {
  //   $_setTabItems()
  // }, [route])

  useEffect(() => {
    $_fetchCheckListRecord()
    $_fetchCheckListAnswers()
  }, [])

  return (
    <SafeAreaView
      style={{
        flex: 1
      }}
    >
      <ScrollView>
        {checklistRecord && answers.length != 0 && (
          <>
            <LlRiskHeaderCalc
              answers={answers}
              passRate={
                checklistRecord.pass_rate ? checklistRecord.pass_rate : '0'
              }
            />
            <LlEffectWithCheckListCalc answers={answers} />
            <WsPaddingContainer
              style={{
                backgroundColor: gColor.white,
                marginBottom: 8
              }}>
              <WsFlex justifyContent="space-between">
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: width / 2,
                  }}
                  type="users"
                  label={t('答題者')}
                  labelSize={12}
                  isUri={true}
                  value={checklistRecord.checkers}
                />
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: width / 2,
                  }}
                  type="users"
                  label={t('答題者')}
                  labelSize={12}
                  isUri={true}
                  value={checklistRecord.reviewers}
                />
              </WsFlex>
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: gColor.white,
                marginBottom: 8
              }}>
              <WsText size={14}>{t('覆核人員總評')}</WsText>
              <WsText>
                {checklistRecord.review_remark
                  ? checklistRecord.review_remark
                  : t('無')}
              </WsText>
            </WsPaddingContainer>

            <View
              style={{
                marginTop: 8,
              }}>
              {checklistRecord.alert && (
                <>
                  <LlRelatedAlertCard001
                    alert={checklistRecord?.alert}
                  ></LlRelatedAlertCard001>
                </>
              )}
              {checklistRecord.tasks && checklistRecord.tasks.length > 0 && (
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
                      item={checklistRecord.tasks[0]}
                      onPress={() => {
                        navigation.push('RoutesTask', {
                          screen: 'TaskShow',
                          params: {
                            id: checklistRecord.tasks[0].id
                          }
                        })
                      }}
                    />
                  </View>
                </>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default CheckListRecord
