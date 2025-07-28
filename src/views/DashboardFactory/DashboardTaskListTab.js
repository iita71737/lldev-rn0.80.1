import React, { useState } from 'react'
import { WsTabView } from '@/components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import ViewDashboardLicenseExpiredList from '@/views/DashboardFactory/LicenseExpiredList'
import ViewDashboardAlertList from '@/views/DashboardFactory/AlertList'
import ViewDashboardTaskList from '@/views/DashboardFactory/TaskList'

const DashboardTaskListTab = (props, { navigation, route }) => {
  const { t, i18n } = useTranslation()

  // PROPS
  const { systemClass, type } = props.route.params

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'new',
      label: i18next.t('新增'),
      view: ViewDashboardTaskList,
      props: {
        systemClass: systemClass,
        type: 1
      }
    },
    {
      value: 'total',
      label: i18next.t('累計'),
      view: ViewDashboardTaskList,
      props: {
        systemClass: systemClass,
        type: 2
      }
    }
  ])

  React.useEffect(() => {
    if (type === 2) {
      settabIndex(1)
    }
  }, [type])

  return (
    <>
      <WsTabView
        index={tabIndex}
        isAutoWidth={true}
        setIndex={settabIndex}
        items={tabItems}
      />
    </>
  )
}

export default DashboardTaskListTab
