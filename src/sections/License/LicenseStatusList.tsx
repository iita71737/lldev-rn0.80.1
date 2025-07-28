import React, { useState } from 'react'
import { View } from 'react-native'
import {
  LlLicenseCard001,
  WsPageIndex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux'
interface LicenseStatusListProps {
  search: string;
  filterValue: any;
  filterFields: any;
  params: any;
  onParamsChange: (params: any) => void;
}

const LicenseStatusList: React.FC<LicenseStatusListProps> = props => {
  const navigation = useNavigation<any>()
  const route = useRoute<any>();

  // Props
  const {
    filterValue = {},
    filterFields = {},
    params,
    onParamsChange = () => { },
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const __params = React.useMemo(() => {
    return params
  }, [currentRefreshCounter]);

  return (
    <>
      <WsPageIndex
        modelName={'license'}
        params={__params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <View
            key={index}
            style={{
              margin: 16
            }}>
            <LlLicenseCard001
              item={item}
              onPress={() => {
                navigation.push('LicenseShow', {
                  id: item.id,
                  type: item.license_type
                })
              }}
              style={{
                marginTop: 8
              }}
            />
          </View>
        )}
      >
      </WsPageIndex>
    </>
  )
}

export default LicenseStatusList
