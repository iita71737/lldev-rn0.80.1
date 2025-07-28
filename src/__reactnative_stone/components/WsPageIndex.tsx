import React, { useCallback, useMemo, useRef } from 'react'
import {
  View,
  FlatList,
  Dimensions
} from 'react-native'
import {
  WsInfiniteScroll,
  WsFilter002,
  LlBtn002,
  WsIconBtn,
  WsText,
  WsEmpty,
  WsFastImage,
  WsFlex,
  WsInfiniteScrollPagination
} from '@/components'
import i18next from 'i18next'
import Services from '@/services/api/v1/index'
import S_Processor from '@/services/app/processor'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { isEqual } from 'lodash'
import store from '@/store'
import {
  setIdleCounter
} from '@/store/data'
import { Portal, PaperProvider } from 'react-native-paper';

interface WsPageIndexProps {
  modelName: string;
  serviceIndexKey: string;
  params: any;
  hasMeta: boolean;
  getAll: boolean;
  filterFields: any;
  defaultFilterValue: any;
  onFilterChange: ($event: any) => void;
  onParamsChange: (params: any, filtersValue: any) => void;
  renderItem: (item: any, index: number, isLastItem: any) => React.ReactNode;
  ListHeaderComponentVisible: boolean;
  filterVisible: boolean;
  mode: string;
  data: any[];
  // onScroll: ($event: any) => void;
  ListFooterComponent: any;
  onRefresh: ($event: any) => void;
  searchLabel: string;
}

const WsPageIndex: React.FC<WsPageIndexProps> = (props) => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // Props
  const {
    modelName,
    serviceIndexKey,
    hasMeta,
    getAll,
    params,
    filterFields = {},
    defaultFilterValue = {
      range: "nolimit",
      system_subclasses: S_SystemClass.getAllSubSystemClassesId(systemClasses),
    },
    onParamsChange = () => { },
    renderItem,
    filterVisible = true,
    mode = 'infiniteScroll',
    data,
    emptyTitle = t('目前尚無資料'),
    emptyText = '',
    ListHeaderComponent,
    searchVisible,
    onScroll,
    searchLabel,
    ListFooterComponent,
    scrollToTargetIndex,
    onRefresh
  } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [modalVisible, setModalVisible] = React.useState(false)
  const [filtersValue, setFiltersValue] = React.useState({ ...defaultFilterValue })
  const [_params, _setParams] = React.useState({ ...params })

  // MEMO 240530-TASK-#1482#1483#1503
  const memoizedFiltersValue = React.useMemo(() => (
    {
      range: "nolimit",
      button: {
        range: "nolimit"
      },
      system_subclasses: S_SystemClass.getAllSubSystemClassesId(systemClasses),
      ...defaultFilterValue,
      ...filtersValue
    }
  ), [defaultFilterValue]);

  // FUNC
  const $_onFilterSubmit = ($event: any) => {
    // console.log($event,'$event--');
    setLoading(true)
    setModalVisible(false)
    setFiltersValue($event)
  }

  // FILTER
  const $_setParams = () => {
    const _filtersValue = S_Processor.getFormattedFiltersValue(
      filterFields,
      filtersValue
    )
    let _params = {
      ...params,
      ..._filtersValue,
    }
    onParamsChange(_params, filtersValue)
    _setParams(_params)
    setLoading(false)
  }

  // FUNC
  const filteredSystemClasses = useMemo(() => {
    if (data) {
      return data.filter((item: any) =>
        item.system_subclasses.some((subclass: any) => filtersValue.system_subclasses.includes(subclass.id))
      );
    } else if (systemClasses && filtersValue && filtersValue.system_subclasses && filtersValue.system_subclasses.length > 0) {
      return systemClasses.filter((item: any) =>
        item.system_subclasses.some((subclass: any) => filtersValue.system_subclasses.includes(subclass.id))
      );
    }
  }, [data, filtersValue, systemClasses]);

  const $_filterSubSystemClasses = (subclass: any) => {
    if (subclass) {
      const filteredArray = subclass.filter((subClass: any) => filtersValue && filtersValue.system_subclasses && filtersValue.system_subclasses.includes(subClass.id));
      return filteredArray
    }
  }

  React.useEffect(() => {
    $_setParams()
  }, [filtersValue])

  React.useEffect(() => {
    _setParams({ ...params });
  }, [params])

  return (
    <>
      {filterVisible && (
        <WsIconBtn
          testID={'WsFilter002'}
          name="bih-filter"
          underlayColor={$color.primary}
          underlayColorPressIn={$color.primary2d}
          color={$color.white}
          size={24}
          style={{
            zIndex: 999,
            position: 'absolute',
            bottom: 16,
            right: 16,
            // borderWidth:2
          }}
          onPress={() => {
            setModalVisible(true)
          }}
        />
      )}
      <WsFilter002
        visible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        filterTypeName={i18next.t('篩選條件')}
        fields={filterFields}
        onSubmit={$_onFilterSubmit}
        defaultFilter={memoizedFiltersValue ? memoizedFiltersValue : filtersValue}
        searchVisible={searchVisible}
        searchLabel={searchLabel}
      />
      {mode === 'infiniteScroll' && !loading && (
        <WsInfiniteScroll
          scrollToTargetIndex={scrollToTargetIndex}
          service={Services[modelName]}
          onRefresh={onRefresh}
          serviceIndexKey={serviceIndexKey}
          params={_params}
          hasMeta={hasMeta}
          getAll={getAll}
          emptyTitle={isEqual(filtersValue, defaultFilterValue) ? t(emptyTitle) : t('找不到符合篩選條件的結果')}
          emptyText={isEqual(filtersValue, defaultFilterValue) ? t(emptyText) : t('請重新設定您的篩選條件')}
          ListFooterComponent={ListFooterComponent}
          ListHeaderComponent={ListHeaderComponent}
          renderItem={({ item, index, items, isLastItem }: { item: any, index: number, items: any, isLastItem: any }) => {
            return (
              renderItem({
                item,
                index,
                items,
                isLastItem
              })
            )
          }}
        />
      )}
      {mode === 'system_classes' && !loading && (
        <FlatList
          data={filteredSystemClasses}
          keyExtractor={(item, index) => item + index}
          renderItem={({ item: systemClass, index }) => {
            return (
              <View
                style={{
                  borderRadius: 10
                }}
                key={index}
              >
                <WsFlex
                  style={{
                    paddingTop: 16,
                    paddingLeft: 16,
                  }}
                >
                  {systemClass.icon && (
                    <WsFastImage widthLoad={30} heightLoad={30} source={systemClass.icon} isUri={true} />
                  )}
                  <WsText
                    size={24}
                    style={{
                    }}>
                    {t(systemClass.name)}
                  </WsText>
                </WsFlex>

                <FlatList
                  data={$_filterSubSystemClasses(systemClass.system_subclasses)}
                  keyExtractor={(item, index) => item + index}
                  renderItem={({ item, index }: { item: any, index: number }) => {
                    const __params = {
                      ..._params,
                      system_classes: systemClass.id,
                      system_subclasses: item.id,
                      search: filtersValue && filtersValue.search ? filtersValue.search : undefined,
                    }
                    return (
                      renderItem({
                        item,
                        index,
                        __params,
                      })
                    )
                  }}
                  ListEmptyComponent={() => {
                    return (
                      <WsEmpty />
                    )
                  }}
                />
              </View>
            )
          }}
          ListEmptyComponent={() => {
            return (
              <WsEmpty />
            )
          }}
        />
      )}
      {mode === 'pagination' && !loading && (
        <WsInfiniteScrollPagination
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          params={_params}
          searchLabel={t('搜尋')}
          filterFields={filterFields}
          searchVisible={searchVisible}
          emptyTitle={t('目前尚無資料')}
          renderItem={({ item, index, items, isLastItem }: { item: any, index: number, items: any, isLastItem: any }) => {
            return (
              renderItem({
                item,
                index,
                items,
                isLastItem
              })
            )
          }}
          ListFooterComponent={ListFooterComponent}
          ListHeaderComponent={ListHeaderComponent}
        ></WsInfiniteScrollPagination>
      )}
    </>
  )
}

export default WsPageIndex