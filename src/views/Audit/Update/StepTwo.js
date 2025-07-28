import React from 'react'
import { View, ScrollView, SafeAreaView } from 'react-native'
import {
  WsText,
  WsPaddingContainer,
  WsBtn,
  WsModal,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  // LlCustomTemplateCard,
  WsIcon,
  WsSkeleton
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditVersion from '@/services/api/v1/audit_version'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

const AuditUpdateStepTwo = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { name } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [updateValue, setUpdateValue] = React.useState()

  const [loading, setLoading] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)
  const [otherQuestions, setOtherQuestions] = React.useState([])
  const [quesTemplatesWithChapters, setQuesTemplatesWithChapters] =
    React.useState()
  const [auditVersion, setAuditVersion] = React.useState()
  const [otherQuesDefaultValue, setOtherQuesDefaultValue] = React.useState({
    remark: t('自訂'),
    title: t('自訂'),
    keypoint: 0
  })

  // Fields
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
      info: true,
      type: 'icon'
    }
  }
  const quesStateFieldsForCustom = {
    title: {
      label: t('標題'),
      placeholder: t('輸入')
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
    },
    attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/audit_question_version/attach`
    }
  }

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem(name)
    const _value = JSON.parse(_item)
    if (_value && _value.last_version.id) {
      setLoading(false)
    }
    setUpdateValue(_value)
    setIsMounted(true)
  }

  const $_setStorage = async () => {
    await AsyncStorage.setItem(name, JSON.stringify(updateValue))
  }

  // Services
  const $_getQuesInChapters = async () => {
    if (isMounted) {
      const questions = await S_AuditQuestion.getQuesInChaptersByAuditVersion(
        updateValue.last_version.id
      )
      setQuesTemplatesWithChapters(questions)

      // 取得一開始 章節屬於其他的 題目
      const initOtherQuestions =
        S_AuditQuestion.getInitOtherQuestions(questions)
      setOtherQuestions(initOtherQuestions)

      setUpdateValue({
        ...updateValue,
        audit_question_with_version: questions
      })
    }
  }
  const $_fetchAuditVersion = async () => {
    if (isMounted) {
      const res = await S_AuditVersion.show(updateValue.last_version.id)
      setAuditVersion(res)
      $_initSelectedQuestion(res)
    }
  }

  const $_initSelectedQuestion = async res => {
    const questions = await S_AuditQuestion.getQuesInChaptersByAuditVersion(
      updateValue.last_version.id
    )
    const initSelectedQuestions =
      await S_AuditQuestion.getInitSelectedQuestions({
        questions,
        auditVersion: res
      })

    const initSelectedQuestionsById =
      S_AuditQuestion.getInitSelectedQuestionsByTemplateId(
        initSelectedQuestions
      )

    setUpdateValue({
      ...updateValue,
      audit_question_with_version: questions,
      audit_question_templates: initSelectedQuestionsById
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
                $_onHeaderRightPress(updateValue)
              }}>
              {t('下一步')}
            </WsBtn>
          </>
        )
      }
    })
  }
  const $_switchTemplate = async ($event, question) => {
    const _updateValue = JSON.parse(JSON.stringify(updateValue))
    // ಠ_ಠ
    const _ids = _updateValue.audit_question_templates
      ? _updateValue.audit_question_templates
      : []
    let _switchTemplateIds = [..._ids]
    if ($event) {
      _switchTemplateIds.push(question.audit_question_template.id)
    } else {
      _switchTemplateIds = _switchTemplateIds.filter(switchId => {
        return switchId !== question.audit_question_template.id
      })
    }
    _updateValue.audit_question_templates = _switchTemplateIds
    setUpdateValue({
      ..._updateValue
    })
  }

  const $_customQuestionOnSubmit = ($event, chapterIndex, sectionIndex) => {
    let _questions = [...quesTemplatesWithChapters]
    const _addQuestion = {
      ...$event,
      audit_question_template: 'custom',
      type: 'custom'
    }
    _questions[chapterIndex].sections[sectionIndex].questions.push(_addQuestion)
    setQuesTemplatesWithChapters(_questions)
    setUpdateValue({
      ...updateValue,
      audit_question_with_version: _questions
    })
  }

  const $_otherQuestionsOnSubmit = $event => {
    const _otherQuestions = [...otherQuestions]
    const _addQuestion = {
      ...$event,
      audit_question_template: 'custom',
      type: 'custom'
    }
    const _otherChapters =
      updateValue.audit_question_with_version &&
        updateValue.audit_question_with_version[
          updateValue.audit_question_with_version.length - 1
        ].badId == 'other'
        ? updateValue.audit_question_with_version[
        updateValue.audit_question_with_version.length - 1
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
    const _OtherQuestionWithVersion = updateValue.audit_question_with_version
      ? updateValue.audit_question_with_version
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

    setQuesTemplatesWithChapters(_OtherQuestionWithVersion)

    setUpdateValue({
      ...updateValue,
      audit_question_with_version: _OtherQuestionWithVersion
    })
  }

  const $_onCopyPress = async (question, chapterIndex, sectionIndex) => {
    const _questions = [...updateValue.audit_question_with_version]
    const _question_shallow = { ...question }
    const _question = JSON.parse(JSON.stringify(_question_shallow))
    delete _question.templateId
    delete _question.id
    _question.audit_question_template = 'custom'
    _question.type = 'custom'
    _question.title = _question.title + t('-複製')
    _questions[chapterIndex].sections[sectionIndex].questions.push(_question)
    setQuesTemplatesWithChapters(_questions)
    setUpdateValue({
      ...updateValue,
      audit_question_with_version: _questions
    })
  }

  const $_deleteOnPress = (questionIndex, chapterIndex, sectionIndex) => {
    let _questions = [...quesTemplatesWithChapters]
    _questions[chapterIndex].sections[sectionIndex].questions.splice(
      questionIndex,
      1
    )
    setQuesTemplatesWithChapters(_questions)
    setUpdateValue({
      ...updateValue,
      audit_question_versions: _questions
    })
  }

  const $_deleteOtherQues = otherQuesIndex => {
    const _otherQuestions = [...otherQuestions]
    _otherQuestions.splice(otherQuesIndex, 1)
    setOtherQuestions(_otherQuestions)

    const _otherChapters = updateValue.audit_question_with_version
    _otherChapters[
      updateValue.audit_question_with_version.length - 1
    ].sections[0].questions = _otherQuestions
    setUpdateValue({
      ...updateValue,
      audit_question_with_version: _otherChapters
    })
  }

  const $_onHeaderRightPress = async updateValue => {
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
      question.last_version = { ...$event }
      question.title = $event.title
      let _questions = [...quesTemplatesWithChapters]
      _questions[chapterIndex].sections[sectionIndex].questions[questionIndex] =
        question
      setQuesTemplatesWithChapters(_questions)
      setUpdateValue({
        ...updateValue,
        audit_question_with_version: _questions
      })
    }
    if (question.type === 'custom') {
      const _last_version = {
        ...$event
      }
      const _event = {
        // id: question.id,
        title: $event.title,
        last_version: _last_version,
        audit_question_template: 'custom',
        type: 'custom'
      }
      let _questions = [...quesTemplatesWithChapters]
      _questions[chapterIndex].sections[sectionIndex].questions[questionIndex] =
        _event

      setQuesTemplatesWithChapters(_questions)
      setUpdateValue({
        ...updateValue,
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
    setUpdateValue({
      ...updateValue,
      audit_question_with_version: [
        ...(updateValue.audit_question_with_version
          ? updateValue.audit_question_with_version
          : []),
        ..._otherQuestions
      ]
    })
  }
  const $_setSwitchQuestions = (question, auditVersion) => {
    if (auditVersion) {
      let hasSelect = false
      if (question.audit_question_template) {
        auditVersion.audit_question_templates.forEach(selectQuestion => {
          if (selectQuestion.id == question.audit_question_template.id) {
            hasSelect = true
          }
        })
      }
      return hasSelect
    }
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])

  React.useEffect(() => {
    if (isMounted) {
      $_getQuesInChapters()
      $_fetchAuditVersion()
    }
  }, [isMounted])

  React.useEffect(() => {
    if (updateValue) {
      $_setStorage()
    }
  }, [updateValue])

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        $_setNavigationOptions()
      });

      return unsubscribe;
    }, [navigation])
  );

  return (
    <>
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
          <ScrollView>
            <WsPaddingContainer>
              {!loading && quesTemplatesWithChapters && (
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
                                      }
                                      des={
                                        question.type == 'template'
                                          ? t('建議題目')
                                          : t('自訂題目')
                                      }
                                      isFocus={
                                        question.last_version
                                          ? question.last_version.keypoint == 1
                                          : question.keypoint == 1
                                            ? true
                                            : false
                                      }
                                      type={
                                        question.type == 'template'
                                          ? 'template'
                                          : 'custom'
                                      }
                                      value={
                                        question.last_version
                                          ? question.last_version
                                          : question
                                      }
                                      switchValue={$_setSwitchQuestions(
                                        question,
                                        auditVersion
                                      )}
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
              )}
            </WsPaddingContainer>
          </ScrollView>
        </>
      )}
    </>
  )
}

export default AuditUpdateStepTwo
