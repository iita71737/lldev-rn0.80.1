import React from 'react'
import { View, ScrollView, Dimensions, SafeAreaView } from 'react-native'
import {
  WsTabView,
  WsBtn,
  WsPaddingContainer,
  WsGradientButton,
  WsText
} from '@/components'
import Checklist from '@/sections/Organization/Checklist'
import Event from '@/sections/Organization/Event'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import S_ChecklistQuestion from '@/services/api/v1/checklist_question'
import S_Event from '@/services/api/v1/event'
import { useSelector } from 'react-redux'

const OrganizationTodayResult = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')

  // Redux
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  const {
    tab
  } = route.params

  // States
  const [todayChecklistQuestions, setTodayChecklistQuestions] = React.useState()
  const [paramsForTab1, setParamsForTab1] = React.useState()

  const [todayAddedEvents, setTodayAddedEvents] = React.useState()
  const [paramsForTab2, setParamsForTab2] = React.useState()

  const [tabIndex, settabIndex] = React.useState(tab ? tab : 0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'Checklist',
      label: i18next.t('點檢異常題目'),
      view: Checklist,
      props: {},
      tabNum: '-'
    },
    {
      value: 'Event',
      label: i18next.t('本日新增事件'),
      view: Event,
      props: {},
      tabNum: '-'
    }
  ])

  // Services
  const $_fetchApiForTab1 = async () => {
    const res = await S_ChecklistQuestion.organizationRankingIndex({
      params: paramsForTab1
    })
    setTodayChecklistQuestions(res)
  }
  const $_fetchApiForTab2 = async () => {
    const res = await S_Event.organizationCurrentAddIndex({
      params: paramsForTab2
    })
    setTodayAddedEvents(res)
  }

  // Functions
  const $_setParams = () => {
    const _paramsForTab1 = {
      organization: currentOrganization.id,
      type: 'checklist'
    }
    const _paramsForTab2 = {
      organization: currentOrganization.id,
      type: 'event'
    }
    setParamsForTab1(_paramsForTab1)
    setParamsForTab2(_paramsForTab2)
  }

  const $_setTabItems = () => {
    const _tabItems = [
      {
        value: 'Checklist',
        label: i18next.t('點檢異常題目'),
        view: Checklist,
        props: {
          checklistQuestions: todayChecklistQuestions
            ? todayChecklistQuestions.data
            : []
        },
        tabNum:
          todayChecklistQuestions && todayChecklistQuestions.meta.total > 0
            ? todayChecklistQuestions.meta.total
            : '-'
      },
      {
        value: 'Event',
        label: i18next.t('本日新增事件'),
        view: Event,
        props: {
          events: todayAddedEvents ? todayAddedEvents.data : []
        },
        tabNum:
          todayAddedEvents && todayAddedEvents.meta.total > 0
            ? todayAddedEvents.meta.total
            : '-'
      }
    ]
    setTabItems(_tabItems)
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: i18next.t('本日概況')
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    if (currentOrganization) {
      $_setParams()
    }
  }, [currentOrganization])

  React.useEffect(() => {
    if (paramsForTab1) {
      $_fetchApiForTab1()
    }
  }, [paramsForTab1])

  React.useEffect(() => {
    if (todayChecklistQuestions) {
      $_setTabItems()
    }
  }, [todayChecklistQuestions])

  React.useEffect(() => {
    if (paramsForTab2) {
      $_fetchApiForTab2()
    }
  }, [paramsForTab2])

  React.useEffect(() => {
    if (todayAddedEvents) {
      $_setTabItems()
    }
  }, [todayAddedEvents])

  // Render
  return (
    <>
      <WsTabView
        index={tabIndex}
        isAutoWidth={true}
        setIndex={settabIndex}
        items={tabItems}
      />
      <View
        style={{
          backgroundColor: $color.white,
          borderTopWidth: 1,
          borderTopColor: $color.white2d
        }}>
        <WsGradientButton
          onPress={() => {
            navigation.navigate('Map')
          }}
          borderRadius={30}
          style={{
            margin: 16
          }}>
          <WsText>{t('前往列表')}</WsText>
        </WsGradientButton>
      </View>
    </>
  )
}

export default OrganizationTodayResult
