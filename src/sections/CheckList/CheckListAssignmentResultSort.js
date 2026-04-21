import React from 'react'
import { View, FlatList } from 'react-native'
import {
  WsFlex,
  WsText,
  WsIcon,
  LlCheckListResultAnswerCard001
} from '@/components'

const CheckListAssignmentResultSort = props => {
  // Props
  const {
    answers
  } = props

  const listData = React.useMemo(() => {
    if (!Array.isArray(answers)) return []
    const rows = []
    answers.forEach((group, groupIndex) => {
      if (!Array.isArray(group?.ans) || group.ans.length === 0) return
      rows.push({
        type: 'header',
        key: `header-${group?.id || group?.title || groupIndex}`,
        title: group.title,
        icon: group.icon,
        color: group.color
      })
      group.ans.forEach((answer, subIndex) => {
        rows.push({
          type: 'answer',
          key: `answer-${answer?.id || `${groupIndex}-${subIndex}`}`,
          answer,
          no: subIndex + 1
        })
      })
    })
    return rows
  }, [answers])

  const renderItem = React.useCallback(({ item }) => {
    if (item.type === 'header') {
      return (
        <WsFlex
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
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
      )
    }
    return (
      <LlCheckListResultAnswerCard001
        testID={`LlCheckListResultAnswerCard001-${item.no}`}
        style={{
          marginBottom: 16,
        }}
        no={item.no}
        title={item.answer?.title}
        answer={item.answer}
        score={item.answer?.risk_level}
      />
    )
  }, [])

  return (
    <>
      {listData.length > 0 && (
        <>
          <FlatList
            testID={'flatList'}
            data={listData}
            keyExtractor={item => item.key}
            renderItem={renderItem}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
            ListFooterComponent={
              <View
                style={{
                  height: 100,
                }}
              />
            }
          />
        </>
      )}
    </>
  )
}

export default React.memo(CheckListAssignmentResultSort, (prevProps, nextProps) => {
  return prevProps.answers === nextProps.answers
})
