import React from 'react'
import { View, Dimensions } from 'react-native'
import {
  WsText,
  WsFilter,
  WsTabView,
  WsIconBtn,
  WsState,
  WsBtn
} from '@/components'
import S_License from '@/services/api/v1/license'
import LicenseListWithLicenseType from '@/sections/License/LicenseListWithLicenseType'
import $color from '@/__reactnative_stone/global/color'
import S_LicenseType from '@/services/api/v1/license_type'
import { useTranslation } from 'react-i18next'

const IndexWithLicenseType = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { id } = route.params

  // States
  const [isSearch, setIsSearch] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState()
  const windowWidth = Dimensions.get('window').width
  const [tabIndex, settabIndex] = React.useState(0)
  const [licenseType, setLicenseType] = React.useState()
  const [tabItems, setTabItems] = React.useState()

  // Services
  const $_fetchLicenseType = async () => {
    const res = await S_LicenseType.index({
      params: {
        order_by: 'sequence',
        order_way: 'asc'
      }
    })
    setLicenseType(res.data)
  }

  // Function
  const $_setTabViewItems = () => {
    const _items = []
    licenseType.forEach(type => {
      _items.push({
        value: type.name,
        label: type.name,
        view: LicenseListWithLicenseType,
        props: {
          navigation: navigation,
          type: type.id,
          systemSubclass: id
        }
      })
    })
    setTabItems(_items)
  }

  React.useEffect(() => {
    $_fetchLicenseType()
  }, [])

  React.useEffect(() => {
    if (licenseType) {
      $_setTabViewItems()
    }
  }, [licenseType])

  return (
    <>
      {tabItems && (
        <WsTabView
          index={tabIndex}
          setIndex={settabIndex}
          items={tabItems}
          scrollEnabled={true}
        />
      )}
    </>
  )
}

export default IndexWithLicenseType
