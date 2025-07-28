import React from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import {
  WsState,
  WsBtn,
  WsCardForSort,
  WsText,
  LlCreateQuestionCard
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import S_AuditQuestion from '@/services/api/v1/audit_question'

const AuditSortedQuestion = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { modelName, name, modelId } = route.params

  // States
  const screenWidth = Math.round(Dimensions.get('window').width)
  const [value, setValue] = React.useState()
  const [isMounted, setIsMounted] = React.useState(false)
  const [chapters, setChapters] = React.useState()
  const [scrollEnabled, setScrollEnabled] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem(name)
    const _value = JSON.parse(_item)

    // 篩選出被挑選的題目
    const questions = S_AuditQuestion.getQuesByQuesId(
      name,
      _value.audit_question_with_version,
      _value.audit_question_templates
    )
    setValue({
      ..._value,
      selectedQuestions: questions
    })
    setChapters(questions)

    setIsMounted(true)
  }

  const $_setStorage = async () => {
    await AsyncStorage.setItem(name, JSON.stringify(value))
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

  const $_onHeaderRightPress = () => {
    navigation.navigate(`${name}Step4`)
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])
  React.useEffect(() => {
    if (value) {
      $_setStorage()
    }
  }, [value])

  return (
    <>
      <ScrollView
        scrollEnabled={scrollEnabled}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}>
        {chapters && (
          <>
            {chapters.map((chapter, chapterIndex) => {
              return (
                <View key={`chapter-${chapterIndex}`}>
                  <WsText
                    style={{
                      marginTop: 16,
                      marginLeft: 16
                    }}
                    size={18}>
                    {chapter.chapterTitle}
                  </WsText>
                  {chapter.sections && (
                    <>
                      {chapter.sections.map((section, sectionIndex) => {
                        return (
                          <View key={`section-${sectionIndex}`}>
                            <WsText
                              style={{
                                marginTop: 8,
                                marginLeft: 16
                              }}>
                              {section.sectionTitle}
                            </WsText>
                            <WsState
                              value={section.questions}
                              onChange={$event => {
                                let _value = { ...value }
                                let _chapters = [
                                  ..._value.audit_question_with_version
                                ]
                                _chapters[chapterIndex].sections[
                                  sectionIndex
                                ].questions = $event
                                _value.audit_question_with_version = _chapters
                                setValue(_value)
                              }}
                              type="sort"
                              keyExtractor={(item, index) => item.id}
                              onDragEnd={() => {
                                setScrollEnabled(true)
                              }}
                              onDragStart={() => {
                                setScrollEnabled(false)
                              }}
                              renderItem={(item, index) => {
                                return (
                                  <View>
                                    <WsCardForSort
                                      index={index}
                                      style={{
                                        width: screenWidth
                                      }}
                                      title={
                                        item.title
                                          ? item.title
                                          : item.last_version.title
                                      }
                                      des={
                                        item.checklist_templates
                                          ? t('建議題目')
                                          : t('自訂題目')
                                      }
                                    />
                                  </View>
                                )
                              }}
                            />
                          </View>
                        )
                      })}
                    </>
                  )}
                </View>
              )
            })}
          </>
        )}
      </ScrollView>
    </>
  )
}

export default AuditSortedQuestion
