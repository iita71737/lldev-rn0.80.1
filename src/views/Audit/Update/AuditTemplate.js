import React from 'react'
import { View, ScrollView } from 'react-native'
import {
  WsText,
  WsPaddingContainer,
  WsBtn,
  WsIcon,
  WsModal,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  // LlCustomTemplateCard
} from '@/components'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_Audit from '@/services/api/v1/audit'
import S_AuditTemplate from '@/services/api/v1/audit_template'
import S_AuditQuestionTemplate from '@/services/api/v1/audit_question_template'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import { useTranslation } from 'react-i18next'

const AuditTemplateUpdate = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { modelId, versionId } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [auditTemplate, setAuditTemplate] = React.useState()
  const [quesWithChapters, setQuesWithChapters] = React.useState()
  const [submitValue, setSubmitValue] = React.useState()
  const [switchQues, setSwitchQues] = React.useState(true)
  const quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      editable: false
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      rules: 'required'
    },
    remark: {
      label: t('查核提示'),
      multiline: true,
      placeholder: t('請輸入查核提示'),
      editable: false
    },
    article_versions: {
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ll-nav-law-outline'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('法規依據')}
          </WsText>
        </View>
      ),
      title: t('法規依據'),
      type: 'info_listWithModal'
    },
    effects: {
      type: 'info_image'
    }
  }
  const quesStateFieldsForCustom = {
    title: {
      label: t('標題'),
      placeholder: t('請輸入題目標題')
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      rules: 'required'
    },
    remark: {
      label: t('查核提示'),
      multiline: true,
      placeholder: t('請輸入查核提示')
    }
  }

  // Services
  const $_getChaptersFormatted = async () => {
    // 取得 目前稽核表
    const audit = await S_Audit.show({ modelId: modelId })
    // 取得 稽核表目前版本 所屬公版
    const template = await S_AuditTemplate.show(audit.audit_template.id)
    setAuditTemplate(template)
    // 取得 稽核表目前版本 所涵蓋的題目
    const questions = await S_AuditQuestion.index({
      audit_versions: versionId
    })
    // 取得 稽核表更新版本 的 所涵蓋的題目
    const questionTemplate = await S_AuditQuestionTemplate.index({
      audit_template_versions: template.last_version.id
    })
    // 整理成目前需要顯示的所有題目的格式(含公版更新後的題目)
    const chapters = await S_AuditQuestion.getQuesInChaptersToTemplateUpdate(
      audit,
      template,
      questions,
      questionTemplate
    )
    // 將整理後的格式 以 id 整理成要存後端的 audit_question_templates 稽核表題目公版陣列，排除更新公版已刪除題目
    const ids = []
    chapters.forEach(chapter => {
      chapter.sections.forEach(section => {
        section.questions.forEach(question => {
          if (question.status !== 'remove') {
            if (
              question.audit_question_template &&
              question.audit_question_template.id
            ) {
              ids.push(question.audit_question_template.id)
            } else if (question.audit_question_template) {
              ids.push(question.audit_question_template)
            }
          }
        })
      })
    })
    setQuesWithChapters(chapters)
    setSubmitValue({
      ...submitValue,
      chapters: chapters,
      audit_question_templates: ids
    })
  }
  // Function
  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16
              }}
              onPress={() => {
                $_onHeaderRightPress()
              }}>
              {t('送出')}
            </WsBtn>
          </>
        )
      }
    })
  }

  const $_switchTemplate = async ($event, question) => {
    const _submitValue = JSON.parse(JSON.stringify(submitValue))
    // ಠ_ಠ
    const _ids = _submitValue.audit_question_templates
      ? _submitValue.audit_question_templates
      : []
    let _switchTemplteIds = [..._ids]
    if ($event) {
      _switchTemplteIds.push(question.audit_question_template.id)
    } else {
      _switchTemplteIds = _switchTemplteIds.filter(switchId => {
        return switchId !== question.audit_question_template.id
      })
    }
    _submitValue.audit_question_templates = _switchTemplteIds
    setSubmitValue(_submitValue)
  }

  const $_customQuestionOnSubmit = ($event, chapterIndex, sectionIndex) => {
    let _questions = [...quesWithChapters]
    const _addQuestion = $event
    _addQuestion.type = 'custom'
    _questions[chapterIndex].sections[sectionIndex].questions.push(_addQuestion)
    setQuesWithChapters(_questions)
    setSubmitValue({
      ...submitValue,
      audit_question_versions: _questions
    })
  }

  const $_onCopyPress = (question, chapterIndex, sectionIndex) => {
    let _questions = [...quesWithChapters]
    const _question_shallow = { ...question }
    const _question = JSON.parse(JSON.stringify(_question_shallow))

      ; (_question.id = '_' + _question.id),
        // _question.audit_question_template = 'custom'
        (_question.type = 'custom')
    _question.title = _question.title + t('-複製')
    _question.last_version.title = _question.last_version.title + t('-複製')
    _question.last_version.article_versions = []
    _question.last_version.effects = []
    _questions[chapterIndex].sections[sectionIndex].questions.push(_question)

    setQuesWithChapters(_questions)
    setSubmitValue({
      ...submitValue,
      audit_question_versions: _questions
    })
  }

  const $_deleteOnPress = (questionIndex, chapterIndex, sectionIndex) => {
    let _questions = [...quesWithChapters]
    _questions[chapterIndex].sections[sectionIndex].questions.splice(
      questionIndex,
      1
    )
    setQuesWithChapters(_questions)
  }

  const $_onHeaderRightPress = async () => {
    let chapters = submitValue.chapters
    // 舊有題目新增版本
    chapters = await S_AuditQuestionVersion.existedQuestionsCreateVersion(
      chapters
    )

    // 新題目建立
    chapters = await S_AuditQuestion.newQuestionsCreate(chapters)

    // 新增稽核表版本
    const res = await S_AuditVersion.createFromChapters(
      chapters,
      modelId,
      submitValue.audit_question_templates
    )
    navigation.navigate({
      name: 'AuditIndex'
    })
  }

  const $_editQuestion = (
    $event,
    sectionIndex,
    chapterIndex,
    questionIndex,
    question
  ) => {
    const _last_version = {
      ...$event
    }
    const _event = {
      ...question,
      title: $event.title,
      keypoint: $event.keypoint,
      last_version: _last_version
    }
    let _questions = [...quesWithChapters]
    _questions[chapterIndex].sections[sectionIndex].questions[questionIndex] =
      _event
    setQuesWithChapters(_questions)
  }

  const $_getQuesionStatus = question => {
    if (question.status) {
      return question.status
    } else {
      let status = 'remove'
      auditTemplate.last_version.audit_question_templates.forEach(
        templateQues => {
          if (question.audit_question_template) {
            if (templateQues.id == question.audit_question_template.id) {
              status = 'same'
            }
          } else {
            status = 'same'
          }
        }
      )
      return status
    }
  }

  React.useEffect(() => {
    $_getChaptersFormatted()
  }, [])
  React.useEffect(() => {
    $_setNavigationOptions()
  }, [submitValue])

  return (
    <ScrollView>
      <WsPaddingContainer>
        {quesWithChapters && (
          <>
            {quesWithChapters.map((chapter, chapterIndex) => {
              return (
                <View key={chapterIndex}>
                  <WsText size={18}>{chapter.chapterTitle}</WsText>
                  {chapter.sections.map((section, sectionIndex) => {
                    return (
                      <View key={sectionIndex}>
                        <WsText>{section.sectionTitle}</WsText>
                        {section.questions.map((question, questionIndex) => {
                          return (
                            <LlQuestionPickTemplate
                              key={questionIndex}
                              style={{
                                marginTop: 8
                              }}
                              no={`${chapterIndex + 1}-${sectionIndex + 1}-${questionIndex + 1
                                }`}
                              noWidth={50}
                              title={
                                question.title
                                  ? question.title
                                  : question.last_version.title
                              }
                              des={
                                question.type == 'template'
                                  ? t('建議題目')
                                  : t('自訂題目')
                              }
                              isFocus={question.keypoint == 1 ? true : false}
                              type={question.type}
                              value={
                                question.last_version
                                  ? question.last_version
                                  : question
                              }
                              switchValue={switchQues}
                              onSwitch={$event => {
                                $_switchTemplate(
                                  $event,
                                  question,
                                  chapterIndex,
                                  sectionIndex,
                                  questionIndex
                                )
                              }}
                              deleteOnPress={() => {
                                $_deleteOnPress(
                                  questionIndex,
                                  chapterIndex,
                                  sectionIndex
                                )
                              }}
                              onSubmit={$event => {
                                $_editQuestion(
                                  $event,
                                  sectionIndex,
                                  chapterIndex,
                                  questionIndex,
                                  question
                                )
                              }}
                              fields={
                                question.type == 'template'
                                  ? quesStateFields
                                  : quesStateFieldsForCustom
                              }
                              status={$_getQuesionStatus(question)}
                              copyOnPress={() => {
                                $_onCopyPress(
                                  question,
                                  chapterIndex,
                                  sectionIndex
                                )
                              }}
                            />
                          )
                        })}
                        <LlCreateQuestionCard
                          fields={quesStateFieldsForCustom}
                          onSubmit={$event => {
                            $_customQuestionOnSubmit(
                              $event,
                              chapterIndex,
                              sectionIndex
                            )
                          }}
                        />
                      </View>
                    )
                  })}
                </View>
              )
            })}
          </>
        )}
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default AuditTemplateUpdate
