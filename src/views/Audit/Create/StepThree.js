import React from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { useSelector } from 'react-redux'
import {
  WsInfo,
  WsPaddingContainer,
  WsBtn,
  WsText,
  WsLoading,
  WsFlex,
  WsAvatar,
  WsTag,
  WsSkeleton,
  LlAuditQuestionCard001
} from '@/components'
import moment from 'moment'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Audit from '@/services/api/v1/audit'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_systemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const AuditCreateStepThree = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // States
  const [isLoading, setIsLoading] = React.useState(true)
  const [createValue, setCreateValue] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('AuditCreate').then(res => {
      const _value = JSON.parse(res)
      // 篩選出被挑選的題目
      const questions = S_AuditQuestion.getQuesByQuesId(
        _value.audit_question_versions,
        _value.audit_question_templates
      )
      setCreateValue({
        ..._value,
        selectedQues: questions
      })
      setIsLoading(false)
    })
  }

  // Services
  const $_putApi = async data => {
    // Step全部題目存一次
    const questions = await S_AuditQuestion.createQuestionsFromChapters(
      data.audit_question_with_version
    )

    // Step 建立稽核表
    const _createData = {
      audit_template: createValue.audit_template.id,
      name: createValue.name,
      owner: createValue.owner.id,
      system_classes: createValue.audit_template.system_class.id,
      system_subclasses: createValue.audit_template.system_subclasses
        ? S_systemClass.$_formatDataWithId(
          createValue.audit_template.system_subclasses
        )
        : ''
    }
    const audit = await S_Audit.create({
      data: _createData
    })

    // Step 建立稽核表版本
    const auditVersion = await S_AuditVersion.useQuestionsToCreate({
      parentId: audit.id,
      data: data,
      questions: questions
    })
  }

  // Function
  const $_onQuestionPress = question => {
    navigation.navigate('AuditQuestionShow', {
      question: question
    })
  }

  const _tagsBySystemSubclasses = () => {
    const _tags = []
    if (
      createValue &&
      createValue.audit_template &&
      createValue.audit_template.system_subclasses
    ) {
      createValue.audit_template.system_subclasses.forEach(system_subclass => {
        _tags.push({
          icon: system_subclass.icon,
          text: system_subclass.name
        })
      })
    }
    return _tags
  }

  const $_onSubmit = async () => {
    await $_putApi(createValue)
    navigation.navigate({
      name: 'AuditIndex'
    })
  }

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
              onPress={$_onSubmit}>
              {t('儲存')}
            </WsBtn>
          </>
        )
      }
    })
  }

  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    if (createValue) {
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
        <ScrollView>
          {createValue && (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsFlex justifyContent="space-between">
                <WsText size={24}>{createValue.name}</WsText>
              </WsFlex>

              <WsFlex>
                {_tagsBySystemSubclasses().map((tag, tagIndex) => {
                  return (
                    <View
                      key={tagIndex}
                      style={{
                        marginRight: 8,
                        alignItems: 'flex-start'
                      }}>
                      {tag.icon && tag.text && (
                        <WsTag
                          style={{
                            marginTop: 8
                          }}
                          img={tag.icon}>
                          {tag.text}
                        </WsTag>
                      )}
                    </View>
                  )
                })}
              </WsFlex>
            </WsPaddingContainer>
          )}
          {createValue.owner && (
            <WsPaddingContainer
              style={{
                marginVertical: 8,
                backgroundColor: $color.white
              }}>
              <WsText
                style={{
                  marginBottom: 16
                }}
                size={24}>
                {t('管理者')}
              </WsText>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center'
                }}>
                {createValue.owner ? (
                  <WsAvatar
                    size={40}
                    source={
                      createValue.owner.avatar ? createValue.owner.avatar : ''
                    }
                  />
                ) : (
                  <WsAvatar
                    size={40}
                    source={
                      'https://i1.jueshifan.com/7b077d83/78067d8b/31073d8a09acfa4c9c38.png'
                    }
                  />
                )}
                <View
                  style={{
                    marginLeft: 8
                  }}>
                  {createValue.owner ? (
                    <WsText color={$color.gray}>
                      {t(createValue.owner.name)}
                    </WsText>
                  ) : (
                    <WsText color={$color.gray}>{t('曹阿毛')}</WsText>
                  )}
                  <WsText color={$color.gray}>
                    {t('編輯時間')}
                    {createValue.owner
                      ? moment(createValue.owner.updated_at).format(
                        'YYYY-MM-DD HH:MM'
                      )
                      : moment().format('YYYY-MM-DD HH:MM')}
                  </WsText>
                </View>
              </View>
            </WsPaddingContainer>
          )}
          {createValue && createValue.selectedQuestions && (
            <ScrollView
              style={{
                paddingVertical: 8
              }}>
              <WsText
                size={14}
                letterSpacing={1}
                fontWeight="700"
                style={{
                  marginVertical: 8,
                  marginLeft: 16
                }}>
                {t('共{number}題', { number: createValue.audit_question_with_version.length })}
              </WsText>
              {createValue.selectedQuestions.map((chapter, chapterIndex) => {
                return (
                  <View key={chapterIndex}>
                    <WsText
                      fontWeight="700"
                      letterSpacing={1}
                      style={[
                        {
                          marginTop: 8,
                          marginLeft: 16
                        }
                      ]}>
                      {chapter.chapterTitle ? chapter.chapterTitle : t('自訂')}
                    </WsText>
                    {chapter.sections.map((section, sectionIndex) => {
                      return (
                        <View key={sectionIndex}>
                          <WsText
                            size={14}
                            letterSpacing={1}
                            fontWeight="700"
                            style={{
                              marginTop: 8,
                              marginLeft: 16
                            }}>
                            {section.sectionTitle
                              ? section.sectionTitle
                              : t('自訂')}
                          </WsText>
                          {section.questions.map((question, questionIndex) => {
                            return (
                              <LlAuditQuestionCard001
                                key={questionIndex}
                                onPress={() => {
                                  $_onQuestionPress(question)
                                }}
                                no={`${chapterIndex + 1}-${sectionIndex + 1}-${questionIndex + 1
                                  }`}
                                title={
                                  question.title
                                    ? question.title
                                    : question.last_version.title
                                      ? question.last_version.title
                                      : '無'
                                }
                                style={{ marginTop: 8 }}
                                isFocus={
                                  question.last_version
                                    ? question.last_version.keypoint == 1
                                    : question.keypoint == 1
                                      ? true
                                      : false
                                }
                              />
                            )
                          })}
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </ScrollView>
          )}
        </ScrollView>
      )}
    </>
  )
}

export default AuditCreateStepThree
