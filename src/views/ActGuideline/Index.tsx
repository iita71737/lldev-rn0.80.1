import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Dimensions, Text } from 'react-native'
import {
  WsToggleTabBar,
  WsTabView,
  WsIconBtn,
  WsState,
  WsPage
} from '@/components'
import GuidelineList from '@/views/ActGuideline/TabSection/GuidelineList'
import GuidelineCollection from '@/views/ActGuideline/TabSection/GuidelineCollection'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import store from '@/store'
import { setIdleCounter } from '@/store/data';

const Tab = createMaterialTopTabNavigator();

const Guideline = ({ route, navigation }) => {
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
        view: GuidelineList,
        props: {
          navigation: navigation,
        }
      },
      {
        value: 'collection',
        label: t('我的收藏'),
        view: GuidelineCollection,
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
        title={t('內規')}
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

export default Guideline
