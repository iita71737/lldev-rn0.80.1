import React, { useState } from 'react'
import { WsTabView } from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

const DashBoardEvent = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { item } = route.params

  return (
    <>
      <DashBoardSystemClass
        item={item}
        routePrefix={'DashboardEventList'}
        navigation={navigation}
      >
      </DashBoardSystemClass>
    </>
  )
}

export default DashBoardEvent
