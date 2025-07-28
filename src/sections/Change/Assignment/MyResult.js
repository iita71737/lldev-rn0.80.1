import React from 'react'
import { Pressable, ScrollView, View, Image, FlatList } from 'react-native'
import {
  WsTabView,
  WsIconTitleCircle,
  WsPaddingContainer,
  WsFlex,
  WsTag,
  WsText,
  WsInfo,
  WsStateFormModal,
  LlChangeResultHeader,
  LlChangeResultCard001,
  WsState,
  WsSkeleton,
  LlChangeResultCard002,
  WsEmpty
} from '@/components'
import S_Change from '@/services/api/v1/change'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import fields from '@/models/change_record_answer'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

const ChangeAssignmentResultShow = (props) => {
  const { t, i18n } = useTranslation()
  //use navigation
  const navigation = useNavigation()

  // Props
  const {
    changeVersionId,
    systemSubclass,
    changeId,
    emptyTitle,
    emptyText
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  const [assignmentDataList, setAssignmentDataList] = React.useState()

  // Function
  const $_onPress = (subClass, evaluator) => {
    navigation.push('ChangeAssignmentOtherResultShow', {
      changeVersionId: changeVersionId,
      evaluator: evaluator.id,
      system_subclass: subClass
    })
  }

  // Services
  const $_getChange = async () => {
    const t0 = performance.now();
    // 1.取得變動計畫
    const res = await S_Change.show(changeId)
    // 2.取得此變動計畫的其他細節
    const current = await S_Change.getVersionChangeItem(
      res.last_version.id,
      systemSubclass,
      currentUser
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
        currentUser
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
    setAssignmentDataList(content)
  }

  React.useEffect(() => {
    $_getChange()
  }, [])

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

export default ChangeAssignmentResultShow
