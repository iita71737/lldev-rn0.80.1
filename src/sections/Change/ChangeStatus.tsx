import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  LlChangeListCard001,
  WsPageIndex
} from '@/components'
import { useNavigation } from '@react-navigation/native'

interface ChangeStatusProps {
  search: string;
  filterValue: any;
  filterFields?: any;
  params: any;
  onParamsChange: (params: any, filterValue: any) => void;
}

const ChangeStatus: React.FC<ChangeStatusProps> = props => {
  const navigation = useNavigation()

  // Props
  const {
    filterValue,
    filterFields = {},
    params,
    onParamsChange
  } = props


  return (
    <>
      <WsPageIndex
        modelName={'change'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <LlChangeListCard001
            testID={`LlChangeListCard001-${index}`}
            key={item.id}
            item={item}
            style={[
              index != 0
                ? {
                  marginTop: 8
                }
                : {
                  marginTop: 8
                }
            ]}
            onPress={() => {
              navigation.navigate({
                name: 'ChangeShow',
                params: {
                  id: item.id,
                  versionId: item.last_version.id
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

export default ChangeStatus
