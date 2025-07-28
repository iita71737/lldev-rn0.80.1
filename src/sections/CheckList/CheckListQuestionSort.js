import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsBtn,
  WsText,
  WsFlex,
  WsIcon,
  WsStateFormView,
  LlCheckListQuestionCard002
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListRecord from '@/services/api/v1/checklist_record'

const CheckListQuestionSort = props => {
  const navigation = useNavigation()

  // Props
  const { id } = props
  console.log(id, 'id===22222');

  // States
  const [answersWithQues, setAnswersWithQues] = useState(null)

  // Services
  const $_fetchCheckListRecordAns = async () => {
    try {
      const res = await S_CheckListRecordAns.index({
        parentId: id
      })
      const record = await S_CheckListRecord.show({ modelId: id })
      const sortedWithQues = S_CheckListRecordAns.getSortedWithQues({
        record: record,
        answers: res.data
      })
      setAnswersWithQues(sortedWithQues)
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchCheckListRecordAns()
  }, [id])

  return (
    <>
      {answersWithQues && (
        <ScrollView
          style={{
            paddingVertical: 8
          }}>
          {answersWithQues.map((answer, answerIndex) => {
            return (
              <LlCheckListQuestionCard002
                onPress={() => {
                  navigation.navigate({
                    name: 'CheckListAnswerShow',
                    params: {
                      id: answer.id
                    }
                  })
                }}
                key={answerIndex}
                style={{
                  marginTop: 8
                }}
                score={answer.score}
                answer={answer}
                isFocus={answer.keypoint == 1 ? true : false}
              />
            )
          })}
        </ScrollView>
      )}
    </>
  )
}

export default CheckListQuestionSort
