import React from 'react'
import { WsTabView } from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'

const DashBoardLicenseExpired = ({ navigation, route }) => {

  // Params
  const { item, unit } = route.params

  return (
    <>
      <DashBoardSystemClass
        item={item}
        routePrefix={'DashboardLicenseExpiredList'}
        navigation={navigation}
        unit={unit}
      >
      </DashBoardSystemClass>
    </>
  )
}

export default DashBoardLicenseExpired
