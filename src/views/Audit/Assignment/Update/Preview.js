import React from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import {
  WsState,
  WsStepsTab,
  WsText,
  WsSkeleton,
  WsTabView,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  WsPaddingContainer,
  WsFlex,
  WsInfo,
  WsModal,
  WsIconBtn,
  WsBtn,
  WsIcon,
  WsModalFooter,
  WsGradientButton,
  WsPopup
} from '@/components'
import S_Audit from '@/services/api/v1/audit'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AuditChaptersSortDraft from '@/sections/Audit/AuditChaptersSortDraft'
import AuditRecordsSortDraft from '@/sections/Audit/AuditRecordsSortDraft'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'
import AuditAssignmentOverview from '@/sections/Audit/AuditAssignmentOverview'

const Preview = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Params
  const { requestId, auditId, _questions, drafts, draftsSortedByChapter } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const factory = useSelector(state => state.data.currentFactory)
  const currentAuditRecordDraft = useSelector(state => state.data.currentAuditRecordDraft)

  // State
  const [popupActive, setPopupActive] = React.useState(false)

  const [questions, setQuestions] = React.useState(drafts ? drafts : _questions ? _questions : [])
  const [answers, setAnswers] = React.useState(drafts ? drafts : [])
  const [answersSortedByChapter, setAnswersSortedByChapter] = React.useState(draftsSortedByChapter ? draftsSortedByChapter : [])

  const [loading, setLoading] = React.useState(true)
  const [btnRightDisable, setBtnRightDisable] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [isAlertVisible, setIsAlertVisible] = React.useState(false);

  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()

  const [audit, setAudit] = React.useState()
  const [request, setRequest] = React.useState()

  // TabView
  const [tabIndex, settabIndex] = React.useState(2)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'AuditAssignmentOverview',
      label: t('總覽'),
      view: AuditAssignmentOverview,
      props: {
        requestId: requestId,
        auditId: auditId,
        _questions: _questions,
        drafts: drafts,
        draftsSortedByChapter: draftsSortedByChapter,

        setStateModal: setStateModal,
        remark: remark,
        remarkImages: remarkImages
      }
    },
    {
      value: 'AuditRecordsSort',
      label: t('依結果排序'),
      view: AuditRecordsSortDraft,
      props: {
        requestId: requestId,
        auditId: auditId,
        navigation: navigation,
      }
    },
    {
      value: 'AuditChaptersSort',
      label: t('依章節排序'),
      view: AuditChaptersSortDraft,
      props: {
        requestId: requestId,
        auditId: auditId,
        navigation: navigation
      }
    }
  ])

  // 取得稽核資料 與 稽核草稿
  const $_fetchRequest = async () => {
    const res = await S_AuditRequest.show({ modelId: requestId })
    setRequest(res)
    if (res.record_draft) {
      const _draft = await S_AuditRequest.getAuditRecordDraft(res.record_draft.id)
      setQuestions(_draft)
    }
    setLoading(false)
  }

  // 送出稽核結果
  const $_putApi = async () => {
    const _formattedQuestions = await S_AuditRequest.formattedQuestionsForAPI(currentAuditRecordDraft ? currentAuditRecordDraft : questions)
    const submitValue = await S_AuditRequest.getFormattedData(
      requestId,
      request,
      currentUser,
      auditId,
      audit,
      factory,
      remark,
      remarkImages,
      _formattedQuestions
    )
    console.log(auditId, 'auditId=');
    console.log(JSON.stringify(submitValue), 'submitValue=');
    try {
      await S_AuditRecord.create(auditId, submitValue)
      store.dispatch(setCurrentAuditRecordDraft(null))
    } catch (e) {
      Alert.alert('稽核送出失敗')
      console.error(e);
    }
  }

  // 取得稽核表
  const $_fetchAudit = async () => {
    const res = await S_Audit.show({ modelId: auditId })
    setAudit(res)
  }

  // 把所有題目整理成要顯示的格式
  const $_fetchQuestion = async () => {
    const chapters = audit && audit.last_version && audit.last_version.chapters ? audit.last_version.chapters : []
    const _questions = await S_AuditRequest.formattedQuestionWithDraft(
      questions,
      drafts
    )
    // 依結果排序
    const res = await S_AuditRequest.getSortedResultsDraft(_questions, chapters)
    setAnswers(res)
    // 依章節排序
    const _res = await S_AuditRequest.getSortedChapterDraft(_questions, chapters)
    setAnswersSortedByChapter(_res)
    setLoading(false)
  }

  // Function
  const $_onHeaderRightPress = () => {
    $_putApi()
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'AuditAssignment',
          params: {
          }
        }
      ],
      key: null
    })
  }

  // 儲存稽核草稿
  const $_saveDraft = async () => {
    const _formattedQuestions =
      S_AuditRequest.formattedQuestionsForDraftAPI(currentAuditRecordDraft)
    const res = await S_AuditRequest.createDraft({
      audit_request: requestId,
      content: _formattedQuestions
    }).then(() => {
      console.log('$_saveDraft success');
      Alert.alert('儲存草稿成功')
      navigation.push('AuditAssignment')
    }).catch(e => {
      Alert.alert('儲存草稿失敗')
      console.error(e);
    })
  }

  //  送出前驗證
  const $_submitValidation = () => {
    let _validation
    if (currentAuditRecordDraft) {
      _validation = S_AuditRequest.validationQuestionSubmit(
        currentAuditRecordDraft,
        remark
      )
      if (_validation == '稽核總評尚未填寫' &&
        stateModal == false &&
        !isAlertVisible) {
        settabIndex(0)
        setBtnRightDisable(true)
        if (!isAlertVisible) {
          Alert.alert(
            t('稽核總評尚未填寫'),
            "",
            [
              {
                text: "前往填寫",
                onPress: () => {
                  setStateModal(true)
                  setIsAlertVisible(true);
                }
              }
            ]
          )
        }
      }
      if (_validation === '已完成答題') {
        setBtnRightDisable(false)
      } else {
        setBtnRightDisable(true)
      }
    } else {
      _validation = S_AuditRequest.validationQuestionSubmit(
        questions,
        remark
      )
      if (_validation == '稽核總評尚未填寫' &&
        stateModal == false &&
        !isAlertVisible) {
        settabIndex(0)
        setBtnRightDisable(true)
        if (!isAlertVisible) {
          Alert.alert(
            t('稽核總評尚未填寫'),
            "",
            [
              {
                text: "前往填寫",
                onPress: () => {
                  setStateModal(true)
                  setIsAlertVisible(true);
                }
              }
            ]
          )
        }
      }
      if (_validation === '已完成答題') {
        setBtnRightDisable(false)
      } else {
        setBtnRightDisable(true)
      }
    }
  }

  const $_onHeaderLeftPress = () => {
    navigation.goBack()
  }

  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              testID={'送出'}
              isDisabled={btnRightDisable}
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16
              }}
              onPress={$_onHeaderRightPress}>
              {t('送出')}
            </WsBtn>
          </>
        )
      },
      headerLeft: () => (
        <>
          <WsIconBtn
            name={'md-arrow-back'}
            onPress={() => {
              setPopupActive(true)
            }}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }

  // Function
  const $_refreshTabItems = () => {
    const _tabItems = [
      {
        value: 'AuditAssignmentOverview',
        label: t('總覽'),
        view: AuditAssignmentOverview,
        props: {
          requestId: requestId,
          auditId: auditId,
          _questions: _questions,
          drafts: drafts,
          draftsSortedByChapter: draftsSortedByChapter,

          setStateModal: setStateModal,
          remark: remark,
          remarkImages: remarkImages
        }
      },
      {
        value: 'AuditRecordsSort',
        label: t('依結果排序'),
        view: AuditRecordsSortDraft,
        props: {
          requestId: requestId,
          auditId: auditId,
          navigation: navigation,
          questions: questions,
          answers: answers,
        },
      },
      {
        value: 'AuditChaptersSort',
        label: t('依章節排序'),
        view: AuditChaptersSortDraft,
        props: {
          requestId: requestId,
          auditId: auditId,
          navigation: navigation,
          questions: questions,
          answers: answersSortedByChapter,
        }
      }
    ]
    setTabItems(_tabItems)
  }

  React.useEffect(() => {
    if (auditId) {
      $_fetchAudit()
      $_fetchRequest()
      $_setNavigationOptions()
    }
  }, [auditId])

  React.useEffect(() => {
    if (currentAuditRecordDraft) {
      setQuestions(currentAuditRecordDraft)
    }
  }, [currentAuditRecordDraft])

  React.useEffect(() => {
    $_fetchQuestion()
    $_setNavigationOptions()
  }, [currentAuditRecordDraft, btnRightDisable, tabIndex])

  React.useEffect(() => {
    if (!remark && tabIndex === 0) {
      $_submitValidation()
    }
  }, [btnRightDisable, tabIndex])


  React.useEffect(() => {
    if (audit && questions) {
      $_fetchQuestion()
    }
  }, [audit, questions])

  React.useEffect(() => {
    if (answers && answersSortedByChapter) {
      $_refreshTabItems()
    }
  }, [answers, answersSortedByChapter, isAlertVisible])

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

          <WsTabView
            isAutoWidth={true}
            index={tabIndex}
            setIndex={settabIndex}
            items={tabItems}
            scrollEnabled={false}
          />

          <WsModalFooter
            btnLeftText={t('儲存草稿')}
            btnLeftOnPress={() => {
              $_saveDraft()
            }}
            btnRightText={t('送出')}
            btnRightDisable={btnRightDisable}
            btnRightOnPress={() => {
              $_onHeaderRightPress()
            }}
          />
          <WsModal
            visible={stateModal}
            onBackButtonPress={() => {
              setStateModal(false)
            }}
            headerLeftOnPress={() => {
              if (remark != undefined &&
                remark.trim() != '' &&
                remark.length !== 0) {
                setBtnRightDisable(false)
                setIsAlertVisible(false)
                setStateModal(false)
              } else {
                setBtnRightDisable(true)
                setIsAlertVisible(false)
                setStateModal(false)
              }
            }}
            headerRightText={t('儲存')}
            RightOnPressIsDisabled={remark ? false : true}
            headerRightOnPress={() => {
              if (remark != undefined && remark.trim() !== '') {
                setBtnRightDisable(false)
                setStateModal(false)
                setIsAlertVisible(false)
              } else {
                Alert.alert(
                  t('稽核總評尚未填寫'),
                  "",
                  [
                    {
                      text: t("繼續填寫"),
                      onPress: () => {
                        setBtnRightDisable(true)
                      }
                    }
                  ]
                )
              }
            }}
            animationType="slide"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View
                  style={{
                    padding: 16,
                    // borderWidth: 1
                  }}
                >
                  <WsState
                    label={t('稽核結果總評')}
                    labelIcon={'ws-outline-edit-pencil'}
                    autoFocus={true}
                    multiline={true}
                    style={{
                      // borderWidth: 1,
                    }}
                    rules={'required'}
                    placeholder={t(`請寫下檢查當場處理情況、以及填報當場未能解決之問題。`)}
                    value={remark}
                    onChange={e => {
                      setRemark(e)
                    }}
                  />
                  {factory && (
                    <WsState
                      style={{
                        paddingVertical: 16,
                      }}
                      type="Ll_filesAndImages"
                      label={t('圖片')}
                      labelIcon={'md-photo'}
                      value={remarkImages}
                      onChange={setRemarkImages}
                      modelName="audit_record"
                      uploadUrl={`factory/${factory.id}/audit_record/image`}
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </WsModal>
        </>
      )}

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              flex: 1,
            }}
          >{t('確定捨棄嗎？')}
          </WsText>
          <WsFlex
            flexWrap={'wrap'}
            justifyContent={'flex-end'}
            alignItems="flex-end"
            style={{
            }}
          >
            <TouchableOpacity
              style={{
                paddingVertical: 9,
                paddingHorizontal: 16,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: 110,
                height: 48
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                // borderWidth:1,
                width: 110
              }}
              onPress={() => {
                $_onHeaderLeftPress()
                setPopupActive(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default Preview
