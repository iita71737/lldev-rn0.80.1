import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Dimensions, Text } from 'react-native'
import {
  WsToggleTabBar,
  WsTabView,
  WsIconBtn,
  WsState,
  WsPage
} from '@/components'
import ActListing from '@/sections/Act/ActListing'
import ActCollection from '@/sections/Act/ActCollection'
import ActChangeReport from '@/sections/Act/ActChangeReport'
import ActLibrary from '@/sections/Act/ActLibrary'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import store from '@/store'
import { setIdleCounter } from '@/store/data';

const Tab = createMaterialTopTabNavigator();

const Act = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  const reRouteTabIndex = route.params?.tabIndex

  // Redux
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const factory = useSelector(state => state.data.currentFactory)

  // States
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()

  // Function
  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'listing',
        label: t('最新上線'),
        view: ActListing,
        props: {
          navigation: navigation,
        }
      },
      {
        value: 'collection',
        label: t('我的收藏'),
        view: ActCollection,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex
        }
      },
      {
        value: 'library',
        label: t('法規圖書館'),
        view: ActLibrary,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex
        }
      },
      {
        value: 'change_report',
        label: t('法規變更報表'),
        view: ActChangeReport,
        props: {
          navigation: navigation,
          currentTabIndex: tabIndex
        }
      }
    ])
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [factory, systemClasses, tabIndex])

  React.useEffect(() => {
    if (reRouteTabIndex != undefined) {
      settabIndex(reRouteTabIndex)
    }
  }, [reRouteTabIndex])

  React.useEffect(() => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, [tabIndex])

  return (
    <>
      <WsPage
        hideLeftBtn={tabIndex != 2 && tabIndex != 3 ? false : true}
        title={t('法規')}
      >
        {tabItems && (
          <WsTabView
            index={tabIndex}
            setIndex={settabIndex}
            items={tabItems}
            scrollEnabled={true}
            isAutoWidth={true}
            fixedTabWidth={128}
          />
        )}
      </WsPage>
    </>
  )
}

export default Act
