import React from 'react'
import {
  Pressable,
  ScrollView,
  SafeAreaView,
  View,
  StatusBar,
  Platform,
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
    clearIsNeedCheckAnsIndex,
    checklistRecordId
  } = route.params

  // Redux
  const currentChecklistDraft = useSelector(
    state => state.data.currentChecklistRecordDraft
  )
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentLatLng = useSelector(state => state.data.currentLatLng)

  // States
  const [loading, setLoading] = React.useState(true)
  const [questions, setQuestions] = React.useState(allQuestions)

  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([])
  const topBtnSubmitPromiseRef = React.useRef(null)

  const $_toIdArray = (items) => {
    if (!Array.isArray(items)) return []
    return items
      .map(item => (item && typeof item === 'object' ? item.id : item))
      .filter(Boolean)
  }

  // Services
  const $_findQuestionIndex = (_questions = [], _questionId) => {
    const _targetId = String(_questionId)
    const _idx = (_questions || []).findIndex(question => {
      const _checklistQuestionId = question?.checklist_question?.id
      const _questionVersionId = question?.id
      return String(_checklistQuestionId) === _targetId || String(_questionVersionId) === _targetId
    })
    return _idx >= 0 ? _idx : 0
  }

  const $_getAnswerChecklistQuestionId = (answer) => {
    return answer?.checklist_question?.id
      || answer?.checklist_question_id
      || answer?.checklist_question
  }

  const $_getAnswerChecklistQuestionVersionId = (answer) => {
    return answer?.checklist_question_version?.id
      || answer?.checklist_question_version_id
      || answer?.checklist_question_version
  }

  const $_extractAnswers = (answersRes) => {
    if (Array.isArray(answersRes)) return answersRes
    if (Array.isArray(answersRes?.data)) return answersRes.data
    if (Array.isArray(answersRes?.data?.data)) return answersRes.data.data
    return []
  }

  const $_findMatchedAnswer = (question, answers = []) => {
    const _questionId = question?.checklist_question?.id || question?.checklist_question || question?.id
    const _questionVersionId =
      question?.checklist_question_version
      || question?.checklist_question_version_id
      || question?.last_version?.id
      || question?.id

    let _matchedAnswer = answers.find(answer => (
      String($_getAnswerChecklistQuestionId(answer) || '') === String(_questionId || '')
    ))
    if (!_matchedAnswer && _questionVersionId) {
      _matchedAnswer = answers.find(answer => (
        String($_getAnswerChecklistQuestionVersionId(answer) || '') === String(_questionVersionId || '')
      ))
    }
    return _matchedAnswer
  }

  const $_canEditQuestion = (question) => {
    const checkboxVisible = true
    const isNotCompleted = question?.is_completed !== 1
    const hasUpdatedUser = !!question?.updated_user
    const isUpdatedByCurrentUser = question?.updated_user?.id === currentUser?.id
    const canEditWhenNoUpdatedUser =
      !!currentUser &&
      checkboxVisible &&
      question?.question_type_setting?.value === 'single-choice' &&
      (
        question?.question_setting == null ||
        !question?.question_setting?.checkers?.length ||
        question?.question_setting?.checkers?.some(checker => checker.id === currentUser.id)
      )
    const canEdit =
      isNotCompleted &&
      (
        (hasUpdatedUser && isUpdatedByCurrentUser) ||
        (!hasUpdatedUser && canEditWhenNoUpdatedUser)
      )
    return canEdit
  }

  const $_fetchQuestions = async () => {
    const _routeQuestions = Array.isArray(allQuestions) ? allQuestions : []
    const _draftQuestions = Array.isArray(currentChecklistDraft) ? currentChecklistDraft : []
    const _sourceQuestions = _routeQuestions.length > 0 ? _routeQuestions : _draftQuestions
    const _checklistRecord = checklistRecordId || route.params?.checklistRecordId
    let _nextQuestions = _sourceQuestions

    if (_checklistRecord && Array.isArray(_sourceQuestions) && _sourceQuestions.length > 0) {
      try {
        const _answersRes = await S_CheckListRecordAns.indexV2({
          parentId: _checklistRecord
        })
        const _latestAnswers = $_extractAnswers(_answersRes)
        _nextQuestions = _sourceQuestions.map(question => {
          const _matchedAnswer = $_findMatchedAnswer(question, _latestAnswers)
          if (!_matchedAnswer) return question

          return {
            ...question,
            recordAnsId: _matchedAnswer?.id || question?.recordAnsId,
            checklist_record_answer_id: _matchedAnswer?.id || question?.checklist_record_answer_id
          }
        })
      } catch (error) {
        console.log('Procedure sync recordAnsId failed', error)
      }
    }

    setQuestions(_nextQuestions)
    setCurrentTabIndex($_findQuestionIndex(_nextQuestions, questionId))
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

  const $_cloneQuestions = (_questions = []) => {
    return (_questions || []).map(item => ({ ...item }))
  }

  const $_setDraftToRedux = (_questions = questions) => {
    const _clonedQuestions = $_cloneQuestions(_questions)
    store.dispatch(setCurrentChecklistRecordDraft(_clonedQuestions))
  }

  const $_onSubmit = async () => {
    const _latestQuestions = await $_onTopBtnPress()
    $_setDraftToRedux(_latestQuestions)
    navigation.goBack()
  }

  const $_backPreview = async () => {
    const _latestQuestions = await $_onTopBtnPress()
    $_setDraftToRedux(_latestQuestions)
    navigation.goBack()
  }

  const $_onTopBtnPress = async (tabItemsState = []) => {
    if (topBtnSubmitPromiseRef.current) {
      return topBtnSubmitPromiseRef.current
    }

    topBtnSubmitPromiseRef.current = (async () => {
      const _currentQuestions = questions || []
      try {
        const _question = questions?.[currentTabIndex]
        if (!_question) return _currentQuestions
        if (!$_canEditQuestion(_question)) {
          return _currentQuestions
        }

        const _checklistRecord = route.params?.checklistRecordId
          || _question?.checklist_record_id
          || _question?.checklist_record?.id

        if (!_checklistRecord) {
          console.warn('Missing checklist_record for S_CheckListRecordAns.create')
          return _currentQuestions
        }

        const _questionValue = typeof _question?.answer_value === 'string'
          ? _question.answer_value
          : _question?.answer_value && typeof _question.answer_value === 'object'
            ? [_question.answer_value?.id]
            : _question?.answer_value

        const _riskLevel = S_CheckListRecordAns.getRiskLevelScore(
          _question,
          _question?.answer_value
        )

        const _params = {
          checklist_record: _checklistRecord,
          question_value: _questionValue,
          score: _question?.score,
          risk_level: _riskLevel,
          remark: _question?.remark,
          images: _question?.images ? S_CheckListRecordAns.formattedForFileStore(_question.images) : [],
          effects: $_toIdArray(_question?.effects),
          factory_effects: $_toIdArray(_question?.factory_effects),
          factory: currentFactory?.id,
          lat: _question?.latLng?.latitude ?? currentLatLng?.latitude,
          lng: _question?.latLng?.longitude ?? currentLatLng?.longitude,
          ip: _question?.ip,
          checklist_question_version: _question?.checklist_question_version
            || _question?.checklist_question_version_id
            || _question?.last_version?.id
            || _question?.id,
          checklist_question: _question?.checklist_question?.id || _question?.checklist_question || _question?.id
        }
        if (Array.isArray(_params.question_value)) {
          _params.question_value = _params.question_value.filter(value => {
            return value !== null && value !== undefined && value !== ''
          })
        }
        const _hasQuestionValue = Array.isArray(_params.question_value)
          ? _params.question_value.length > 0
          : _params.question_value !== null && _params.question_value !== undefined && _params.question_value !== ''
        console.log(_hasQuestionValue, '_hasQuestionValue')
        if (!_hasQuestionValue) {
          return _currentQuestions
        }
        let _recordAnsId = _question?.recordAnsId
          || _question?.checklist_record_answer_id
          || _question?.checklist_record_answer?.id
        if (!_recordAnsId) {
          try {
            const _latestAnswersRes = await S_CheckListRecordAns.indexV2({
              parentId: _checklistRecord
            })
            const _latestAnswers = $_extractAnswers(_latestAnswersRes)
            const _matchedAnswer = $_findMatchedAnswer(_question, _latestAnswers)
            _recordAnsId = _matchedAnswer?.id
            if (_recordAnsId) {
              const _syncedQuestions = _currentQuestions.map((question, questionIndex) => {
                if (questionIndex === currentTabIndex) {
                  return {
                    ...question,
                    recordAnsId: _recordAnsId,
                    checklist_record_answer_id: _recordAnsId
                  }
                }
                return question
              })
              setQuestions(_syncedQuestions)
              store.dispatch(setCurrentChecklistRecordDraft(_syncedQuestions))
            }
          } catch (error) {
            console.log('Procedure single save prefetch recordAnsId failed', error)
          }
        }
        let _res
        if (_recordAnsId) {
          const _updateData = {
            question_value: _params.question_value,
            score: _params.score,
            risk_level: _params.risk_level,
            remark: _params.remark,
            images: _params.images,
            effects: _params.effects,
            factory_effects: _params.factory_effects,
            factory: _params.factory,
            lat: _params.lat,
            lng: _params.lng,
            ip: _params.ip,
            checklist_question_version: _params.checklist_question_version,
            checklist_question: _params.checklist_question
          }
          console.log(_recordAnsId, '_recordAnsId')
          console.log(_updateData, 'S_CheckListRecordAns.update')
          _res = await S_CheckListRecordAns.update({
            modelId: _recordAnsId,
            data: _updateData
          })
        } else {
          console.log(_params, 'S_CheckListRecordAns.create')
          _res = await S_CheckListRecordAns.create({ params: _params })
        }
        const _nextRecordAnsId = _res?.id || _res?.data?.id || _recordAnsId
        if (_nextRecordAnsId) {
          const _updatedQuestions = questions.map((question, questionIndex) => {
            if (questionIndex === currentTabIndex) {
              return {
                ...question,
                recordAnsId: _nextRecordAnsId
              }
            }
            return question
          })
          setQuestions(_updatedQuestions)
          store.dispatch(setCurrentChecklistRecordDraft(_updatedQuestions))
          return _updatedQuestions
        }
        return _currentQuestions
      } catch (error) {
        console.error('S_CheckListRecordAns.create/update failed in top button callback', error)
        return _currentQuestions
      } finally {
        topBtnSubmitPromiseRef.current = null
      }
    })()

    return topBtnSubmitPromiseRef.current
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
    setQuestions(prev => prev ? [...prev] : prev)
  }

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
              topRightBtn={$_onTopBtnPress}
              topLeftBtn={$_onTopBtnPress}
              _onIndexChange={$_onTopBtnPress}
            />
          )}
          <SafeAreaView>

            {tabItems && tabItems.length > 1 && (
              <WsBtn
                testID={'返回題目列表'}
                onPress={() => {
                  $_backPreview()
                }}
                style={{
                  marginBottom: Platform.OS === 'ios' ? 0 : 48,
                }}
              >
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
