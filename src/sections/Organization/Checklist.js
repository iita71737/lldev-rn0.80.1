import React from 'react'
import { ScrollView, View, Text, SafeAreaView } from 'react-native'
import { WsCard, WsText, LlCheckListQuestionCard004 } from '@/components'

const OrganizationChecklist = props => {
  // Props
  const { checklistQuestions } = props

  // Render
  return (
    <>
      <ScrollView>
        {checklistQuestions &&
          checklistQuestions.map(item => (
            <LlCheckListQuestionCard004 item={item} />
          ))}
      </ScrollView>
    </>
  )
}

export default React.memo(OrganizationChecklist)
