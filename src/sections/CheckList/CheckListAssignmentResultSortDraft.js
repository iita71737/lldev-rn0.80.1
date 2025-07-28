import React from 'react'
import {
  ScrollView,
  View,
  StatusBar,
  SafeAreaView,
  FlatList
} from 'react-native'
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
  WsEmpty,
  LlBtn002,
  WsGradientButton,
  WsState
} from '@/components'
import { useSelector } from 'react-redux'
import LlCheckListQuestionCard002 from '@/components/LlCheckListQuestionCard002'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import { setCurrentChecklistRecordDraft } from '@/store/data'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import { useTranslation } from 'react-i18next'
import CheckBox from '@react-native-community/checkbox'
import moment from 'moment'
import { TouchableOpacity } from 'react-native-gesture-handler'

const CheckListAssignmentResultSortDraft = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    id,
    versionId,
    answers,
    questions,
    setQuestions,
    todayDone,
    questionFilteredBtnVisible = true,
    setBatchQualifiedLoading,
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // STATE
  const [checkedQuestions, setCheckedQuestioned] = React.useState([])

  const [questionFiltered, setQuestionFiltered] = React.useState(false)
  const [myQuestions, setMyQuestions] = React.useState()


  // HELPER
  const $_validation = (item) => {
    const {
      question_type,
      risk_level,
      answer_value,
      remark
    } = item
    if (
      item.last_version &&
      item.last_version.updated_at &&
      item.answer_updated_at &&
      moment.utc(item.last_version.updated_at).isAfter(moment.utc(item.answer_updated_at))
    ) {
      return $color.danger11l
    }
    if (!answer_value) {
      return $color.danger11l
    }
    if ((risk_level === 23 || risk_level === 22 || risk_level === 21) && !remark) {
      return $color.danger11l
    }
    if ((risk_level === 23 || risk_level === 22 || risk_level === 21) && remark) {
      return $color.white
    }
    if (risk_level === 25) {
      return $color.white
    }
    return $color.white
  }


  // HELPER
  // 篩選 我的題目 並整理成 依結果排序 顯示的格式
  const $_filterMyQuestions = () => {
    const _answer = S_CheckListQuestion.getFormattedMyQuestionSortedByResult(answers, currentUser.id)
    setQuestionFiltered(!questionFiltered)
    setMyQuestions(_answer)
  }

  // 提交批次全部合格並整理成要送出的格式
  const $_SubmitBatchQualified = () => {
    const _questions = S_CheckListQuestion.getQualifiedMyQuestions(questions, checkedQuestions, currentUser.id, 25)
    setQuestions(_questions)
    store.dispatch(setCurrentChecklistRecordDraft(_questions))
  }

  // 核選欲加入批次合格的清單
  const $_addToBatchQualified = (answer) => {
    if (answer.checked) {
      setCheckedQuestioned([...checkedQuestions, answer.id])
    } else {
      const updatedItems = checkedQuestions.filter((checkedItem) => checkedItem !== answer.id);
      setCheckedQuestioned(updatedItems);
    }
  }

  // 全選
  const $_addAllToBatchQualified = () => {
    console.log('$_addAllToBatchQualified');
    const _checkedAllQuestions = S_CheckListQuestion.checkedAllMyQuestions(questions, currentUser.id)
    setCheckedQuestioned(_checkedAllQuestions)
  }

  // 我的題目狀態下送批次合格RE-RENDER
  React.useEffect(() => {
    if (answers && questionFiltered && currentUser) {
      const _answer = S_CheckListQuestion.getFormattedMyQuestionSortedByResult(answers, currentUser.id)
      setMyQuestions(_answer)
    }
  }, [answers])

  // console.log(JSON.stringify(answers),'answers');

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <>
        {answers && questions && (
          <>
            <FlatList
              data={questionFiltered ? myQuestions : answers}
              keyExtractor={(item, index) => item + index}
              renderItem={({ item, index }) => {
                if (item.ans && item.ans.length > 0)
                  return (
                    <View key={index}>
                      <WsFlex
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 16,
                        }}>
                        <WsIcon
                          name={item.icon}
                          size={22}
                          color={item.color}
                          style={{
                            marginRight: 4
                          }}
                        />
                        {item.ans != undefined && (
                          <WsText fontWeight="bold">{`${item.title} ${t('共{number}題', { number: item.ans.length })}`}</WsText>
                        )}
                      </WsFlex>
                      
                      <FlatList
                        data={item.ans}
                        keyExtractor={(item, index) => item + index}
                        renderItem={({ item, index }) => {
                          return (
                            <LlCheckListQuestionCard002
                              done={todayDone}
                              key={item.id}
                              checkboxVisible={todayDone ? false : true}
                              checked={checkedQuestions.includes(item.id)}
                              checkboxOnPress={(answer) => {
                                $_addToBatchQualified(answer)
                              }}
                              onPress={() => {
                                navigation.navigate({
                                  name: 'CheckListAssignmentProcedure',
                                  params: {
                                    id: id,
                                    versionId: versionId,
                                    questionId: item.id,
                                    allQuestions: questions
                                  }
                                })
                              }}
                              style={[
                                {
                                  marginBottom: 8
                                }
                              ]}
                              cardColor={$_validation(item)}
                              no={item.no ? item.no : index + 1}
                              title={item.title}
                              answer={item}
                            />
                          )
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <></>
                          )
                        }}
                      />
                    </View>
                  )
              }}
              ListHeaderComponent={() => {
                return (
                  <>
                    <WsFlex
                    justifyContent="flex-end"
                    >
                      <WsGradientButton
                        style={{
                          marginTop: 16,
                          marginRight: 16,
                          alignSelf: 'flex-end',
                          width: 120,
                        }}
                        onPress={() => {
                          $_addAllToBatchQualified()
                        }}
                      >
                        {t('全選')}
                      </WsGradientButton>
                      <WsGradientButton
                        style={{
                          marginTop: 16,
                          marginRight: 16,
                          alignSelf: 'flex-end',
                          width: 120,
                        }}
                        onPress={() => {
                          $_SubmitBatchQualified()
                        }}
                      >
                        {t('批次合格')}
                      </WsGradientButton>
                    </WsFlex>
                  </>
                )
              }}
              ListFooterComponent={
                () => {
                  return (
                    <View
                      style={{
                        height: 100,
                        // borderWidth: 1,
                      }}
                    >
                    </View>
                  )
                }
              }
            />
          </>
        )}
      </>
    </>
  )
}

export default CheckListAssignmentResultSortDraft
