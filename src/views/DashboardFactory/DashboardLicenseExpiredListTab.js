import React, { useState } from 'react'
import { WsTabView } from '@/components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import ViewDashboardLicenseExpiredList from '@/views/DashboardFactory/LicenseExpiredList'

const DashboardLicenseExpiredListTab = (props, { navigation, route }) => {
  const { t, i18n } = useTranslation()

  // PROPS
  const { systemClass, type } = props.route.params

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'expired',
      label: i18next.t('已逾期'),
      view: ViewDashboardLicenseExpiredList,
      props: {
        systemClass: systemClass,
        type: 1
      }
    },
    {
      value: 'expiring',
      label: i18next.t('即將到期'),
      view: ViewDashboardLicenseExpiredList,
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

export default DashboardLicenseExpiredListTab
