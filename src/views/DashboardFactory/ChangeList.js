import React from 'react'
import { ScrollView, Pressable, SafeAreaView } from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsFlex,
  LlChangeListCard001,
  WsBtn,
  WsDes,
  WsTag,
  WsCard,
  WsGradientButton,
  WsDialog,
  WsInfiniteScroll
} from '@/components'
import i18next from 'i18next'
import S_Change from '@/services/api/v1/change'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const DashboardChangeList = (props) => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // Params
  const { systemClass, type } = props

  // States
  const [popUpVisible, setPopUpVisible] = React.useState(false)
  const dialogButton = [
    {
      label: i18next.t('知道了'),
      onPress: () => {
        setPopUpVisible(false)
      }
    }
  ]
  const [params, setParams] = React.useState({
    system_classes: systemClass.id,
    order_way: type == 1 ? 'desc' : 'asc',
    order_by: type == 1 ? 'created_at' : 'expired_date',
    page: 1,
    change_status: type == 1 ? 3 : undefined,
  })

  // Option
  const $_setNavigationOption = () => {
    const titleStatusText = type == 1 ? t('執行中的') : t('評估逾期的')
    navigation.setOptions({
      title: `[${t(systemClass.name)}] ${titleStatusText}${t('變動計畫')}`
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        <WsDialog
          dialogVisible={popUpVisible}
          setDialogVisible={setPopUpVisible}
          title={i18next.t('請使用網頁版查看詳細內容')}
          dialogButtonItems={dialogButton}
        />

        <WsInfiniteScroll
          serviceIndexKey={type == 1 ? 'index' : 'expiredIndex'}
          service={S_Change}
          params={params}
          renderItem={({ item, index }) => {
            return (
              <LlChangeListCard001
                key={item.id}
                item={item}
                style={[
                  index != 0
                    ? {
                      marginTop: 8
                    }
                    : null
                ]}
                onPress={() => {
                  navigation.navigate('RoutesChange', {
                    screen: 'ChangeShow',
                    params: {
                      from: {
                        routeName: _stack[0].name,
                        routeKey: _stack[0].key,
                      },
                      id: item.id,
                      versionId: item.last_version.id,
                    }
                  })
                }}
              />
            )
          }}
        />
        <WsGradientButton
          testID={'前往變動列表'}
          isFullWidth={false}
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 16,
            margin: 16,
          }}
          borderRadius={24}
          onPress={() => {
            navigation.navigate('RoutesChange', {
              screen: 'ChangeIndex'
            })
          }}>
          {t('前往列表')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default DashboardChangeList
