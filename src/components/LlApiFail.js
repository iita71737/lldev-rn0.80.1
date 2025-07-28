import React from 'react'
import { WsDialog, WsText, WsFlex } from '@/components'
import {
  useNavigation,
  useRoute,
  NavigationState
} from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { setDataFail } from '@/store/data'
import store from '@/store'
import { useTranslation } from 'react-i18next'

const LlApiFail = () => {
  const { t, i18n } = useTranslation()

  const navigation = useNavigation()
  const route = useRoute()

  // Redux
  const apiFail = useSelector(state => state.data.dataFail)

  // State
  const [visible, setVisible] = React.useState(apiFail)
  const dialogButtonItems = [
    {
      label: t('返回'),
      onPress: () => {
        $_close()
      }
    }
  ]

  // Function
  const $_close = () => {
    const routeState = navigation.getState()
    if (
      !routeState.routes ||
      routeState.routes.length == 0 ||
      routeState.index >= routeState.routes.length
    ) {
      navigation.navigate('DashboardFactory')
    } else if (routeState.routes[routeState.index]) {
      navigation.navigate('DashboardFactory')

      const stateIndex = routeState.routes[routeState.index].state.index
      const routeName =
        routeState.routes[routeState.index].state.routes[stateIndex].name

      const screenName = routeState.routes[routeState.index].state.routes[
        stateIndex
      ].state
        ? routeState.routes[routeState.index].state.routes[stateIndex].state
          .routeNames[0]
        : null

      navigation.navigate(
        routeName,
        screenName
          ? {
            screen: screenName
          }
          : null
      )
    }
    store.dispatch(setDataFail(false))
  }

  React.useEffect(() => {
    setVisible(apiFail)
  }, [apiFail])

  return (
    <>
      <WsDialog
        dialogVisible={visible}
        dialogButtonItems={dialogButtonItems}
        setDialogVisible={$_close}
        paddingLeft={0}
        style={{
          width: 200
        }}
        headerStyle={{
          padding: 0,
          margin: 0
        }}
        contentStyle={{
          paddingBottom: 0,
          width: 310,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 16,
          paddingRight: 16,
          backgroundColor: 'white'
        }}>
        <WsFlex
          flexWrap="wrap"
          style={{
            width: 310,
            paddingRight: 16
          }}>
          <WsText>{t('這個頁面已經不存在囉！這筆資料可能已被人刪除。')}</WsText>
        </WsFlex>
      </WsDialog>
    </>
  )
}

export default LlApiFail
