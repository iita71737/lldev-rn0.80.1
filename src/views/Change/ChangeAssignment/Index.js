import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsStepsTab, WsText, WsTabView, WsIconBtn } from '@/components'
import UndoneChangeAssignment from '@/sections/Change/Assignment/UndoneChangeAssignment'
import FinishChangeAssignment from '@/sections/Change/Assignment/FinishChangeAssignment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

const ChangeAssignmentIndex = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Params
  const _tabIndex = route.params?._tabIndex

  // State
  const [tabIndex, settabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [tabItems] = React.useState([
    {
      value: 'ChecklistConclusionDaily',
      label: t('我的變動評估作業'),
      view: UndoneChangeAssignment
    },
    {
      value: 'finished',
      label: t('已完成的變動評估作業'),
      view: FinishChangeAssignment,
      props: {
        frequency: 'day'
      }
    }
  ])


  return (
    <>
      <WsTabView
        isAutoWidth={true}
        scrollEnabled={true}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
      />
    </>
  )
}

export default ChangeAssignmentIndex
