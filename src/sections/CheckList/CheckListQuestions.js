import React from 'react'
import { Pressable, ScrollView } from 'react-native'

import { WsText, WsFlex, WsPaddingContainer, WsBtn } from '@/components'
import { LlAuditQuestionCard001 } from '@/components'
import { useNavigation } from '@react-navigation/native'

import gColor from '@/__reactnative_stone/global/color'
// import ServiceAidit from ''

const CheckListQuestions = () => {
  const [questionInChapters, setQuestionInChapters] = React.useState([])
  const $_fetchQuestionInChapters = () => { }

  const navigation = useNavigation()

  const $_onQuestionPress = () => {
    navigation.navigate('CheckListQuestionShow')
  }

  React.useEffect(() => {
    $_fetchQuestionInChapters()
  }, [])

  return (
    <ScrollView
      style={{
        paddingVertical: 8
      }}>
      <WsText
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16
        }}
        fontWeight="bold">
        章
      </WsText>
      <WsText
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16
        }}
        fontWeight="bold"
        size={14}>
        節
      </WsText>
      <LlAuditQuestionCard001
        onPress={() => {
          $_onQuestionPress()
        }}
        style={{
          marginTop: 8
        }}
        no={1}
        title="題目題目題目題目題目題目"
      />
      <LlAuditQuestionCard001
        onPress={() => {
          $_onQuestionPress()
        }}
        style={{
          marginTop: 8
        }}
        no="2"
        title="題目題目題目題目題目題目"
        isFocus={true}
      />
    </ScrollView>
  )
}

export default CheckListQuestions
