import React from 'react'
import {
  LlToggleTabBar001,
  WsIconBtn,
  WsState,
  WsPage,
  WsToggleTabView,
  WsPage002,
  WsSkeleton
} from '@/components'
import TrainingList from '@/sections/Training/TrainingList'
import TrainingGroupList from '@/sections/Training/TrainingGroupList'
import TrainingCalendar from '@/sections/Training/TrainingCalendar'
import TrainingTemplateList from '@/sections/Training/TrainingTemplateList'
import { useTranslation } from 'react-i18next'
interface TrainingIndexProps {
  route: any;
  navigation: any;
}

const TrainingIndex: React.FC<TrainingIndexProps> = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const _tabIndex = route?.params?.tabIndex || route?.params?._tabIndex

  // States
  const [loading, setLoading] = React.useState<boolean>(true);
  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [toggleTabs, setToggleTabs] = React.useState([
    {
      value: 'trainingList',
      label: t('教育訓練'),
      view: TrainingList,
      props: {
        tabIndex: tabIndex
      }
    },
    {
      value: 'trainingGroupList',
      label: t('教育訓練群組'),
      view: TrainingGroupList,
      props: {
        tabIndex: tabIndex
      }
    },
    {
      value: 'calendar',
      label: t('行事曆'),
      view: TrainingCalendar,
      props: {
        tabIndex: tabIndex,
        showLeftBtn: false
      }
    },
    {
      value: 'trainingTemplateList',
      label: t('教育訓練公版'),
      view: TrainingTemplateList,
      props: {
        tabIndex: tabIndex
      }
    }
  ])

  // Function
  const $_setTabItems = (): void => {
    setToggleTabs([
      {
        value: 'trainingList',
        label: t('教育訓練'),
        view: TrainingList,
        props: {
          tabIndex: tabIndex
        }
      },
      {
        value: 'trainingGroupList',
        label: t('教育訓練群組'),
        view: TrainingGroupList,
        props: {
          tabIndex: tabIndex
        }
      },
      {
        value: 'calendar',
        label: t('行事曆'),
        view: TrainingCalendar,
        props: {
          tabIndex: tabIndex,
          showLeftBtn: false
        }
      },
      {
        value: 'trainingTemplateList',
        label: t('教育訓練公版'),
        view: TrainingTemplateList,
        props: {
          tabIndex: tabIndex
        }
      }
    ])
    setLoading(false)
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [tabIndex])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <WsPage002
          tabItems={toggleTabs}
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
        >
        </WsPage002>
      )}
    </>
  )
}
export default TrainingIndex
