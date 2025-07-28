import React, { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import {
  WsFilter,
  WsPaddingContainer,
  WsText,
  WsIconTitle,
  LlTemplatesCard001,
  WsPickTemplateWithSystemClass
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import LlBtn002 from '@/components/LlBtn002'
import ServiceCheckList from '@/services/api/v1/checklist'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import store from '@/store'
import { setCurrentCheckListCreateData } from '@/store/data'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'

const CheckListCreate = () => {
  const { t, i18n } = useTranslation()
  // State
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState(false)
  const [filtersValue, setFiltersValue] = useState({})
  const [FilteredTemplateList, setFilteredTemplateList] = useState([])

  const [initParams, setInitParams] = useState({ status: '1,2' })

  // Filter default States
  const [defaultFilter, setDefaultFilter] = useState({
    frequency: { frequency: '' },
    system_subclasses: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 28]
  })

  // Fields
  const fields = {
    frequency: {
      type: 'frequency',
      label: t('篩選頻率'),
      items: [
        {
          label: t('每日'),
          frequency: 'day'
        },
        {
          label: t('每週'),
          frequency: 'week'
        },
        {
          label: t('每月'),
          frequency: 'month'
        },
        {
          label: t('每季'),
          frequency: 'season'
        },
        {
          label: t('每年'),
          frequency: 'year'
        },
        {
          label: t('每次作業前'),
          frequency: 'everyTime'
        }
      ]
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  }
  // Services
  const getFilteredTemplateList = async () => {
    const params = { ...initParams }
    if (Object.keys(filtersValue).length !== 0) {
      const string_system_subclasses = filtersValue.system_subclasses.join()
      params.system_subclasses = string_system_subclasses
      const string_frequency = filtersValue.frequency.frequency
      params.frequency = string_frequency
    }
    const res = await ServiceCheckList.getFilteredTemplateList(params)
    setInitParams(params)
    setFilteredTemplateList(res)
  }

  // Function
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  const $_templateOnPress = async checklist => {
    if (checklist.status == 1) {
      await AsyncStorage.setItem(
        'CheckListCreate',
        JSON.stringify({
          checklist_template: checklist,
          name: checklist.last_version.name,
          frequency: $_changeFrequencyChinese(checklist.frequency),
          system_classes: S_SystemClass.$_formatDataWithId(checklist.system_classes),
          system_subclasses: checklist.system_subclasses
        })
      )
      store.dispatch(
        setCurrentCheckListCreateData({
          checklist_template: checklist,
          name: checklist.last_version.name,
          frequency: $_changeFrequencyChinese(checklist.frequency),
          system_classes: S_SystemClass.$_formatDataWithId(checklist.system_classes),
          system_subclasses: checklist.system_subclasses
        })
      )
      navigation.navigate('CheckListCreate')
    }
  }

  const $_changeFrequencyChinese = frequency => {
    return frequency === 'week'
      ? t('每週')
      : frequency === 'month'
        ? t('每月')
        : frequency === 'season'
          ? t('每季')
          : frequency === 'year'
            ? t('每年')
            : frequency === 'everyTime'
              ? t('每次作業前')
              : frequency === 'day'
                ? t('每日')
                : ''
  }

  const $_otherOnPress = async () => {
    await AsyncStorage.setItem(
      'CheckListCreate',
      JSON.stringify({
        name: t('其他'),
        checklist_template: {
          name: t('其他')
        },
        frequency: '每日'
      })
    )
    navigation.navigate('CustomizeCheckListCreate')
  }

  useEffect(() => {
    getFilteredTemplateList()
  }, [filtersValue])

  return (
    <ScrollView scrollIndicatorInsets={{ right: 1 }}>
      <WsFilter
        title={t('篩選條件')}
        visible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        filterTypeName={t('篩選條件')}
        fields={fields}
        currentValue={filtersValue}
        onSubmit={$_onFilterSubmit}
        defaultFilter={defaultFilter}
      />
      <WsPaddingContainer>
        <View
          style={{
            alignItems: 'flex-start'
          }}>
          <LlBtn002
            style={{
              width: 92,
              height: 40
            }}
            onPress={() => setModalVisible(true)}>
            {t('篩選條件')}
          </LlBtn002>
        </View>
        <WsPickTemplateWithSystemClass
          modelName="checklist_template"
          params={initParams}
          text={t('找不到想新增的種類嗎？')}
          onPressText={t('點此新增「其他」')}
          onPress={$_otherOnPress}
          keyExtractor={(item, index) => {
            item.id
          }}
          renderItem={(item, index, subClass) => {
            return (
              <>
                {(item.status == 1 || item.status == 2) && item.last_version && item.last_version.name && (
                  <LlTemplatesCard001
                    key={item.id}
                    name={
                      item.status == 2
                        ? `(${t('修訂中')}) ${item.last_version.name}`
                        : item.last_version.name
                    }
                    style={[
                      index != 0
                        ? {
                          marginTop: 8
                        }
                        : null
                    ]}
                    fontColor={item.status == 2 ? $color.gray : $color.black}
                    onPress={() => {
                      $_templateOnPress(item)
                    }}
                  />
                )}
              </>
            )
          }}
        />
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default CheckListCreate
