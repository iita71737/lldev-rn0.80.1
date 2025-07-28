import React from 'react'
import { ScrollView, TouchableOpacity, View, SafeAreaView } from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsFlex,
  WsText,
  WsIcon,
  WsBtn,
  WsDes,
  WsGradientButton,
  WsDialog,
  WsInfiniteScroll
} from '@/components'
import moment from 'moment'
import i18next from 'i18next'
import S_Alert from '@/services/api/v1/alert'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const DashboardAlertList = (props) => {
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
    order_way: 'desc',
    order_by: 'created_at',
    solved_at: 'null',
    system_classes: systemClass.id,
    page: 1
  })

  // Option
  const $_setNavigationOption = () => {
    const titleStatusText = type == 1 ? t('新增未排除警示') : t('累計未排除警示')
    navigation.setOptions({
      title: `[${t(systemClass.name)}] ${t(`${titleStatusText}`)}`
    })
  }

  // Function
  const $_getText = alert => {
    return S_Alert.setAlertContent(alert)
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [type])

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
          serviceIndexKey={type == 1 ? 'currentAddIndex' : 'index'}
          service={S_Alert}
          padding={0}
          params={params}
          renderItem={({ item, index }) => {
            const _alertText = $_getText(item)
            return (
              <TouchableOpacity
                testID={`未排除警示-${index}`}
                onPress={() => {
                  navigation.push('AlertShow', {
                    id: item.id,
                  })
                }}>
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                    marginBottom: 8
                  }}>
                  <WsFlex>
                    <WsFlex
                      style={{
                        flex: 1,
                        marginRight: 46
                      }}>
                      <WsIcon
                        color={
                          item.level == 1 ? $color.danger : $color.yellow
                        }
                        name="ws-filled-alert"
                        size={22}
                        style={{ marginRight: 16 }}
                      />
                      <View
                        style={{
                          flexDirection: 'column'
                        }}>
                        <WsText
                          style={{
                            flexWrap: 'wrap',
                            marginBottom: 4
                          }}>
                          {_alertText.title}
                        </WsText>
                        <WsDes>
                          {t('發生時間')}{' '}
                          {moment(item.created_at).format(
                            'YYYY-MM-DD HH:mm'
                          )}
                        </WsDes>
                      </View>
                    </WsFlex>
                    <WsIcon size={22} name="md-chevron-right" />
                  </WsFlex>
                </WsPaddingContainer>
              </TouchableOpacity>
            )
          }}
          emptyTitle={t('目前尚無資料')}
          emptyText={t('')}
        />
        <WsGradientButton
          testID={'前往警示列表'}
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 16,
            margin: 16,
          }}
          borderRadius={24}
          onPress={() => {
            navigation.push('RoutesAlert', {
              screen: 'AlertIndex',
              params: {
                tabIndex: 1
              }
            })
          }}>
          {t('前往列表')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default DashboardAlertList
