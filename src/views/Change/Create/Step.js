import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsStepsTab, WsText, WsSkeleton } from '@/components'
import ChangeCreateStep from '@/sections/Change/Create/CreateStep'
import S_ChangeItemTemplate from '@/services/api/v1/change_item_template'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'

const ChangeCreateStepPage = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // State
  const [loading, setLoading] = React.useState(true)
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()
  const [countersigns, setCountersigns] = React.useState()
  const [createValue, setCreateValue] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('ChangeCreate')
    const _value = JSON.parse(_item)
    setCreateValue({
      ..._value,
      ...createValue
    })
  }
  const $_setStorage = async () => {
    await AsyncStorage.setItem('ChangeCreate', JSON.stringify(createValue))
  }

  // Services
  const $_fetchChangeItemTemplate = async () => {
    const _params = {
      is_active: 1,
      order_way: 'asc',
      order_by: 'sequence'
    }
    // console.log(_params,'-_params') //230104-issues
    const res = await S_ChangeItemTemplate.index({
      params: _params
    })
    setCountersigns(res.data)
    setLoading(false)
  }

  // Function
  const $_setTabItemsViews = () => {
    const _items = countersigns.map((countersign, countersignIndex) => {
      return {
        value: `changeCreateStep${countersignIndex}`,
        props: {
          title: countersign.name ? countersign.name : 'no title',
          countersign: countersign ? countersign : null,
          currentPage: countersignIndex + 1,
          allStep: countersigns.length + 1
        }
      }
    })
    setTabItems(_items)
  }

  const $_onSubmit = $event => {
    setCreateValue({
      ...createValue,
      changes: $event
    })
    navigation.navigate('AssignChange')
  }

  React.useEffect(() => {
    $_getStorage()
    $_fetchChangeItemTemplate()
  }, [])

  React.useEffect(() => {
    if (countersigns) {
      $_setTabItemsViews()
      setCreateValue({
        ...createValue,
        countersigns: countersigns
      })
    }
  }, [countersigns])

  React.useEffect(() => {
    if (createValue) {
      $_setStorage()
    }
  }, [createValue])

  return (
    <>
      {tabItems && countersigns && countersigns.length > 0 && !loading ? (
        <WsStepsTab
          currentTabIndex={currentTabIndex}
          setCurrentTabIndex={setCurrentTabIndex}
          items={tabItems}
          title={t('萬用初篩表')}
          viewComponent={ChangeCreateStep}
          submitText={t('下一步')}
          onSubmit={$_onSubmit}
        />
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

export default ChangeCreateStepPage
