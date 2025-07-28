import React from 'react'
import { View, ScrollView } from 'react-native'
import {
  WsText,
  WsPaddingContainer,
  WsBtn,
  WsModal,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  // LlCustomTemplateCard,
  WsSkeleton,
  WsIcon
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_AuditTemplate from '@/services/api/v1/audit_template'

const AuditCreateStepTwo = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { modelName, name } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [createValue, setCreateValue] = React.useState()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)
  const [otherQuestions, setOtherQuestions] = React.useState([])
  const [quesTemplatesWithChapters, setQuesTemplatesWithChapters] =
    React.useState()

  const [stateSwitch, setStateSwitch] = React.useState(false)
  const [otherQuesDefaultValue, setOtherQuesDefaultValue] = React.useState({
    remark: t('自訂'),
    title: t('自訂'),
    keypoint: 0
  })

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
      info: true,
      title: t('法規依據'),
      type: 'info_listWithModal',
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
      displayCheck(fieldsValue) {
        if (fieldsValue.article_versions) {
          return true
        } else {
          return false
        }
      }
    },
    effects: {
      info: 'true',
      type: 'icon'
    },
    attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/audit_question_version/attach`
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

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem(name)
    const _value = JSON.parse(_item)
    setCreateValue(_value)
    setIsMounted(true)
  }

  const $_setStorage = async () => {
    await AsyncStorage.setItem(name, JSON.stringify(createValue))
  }
  // Services
  const $_fetchQuestions = async () => {
    if (createValue && createValue.audit_template) {
      const template = await S_AuditTemplate.show(
        createValue.audit_template.id
      );
      const res = await S_AuditQuestion.getQuesTemplatesWithChapters(
        template.last_version
      )
      setQuesTemplatesWithChapters(res)
      setCreateValue({
        ...createValue,
        audit_question_with_version: res
      })
    }
    setIsLoading(false)
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
              {t('下一步')}
            </WsBtn>
          </>
        )
      }
    })
  }
  const $_switchTemplate = async (
    $event,
    question,
    chapterIndex,
    sectionIndex
  ) => {
    const _createValue = JSON.parse(JSON.stringify(createValue))
    const _ids = _createValue.audit_question_templates
      ? _createValue.audit_question_templates
      : []
    let _switchTemplteIds = [..._ids]
    if ($event) {
      _switchTemplteIds.push(question.id)
    } else {
      _switchTemplteIds = _switchTemplteIds.filter(switchId => {
        return switchId !== question.id
      })
    }
    _createValue.audit_question_templates = _switchTemplteIds
    setCreateValue(_createValue)
  }

  const $_customQuestionOnSubmit = ($event, chapterIndex, sectionIndex) => {
    let _questions = [...createValue.audit_question_with_version]
    const _addQuestion = $event
    _addQuestion.type = 'custom'
    _questions[chapterIndex].sections[sectionIndex].questions.push(_addQuestion)
    setQuesTemplatesWithChapters(_questions)
    setCreateValue({
      ...createValue,
      audit_question_with_version: _questions
    })
  }

  const $_otherQuestionsOnSubmit = $event => {
    const _otherQuestions = [...otherQuestions]
    const _addQuestion = $event
    _addQuestion.type = 'custom'
    const _otherChapters =
      createValue.audit_question_with_version &&
        createValue.audit_question_with_version[
          createValue.audit_question_with_version.length - 1
        ].badId == 'other'
        ? createValue.audit_question_with_version[
        createValue.audit_question_with_version.length - 1
        ]
        : {
          badId: 'other',
          chapterTitle: '其他'
        }
    const _otherSections = _otherChapters.sections
      ? _otherChapters.sections
      : [
        {
          badId: 'other',
          sectionTitle: '其他'
        }
      ]
    const _otherSectionsQuestions =
      _otherChapters.sections && _otherChapters.sections[0].questions
        ? _otherChapters.sections[0].questions
        : []

    _otherQuestions.push(_addQuestion)
    _otherSectionsQuestions.push(_addQuestion)
    _otherSections[0].questions = _otherSectionsQuestions
    _otherChapters.sections = _otherSections
    setOtherQuestions(_otherQuestions)
    const _OtherQuestionWithVersion = createValue.audit_question_with_version
      ? createValue.audit_question_with_version
      : []
    if (
      _OtherQuestionWithVersion.length != 0 &&
      _OtherQuestionWithVersion[_OtherQuestionWithVersion.length - 1].badId ==
      'other'
    ) {
      _OtherQuestionWithVersion.splice(
        _OtherQuestionWithVersion[_OtherQuestionWithVersion.length - 1],
        1,
        _otherChapters
      )
    } else {
      _OtherQuestionWithVersion.push(_otherChapters)
    }
    setCreateValue({
      ...createValue,
      audit_question_with_version: _OtherQuestionWithVersion
    })
  }
  const $_onCopyPress = async (question, chapterIndex, sectionIndex) => {
    const _questions = [...createValue.audit_question_with_version]
    const _question_shallow = { ...question }
    const _question = JSON.parse(JSON.stringify(_question_shallow))
    delete _question.templateId
      ; (_question.id = '_' + _question.id),
        (_question.audit_question_template = 'custom')
    _question.type = 'custom'
    _question.last_version.title = _question.last_version.title + t('-複製')
    _question.article_versions = []
    _question.effects = []
    _questions[chapterIndex].sections[sectionIndex].questions.push(_question)
    setQuesTemplatesWithChapters(_questions)
    setCreateValue({
      ...createValue,
      audit_question_with_version: _questions
    })
  }

  const $_onCopyOtherQuestion = otherQues => {
    const _otherQuestions = [...otherQuestions]
    _otherQuestions.push(otherQues)
    setOtherQuestions(_otherQuestions)

    const _otherChapters = createValue.audit_question_with_version
    _otherChapters[
      createValue.audit_question_with_version.length - 1
    ].sections[0].questions = _otherQuestions
    setCreateValue({
      ...createValue,
      audit_question_with_version: _otherChapters
    })
  }
  const $_deleteOnPress = (questionIndex, chapterIndex, sectionIndex) => {
    let _questions = [...quesTemplatesWithChapters]
    _questions[chapterIndex].sections[sectionIndex].questions.splice(
      questionIndex,
      1
    )
    setQuesTemplatesWithChapters(_questions)
    setCreateValue({
      ...createValue,
      audit_question_with_version: _questions
    })
  }

  const $_deleteOtherQues = otherQuesIndex => {
    const _otherQuestions = [...otherQuestions]
    _otherQuestions.splice(otherQuesIndex, 1)
    setOtherQuestions(_otherQuestions)
    // CreateValue
    const _otherChapters = createValue.audit_question_with_version
    _otherChapters[
      createValue.audit_question_with_version.length - 1
    ].sections[0].questions = _otherQuestions
    setCreateValue({
      ...createValue,
      audit_question_with_version: _otherChapters
    })
  }
  const $_onHeaderRightPress = async () => {
    navigation.navigate(`${name}Step3`)
  }
  const $_editQuestion = (
    $event,
    sectionIndex,
    chapterIndex,
    questionIndex,
    question
  ) => {
    if (question.type === 'template') {
      const _event = {
        ...$event,
        id: question.templateId,
        type: 'template',
        templateId: question.templateId
      }
      let _questions = [...quesTemplatesWithChapters]
      _questions[chapterIndex].sections[sectionIndex].questions[questionIndex] =
        _event
      setQuesTemplatesWithChapters(_questions)
      setCreateValue({
        ...createValue,
        audit_question_with_version: _questions
      })
    }
    if (question.type === 'custom') {
      const _event = {
        ...$event,
        type: 'custom'
      }
      let _questions = [...quesTemplatesWithChapters]
      _questions[chapterIndex].sections[sectionIndex].questions[questionIndex] =
        _event
      setQuesTemplatesWithChapters(_questions)
      setCreateValue({
        ...createValue,
        audit_question_with_version: _questions
      })
    }
  }

  const $_editOtherQuestion = ($event, otherQuesIndex) => {
    const _otherQuestions = [...otherQuestions]
    const _addQuestion = $event
    _addQuestion.type = 'custom'
    _addQuestion.payload = {
      chapterId: 'other',
      sectionId: 'other'
    }
    _otherQuestions.splice(otherQuesIndex, 1, _addQuestion)
    setOtherQuestions(_otherQuestions)
    setCreateValue({
      ...createValue,
      audit_question_with_version: [
        ...(createValue.audit_question_with_version
          ? createValue.audit_question_with_version
          : []),
        ..._otherQuestions
      ]
    })
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      $_fetchQuestions()
    }
  }, [isMounted])

  React.useEffect(() => {
    if (createValue) {
      $_setStorage()
      $_setNavigationOptions()
    }
  }, [createValue])

  return (
    <>
      {isLoading ? (
        <>
          <WsSkeleton />
          <WsSkeleton />
          <WsSkeleton />
        </>
      ) : (
        <>
          <ScrollView>
            <WsPaddingContainer>
              <>
                {quesTemplatesWithChapters && (
                  <>
                    {quesTemplatesWithChapters.map((chapter, chapterIndex) => {
                      return (
                        <View key={chapterIndex}>
                          <WsText size={18}>{chapter.chapterTitle}</WsText>
                          {chapter.sections.map((section, sectionIndex) => {
                            return (
                              <View key={sectionIndex}>
                                <WsText>{section.sectionTitle}</WsText>
                                {section.questions.map(
                                  (question, questionIndex) => {
                                    return (
                                      <LlQuestionPickTemplate
                                        key={questionIndex}
                                        style={{
                                          marginTop: 8
                                        }}
                                        no={`${chapterIndex + 1}-${sectionIndex + 1
                                          }-${questionIndex + 1}`}
                                        noWidth={50}
                                        title={
                                          question.title
                                            ? question.title
                                            : question.last_version.title
                                              ? question.last_version.title
                                              : '無'
                                        }
                                        des={
                                          question.templateId
                                            ? t('建議題目')
                                            : t('自訂題目')
                                        }
                                        isFocus={
                                          question.last_version
                                            ? question.last_version.keypoint ==
                                            1
                                            : question.keypoint == 1
                                              ? true
                                              : false
                                        }
                                        type={
                                          question.templateId
                                            ? 'template'
                                            : 'custom'
                                        }
                                        value={question.last_version}
                                        switchValue={stateSwitch}
                                        onSwitch={$event => {
                                          $_switchTemplate(
                                            $event,
                                            question,
                                            chapterIndex,
                                            sectionIndex
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
                                          question.templateId
                                            ? quesStateFields
                                            : quesStateFieldsForCustom
                                        }
                                        copyOnPress={() => {
                                          $_onCopyPress(
                                            question,
                                            chapterIndex,
                                            sectionIndex
                                          )
                                        }}
                                      />
                                    )
                                  }
                                )}
                                <LlCreateQuestionCard
                                  value={otherQuesDefaultValue}
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
                {otherQuestions.length == 0 && (
                  <>
                    <WsText size={18}>{t('其他')}</WsText>
                    <LlCreateQuestionCard
                      value={otherQuesDefaultValue}
                      fields={quesStateFieldsForCustom}
                      onSubmit={$event => {
                        $_otherQuestionsOnSubmit($event)
                      }}
                    />
                  </>
                )}
              </>
            </WsPaddingContainer>
          </ScrollView>
        </>
      )}
    </>
  )
}

export default AuditCreateStepTwo
