import React from 'react'
import {
  Pressable,
  ScrollView,
  SafeAreaView,
  View,
  StatusBar,
} from 'react-native'
import { WsBtn, WsStepsTab, WsTabView, WsSkeleton } from '@/components'
import CheckListAssignmentStep from '@/sections/CheckList/CheckListAssignmentProcedure/Step'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { setCurrentChecklistRecordDraft } from '@/store/data'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const Procedure = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const {
    id,
    versionId,
    questionId,
    allQuestions,
    clearIndex,
    clearIsNeedCheckAnsIndex
  } = route.params

  // Redux
  const currentChecklistDraft = useSelector(
    state => state.data.currentChecklistRecordDraft
  )

  // States
  const [loading, setLoading] = React.useState(true)
  const [questions, setQuestions] = React.useState(allQuestions)

  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([])

  // Services
  const $_fetchQuestions = async () => {
    if (currentChecklistDraft) {
      setQuestions(currentChecklistDraft)
    }
    setCurrentTabIndex(
      allQuestions.findIndex(question => question.id === questionId)
    )
    setLoading(false)
  }

  // Function
  const $_setTabItemsViews = () => {
    const _items = questions.map((question, questionIndex) => {
      // 從Preview按清除答案
      if (questionIndex === clearIndex) {
        delete question.remark
        delete question.answer_value
        delete question.risk_level
        return {
          value: `CheckListAssignmentStep${questionIndex}`,
          props: {
            title: question.title,
            question_type: question.question_type_setting,
            question: question,
          }
        }
      }
      // 從Preview按保留答案
      else if (questionIndex === clearIsNeedCheckAnsIndex) {
        delete question.isNeedCheckAns
        return {
          value: `CheckListAssignmentStep${questionIndex}`,
          props: {
            title: question.title,
            question_type: question.question_type_setting,
            question: question,
          }
        }
      }
      else {
        return {
          value: `CheckListAssignmentStep${questionIndex}`,
          props: {
            title: question.title,
            question_type: question.question_type_setting,
            question: question,
          }
        }
      }

    })
    setTabItems(_items)
  }

  const $_setDraftToRedux = () => {
    store.dispatch(setCurrentChecklistRecordDraft(questions))
  }

  const $_onSubmit = () => {
    $_setDraftToRedux()
    navigation.goBack()
  }

  const $_backPreview = () => {
    $_setDraftToRedux()
    navigation.goBack()
  }

  const $_onChange = (itemIndex, $event, stateKey, question) => {
    if ($event != undefined && stateKey == 'score') {
      question.score = $event
    }
    if ($event && stateKey === 'secondary') {
      stateKey = 'score'
      question.answer_value = $event
      const _risk_level = S_CheckListRecordAns.getRiskLevelScore(question, $event.value)
      question.risk_level = _risk_level
      delete question.isNeedCheckAns
    }
    if ($event != undefined && stateKey == 'remark') {
      question.remark = $event
    }
    if ($event && stateKey == 'images') {
      question.images = $event
    }
    if ($event && stateKey == 'question_setting_items') {
      question.question_setting_items = $event
    }
    if ($event && stateKey == 'answer_setting') {
      question.answer_setting = $event
    }
    if ($event != undefined && stateKey == 'answer_value') {
      question.answer_value = $event
      const _risk_level = S_CheckListRecordAns.getRiskLevelScore(question, $event.value)
      question.risk_level = _risk_level
      delete question.isNeedCheckAns
    }
    // 題目變更-保留答案
    if ($event == null && stateKey == 'clear_isNeedCheckAns') {
      delete question.isNeedCheckAns
    }
    // 題目變更-清除答案
    if ($event == null && stateKey == 'clear_answer_value') {
      question.answer_value = $event
      question.risk_level = $event
    }
    if ($event == null && stateKey == 'clear_answer_value') {
      question.answer_value = $event
      question.risk_level = $event
    }
    if ($event != undefined && stateKey == 'itemsToggleBtnSelected') {
      question.itemsToggleBtnSelected = $event
    }
    if ($event != undefined && stateKey == 'minorToggleBtnSelected') {
      question.minorToggleBtnSelected = $event
    }
    if ($event != undefined && stateKey == 'unit') {
      question.unit = $event
    }
    if ($event != undefined && stateKey == 'last_version') {
      question.last_version = $event
    }
    if ($event != undefined && stateKey == 'latLng') {
      question.latLng = $event
    }
  }

  // VALIDATION
  const $_stepValidation = React.useMemo(() => {
    if (
      questions[currentTabIndex].quesType == 2 ||
      questions[currentTabIndex].questionType == 2 ||
      questions[currentTabIndex].question_type == 2
    ) {
      if (
        questions[currentTabIndex].score == 25 ||
        (questions[currentTabIndex].score != 25 &&
          questions[currentTabIndex].remark)
      ) {
        return false
      } else {
        return true
      }
    }
    if (
      questions[currentTabIndex].quesType == 1 ||
      questions[currentTabIndex].questionType == 1 ||
      questions[currentTabIndex].question_type == 1
    ) {
      const _score = S_CheckListRecordAns.getAnsDataScore(
        questions[currentTabIndex],
        questions[currentTabIndex].score
      )
      if (_score == 25 || (_score < 25 && questions[currentTabIndex].remark)) {
        return false
      } else {
        return true
      }
    }
  }, [questions, currentTabIndex])

  React.useEffect(() => {
    if (allQuestions) {
      $_fetchQuestions()
    }
  }, [allQuestions])

  React.useEffect(() => {
    if (questions) {
      $_setTabItemsViews()
    }
  }, [questions])

  React.useEffect(() => {
    if (questionId && questions) {
      $_fetchQuestions()
    }
  }, [questionId])

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
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
          {tabItems && (
            <WsStepsTab
              currentTabIndex={currentTabIndex}
              setCurrentTabIndex={setCurrentTabIndex}
              items={tabItems}
              title={t('點檢作業')}
              submitText={t('回列表')}
              onSubmit={() => {
                $_onSubmit()
              }}
              onChange={(itemIndex, $event, stateKey, item) => {
                $_onChange(itemIndex, $event, stateKey, item)
              }}
              viewComponent={CheckListAssignmentStep}
              backBtnOnPress={() => $_backPreview()}
            />
          )}
          <SafeAreaView>

            {tabItems && tabItems.length > 1 && (
              <WsBtn
                testID={'返回題目列表'}
                onPress={() => {
                  $_backPreview()
                }}>
                {t('返回')}
              </WsBtn>
            )}

          </SafeAreaView>
        </>
      )}
    </>
  )
}

export default Procedure
