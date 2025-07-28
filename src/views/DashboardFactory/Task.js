import React from 'react'
import { WsTabView } from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'

const DashBoardTask = ({ navigation, route }) => {

  // Params
  const { item } = route.params

  return (
    <>
      <DashBoardSystemClass
        item={item}
        routePrefix={'DashboardTaskList'}
        navigation={navigation}
      >
      </DashBoardSystemClass>
    </>
  )
}

export default DashBoardTask
