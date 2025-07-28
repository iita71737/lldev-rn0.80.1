import React, { useState, useMemo } from 'react'
import { ScrollView, View, Text, Dimensions, Platform } from 'react-native'
import {
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsPage,
  WsSkeleton,
  LlInfoContainer001,
  LlIconCard001,
  WsIcon,
  WsIconBtn,
  WsState,
  LlFactoryIndexingDataCard001
} from '@/components'
import { useSelector } from 'react-redux'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import factoryTotalAnalysis from '@/services/api/v1/factory_total'
import S_Factory from '@/services/api/v1/factory'
import moment from 'moment'
import i18next from 'i18next'

const EachFactoryIndexingData = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  // States
  const [factoryIndexingData, setFactoryIndexingData] = React.useState()

  const [loading, setLoading] = React.useState(true)
  const [isSearch, setIsSearch] = React.useState(false)

  const [searchValue, setSearchValue] = React.useState()
  const [sortValue, setSortValue] = React.useState()

  const [filterFactories, setFilterFactories] = React.useState()
  const [params, setParams] = React.useState({
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
    time_field: 'created_at',
    get_all: 1
  })

  // Functions
  const $_getAllFactories = () => {
    const _allFactories = S_Factory.getAccessibleAllFactories(
      currentUser,
      currentOrganization.id
    )
    const _factory = _allFactories.map(factory => factory.id).toString()
    setFilterFactories(_factory)
  }

  const $_setParams = () => {
    const _params = {
      ...params,
      ...sortValue,
      factory: filterFactories ? filterFactories : null,
    }
    if (searchValue && searchValue.trim().length !== 0) {
      _params.search = searchValue
    } else {
      delete _params.search
    }
    setParams(_params)
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => (
        <WsIconBtn
          name={'md-arrow-back'}
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />
      ),
      headerRight: () => {
        return (
          <WsIconBtn
            name="ws-outline-search"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setIsSearch(!isSearch)
            }}
          />
        )
      },
      headerTitle: () =>
        isSearch ? (
          <WsState
            type="search"
            stateStyle={{
              width: width * 0.65,
              height: Platform.OS == 'ios' ? 35 : 40,
              borderRadius: 25
            }}
            value={searchValue}
            onChange={setSearchValue}
          />
        ) : (
          <WsText color={$color.white}>{t('各廠指標數據')}</WsText>
        )
    })
  }

  // Services
  const $_fetchFactory = async () => {
    try {
      const _params1 = {
        organization: currentOrganization ? currentOrganization.id : currentFactory.id,
      }
      if (searchValue && searchValue.trim().length !== 0) {
        _params1.search = searchValue
      } else {
        delete _params1.search
      }
      const _res = await S_Factory.userIndex({ params: _params1 })
      const _ids = S_Factory.getIdsByArray(_res.data)

      const _params = {
        ...params,
        organization: currentOrganization.id,
        factory: _ids ? _ids : undefined,
      }
      delete _params.get_all
      delete _params.search
      console.log(_params,'_params--');
      const res = await factoryTotalAnalysis.indexV2({ params: _params })
      // console.log(JSON.stringify(res),'res--');
      setFactoryIndexingData(res.data)
      setLoading(false)
    } catch (err) {
      alert(err);
    }
  }

  // Hooks
  React.useEffect(() => {
    $_fetchFactory()
  }, [params, searchValue])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [isSearch])

  React.useEffect(() => {
    if (filterFactories || searchValue) {
      $_setParams()
    }
  }, [searchValue, filterFactories])

  React.useEffect(() => {
    if (sortValue) {
      $_setParams()
    }
  }, [sortValue])

  React.useEffect(() => {
    if (currentUser && currentOrganization) {
      $_getAllFactories()
    }
  }, [currentUser, currentOrganization])

  return (
    <>
      <ScrollView>
        <WsPaddingContainer>
          {loading ? (
            <>
              <WsSkeleton />
              <WsSkeleton />
              <WsSkeleton />
              <WsSkeleton />
            </>
          ) : (
            <>
              {factoryIndexingData &&
                factoryIndexingData.map((item, index) => {
                  return <LlFactoryIndexingDataCard001 key={index} item={item} />
                })}
            </>
          )}
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default EachFactoryIndexingData
