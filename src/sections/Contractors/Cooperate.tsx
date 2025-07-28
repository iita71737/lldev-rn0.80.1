import React from 'react'
import { ScrollView, View, Dimensions } from 'react-native'
import {
  WsFlex,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlContractorsCard001,
  WsState,
  WsSkeleton,
  WsPageIndex
} from '@/components'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'

const Cooperate = props => {
  const navigation = useNavigation()

  // Props
  const {
    filterFields,
    filterValue,
    defaultFilter,
    onParamsChange
  } = props

  // State
  const [params] = React.useState({
    system_subclasses: defaultFilter && defaultFilter.system_subclasses ? defaultFilter.system_subclasses.toString() : undefined,
    order_by: 'created_at',
    order_way: 'desc',
    contractor_status: 1,
    search: filterValue && filterValue.search ? filterValue.search : undefined,
    contractor_types: defaultFilter && defaultFilter.contractor_types ? defaultFilter.contractor_types.toString() : undefined,
    contractor_customed_types: defaultFilter && defaultFilter.contractor_customed_types ? defaultFilter.contractor_customed_types.toString() : undefined
  })

  return (
    <>
      <WsPageIndex
        modelName={'contractor'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <LlContractorsCard001
            testID={`LlContractorsCard001-${index}`}
            key={index}
            item={item}
            style={[
              index != 0
                ? {
                  marginTop: 8,
                  marginHorizontal: 16
                }
                : {
                  marginTop: 8,
                  marginHorizontal: 16
                }
            ]}
            onPress={() => {
              navigation.navigate({
                name: 'ContractorsShow',
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

export default Cooperate
