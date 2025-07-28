import React from 'react'
import { View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native'
import {
  WsText,
  WsSectionTitle,
  WsIconBtn,
  WsSkeleton,
  WsLoading,
  WsIcon,
  WsFlex,
  LlLvInfoMultiLayer
} from '@/components'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import {
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentTimezone,
  setCurrentViewMode,
  setUserScopes,
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import { NativeModules, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';
import S_Factory from '@/services/api/v1/factory'
import {
} from '@/__reactnative_stone/store/app'

const FactoryAndOrganization = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentTimezone = useSelector(state => state.data.currentTimezone)

  // State
  const [loading, setLoading] = React.useState(true)
  const [changeLoading, setChangeLoading] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState(currentViewMode === 'organization' ? currentOrganization : currentFactory)
  const [viewMode, setViewMode] = React.useState(currentViewMode)
  const [scopesFactories, setScopesFactories] = React.useState([])

  // Store
  const $_setStorage = (viewMode, selectedItem) => {
    if (viewMode === 'organization') {
      $_setLocalStorage(selectedItem, 'organization')
      store.dispatch(setCurrentOrganization(selectedItem))
      store.dispatch(setCurrentViewMode('organization'))
      store.dispatch(setCurrentFactory(selectedItem)) //240617-#1545
      if (currentViewMode === viewMode) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RoutesApp'
            }
          ],
          key: null
        })
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RoutesFactory'
            }
          ],
          key: null
        })
      }
    }
    else if (viewMode === 'factory') {
      if (selectedItem && selectedItem.id) {
        $_checkoutFactory(selectedItem)
      }
      $_setLocalStorage(selectedItem, 'factory')
      store.dispatch(setCurrentViewMode('factory'))
      if (currentViewMode === viewMode) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RoutesApp'
            }
          ],
          key: null
        })
      }
      else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RoutesOrganization'
            }
          ],
          key: null
        })
      }
    }
    setChangeLoading(false)
  }

  // SERVICES
  const $_checkoutFactory = async (unit) => {
    try {
      const _factory = await S_Factory.show({ modelId: unit.id })
      store.dispatch(setCurrentFactory(_factory))
      store.dispatch(setCurrentTimezone(unit?.timezone))
    } catch (e) {
      console.error(e);
      store.dispatch(setCurrentFactory(unit))
      store.dispatch(setCurrentTimezone(unit?.timezone))
    }
  }

  // Local Storage
  const $_setLocalStorage = async (item, mode) => {
    if (mode === 'factory') {
      try {
        await AsyncStorage.setItem('factory', JSON.stringify(item))
        await AsyncStorage.removeItem('organization');
      }
      catch (exception) {
        console.log(exception)
      }
    }
    if (mode === 'organization') {
      try {
        await AsyncStorage.setItem('organization', JSON.stringify(item))
        await AsyncStorage.removeItem('factory');
      }
      catch (exception) {
        console.log(exception)
      }
    }
  }

  // Scopes & Roles
  const $_userScopesSet = () => {
    const _scopes = []
    // Roles
    currentUser.user_factory_roles.forEach(role => {
      if (role.factory.id == currentFactory.id) {
        role.scopes.forEach(roleScope => {
          if (!_scopes.includes(roleScope)) {
            _scopes.push(roleScope)
          }
        })
      }
    })
    // Factory scopes
    currentUser.user_factory_scopes.forEach(factory => {
      factory.scopes.forEach(factoryScope => {
        if (!_scopes.includes(factoryScope)) {
          _scopes.push(factoryScope)
        }
      })
    })
    store.dispatch(setUserScopes(_scopes))
  }

  // UNIT_ON_PRESS
  const onPressUnit = (unit) => {
    if (!unit) {
      return
    }
    if (selectedItem && selectedItem.id !== unit.id) {
      setChangeLoading(true)
      if (unit && unit.name.includes('集團')) {
        $_setStorage('organization', unit)
      }
      else if (unit && unit.name.includes('廠')) {
        $_setStorage('factory', unit)
      }
      else {
        $_setStorage('factory', unit)
      }
    }
  }

  const $_initScopeFactory = () => {
    let _factories = []
    currentUser.factories.map((factory, itemIndex) => {
      // USER ROLES
      const firstRole = currentUser.user_factory_roles.find(role => {
        return factory.id == role.factory.id
      })
      // FACTORY SCOPES
      const firstScope = currentUser.user_factory_scopes.find(scope => {
        return factory.id == scope.factory.id && scope.scopes.includes('app-apply')
      })
      // FACTORY TEMPLATE SCOPES
      const _templateScope = currentUser.user_factory_role_templates.find(templateRole => {
        return factory.id == templateRole.factory_id
      })
      if (firstRole || firstScope || _templateScope) {
        _factories.push(factory)
      }
    })
    setScopesFactories(_factories)
  }

  React.useEffect(() => {
    if (currentUser) {
      setLoading(false)
      $_initScopeFactory()
    }
  }, [currentUser])


  return (
    <>
      {loading && !changeLoading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          {changeLoading ? (
            <WsLoading style={{ flex: 1 }}></WsLoading>
          ) : (
            <ScrollView scrollIndicatorInsets={{ right: 1 }}>
              <WsSectionTitle icon="ws-outline-enterprise">{t('單位')}</WsSectionTitle>
              <LlLvInfoMultiLayer
                items={scopesFactories ? scopesFactories : currentUser && currentUser.factories ? currentUser.factories : []}
                value={selectedItem}
                onChange={onPressUnit}
              ></LlLvInfoMultiLayer>
            </ScrollView>
          )
          }
        </>
      )}
    </>
  )
}
export default FactoryAndOrganization
