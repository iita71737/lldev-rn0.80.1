import React, { useState } from 'react'
import { WsTabView } from '@/components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import ViewDashboardChangeList from '@/views/DashboardFactory/ChangeList'

const DashboardChangeListTab = (props, { navigation, route }) => {
  const { t, i18n } = useTranslation()

  // PROPS
  const { systemClass, type } = props.route.params

  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'execute',
      label: i18next.t('執行中'),
      view: ViewDashboardChangeList,
      props: {
        systemClass: systemClass,
        type: 1
      }
    },
    {
      value: 'expired',
      label: i18next.t('評估逾期'),
      view: ViewDashboardChangeList,
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

export default DashboardChangeListTab
