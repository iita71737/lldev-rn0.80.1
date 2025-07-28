import React from 'react'
import { Pressable, ScrollView, View, SafeAreaView, Dimensions } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsBtn,
  WsBottomSheet,
  WsGradientButton
} from '@/components'
import moment from 'moment'
import { useSelector } from 'react-redux'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_Audit from '@/services/api/v1/audit'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'

const AuditAssignmentRequestIntroduction = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  // Params
  const { requestId, auditId } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [assignment, setAssignment] = React.useState()
  const [audit, setAudit] = React.useState()
  const [questionsCount, setQuestionsCount] = React.useState()
  const [questions, setQuestions] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [drafts, setDrafts] = React.useState()
  const [draftsSortedByChapter, setDraftsSortedByChapter] = React.useState()

  // Services
  const $_fetchAudit = async () => {
    const res = await S_AuditRequest.show({ modelId: requestId })
    setAssignment(res)
    const _audit = await S_Audit.show({ modelId: res.audit_id })
    setAudit(_audit)
    const _versions = await S_AuditVersion.show(_audit.last_version.id)
    const _totalQuesCount = _versions.select_audit_question_templates_count + _versions.custom_audit_questions_count
    const _selectedTemplateQuestionIds = _versions.audit_question_templates
    setQuestionsCount(_totalQuesCount)
    const _params = {
      audit_versions: _audit.last_version.id
    }
    const _questions = await S_AuditQuestionVersion.indexV2({ params: _params })
    const chapters = _audit && _audit.last_version && _audit.last_version.chapters ? _audit.last_version.chapters : []
    // 初始化題目排序
    const __questionsSorted = S_AuditQuestionVersion.questionsSorted(_questions.data, chapters)
    // 挑出有選取的公版題目
    const _formattedQues = S_AuditQuestionVersion.formattedQues(__questionsSorted, _selectedTemplateQuestionIds)
    setQuestions(_formattedQues)
    setLoading(false)
  }

  // 取得稽核資料 與 稽核草稿
  const $_fetchRequest = async () => {
    try {
      const res = await S_AuditRequest.show({ modelId: requestId })
      if (res.record_draft) {
        console.log(res.record_draft.id,'res.record_draft.id');
        const _draft = await S_AuditRequest.getAuditRecordDraft(res.record_draft.id)
        setDrafts(_draft)
        // 依章節排序
        const chapters = audit && audit.last_version && audit.last_version.chapters ? audit.last_version.chapters : []
        const _res = await S_AuditRequest.getSortedChapterDraft(_draft, chapters)
        setDraftsSortedByChapter(_res)
      }
    } catch (e) {
      console.error(e);
    }
  }

  const $_onProcedurePress = () => {
    store.dispatch(setCurrentAuditRecordDraft(null))
    navigation.navigate({
      name: 'AuditAssignmentPreview',
      params: {
        requestId: requestId,
        auditId: auditId,

        drafts: drafts ? drafts : null,
        draftsSortedByChapter: draftsSortedByChapter ? draftsSortedByChapter : [],
        _questions: questions
      }
    })
  }

  React.useEffect(() => {
    $_fetchAudit()
  }, [])

  React.useEffect(() => {
    if (audit && questions) {
      $_fetchRequest()
    }
  }, [audit, questions])

  return (
    <>
      <ScrollView>
        {assignment && audit && (
          <>
            <WsPaddingContainer>
              <WsText size={24}>{assignment.name}</WsText>
              <WsFlex
                style={{
                  marginVertical: 16
                }}>
                <WsTag
                  backgroundColor={$color.primary10l}
                  icon="ll-esh-firefighting">
                  {t(audit.system_subclasses[0].name)}
                </WsTag>
              </WsFlex>
              {audit.last_version &&
                audit.last_version.audit_question_templates && questionsCount && (
                  <WsFlex
                    style={{
                      marginBottom: 16
                    }}>
                    <WsText color={$color.gray}>
                      {t('共{number}題', { number: questionsCount })}
                    </WsText>
                  </WsFlex>
                )}
              <WsFlex>
                <WsText color={$color.gray}>
                  {t('稽核日期')}{' '}
                  {moment(assignment.record_at).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            </WsPaddingContainer>
            <WsPaddingContainer>
              <WsFlex
                alignItems={"flex-start"}
              >
                <WsInfo
                  style={{
                    width: width * 0.5,
                    // borderWidth: 1,
                  }}
                  type="users"
                  label={t('稽核者')}
                  value={assignment.auditors}
                  isUri={true}
                />
                <WsInfo
                  style={{
                    width: width * 0.5,
                  }}
                  type="users"
                  label={t('受稽者')}
                  isUri={true}
                  value={assignment.auditees}
                />
              </WsFlex>
            </WsPaddingContainer>
          </>
        )}
      </ScrollView>
      <SafeAreaView
        style={{
        }}>
        <WsGradientButton
          testID={'開始'}
          borderRadius={30}
          style={{
          }}
          disabled={loading}
          onPress={$_onProcedurePress}>
          {t('開始')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default AuditAssignmentRequestIntroduction
