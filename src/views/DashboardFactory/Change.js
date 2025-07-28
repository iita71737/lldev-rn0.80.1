import React from 'react'
import { WsTabView } from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'

const DashBoardChange = ({ navigation, route }) => {

  // Params
  const { item } = route.params

  return (
    <>
      <DashBoardSystemClass
        item={item}
        routePrefix={'DashboardChangeList'}
        navigation={navigation}
      >
      </DashBoardSystemClass>
    </>
  )
}

export default DashBoardChange
