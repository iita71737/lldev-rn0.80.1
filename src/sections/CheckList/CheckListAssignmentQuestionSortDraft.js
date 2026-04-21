import React, { useCallback, useEffect, useRef } from 'react'
import {
  ScrollView,
  View,
  StatusBar,
  FlatList,
  Dimensions,
  Modal,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  AppState
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
  WsGradientButton,
  WsNavCheck,
  WsLoading,
  WsPopup,
  WsInfo
} from '@/components'
import { useSelector } from 'react-redux'
import LlCheckListQuestionCard002 from '@/components/LlCheckListQuestionCard002'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import store from '@/store'
import {
  setCurrentChecklistRecordDraft,
  setCurrentLatLng
} from '@/store/data'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import CheckBox from '@react-native-community/checkbox'
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment'
import ViewCheckListQuestionShow from '@/views/CheckListQuestionTemplate/Show'
import Geolocation from '@react-native-community/geolocation';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings'
import { getLocation, getGeocode } from '@/__reactnative_stone/global/location'

const CheckListAssignmentQuestionSortDraft = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const appState = useRef(AppState.currentState);

  // Props
  const {
    id,
    versionId,
    questions,
    drafts,
    checklistRecordId,
    setQuestions,
    todayDone,
    questionFilteredBtnVisible = true,
    setBatchQualifiedLoading,
  } = props
  // 判斷是否為臨時點檢作業
  const hasQuestionSettingEverywhere = questions.every(question => "question_setting" in question);

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentLatLng = useSelector(state => state.data.currentLatLng)

  // States
  const [selectedIndex, setSelectedIndex] = React.useState()
  const [selectedItem, setSelectedItem] = React.useState()
  const [popupActive003, setPopupActive003] = React.useState(false)

  const [checkedQuestions, setCheckedQuestioned] = React.useState([])
  const [questionFiltered, setQuestionFiltered] = React.useState(
    questionFilteredBtnVisible && hasQuestionSettingEverywhere ? true : false
  )
  const [myQuestions, setMyQuestions] = React.useState()
  const [questionsCopy, setQuestionsCopy] = React.useState(questions) // 240508-prevent-tab-view-re-render-issue

  const $_toIdArray = (items) => {
    if (!Array.isArray(items)) return []
    return items
      .map(item => (item && typeof item === 'object' ? item.id : item))
      .filter(Boolean)
  }

  // HELPER
  const $_getScoreTextV5 = (answer) => {
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
          : _score == 22 ?
            `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
            : _score == 23 ?
              `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
              : _score == 25 ?
                `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
                : `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${answer.answer_value}`
          : _score == 22 ?
            `${answer.answer_value}`
            : _score == 23 ?
              `${answer.answer_value}`
              : _score == 25 ?
                `${answer.answer_value}`
                : `${answer.answer_value}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value}${_unit ? _unit : ''}`
          : _score == 22 ?
            `${answer.answer_value}${_unit ? _unit : ''}`
            : _score == 23 ?
              `${answer.answer_value}${_unit ? _unit : ''}`
              : `${answer.answer_value}${_unit ? _unit : ''}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) &&
      answer.answer_value[0]
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
          : _score == 22 ?
            `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
            : _score == 23 ?
              `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
              : _score == 25 ?
                `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
                : ``
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) &&
      answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value ? answer.answer_value.label : ''}`
          : _score == 22 ?
            `${answer.answer_value ? answer.answer_value.label : ''}`
            : _score == 23 ?
              `${answer.answer_value ? answer.answer_value.label : ''}`
              : _score == 25 ?
                `${answer.answer_value ? answer.answer_value.label : ''}`
                : ``
    }
    else {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
          : _score == 22 ?
            `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
            : _score == 23 ?
              `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
              : _score == 25 ?
                `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
                : `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
    }
  }
  const $_getScoreTextV4 = (answer) => {
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return `${t('觀測日期')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return `${t('觀測內容')}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return `${t('觀測值')}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) && // 確認是陣列
      answer.answer_value[0]
    ) {
      return `${t('選項')}`
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) && // 確認不是陣列（可能是字串或物件）
      answer.answer_value
    ) {
      return `${t('選項')}`
    }
    else {
      return ``
    }
  }
  const $_getScoreIconColorV3 = (answer) => {
    const _score = answer.risk_level
    return _score == 23
      ? $color.danger
      : _score == 22
        ? $color.yellow
        : _score == 21
          ? $color.primary
          : _score == 25
            ? $color.green
            : $color.gray;
  }
  const $_getScoreIconV3 = (answer) => {
    const _score = answer.risk_level
    return _score == 21 || _score == 22 || _score == 23 ? 'ws-filled-warning' : 'md-check-circle'
  }
  const $_getScoreTextV3 = (answer) => {
    // const { t, i18n } = useTranslation(); // crash
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    return answer.answer_value == null || Number.isNaN(answer.answer_value)
      ? `${t('未答題')}`
      : _score == 21 ?
        `${t('低風險')}`
        : _score == 22 ?
          `${t('中風險')}`
          : _score == 23 ?
            `${t('高風險')}`
            : _score == 25 ?
              `${t('無異常')}`
              : `${t('不涉及風險')}`
  }
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

  const $_filterMyQuestions = () => {
    // FILTER MY QUESTIONS
    const _answer = S_CheckListQuestion.getFormattedMyQuestionSortedBySequence(questions, currentUser.id)
    setQuestionFiltered(!questionFiltered)
    setMyQuestions(_answer)
  }
  // FORMATTED
  const $_SubmitBatchQualified = () => {
    const $_submit = async () => {
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

        const _questions = S_CheckListQuestion.getQualifiedMyQuestions(questions, _myCheckedQuestionIds, currentUser.id, 25).map(item => {
          return {
            ...item,
            latLng: {
              latitude: currentLatLng?.latitude,
              longitude: currentLatLng?.longitude
            }
          };
        })
        setQuestions(_questions)
        setQuestionsCopy(_questions)
        store.dispatch(setCurrentChecklistRecordDraft(_questions))

        if (!checklistRecordId) {
          console.log(t('缺少點檢記錄ID，無法送出批次合格'))
          return
        }

        const _targetQuestions = _questions.filter(item => _myCheckedQuestionIds.includes(item.id))
        console.log(JSON.stringify(_targetQuestions), '_targetQuestions')
        const _results = await Promise.allSettled(
          _targetQuestions.map(async item => {
            const _questionValue = typeof item?.answer_value === 'string'
              ? item.answer_value
              : Array.isArray(item?.answer_value)
                ? item.answer_value.map(ans => ans?.id).filter(Boolean)
                : item?.answer_value && typeof item.answer_value === 'object'
                  ? [item.answer_value?.id]
                  : item?.answer_value

            const _riskLevel = S_CheckListRecordAns.getRiskLevelScore(item, item?.answer_value)
            const _riskLevelNum = Number(_riskLevel)

            const _params = {
              checklist_record: checklistRecordId,
              question_value: _questionValue,
              score: item?.score,
              risk_level: Number.isFinite(_riskLevelNum) ? _riskLevelNum : null,
              remark: item?.remark,
              images: item?.images ? S_CheckListRecordAns.formattedForFileStore(item.images) : [],
              effects: $_toIdArray(item?.effects),
              factory_effects: $_toIdArray(item?.factory_effects),
              factory: currentFactory?.id,
              lat: item?.latLng?.latitude ?? currentLatLng?.latitude,
              lng: item?.latLng?.longitude ?? currentLatLng?.longitude,
              ip: item?.ip,
              checklist_question_version: item?.checklist_question_version
                || item?.checklist_question_version_id
                || item?.id
                || item?.last_version?.id,
              checklist_question: item?.checklist_question?.id
            }
            if (item?.recordAnsId) {
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
              console.log(_updateData, 'update _updateData')
              return S_CheckListRecordAns.update({
                modelId: item.recordAnsId,
                data: _updateData
              })
            }
            console.log(_params, 'create _params')
            return S_CheckListRecordAns.create({ params: _params })
          })
        )

        const _recordAnsIdByQuestionId = {}
        _results.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            const _questionId = _targetQuestions[idx]?.id
            const _recordAnsId = result.value?.id || result.value?.data?.id || _targetQuestions[idx]?.recordAnsId
            if (_questionId && _recordAnsId) {
              _recordAnsIdByQuestionId[_questionId] = _recordAnsId
            }
          }
        })
        const _questionsWithRecordAnsId = _questions.map(item => ({
          ...item,
          recordAnsId: _recordAnsIdByQuestionId[item.id] || item.recordAnsId
        }))
        setQuestions(_questionsWithRecordAnsId)
        setQuestionsCopy(_questionsWithRecordAnsId)
        store.dispatch(setCurrentChecklistRecordDraft(_questionsWithRecordAnsId))

        const _failedCount = _results.filter(result => result.status === 'rejected').length
        if (_failedCount > 0) {
          console.log(t('批次合格送出失敗{number}題', { number: _failedCount }))
        }
      } finally {
        setBatchQualifiedLoading?.(false)
      }
    }
    $_submit()
  }

  // ADD_TO_FOR_BATCH
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
    const _checkedAllQuestions = S_CheckListQuestion.checkedAllMyQuestions(questions, currentUser?.id)
    setCheckedQuestioned(_checkedAllQuestions)
  }

  const $_requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    const result = await check(permission);
    console.log('權限檢查結果:', result);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const requestResult = await request(permission);
      console.log('權限請求結果:', requestResult);
      return requestResult === RESULTS.GRANTED;
    }
    if (result === RESULTS.BLOCKED) {
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
      return false;
    }
    // unavailable 或其他情況
    return false;
  };


  // GET LOCATION
  const $_getLocation = async () => {
    const granted = await $_requestLocationPermission();
    if (!granted) {
      console.log('使用者未授權定位');
      return;
    }
    try {
      const myLocation = await getLocation()
      store.dispatch(setCurrentLatLng(myLocation))
    } catch (e) {
      console.log(e, 'e');
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      $_getLocation()
    }, [])
  );

  React.useEffect(() => {
    if (questionFilteredBtnVisible && questions && currentUser) {
      const _answer = S_CheckListQuestion.getFormattedMyQuestionSortedBySequence(questions, currentUser.id)
      setMyQuestions(_answer)
    }
  }, [questionFilteredBtnVisible, questions, currentUser?.id])

  // 我的題目狀態下送批次合格RE-RENDER
  React.useEffect(() => {
    if (questions) {
      setQuestionsCopy(questions)
    }
    if (questionFilteredBtnVisible && questions && questionFiltered && currentUser) {
      const _answer = S_CheckListQuestion.getFormattedMyQuestionSortedBySequence(questions, currentUser.id)
      setMyQuestions(_answer)
    }
  }, [questions])

  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      <FlatList
        testID={'flatList'}
        data={
          questionFiltered
            ? (myQuestions || questionsCopy || [])
            : (questionsCopy || [])
        }
        keyExtractor={(item, index) => item.id}
        renderItem={({ item, index }) => {
          return (
            <LlCheckListQuestionCard002
              testID={`LlCheckListQuestionCard002-${index}`}
              locationVisible={false}
              key={item.id}
              done={todayDone}
              checkboxVisible={todayDone ? false : true}
              checkboxVisible={true}
              checked={checkedQuestions.includes(item.id)}
              checkboxOnPress={(answer) => {
                $_addToBatchQualified(answer)
              }}
              onPress={() => {
                if (
                  item.last_version &&
                  item.last_version.updated_at &&
                  item.updated_at &&
                  moment.utc(item.last_version.updated_at).isAfter(moment.utc(item.answer_updated_at)) &&
                  item.isNeedCheckAns
                ) {
                  setSelectedIndex(index)
                  setSelectedItem(item)
                  setPopupActive003(true)
                } else {
                  navigation.push('RoutesCheckList', {
                    screen: 'CheckListAssignmentProcedure',
                    params: {
                      id: id,
                      versionId: versionId,
                      checklistRecordId: checklistRecordId,
                      questionId: item?.checklist_question?.id,
                      // drafts: drafts,
                      allQuestions: questionsCopy
                    }
                  })
                }
              }}
              style={{
                marginTop: 8,
                // borderWidth:1,
              }}
              no={index + 1}
              answer={item}
              title={item.title}
              score={item.score}
              cardColor={$_validation(item)}
            />
          )
        }}
        ListHeaderComponent={() => {
          return (
            <>
              <WsFlex
                justifyContent="flex-end"
                style={{
                  marginTop: 12
                }}
              >
                <WsGradientButton
                  style={{
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

              <WsFlex
                justifyContent="space-between"
                style={{ marginTop: 12 }}
              >
                {myQuestions && myQuestions.length > 0 && (
                  <WsText
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16
                    }}
                    fontWeight="bold">
                    {i18next.t('題目')}
                    {'（ '}
                    {questionFiltered ? t('共{number}題', { number: myQuestions.length }) : t('共{number}題', { number: questions.length })}
                    {' ）'}
                  </WsText>
                )}

                {questionFilteredBtnVisible && (
                  <TouchableOpacity
                    style={{
                      marginRight: 16,
                      alignItems: 'flex-start',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      backgroundColor: $color.white,
                      borderColor: $color.primary,
                      borderWidth: 1,
                      borderRadius: 25,
                    }}
                    disabled={!currentUser || !questions || questions.length === 0}
                    onPress={() => {
                      $_filterMyQuestions()
                    }}>
                    <WsText
                      color={$color.primary}
                    >
                      {questionFiltered ? t('顯示全部題目') : t('只顯示我的題目')}
                    </WsText>
                  </TouchableOpacity>
                )}
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

      <WsPopup
        active={popupActive003}
        onClose={() => {
          // 引導選擇其一按鈕，不給關閉
          // setPopupActive003(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('題目已變更，是否保留先前作答、備註、附件？若題型變更，僅會保留備註與附件')}
          </WsText>
          {selectedItem && (
            <View
              style={{
                paddingVertical: 100,
                height: height * 0.8,
                width: width * 0.9
              }}
            >
              {selectedItem && (
                <>
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                    }}
                  >
                    <WsInfo
                      style={{
                        paddingLeft: 16,
                        flexDirection: 'row'
                      }}
                      label={t('作答')}
                      value={' '}
                    />
                    <WsText
                      style={{
                      }}
                      fontWeight="600"
                      size={14}
                    >
                      {$_getScoreTextV4(selectedItem)}
                    </WsText>
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={14}
                    >
                      {$_getScoreTextV5(selectedItem)}
                    </WsText>
                  </WsFlex>
                </>
              )}
              {$_getScoreTextV3(selectedItem) && (
                <>
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                    }}
                  >
                    <WsInfo
                      style={{
                        paddingLeft: 16,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      label={t('風險')}
                      value={' '}
                    />
                    <WsIcon
                      style={{
                      }}
                      name={$_getScoreIconV3(selectedItem)}
                      size={20}
                      color={$_getScoreIconColorV3(selectedItem)}
                    />
                    <WsText
                      style={{
                        marginLeft: 8,
                      }}
                      size={14}
                      fontWeight="600"
                    >
                      {$_getScoreTextV3(selectedItem)}
                    </WsText>
                  </WsFlex>
                </>
              )}
              <ViewCheckListQuestionShow
                id={selectedItem?.id}
              ></ViewCheckListQuestionShow>
            </View>
          )}
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              testID={'保留答案'}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupActive003(false)
                navigation.push('RoutesCheckList', {
                  screen: 'CheckListAssignmentProcedure',
                  params: {
                    id: id,
                    versionId: versionId,
                    checklistRecordId: checklistRecordId,
                    questionId: selectedItem?.checklist_question?.id || selectedItem?.id,
                    drafts: drafts,
                    allQuestions: questionsCopy,
                    clearIsNeedCheckAnsIndex: selectedIndex
                  }
                })
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('保留答案')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              btnColor={[$color.danger, $color.danger5l]}
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupActive003(false)
                navigation.push('RoutesCheckList', {
                  screen: 'CheckListAssignmentProcedure',
                  params: {
                    id: id,
                    versionId: versionId,
                    checklistRecordId: checklistRecordId,
                    questionId: selectedItem?.checklist_question?.id || selectedItem?.id,
                    drafts: drafts,
                    allQuestions: questionsCopy,
                    clearIndex: selectedIndex
                  }
                })
              }}>
              {t('清除答案')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default CheckListAssignmentQuestionSortDraft
