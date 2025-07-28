import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsStepsTab, WsText } from '@/components'
import ChangeCreateStep from '@/sections/Change/Create/CreateStep'
import S_ChangeItemTemplate from '@/services/api/v1/change_item_template'
import S_ChangeVersion from '@/services/api/v1/change_version'
import S_ChangeItemVersion from '@/services/api/v1/change_item_version'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'

const ChangeUpdateStepPage = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { modelId } = route.params

  // State
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [createValue, setCreateValue] = React.useState()
  const [tabItems, setTabItems] = React.useState()
  const [countersigns, setCountersigns] = React.useState([])
  const [tabValue, setTabValue] = React.useState()

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('ChangeUpdate')
    const _value = JSON.parse(_item)
    setCreateValue(_value)
  }
  const $_setStorage = async () => {
    await AsyncStorage.setItem('ChangeUpdate', JSON.stringify(createValue))
  }

  // Services
  const $_fetchChangeItemTemplate = async () => {
    const res = await S_ChangeItemTemplate.index({
      params: {
        is_active: 1,
        order_way: 'asc',
        order_by: 'sequence'
      }
    })
    setCountersigns(res.data)
  }

  // Function
  const $_setTabValue = async () => {
    const _tabValue = []
    const changeVersion = await S_ChangeVersion.show({ modelId: modelId })

    const changeItemsVersion = await S_ChangeItemVersion.showAll(
      changeVersion.change_item_versions
    )

    changeItemsVersion.forEach(changeItem => {
      const _other = []
      if (!changeItem.data.data.change_item_template_version) {
        const _system_subclasses = changeItem.data.data.system_subclasses.map(
          subClass => {
            return subClass.id
          }
        )
        _other.push({
          factor_score: changeItem.data.data.factor_score,
          description: changeItem.data.data.description,
          name: changeItem.data.data.name,
          system_subclasses: _system_subclasses
        })
      }
      _tabValue.push({
        factor_score: changeItem.data.data.factor_score,
        remark: changeItem.data.data.description,
        system_subclasses: changeItem.data.data.system_subclasses,
        other: !changeItem.data.data.change_item_template_version
          ? _other
          : null
      })
    })
    _tabValue.sort((a, b) => {
      if (b.other) {
        return -1
      } else {
        return 1
      }
    })
    setTabValue(_tabValue)
  }
  const $_setTabItemsViews = () => {
    const _items = countersigns.map((countersign, countersignIndex) => {
      return {
        value: `changeCreateStep${countersignIndex}`,
        props: {
          title: countersign.name,
          countersign: countersign,
          currentPage: countersignIndex + 1,
          allStep: countersigns.length + 1
        }
      }
    })
    _items.push({
      value: `changeCreateStep${_items.length + 1}`,
      props: {
        currentPage: _items.length + 1,
        allStep: countersigns.length + 1
      }
    })
    setTabItems(_items)
  }
  const $_onSubmit = $event => {
    setCreateValue({
      ...createValue,
      changes: $event
    })
    navigation.navigate('UpdateAssignChange')
  }

  React.useEffect(() => {
    $_getStorage()
    $_fetchChangeItemTemplate()
    $_setTabValue()
  }, [])

  React.useEffect(() => {
    if (countersigns) {
      $_setTabItemsViews()
    }
  }, [countersigns])

  React.useEffect(() => {
    if (createValue) {
      $_setStorage()
    }
  }, [createValue])


  return (
    <>
      {countersigns.length != 0 && (
        <WsStepsTab
          currentTabIndex={currentTabIndex}
          setCurrentTabIndex={setCurrentTabIndex}
          items={tabItems}
          title={t('萬用初篩表')}
          viewComponent={ChangeCreateStep}
          submitText={t('下一步')}
          onSubmit={$_onSubmit}
          value={tabValue}
        />
      )}
    </>
  )
}

export default ChangeUpdateStepPage
