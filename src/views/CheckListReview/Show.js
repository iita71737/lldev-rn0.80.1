import React from 'react'
import { Pressable, ScrollView } from 'react-native'

import {
  WsTabView
} from '@/components'
import CheckListAssignmentQuestionSort from '@/sections/CheckList/CheckListAssignmentQuestionSort'
import CheckListAssignmentResultSort from '@/sections/CheckList/CheckListAssignmentResultSort'
import { useTranslation } from 'react-i18next'

const CheckListReview = () => {
  const { t, i18n } = useTranslation();
  const [tabIndex, settabIndex] = React.useState(0);
  const [tabItems] = React.useState([
    {
      value: 'CheckListAssignmentResultSort',
      label: t('依結果排序'),
      view: CheckListAssignmentResultSort,
    },
    {
      value: 'CheckListAssignmentQuestionSort',
      label: t('依題目排序'),
      view: CheckListAssignmentQuestionSort,
    },
  ])

  return (
    <>
      <WsTabView
        isAutoWidth={true}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
        fixedContainerHeight={600}
      />
    </>
  )
}

export default CheckListReview