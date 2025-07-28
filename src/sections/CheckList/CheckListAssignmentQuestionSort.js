import React from 'react'
import { Pressable, ScrollView, FlatList, View } from 'react-native'
import {
  WsBtn,
  WsText,
  WsStateFormView,
  LlCheckListResultAnswerCard001
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

const CheckListAssignmentQuestionSort = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    id,
    versionId
  } = props

  // State
  const [record, setRecord] = React.useState()
  const [answers, setAnswers] = React.useState()

  // Services
  const $_fetchRecord = async () => {
    const res = await S_CheckListRecord.showV2({ modelId: id })
    setRecord(res)
  }
  const $_fetchAnswers = async () => {
    const res = await S_CheckListRecordAns.indexV2({
      parentId: id
    })
    setAnswers(res.data)
  }

  React.useEffect(() => {
    $_fetchRecord()
    $_fetchAnswers()
  }, [])

  return (
    <>
      {answers && (
        <>
          <WsText
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16
            }}
            fontWeight="bold">
            {i18next.t('題目')}
            {'（ '}
            {t('共{number}題', { number: answers.length })}
            {' ）'}
          </WsText>

          <FlatList
            testID='flatList'
            data={answers}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ item, index }) => {
              return (
                <LlCheckListResultAnswerCard001
                  key={item.id}
                  onPress={() => {
                    navigation.navigate({
                      name: 'CheckListAssignmentProcedure',
                      params: {
                        id: id,
                        versionId: versionId
                      }
                    })
                  }}
                  style={{
                    marginTop: 8
                  }}
                  no={index + 1}
                  answer={item}
                  title={item.title}
                  score={item.score}
                />
              )
            }}
            ListFooterComponent={
              () => {
                return (
                  <View
                    style={{
                      height: 50,
                      // borderWidth: 1,
                    }}
                  >
                  </View>
                )
              }
            }
          />
        </>
      )}
    </>
  )
}

export default CheckListAssignmentQuestionSort
