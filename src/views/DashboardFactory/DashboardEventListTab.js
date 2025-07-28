import React, { useState } from 'react'
import { WsTabView, WsIconBtn } from '@/components'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import ViewDashboardEventList from '@/views/DashboardFactory/EventList'
import { useNavigation } from '@react-navigation/native'

const DashboardEventListTab = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // PROPS
  const { systemClass, type } = props.route.params

  //State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'new',
      label: t('新增'),
      view: ViewDashboardEventList,
      props: {
        systemClass: systemClass,
        type: 1
      }
    },
    {
      value: 'total',
      label: i18next.t('累計'),
      view: ViewDashboardEventList,
      props: {
        systemClass: systemClass,
        type: 2
      }
    }
  ])

  React.useEffect(() => {
    if (type == 2) {
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

export default DashboardEventListTab
