import React, { useState } from 'react'
import { View } from 'react-native'
import {
  WsFilter,
  WsInfiniteScroll,
  WsPaddingContainer,
  LlBtn002,
  LlLicenseCard001,
  LlLicenseCard002,
  WsSkeleton,
  WsPageIndex,
  WsIconBtn
} from '@/components'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'
import { useFocusEffect } from '@react-navigation/native'
import S_LicenseType from '@/services/api/v1/license_type'
import $color from '@/__reactnative_stone/global/color'

interface LicenseTemplateListProps {
  searchValue: string;
  tabFocus: string;
}

const LicenseTemplateList: React.FC<LicenseTemplateListProps> = (props) => {
  const navigation = useNavigation<any>()

  // Props
  const {
    searchValue,
    tabFocus
  } = props

  // redux
  const factory = useSelector(state => state.data.currentFactory.id)

  // States
  const [filterFields, setFilterFields] = React.useState({
    license_type: {
      type: 'checkbox',
      label: i18next.t('類型'),
      items: []
    },
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })

  const [params] = React.useState({
    order_by: 'created_at',
    order_way: 'desc',
    get_all: 0,
  })

  // Services
  const $_fetchLicenseTypes = async () => {
    const _params = {
      order_by: 'sequence',
      order_way: 'asc'
    }
    const res = await S_LicenseType.index({
      params: _params
    })
    $_setFilterFields(res.data)
  }

  // Fields
  const $_setFilterFields = (licenseTypes: any) => {
    setFilterFields({
      license_type: {
        type: 'checkbox',
        label: i18next.t('類型'),
        items: licenseTypes
      },
      system_subclasses: {
        type: 'system_subclass',
        label: i18next.t('領域')
      }
    })
  }

  // Options
    const $_setNavigationOption = () => {
      navigation.setOptions({
        headerRight: () => null,
        headerLeft: () => {
          return (
            <WsIconBtn
              testID={"backButton"}
              name="ws-outline-arrow-left"
              color="white"
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          )
        }
      })
    }
  
  
    React.useEffect(() => {
      // 顯示或隱藏新增功能
      $_setNavigationOption()
    }, [])

  React.useEffect(() => {
    $_fetchLicenseTypes()
  }, [factory])

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        // Do something when the screen is unfocused
      }
    }, [])
  )

  return (
    <>
      <WsPageIndex
        modelName={'license_templates'}
        serviceIndexKey={'factoryIndex'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        renderItem={({ item, index }: { item: any, index: number }) => (
          <View
            key={index}
            style={{
              marginHorizontal: 16
            }}>
            <LlLicenseCard002
              item={item}
              onPress={() => {
                navigation.navigate({
                  name: 'LicenseTemplateShow',
                  params: {
                    id: item.id,
                    type: item.license_type
                  }
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

export default LicenseTemplateList
