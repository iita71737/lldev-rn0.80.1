import React from 'react'
import { ScrollView, View } from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsModal,
  WsSkeleton,
  WsTabView
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Training from '@/services/api/v1/training'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import TrainingOverview from '@/sections/Training/TrainingOverview'
import TrainingRecordList from '@/sections/Training/TrainingRecordList'

const TrainingShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes

  // Params
  const { id } = route.params

  // States
  const [index, setIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'Overview',
      label: t('總覽'),
      view: TrainingOverview,
      props: {
        id: id
      }
    },
    {
      value: 'TrainingRecordList',
      label: t('記錄列表'),
      view: TrainingRecordList,
      props: {
        tabIndex: index
      }
    },
  ])

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'Overview',
        label: t('總覽'),
        view: TrainingOverview,
        props: {
          id: id
        }
      },
      {
        value: 'TrainingRecordList',
        label: t('記錄列表'),
        view: TrainingRecordList,
        props: {
          id: id,
          tabIndex: index
        }
      },
    ])
  }

   React.useEffect(() => {
        $_setTabItems()
    }, [index])

  return (
    <>
      {tabItems && (
        <WsTabView
          scrollEnabled={true}
          items={tabItems}
          index={index}
          isAutoWidth={true}
          setIndex={setIndex}
        />
      )}
    </>
  )
}
export default TrainingShow
