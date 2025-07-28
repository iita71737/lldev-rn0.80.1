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
  WsTag,
  WsAvatar,
  WsSkeleton,
  LlAuditQuestionCard001
} from '@/components'
import moment from 'moment'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_AuditQuestionVersion from '@/services/api/v1/audit_question_version'
import S_Audit from '@/services/api/v1/audit'
import S_AuditVersion from '@/services/api/v1/audit_version'
import S_systemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'

const AuditUpdateStepThree = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { modelId } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [isLoading, setIsLoading] = React.useState(true)
  const [updateValue, setUpdateValue] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('AuditUpdate')
    const _value = JSON.parse(_item)
    setUpdateValue(_value)
    setIsLoading(false)
  }

  // Services
  const $_putApi = async data => {
    let chapters = data.audit_question_with_version
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
      data.audit_question_templates
    )
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
      updateValue &&
      updateValue.audit_template &&
      updateValue.audit_template.system_subclasses
    ) {
      updateValue.audit_template.system_subclasses.forEach(system_subclass => {
        _tags.push({
          icon: system_subclass.icon,
          text: system_subclass.name
        })
      })
    }
    return _tags
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

  const $_onSubmit = async () => {
    await $_putApi(updateValue)
    navigation.navigate({
      name: 'AuditIndex'
    })
  }

  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    if (updateValue) {
      $_setNavigationOptions()
    }
  }, [updateValue])

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
          {updateValue && (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsFlex justifyContent="space-between">
                <WsText size={24}>{updateValue.name}</WsText>
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
          {updateValue.owner && (
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
                {updateValue.owner ? (
                  <WsAvatar
                    size={40}
                    source={
                      updateValue.owner.avatar ? updateValue.owner.avatar : ''
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
                  {updateValue.owner ? (
                    <WsText color={$color.gray}>
                      {t(updateValue.owner.name)}
                    </WsText>
                  ) : (
                    <WsText color={$color.gray}>{t('曹阿毛')}</WsText>
                  )}
                  <WsText color={$color.gray}>
                    {t('編輯時間')}
                    {updateValue.owner
                      ? moment(updateValue.owner.updated_at).format(
                        'YYYY-MM-DD HH:MM'
                      )
                      : moment().format('YYYY-MM-DD HH:MM')}
                  </WsText>
                </View>
              </View>
            </WsPaddingContainer>
          )}
          {updateValue && updateValue.selectedQuestions && (
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
                {t('共{number}題', { number: updateValue.audit_question_with_version.length })}
              </WsText>
              {updateValue.selectedQuestions.map((chapter, chapterIndex) => {
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
                                no={`${questionIndex + 1}${' . '}`}
                                title={
                                  question.title
                                    ? question.title
                                    : question.last_version &&
                                      question.last_version.title
                                      ? question.last_version.title
                                      : ''
                                }
                                style={{ marginTop: 8 }}
                                isFocus={
                                  question.last_version &&
                                    question.last_version.keypoint == 1
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

export default AuditUpdateStepThree
