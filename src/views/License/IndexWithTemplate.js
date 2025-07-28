import React from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import {
  WsText,
  WsFilter,
  WsTabView,
  WsIconBtn,
  WsState,
  WsBtn
} from '@/components'
import LicenseStatusList from '@/sections/License/LicenseStatusList'
import S_License from '@/services/api/v1/license'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LicenseIndexWithTemplate = ({ route, navigation }) => {
  const windowWidth = Dimensions.get('window').width
  const { t, i18n } = useTranslation()

  // Params
  const {
    templateId,
    name,
    systemSubclass,
    type,
    licenseDelay,
    licenseConduct,
    licenseUsing,
    licensePause
  } = route.params

  // States
  const [tabParams, setTabParams] = React.useState({
    order_by: 'valid_end_date',
    order_way: 'asc',
    search: searchValue ? searchValue : undefined,
    license_type: type ? type : undefined,
    system_subclasses: systemSubclass ? systemSubclass : undefined
  })
  const [filterFields] = React.useState({
    license_type: {
      type: 'checkbox',
      label: t('類型'),
      storeKey: "licenseType",
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  })

  const [isSearch, setIsSearch] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState()
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'licenseDelay',
      label: t('逾期'),
      view: LicenseStatusList,
      props: {
        params: {
          ...tabParams,
          order_by: 'valid_end_date',
          order_way: 'asc',
          license_status: 0,
          lang: 'tw',
          page: '1',
          license_template: templateId,
          search: searchValue ? searchValue : undefined,
        },
      },
      tabNum: licenseDelay ? licenseDelay : '0'
    },
    {
      value: 'licenseConduct',
      label: t('辦理中'),
      view: LicenseStatusList,
      props: {
        params: {
          ...tabParams,
          order_by: 'valid_end_date',
          order_way: 'asc',
          license_status: 1,
          lang: 'tw',
          page: '1',
          license_template: templateId,
          search: searchValue ? searchValue : undefined,
        },
      },
      tabNum: licenseConduct ? licenseConduct : '0'
    },
    {
      value: 'licenseUsing',
      label: t('使用中'),
      view: LicenseStatusList,
      props: {
        params: {
          ...tabParams,
          order_by: 'valid_end_date',
          order_way: 'asc',
          license_status: 2,
          lang: 'tw',
          page: '1',
          license_template: templateId,
          search: searchValue ? searchValue : undefined,
        },
      },
      tabNum: licenseUsing ? licenseUsing : '0'
    },
    {
      value: 'licensePause',
      label: t('已停用'),
      view: LicenseStatusList,
      props: {
        params: {
          ...tabParams,
          order_by: 'valid_end_date',
          order_way: 'asc',
          license_status: 3,
          lang: 'tw',
          page: '1',
          license_template: templateId,
          search: searchValue ? searchValue : undefined,
        },
      },
      tabNum: licensePause ? licensePause : '0'
    },
  ])

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

export default LicenseIndexWithTemplate
