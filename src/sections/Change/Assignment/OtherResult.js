import React from 'react'
import { Pressable, ScrollView, FlatList } from 'react-native'
import {
  WsTabView,
  WsIconTitleCircle,
  WsPaddingContainer,
  WsFlex,
  WsTag,
  WsText,
  WsInfo,
  LlChangeResultCard002,
  WsSkeleton,
  WsEmpty
} from '@/components'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_Change from '@/services/api/v1/change'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const ChangeAssignmentOtherResult = props => {
  const navigation = useNavigation()

  // Props
  const {
    changeVersionId,
    name,
    systemSubclass,
    changeId,
    emptyTitle,
    emptyText
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [assignmentDataList, setAssignmentDataList] = React.useState()

  // Function
  const $_onPress = (subClass, evaluator) => {
    navigation.push('RoutesChange', {
      screen: 'ChangeAssignmentOtherResultShow',
      params: {
        changeVersionId: changeVersionId,
        evaluator: evaluator.id,
        system_subclass: subClass
      }
    })
  }

  // Services
  const $_getChange = async () => {
    // 1.取得變動計畫
    const res = await S_Change.show(changeId)
    // 2.取得此變動計畫的其他細節
    const current = await S_Change.getVersionChangeItem(
      res.last_version.id,
      systemSubclass,
    )
    let content
    const assignmentData = S_Change.getChangeDataAssignment(res)
    if (assignmentData.versions.length > 1) {
      const beforeVersion = assignmentData.versions.find(
        version => assignmentData.lastVersionId !== version.id
      )
      const before = await S_Change.getVersionChangeItem(
        beforeVersion.id,
        systemSubclass,
      )
      content = await S_Change.getOtherChangeAssignmentWithSystemSubclasses(
        before.evaluators,
        current.evaluators,
        before.changeItems,
        current.changeItems,
        before.risks,
        current.risks,
        systemSubclass,
        currentUser,
        before.answers,
        current.answers
      )
    } else {
      content = await S_Change.getOtherChangeAssignmentWithSystemSubclasses(
        [],
        current.evaluators,
        [],
        current.changeItems,
        [],
        current.risks,
        systemSubclass,
        currentUser,
        [],
        current.answers
      )
    }
    // 篩選 非我的評估的結果
    const _content = content.filter(item => item.evaluator.id !== currentUser.id)
    setAssignmentDataList(_content)
  }

  React.useEffect(() => {
    $_getChange()
  }, [])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      $_getChange()
    })
    return unsubscribe
  }, [navigation])

  // Render
  return (
    <>
      {assignmentDataList ? (
        <>
          <FlatList
            data={assignmentDataList}
            keyExtractor={(item, itemIndex) => itemIndex}
            renderItem={({ item, index }) => (
              <LlChangeResultCard002 key={index} answer={item} style={{ marginTop: 8 }} onPress={() => $_onPress(item.subClass, item.evaluator)} />
            )}
            ListEmptyComponent={() => {
              return (
                <>
                  <WsEmpty emptyTitle={emptyTitle} emptyText={emptyText} />
                </>
              )
            }}
          />
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default ChangeAssignmentOtherResult
