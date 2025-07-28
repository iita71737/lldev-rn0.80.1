import React from 'react'
import { View, ScrollView } from 'react-native'
import { WsText, WsPaddingContainer, LlAuditQuestionCard001, WsSkeleton } from '@/components'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const AuditQuestionIndex = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { id, versionId, navigation } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [questionInChapters, setQuestionInChapters] = React.useState([])
  const [count, setCount] = React.useState()

  // Services
  const $_fetchQuestionInChapters = async () => {
    // 挑選的題目
    const questions = await S_AuditQuestion.getQuesForQuesList(versionId)
    setQuestionInChapters(questions)
    const _count = await S_AuditQuestion.getCount(questions)
    setCount(_count)
    setLoading(false)
  }

  // Function
  const $_onQuestionPress = question => {
    navigation.push('RoutesAudit', {
      screen:'AuditQuestionShow',
      params:{
        question: question
      }
    })
  }

  React.useEffect(() => {
    $_fetchQuestionInChapters()
  }, [])

  return (
    <>
      {questionInChapters && !loading ? (
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
            {t('共{number}題', { number: count })}
          </WsText>
          {questionInChapters.map((chapter, chapterIndex) => {
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
                  {chapterIndex + 1}{'.'}{chapter.chapterTitle}
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
                        {chapterIndex + 1}{'-'}{sectionIndex + 1}{'.'}{section.sectionTitle}
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
                            title={question.title}
                            style={{ marginTop: 8 }}
                            isFocus={
                              question.keypoint ? true : false
                            }
                            question={question}
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
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default AuditQuestionIndex
