import React, { useState } from 'react'
import { View } from 'react-native'
import {
  WsFilter,
  WsInfiniteScroll,
  WsPaddingContainer,
  LlBtn002,
  LlLicenseCard001,
  WsSkeleton,
  LlContractorLicenseCard002,
  WsPageIndex
} from '@/components'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'

const ContractorLicenseList = props => {
  const navigation = useNavigation()

  // Props
  const {
  } = props

  // States
  const [filterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })
  const [params] = React.useState({
    order_by: 'created_at',
    order_way: 'desc',
  })

  return (
    <>
      <WsPageIndex
        modelName={'contractor_license_template'}
        params={params}
        filterFields={filterFields}
        renderItem={({ item, index }) => (
          <LlContractorLicenseCard002
            key={item.id}
            item={item}
            style={[
             {
              marginTop: 16,
              marginHorizontal:16
             }
            ]}
            system_subclasses={item.system_subclasses}
            onPress={() => {
              navigation.navigate('RoutesContractors', {
                screen: 'ContractorsLicenseTemplateShow',
                params: {
                  id: item.id
                }
              })
            }}
          />
        )}
      >
      </WsPageIndex>
    </>
  )
}

export default ContractorLicenseList
