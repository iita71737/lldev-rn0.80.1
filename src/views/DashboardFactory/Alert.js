import React from 'react'
import { WsTabView } from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'

const DashBoardAlert = ({ navigation, route }) => {
  // Params
  const { item } = route.params

  return (
    <>
      <DashBoardSystemClass
        item={item}
        routePrefix={'DashboardAlertList'}
        navigation={navigation}
      >
      </DashBoardSystemClass>
    </>
  )
}

export default DashBoardAlert
