import React from 'react'
import { Pressable } from 'react-native'
import { WsPage, WsTabView, WsInfiniteScroll } from '@/components'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import DefaultRoles from '@/sections/Roles/DefaultRoles'
import i18next from 'i18next'

const RolesIndex = ({ navigation }) => {
  // State
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'DefaultRoles',
      label: i18next.t('預設角色'),
      view: DefaultRoles,
      props: {
        navigation: navigation
      }
    },
    {
      value: 'CustomRoles',
      label: i18next.t('自訂角色'),
      view: DefaultRoles,
      props: {
        navigation: navigation
      }
    }
  ])

  return (
    <>
      <WsPage
        title={i18next.t('角色管理')}
        iconRight="md-add"
        rightOnPress={() => {
          navigation.navigate('RolesCreate')
        }}>
        <WsTabView
          items={tabItems}
          scrollEnabled={false}
          isAutoWidth={true}
          index={tabIndex}
          setIndex={settabIndex}
        />
      </WsPage>
    </>
  )
}

export default RolesIndex
