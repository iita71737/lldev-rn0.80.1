import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsTabView, WsIconBtn, WsText } from '@/components'
import CheckListAssignmentList from '@/sections/CheckList/CheckListAssignmentList'
import CheckListAssignmentHasDraftList from '@/sections/CheckList/CheckListAssignmentHasDraftList'
import CheckListReview from '@/sections/CheckList/CheckListReview'
import CheckListResult from '@/sections/CheckList/CheckListResult'
import CheckListReviewed from '@/sections/CheckList/CheckListReviewed'
import HadBeenReviewedResult from '@/sections/CheckList/HadBeenReviewedResult'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

const CheckListAssignment = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  let checklistId
  const checkListId = route.params?.checkListId;
  const refreshCounter = route.params?.refreshCounter;
  const subTabIndex = route.params?.subTabIndex
  if (checkListId) {
    checklistId = route.params.checkListId
  }

  // STATE
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListAssignmentList',
      label: t('點檢作業'),
      view: CheckListAssignmentList,
      props: {
        record_draft: 'null',
        navigation: navigation,

        checklistId: checklistId ? checklistId : undefined,
        subTabIndex: subTabIndex ? subTabIndex : 0
      }
    },
    {
      value: 'CheckListReview',
      label: t('覆核作業'),
      view: CheckListReview,
      props: {
        navigation: navigation
      }
    },
    {
      value: 'CheckListResult',
      label: t('點檢結果'),
      view: CheckListResult,
      props: {
        navigation: navigation
      }
    },
    {
      value: 'CheckListReviewed',
      label: t('覆核結果'),
      view: CheckListReviewed,
      props: {
        navigation: navigation
      }
    },
    {
      value: 'HadBeenReviewedResult',
      label: t('被覆核結果'),
      view: HadBeenReviewedResult,
      props: {
        navigation: navigation
      }
    }
  ])

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'CheckListAssignmentList',
        label: t('點檢作業'),
        view: CheckListAssignmentList,
        props: {
          record_draft: 'null',
          navigation: navigation,

          checklistId: checklistId ? checklistId : undefined,
          subTabIndex: subTabIndex ? subTabIndex : 0
        }
      },
      {
        value: 'CheckListReview',
        label: t('覆核作業'),
        view: CheckListReview,
        props: {
          navigation: navigation
        }
      },
      {
        value: 'CheckListResult',
        label: t('點檢結果'),
        view: CheckListResult,
        props: {
          navigation: navigation
        }
      },
      {
        value: 'CheckListReviewed',
        label: t('覆核結果'),
        view: CheckListReviewed,
        props: {
          navigation: navigation
        }
      },
      {
        value: 'HadBeenReviewedResult',
        label: t('被覆核結果'),
        view: HadBeenReviewedResult,
        props: {
          navigation: navigation
        }
      }
    ])
  }

  React.useEffect(() => {
    if (refreshCounter) {
      $_setTabItems()
    }
  }, [refreshCounter])

  return (
    <>
      <WsTabView
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
        scrollEnabled={true}
        isAutoWidth={true}
        fixedTabWidth={100}
        marginBottom={0}
        swipeEnabled={false}
        animationEnabled={false}
        pointerVisible={true}
      />
    </>
  )
}

export default CheckListAssignment
