import React, { useEffect } from 'react'
import {
  Pressable,
  ScrollView,
  View,
  FlatList
} from 'react-native'
import {
  WsFlex,
  WsText,
  WsIcon,
  LlCheckListResultAnswerCard001
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'

const CheckListAssignmentResultSort = props => {
  const navigation = useNavigation()

  // Props
  const {
    answers
  } = props

  const renderAnswerCards = (answers) => {
    return answers.map((answer, subIndex) => (
      <LlCheckListResultAnswerCard001
        testID={`LlCheckListResultAnswerCard001-${subIndex}`}
        key={answer.id}
        style={{
          marginBottom: 16,
        }}
        no={subIndex + 1}
        title={answer.title}
        answer={answer}
        score={answer.risk_level}
      />
    ));
  };

  return (
    <>
      {answers && (
        <>
          <FlatList
            testID={'flatList'}
            data={answers}
            keyExtractor={(item, index) => item.id || String(index)}
            renderItem={({ item, index }) => {
              if (item.ans && item.ans.length > 0)
                return (
                  <View key={index}>
                    <WsFlex
                      style={{
                        paddingVertical: 8,
                        paddingHorizontal: 16
                      }}>
                      <WsIcon
                        name={item.icon}
                        size={22}
                        color={item.color}
                        style={{
                          marginRight: 8,
                        }}
                      />
                      <WsText fontWeight="bold">{item.title}</WsText>
                    </WsFlex>
                    {item.ans && (
                      <>
                        {renderAnswerCards(item.ans)}
                      </>
                    )}
                  </View>
                )
            }}
            ListFooterComponent={
              () => {
                return (
                  <View
                    style={{
                      height: 100,
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

export default CheckListAssignmentResultSort
