import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  StatusBar,
  SafeAreaView,
} from 'react-native'
import {
  WsStepsTab,
  WsText,
  WsSkeleton,
  WsModalFooter,
  WsBtn
} from '@/components'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import AuditAssignmentStep from '@/sections/Audit/Assignment/Step'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store';
import {
  setCurrentAuditRecordDraft,
} from '@/store/data';

const AuditAssignmentProcedure = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  // Params
  const {
    requestId,
    auditId,
    questionId,
    drafts,
    allQuestions,
    selectedIndex
  } = route.params

  // REDUX
  const currentAuditRecordDraft = useSelector(state => state.data.currentAuditRecordDraft)

  // States
  const [loading, setLoading] = React.useState(true);
  const [questions, setQuestions] = React.useState(allQuestions ? allQuestions : [])
  const [tabItems, setTabItems] = React.useState([])
  const [currentTabIndex, setCurrentTabIndex] = React.useState(selectedIndex ? selectedIndex : 0);

  // Services
  const $_fetchQuestion = async () => {
    if (currentAuditRecordDraft) {
      setQuestions(currentAuditRecordDraft)
    }
    const _selected = allQuestions.findIndex(question => question.id === questionId)
    setCurrentTabIndex(_selected)
    setLoading(false)
  }

  // Functions
  const $_setTabItemsViews = () => {
    const _items = questions.map((question, questionIndex) => {
      return {
        value: `AuditAssignmentStep${questionIndex}`,
        props: {
          question: question,
          value: {
            score: question.score,
            remark: question.remark,
            images: question.images
          }
        },
      }
    })
    setTabItems(_items)
  }

  const $_onChange = (itemIndex, $event, stateKey,) => {
    const _questions = JSON.parse(JSON.stringify(questions))
    const _question = _questions[itemIndex]
    let _changeQuestion = {}
    if (stateKey === 'bad') {
      stateKey = 'score',
        _changeQuestion = {
          ..._question,
          [stateKey]: $event
        }
    }
    if (stateKey == 'remark') {
      _changeQuestion = {
        ..._question,
        remark: $event.remark,
        images: $event.images
      }
    } else {
      _changeQuestion = {
        ..._question,
        [stateKey]: $event
      }
    }
    _questions[itemIndex] = _changeQuestion
    setQuestions(_questions)
    setCurrentTabIndex(itemIndex)
  };

  const $_setDraftToRedux = () => {
    store.dispatch(setCurrentAuditRecordDraft(questions))
  }

  const $_stepValidation = React.useMemo(() => {
    if (questions) {
      if (
        questions &&
        currentTabIndex != undefined &&
        questions[currentTabIndex] &&
        questions[currentTabIndex].score &&
        (questions[currentTabIndex].score == 25 ||
          (questions[currentTabIndex].score != 25 &&
            questions[currentTabIndex].remark))
      ) {
        return false
      } else {
        return true
      }
    }
  }, [questions, currentTabIndex])

  const $_onSubmit = async () => {
    $_setDraftToRedux()
    navigation.navigate({
      name: 'AuditAssignmentPreview',
      params: {
        requestId: requestId,
        auditId: auditId,
      }
    })
  }
  const $_backPreview = () => {
    $_setDraftToRedux()
    navigation.navigate({
      name: 'AuditAssignmentPreview',
      params: {
        requestId: requestId,
        auditId: auditId,
      }
    })
  }

  React.useEffect(() => {
    if (auditId) {
      $_fetchQuestion()
    }
  }, [auditId])

  React.useEffect(() => {
    if (questions) {
      $_setTabItemsViews()
    }
  }, [questions])

  React.useEffect(() => {
    if (questionId && questions) {
      $_fetchQuestion()
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
          {questions && (
            <WsStepsTab
              currentTabIndex={currentTabIndex}
              setCurrentTabIndex={setCurrentTabIndex}
              items={tabItems}
              title={t('稽核作業')}
              submitText={t('回列表')}
              onSubmit={() => {
                $_onSubmit();
              }}
              onChange={(itemIndex, $event, stateKey) => {
                $_onChange(itemIndex, $event, stateKey);
              }}
              btnRightDisable={$_stepValidation}
              btnSubmitDisable={$_stepValidation}
              viewComponent={AuditAssignmentStep}
              backBtnOnPress={() => $_backPreview()}
            ></WsStepsTab>
          )}
          <SafeAreaView>
            <WsBtn
              onPress={() => {
                $_setDraftToRedux()
                navigation.navigate({
                  name: 'AuditAssignmentPreview',
                  params: {
                    requestId: requestId,
                    auditId: auditId,
                  }
                })
              }}
            >
              {t('返回')}
            </WsBtn>
          </SafeAreaView>
        </>
      )}
    </>
  )
}

export default AuditAssignmentProcedure