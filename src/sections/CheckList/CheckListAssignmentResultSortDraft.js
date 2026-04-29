import React from 'react'
import {
  ScrollView,
  View,
  StatusBar,
  FlatList,
  Alert
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
    checklistRecordId,
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
  const currentFactoryId = factory?.id

  // STATE
  const [checkedQuestions, setCheckedQuestioned] = React.useState([])
  const [questionFiltered, setQuestionFiltered] = React.useState(false)
  const [myQuestions, setMyQuestions] = React.useState()
  const $_BATCH_QUALIFIED_COOLDOWN_MS = 15000
  const _submitBatchQualifiedInFlightRef = React.useRef(false)
  const _lastSubmitBatchQualifiedAtRef = React.useRef(0)

  const $_toIdArray = (items) => {
    if (!Array.isArray(items)) return []
    return items
      .map(item => {
        if (item && typeof item === 'object') {
          return item.id ?? item.value ?? item.factory_effect_id
        }
        return item
      })
      .filter(Boolean)
  }
  const $_toIdValue = (value) => {
    if (value === null || value === undefined) return undefined
    if (value && typeof value === 'object') {
      return value.id ?? value.value ?? value.factory_effect_id
    }
    return value
  }
  const $_toQuestionValue = (item) => {
    if (typeof item?.answer_value === 'string') return item.answer_value
    if (Array.isArray(item?.answer_value)) {
      return item.answer_value
        .map(ans => $_toIdValue(ans))
        .filter(ans => ans !== undefined && ans !== null && ans !== '')
    }
    if (item?.answer_value && typeof item.answer_value === 'object') {
      const _value = $_toIdValue(item.answer_value)
      return _value !== undefined && _value !== null && _value !== '' ? [_value] : []
    }
    return item?.answer_value
  }
  const $_toImages = (images) => {
    if (!Array.isArray(images)) return []
    return S_CheckListRecordAns.formattedForFileStore(images)
  }
  const $_toFactoryEffectsPayload = (items) => {
    if (!Array.isArray(items)) return []
    return items
      .map(item => {
        if (item && typeof item === 'object') {
          const _factoryEffectId = item.factory_effect_id || item.id
          if (!_factoryEffectId) return null
          return {
            factory_effect_id: _factoryEffectId,
            model: item.model || 'checklist_record_answer'
          }
        }
        return {
          factory_effect_id: item,
          model: 'checklist_record_answer'
        }
      })
      .filter(Boolean)
  }
  const $_compactPayload = (payload = {}) => {
    return Object.entries(payload).reduce((acc, [key, value]) => {
      if (value === undefined || value === null || value === '') return acc
      if (Array.isArray(value) && value.length === 0) return acc
      acc[key] = value
      return acc
    }, {})
  }
  const $_toComparablePayload = (item) => {
    const _riskLevel = S_CheckListRecordAns.getRiskLevelScore(item, item?.answer_value)
    const _riskLevelNum = Number(_riskLevel)
    const _checklistQuestionVersionId =
      $_toIdValue(item?.checklist_question_version)
      || $_toIdValue(item?.checklist_question_version_id)
      || $_toIdValue(item?.id)
      || $_toIdValue(item?.last_version?.id)
    const _checklistQuestionId =
      $_toIdValue(item?.checklist_question)
      || $_toIdValue(item?.checklist_question_id)
    const _payload = {
      question_value: $_toQuestionValue(item),
      score: item?.score,
      risk_level: Number.isFinite(_riskLevelNum) ? _riskLevelNum : null,
      remark: item?.remark,
      images: $_toImages(item?.images),
      effects: $_toIdArray(item?.effects),
      factory_effects: $_toIdArray(item?.factory_effects),
      factory: factory?.id,
      lat: item?.latLng?.latitude,
      lng: item?.latLng?.longitude,
      ip: item?.ip,
      checklist_question_version: _checklistQuestionVersionId,
      checklist_question: _checklistQuestionId
    }
    return $_compactPayload(_payload)
  }
  const $_isSamePayload = (nextItem, prevItem) => {
    if (!nextItem || !prevItem) return false
    return JSON.stringify($_toComparablePayload(nextItem)) === JSON.stringify($_toComparablePayload(prevItem))
  }
  const $_runWithConcurrencyLimit = async (items = [], worker, limit = 6) => {
    const _limit = Math.max(1, Number(limit) || 1)
    const results = new Array(items.length)
    let cursor = 0
    const runner = async () => {
      while (cursor < items.length) {
        const currentIndex = cursor
        cursor += 1
        try {
          const value = await worker(items[currentIndex], currentIndex)
          results[currentIndex] = { status: 'fulfilled', value }
        } catch (reason) {
          results[currentIndex] = { status: 'rejected', reason }
        }
      }
    }
    const workers = Array.from({ length: Math.min(_limit, items.length) }, () => runner())
    await Promise.all(workers)
    return results
  }


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
    const _logPrefix = '[CheckListAssignmentResultSortDraft]'
    const _now = Date.now()
    const _inFlight = _submitBatchQualifiedInFlightRef.current
    const _isInCooldown = (_now - _lastSubmitBatchQualifiedAtRef.current) < $_BATCH_QUALIFIED_COOLDOWN_MS
    if (_inFlight || _isInCooldown) {
      Alert.alert('伺服器忙碌中，請稍後再試')
      return
    }
    _submitBatchQualifiedInFlightRef.current = true
    _lastSubmitBatchQualifiedAtRef.current = _now

    const $_submit = async () => {
      const _submitStartAt = Date.now()
      setBatchQualifiedLoading?.(true)
      try {
        const _myCheckedQuestionIds = checkedQuestions.filter(questionId => {
          const _question = questions.find(item => item?.id === questionId)
          const _checkers = _question?.question_setting?.checkers
          if (!_question?.question_setting) {
            return true
          }
          if (Array.isArray(_checkers) && _checkers.length === 0) {
            return true
          }
          return Array.isArray(_checkers) && _checkers.some(checker => String(checker?.id) === String(currentUser?.id))
        })
        const _blockedByCheckerCount = checkedQuestions.length - _myCheckedQuestionIds.length

        const _questions = S_CheckListQuestion.getQualifiedMyQuestions(questions, _myCheckedQuestionIds, currentUser.id, 25)
        setQuestions(_questions)
        store.dispatch(setCurrentChecklistRecordDraft(_questions))

        if (!checklistRecordId) {
          console.log(t('缺少點檢記錄ID，無法送出批次合格'))
          return
        }

        const _originalQuestionById = new Map((questions || []).map(item => [item?.id, item]))
        const _selectedQuestions = _questions.filter(item => _myCheckedQuestionIds.includes(item.id))
        const _targetQuestions = _selectedQuestions
          .filter(item => {
            if (!item?.recordAnsId) return true
            const _original = _originalQuestionById.get(item.id)
            return !_original || !$_isSamePayload(item, _original)
          })
        if (_targetQuestions.length === 0) {
          setQuestions(_questions)
          store.dispatch(setCurrentChecklistRecordDraft(_questions))
          console.log(`${_logPrefix} result: success=0, failed=0`)
          return
        }

        const _batchAnswers = _targetQuestions.map(item => {
          const _payload = $_toComparablePayload(item)
          const _questionValue = Array.isArray(_payload?.question_value)
            ? _payload.question_value
              .map(value => $_toIdValue(value))
              .filter(value => value !== undefined && value !== null && value !== '')
            : $_toIdValue(_payload?.question_value)
          const _effects = $_toIdArray(item?.effects)
          const _answerPayload = {
            question_value: _questionValue,
            score: _payload?.score,
            risk_level: _payload?.risk_level,
            remark: _payload?.remark,
            images: $_toImages(item?.images),
            checklist_question: $_toIdValue(_payload?.checklist_question),
            checklist_question_version: $_toIdValue(_payload?.checklist_question_version),
            effects: _effects,
            factory_effects: $_toFactoryEffectsPayload(item?.factory_effects),
            factory: currentFactoryId ?? 1,
            lat: _payload?.lat,
            lng: _payload?.lng,
            ip: _payload?.ip,
          }
          if (item?.recordAnsId) {
            _answerPayload.id = item.recordAnsId
          }
          return _answerPayload
        })
        const _firstBatchAnswer = _batchAnswers[0] || {}
        const _batchParams = {
          checklist_record_id: checklistRecordId,
          factory: String(currentFactoryId ?? 1),
          checklist_assignment: id,
          lat: _firstBatchAnswer?.lat,
          lng: _firstBatchAnswer?.lng,
          ip: _firstBatchAnswer?.ip,
          checklist_record_answers: _batchAnswers
        }
        console.log(JSON.stringify(_batchParams, null, 2))
        const _batchRes = await S_CheckListRecordAns.batch({ params: _batchParams })
        const _batchMessage = _batchRes?.message || _batchRes?.data?.message
        if (_batchMessage === 'This record has been completed.') {
          console.log(`${_logPrefix} ${_batchMessage}`)
        }
        const _latestAnswersRes = await S_CheckListRecordAns.indexV2({
          parentId: checklistRecordId
        })
        const _latestAnswers = Array.isArray(_latestAnswersRes?.data)
          ? _latestAnswersRes.data
          : []

        const _getAnsChecklistQuestionId = (ans) => {
          return ans?.checklist_question?.id
            || ans?.checklist_question_id
            || ans?.checklist_question
        }
        const _getAnsChecklistQuestionVersionId = (ans) => {
          return ans?.checklist_question_version?.id
            || ans?.checklist_question_version_id
            || ans?.checklist_question_version
        }
        const _recordAnsIdByQuestionId = {}
        _targetQuestions.forEach((item) => {
          const _questionId = item?.checklist_question?.id || item?.checklist_question
          const _questionVersionId =
            item?.checklist_question_version
            || item?.checklist_question_version_id
            || item?.last_version?.id

          let _responseAnswer = _latestAnswers.find(ans => (
            String(_getAnsChecklistQuestionId(ans) || '') === String(_questionId || '')
          ))
          if (!_responseAnswer && _questionVersionId) {
            _responseAnswer = _latestAnswers.find(ans => (
              String(_getAnsChecklistQuestionVersionId(ans) || '') === String(_questionVersionId || '')
            ))
          }
          const _recordAnsId = _responseAnswer?.id || item?.recordAnsId
          if (item?.id && _recordAnsId) {
            _recordAnsIdByQuestionId[item.id] = _recordAnsId
          }
        })
        const _mappedCount = Object.keys(_recordAnsIdByQuestionId).length
        const _unmappedCount = _targetQuestions.length - _mappedCount
        console.log(`${_logPrefix} batch recordAnsId mapped=${_mappedCount}, unmapped=${_unmappedCount}`)
        const _questionsWithRecordAnsId = _questions.map(item => ({
          ...item,
          recordAnsId: _recordAnsIdByQuestionId[item.id] || item.recordAnsId
        }))
        setQuestions(_questionsWithRecordAnsId)
        store.dispatch(setCurrentChecklistRecordDraft(_questionsWithRecordAnsId))

        const _failedCount = 0
        const _successCount = _targetQuestions.length
        console.log(`${_logPrefix} result: success=${_successCount}, failed=${_failedCount}`)
        if (_failedCount > 0) {
          console.log(t('批次合格送出失敗{number}題', { number: _failedCount }))
        }
      } catch (error) {
        const _batchErrorMessage = error?.response?.data?.message || error?.message
        if (_batchErrorMessage === 'This record has been completed.') {
          console.log(`${_logPrefix} ${_batchErrorMessage}`)
        }
        console.error(`${_logPrefix} S_CheckListRecordAns.batch failed`, error)
        console.log(`${_logPrefix} result: success=0, failed=${checkedQuestions?.length || 0}`)
      } finally {
        const _durationMs = Date.now() - _submitStartAt
        console.log(`${_logPrefix} $_SubmitBatchQualified completed in ${_durationMs}ms`)
        _submitBatchQualifiedInFlightRef.current = false
        setBatchQualifiedLoading?.(false)
      }
    }
    $_submit()
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
    const _checkboxVisible = !todayDone
    const _checkedQuestionIds = (questions || [])
      .filter(answer => {
        const isNotCompleted = answer?.is_completed !== 1
        const hasUpdatedUser = !!answer?.updated_user
        const isUpdatedByCurrentUser = answer?.updated_user?.id === currentUser?.id
        const canEditWhenNoUpdatedUser =
          !!currentUser &&
          _checkboxVisible &&
          answer?.question_type_setting?.value === 'single-choice' &&
          (
            answer?.question_setting == null ||
            !answer?.question_setting?.checkers?.length ||
            answer?.question_setting?.checkers?.some(checker => checker.id === currentUser?.id)
          )
        const canEdit =
          isNotCompleted &&
          (
            (hasUpdatedUser && isUpdatedByCurrentUser) ||
            (!hasUpdatedUser && canEditWhenNoUpdatedUser)
          )
        return canEdit
      })
      .map(item => item?.id)
      .filter(Boolean)
    setCheckedQuestioned(_checkedQuestionIds)
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
                              locationVisible={false}
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
                                    checklistRecordId: checklistRecordId,
                                    questionId: item?.checklist_question?.id,
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
