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
import ViewNewsList from '@/views/News/NewsList'

const NewsTabs = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

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
        label: t('聯盟新訊'),
        view: ViewNewsList,
        props: {
          navigation: navigation,
        }
      },
      {
        value: 'collection',
        label: t('我的收藏'),
        view: ViewNewsList,
        props: {
          navigation: navigation,
        }
      }
    ])
  }

  React.useEffect(() => {
    $_setTabItems()
  }, [factory, systemClasses, tabIndex])

  return (
    <>
        {tabItems && (
          <WsTabView
            index={tabIndex}
            setIndex={settabIndex}
            items={tabItems}
            scrollEnabled={true}
            isAutoWidth={true}
          />
        )}
    </>
  )
}

export default NewsTabs
