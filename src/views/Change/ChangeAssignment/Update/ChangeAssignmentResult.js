import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsTabView } from '@/components'
import MyResult from '@/sections/Change/Assignment/MyResult'
import OtherResult from '@/sections/Change/Assignment/OtherResult'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const ChangeAssignmentResult = ({ route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { name, changeVersionId, system_subclass, changeId } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'MyResult',
      label: t('我的評估結果'),
      view: MyResult,
      props: {
        changeVersionId: changeVersionId,
        evaluator: currentUser && currentUser.id,
        systemSubclass: system_subclass,
        changeId: changeId,
      }
    },
    {
      value: 'OtherResult',
      label: t('其他評估結果'),
      view: OtherResult,
      props: {
        changeVersionId: changeVersionId,
        changeId: changeId,
        systemSubclass: system_subclass
      }
    }
  ])

  return (
    <>
      <WsTabView
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
        scrollEnabled={true}
        isAutoWidth={true}
      />
    </>
  )
}

export default ChangeAssignmentResult
