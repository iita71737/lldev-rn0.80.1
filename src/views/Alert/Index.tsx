import React from 'react'
import {
  View,
  StatusBar,
  Platform,
  // SafeAreaView
} from 'react-native'
import {
  LlToggleTabBar001,
  WsPopup,
  WsDialog,
  WsPage,
  WsPage002
} from '@/components'
import AlertListTabView from '@/sections/Alert/AlertListTabView'
import NotificationList from '@/sections/Alert/NotificationList'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux'
import store from '@/store'
import { setIdleCounter } from '@/store/data';
import $color from '@/__reactnative_stone/global/color'
import { HeaderHeightContext } from '@react-navigation/elements';
import { SafeAreaView } from 'react-native-safe-area-context';
interface AlertIndexProps {
  route: any;
}

interface ToggleTab {
  value: string;
  label: string;
  view: React.FC<any>;
  props: any;
}

const AlertIndex: React.FC<AlertIndexProps> = ({ route }) => {
  const { t } = useTranslation()

  // PROPS
  const _tabIndex = route?.params?.tabIndex || ''

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // STATE
  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [toggleTabs] = React.useState<ToggleTab[]>([
    {
      value: 'notification',
      label: t('通知中心'),
      view: NotificationList,
      props: {
        route: route,
        showLeftBtn: false
      }
    },
    {
      value: 'alert',
      label: t('警示'),
      view: AlertListTabView,
      props: {
        showLeftBtn: false
      }
    }
  ])

  React.useEffect(() => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, [tabIndex])

  // Render
  return (
    <>
      {/* 250918-edge-to-edge-issue */}
      <SafeAreaView
        edges={['top']}
        style={{
          backgroundColor: $color.primary
        }}
      />
      <WsPage002
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
      </WsPage002>
    </>
  )
}

export default AlertIndex
