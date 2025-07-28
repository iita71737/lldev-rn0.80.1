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
  WsModalFooter
} from '@/components'
import S_Audit from '@/services/api/v1/audit'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'

const AuditAssignmentOverview = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    requestId,
    auditId,
    _questions,
    drafts,
    draftsSortedByChapter,

    remarkImages,
    setRemarkImages,
    setStateModal,
    remark,
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const factory = useSelector(state => state.data.currentFactory)
  const currentAuditRecordDraft = useSelector(state => state.data.currentAuditRecordDraft)

  // State
  const [questions, setQuestions] = React.useState(drafts ? drafts : _questions ? _questions : [])
  const [answers, setAnswers] = React.useState(drafts ? drafts : [])
  const [answersSortedByChapter, setAnswersSortedByChapter] = React.useState(draftsSortedByChapter ? draftsSortedByChapter : [])

  const [loading, setLoading] = React.useState(true)

  const [audit, setAudit] = React.useState()
  const [request, setRequest] = React.useState()

  // 取得稽核資料 與 稽核草稿
  const $_fetchRequest = async () => {
    const res = await S_AuditRequest.show({ modelId: requestId })
    setRequest(res)
    if (res.record_draft) {
      const _draft = await S_AuditRequest.getAuditRecordDraft(res.record_draft.id)
      // setDrafts(_draft)
    }
    setLoading(false)
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

  // 儲存稽核草稿
  const $_saveDraft = async () => {
    const _formattedQuestions =
      S_AuditRequest.formattedQuestionsForDraftAPI(currentAuditRecordDraft)
    const res = await S_AuditRequest.createDraft({
      audit_request: requestId,
      content: _formattedQuestions
    })
      .then(() => {
        console.log('$_saveDraft success');
        Alert.alert('儲存草稿成功')
        navigation.push('AuditAssignment')
      })
      .catch(e => {
        Alert.alert('儲存草稿失敗')
        console.error(e);
      })
  }

  const $_onHeaderLeftPress = () => {
    navigation.goBack()
  }

  // const $_setNavigationOptions = () => {
  //   navigation.setOptions({
  //     headerRight: () => {
  //       return (
  //         <>
  //           <WsBtn
  //             isDisabled={btnRightDisable}
  //             minHeight={40}
  //             isFullWidth={false}
  //             style={{
  //               marginRight: 16
  //             }}
  //             onPress={$_onHeaderRightPress}>
  //             {t('送出')}
  //           </WsBtn>
  //         </>
  //       )
  //     },
  //     headerLeft: () => (
  //       <>
  //         <WsIconBtn
  //           name={'md-arrow-back'}
  //           onPress={$_onHeaderLeftPress}
  //           size={22}
  //           color={$color.white}
  //         />
  //       </>
  //     )
  //   })
  // }

  React.useEffect(() => {
    if (auditId) {
      $_fetchAudit()
      $_fetchRequest()
      // $_setNavigationOptions()
    }
  }, [auditId])

  React.useEffect(() => {
    if (currentAuditRecordDraft) {
      setQuestions(currentAuditRecordDraft)
    }
  }, [currentAuditRecordDraft])

  React.useEffect(() => {
    $_fetchQuestion()
    // $_setNavigationOptions()
  }, [currentAuditRecordDraft, remark])

  React.useEffect(() => {
    if (audit && questions) {
      $_fetchQuestion()
    }
  }, [audit, questions])

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
        <ScrollView
          style={{
            flex: 1,
            // borderWidth: 2
          }}
        >
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginVertical: 16
            }}>
            <LlRiskHeaderCalc answers={drafts ? drafts : currentAuditRecordDraft !== null ? currentAuditRecordDraft : []} type={"audit"} />
            <LlEffectWithAuditRisk answers={drafts ? drafts : currentAuditRecordDraft !== null ? currentAuditRecordDraft : []} />
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginBottom: 8
            }}>
            <WsFlex justifyContent="space-between" alignItems="flex-start">
              {request && request.auditors && (
                <WsInfo
                  style={{ flex: 1 }}
                  label={t('稽核者')}
                  value={request.auditors}
                  type="users"
                  isUri={true}
                />
              )}
              {request && request.auditees && (
                <WsInfo
                  style={{ flex: 1 }}
                  label={t('受稽者')}
                  value={request.auditees}
                  type="users"
                  isUri={true}
                />
              )}
            </WsFlex>
          </WsPaddingContainer>
          <WsPaddingContainer
            style={{
              backgroundColor: remark ? $color.white : $color.danger10l,
              marginBottom: 8
            }}>
            <WsFlex justifyContent="space-between">
              <WsText fontWeight="700" size={14}>
                {t('稽核總評')}
              </WsText>
              <TouchableOpacity
                onPress={() => {
                  setStateModal(true)
                }}>
                <WsText fontWeight="700" size={14} color={$color.primary}>
                  {t('填寫稽核總評')}
                </WsText>
              </TouchableOpacity>
            </WsFlex>
            <WsText
              size={12}
              color={remark ? $color.black : $color.danger}
              style={{
              }}>
              {remark ? remark : `${t('稽核者尚未填寫總評')}`}
            </WsText>
            {!remark && (
              <WsFlex
                style={{
                  marginTop: 4
                }}
              >
                <WsIcon name={'md-info-outline'} size={16} color={$color.danger} />
                <WsText
                  style={{
                    marginLeft: 4
                  }}
                  color={$color.danger}
                  size={12}>
                  {t('此項目為必填')}
                </WsText>
              </WsFlex>
            )
            }
            {remarkImages &&
              remarkImages.length > 0 && (
                <WsInfo
                  style={{
                    marginTop: 8
                  }}
                  type="filesAndImages"
                  label={t('附件')}
                  value={remarkImages}
                />
              )}
          </WsPaddingContainer>
        </ScrollView>
      )
      }
    </>
  )
}

export default AuditAssignmentOverview
