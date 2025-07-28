import React, { useState } from 'react'
import { ScrollView, View, FlatList } from 'react-native'
import {
  WsText,
  WsNavButton,
  WsFilter,
  WsFilter002,
  LlBtn002,
  WsSkeleton,
  WsEmpty,
  LlActCard001,
  WsInfiniteScroll,
  WsNavButtonCollapse,
  LlActLibrarySystemClassCard001,
  WsCollapsible,
  WsIconBtn
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_Processor from '@/services/app/processor'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

interface LlSystemClassesListProps {
  navigation: any;
  searchValue: string;
  defaultFilter: any;

  params: any;
  renderItem: (item: any, index: number) => React.ReactNode;
}

const LlSystemClassesList: React.FC<LlSystemClassesListProps> = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    searchValue,
    defaultFilter,

    params,
    renderItem
  } = props

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentActTypes = useSelector(state => state.data.actTypes)

  // States
  const [_params, _setParams] = React.useState({ ...params })

  const [modalVisible, setModalVisible] = React.useState(false)
  const [filtersValue, setFiltersValue] = React.useState(defaultFilter)
  const [filterFields] = React.useState({
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: "actStatus"
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      items: currentActTypes ? currentActTypes : []
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false
    },
  })

  const $_filterSystemClasses = () => {
    const result = systemClasses.filter((item: any) => item.system_subclasses.some((subclass: any) => filtersValue.system_subclasses.includes(subclass.id)));
    return result
  }

  const $_filterSubSystemClasses = (subclass: any) => {
    const filteredArray = subclass.filter((subClass: any) => filtersValue.system_subclasses.includes(subClass.id));
    return filteredArray
  }

  // Function
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  // Params
  const $_setParams = () => {
    const _filtersValue = S_Processor.getFormattedFiltersValue(
      filterFields,
      filtersValue
    )
    let __params = {
      ..._params,
      ..._filtersValue,
    }
    if (searchValue && searchValue.trim().length !== 0) {
      __params = {
        ..._params,
        search: searchValue
      }
    } else {
      delete __params.search
    }
    _setParams(__params)
    if (__params && __params.system_subclasses) {
      const _subSystemArr = __params.system_subclasses.split(',')
      const _subSystemNumArr = _subSystemArr.map(Number)
      $_filterSystemClasses(_subSystemNumArr)
    }
  }

  React.useEffect(() => {
    if (searchValue && searchValue.trim()) {
      $_setParams()
    }
  }, [searchValue])

  React.useEffect(() => {
    $_setParams()
  }, [filtersValue])

  // 領域層級
  // const $_renderItem = (_systemClassId) => ({ item, index }) => {
  //   const _params = {
  //     ...params,
  //     system_classes: _systemClassId,
  //     system_subclasses: item.id,
  //   }
  //   return (
  //     <LlActLibrarySystemClassCard001
  //       key={index}
  //       item={item}
  //       params={_params}
  //     >
  //     </LlActLibrarySystemClassCard001>
  //   );
  // };

  return (
    <>
      <WsIconBtn
        name="ws-outline-filter-outline"
        underlayColor={$color.primary}
        underlayColorPressIn={$color.primary2d}
        color={$color.white}
        size={24}
        style={{
          zIndex: 1,
          position: 'absolute',
          bottom: 10,
          right: 10
        }}
        onPress={() => {
          setModalVisible(true)
        }}
      />
      <WsFilter002
        title={t('篩選條件')}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        fields={filterFields}
        onSubmit={$_onFilterSubmit}
        defaultFilter={filtersValue}
      />
      <FlatList
        data={$_filterSystemClasses()}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item, index }) => {
          const _systemClassId = item.id
          return (
            <View
              style={{
                marginTop: 16,
                borderRadius: 10
              }}
              key={index}>
              <WsText
                size={24}
                style={{
                  paddingLeft: 16,
                  paddingVertical: 16,
                }}>
                {t(item.name)}
              </WsText>

              <View
                style={{
                  borderRadius: 10,
                  paddingBottom: 16,
                  backgroundColor: $color.white
                }}
              >
                <FlatList
                  data={$_filterSubSystemClasses(item.system_subclasses)}
                  renderItem={({ item, index, isLastItem }: { item: any, index: number, isLastItem: any }) => {
                    return (
                      renderItem({
                        item,
                        index,
                        isLastItem,
                        _systemClassId,
                      })
                    )
                  }}
                  keyExtractor={(item, index) => item + index}
                  ListEmptyComponent={() => {
                    return (
                      <WsEmpty />
                    )
                  }}
                />
              </View>

            </View>
          )
        }}
        ListEmptyComponent={() => {
          return (
            <WsEmpty />
          )
        }}
      />
    </>
  )
}
export default LlSystemClassesList
