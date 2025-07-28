import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  SafeAreaView,
  StatusBar
} from 'react-native'
import {
  WsText,
  LlAuditQuestionCard001,
  LlAuditListCard003,
  WsSkeleton,
  WsIconBtn
} from '@/components'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_Audit from '@/services/api/v1/audit'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'

const AuditeeQuestion = ({ route, navigation }) => {

  // Params
  const { requestId, auditId, from } = route.params

  // States
  const [loading, setLoading] = React.useState(true)
  const [questionInChapters, setQuestionInChapters] = React.useState()

  // Services
  const $_fetchQuestionInChapters = async () => {
    console.log(auditId,'auditId=');
    try {
      const audit = await S_Audit.show({ modelId: auditId })
      const questions = await S_AuditQuestion.getQuesForQuesList(
        audit.last_version.id
      )
      setQuestionInChapters(questions)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  // Function
  const $_onQuestionPress = question => {
    navigation.navigate({
      name: 'AuditQuestionShow',
      params: {
        question: question
      }
    })
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <WsIconBtn
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_fetchQuestionInChapters()
  }, [])

  React.useEffect(() => {
    if (from) {
      $_setNavigationOption()
    }
  }, [from])

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
          {questionInChapters && (
            <ScrollView
              style={{
                paddingTop: 16,
                paddingVertical: 8
              }}>
              {questionInChapters.map((chapter, chapterIndex) => {
                return (
                  <View key={chapterIndex}>
                    <WsText
                      style={{
                        marginTop: 16,
                        paddingLeft: 16
                      }}>
                      {chapterIndex + 1}
                      {'.'}
                      {chapter.chapterTitle}
                    </WsText>
                    {chapter.sections.map((section, sectionIndex) => {
                      return (
                        <View key={sectionIndex}>
                          {section.sectionTitle && (
                            <WsText
                              style={{
                                marginVertical: 16,
                                paddingLeft: 16
                              }}>
                              {chapterIndex + 1}
                              {'-'}
                              {sectionIndex + 1}
                              {'.'}
                              {section.sectionTitle}
                            </WsText>
                          )}
                          {section.questions.map((question, questionIndex) => {
                            return (
                              <>
                                <LlAuditQuestionCard001
                                  key={questionIndex}
                                  onPress={() => {
                                    $_onQuestionPress(question)
                                  }}
                                  no={`${chapterIndex + 1}-${sectionIndex + 1
                                    }-${questionIndex + 1}`}
                                  title={question.title}
                                  style={{
                                    marginTop: 8
                                  }}
                                />
                              </>
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
        </>
      )}
    </>
  )
}

export default AuditeeQuestion
