import React from 'react'
import {
  ScrollView,
  Pressable,
  TouchableOpacity,
  SafeAreaView,
  View,
  Dimensions
} from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsFlex,
  WsText,
  WsIcon,
  WsBtn,
  WsDes,
  WsTag,
  WsGradientButton,
  WsDialog,
  WsInfiniteScroll,
  WsIconBtn
} from '@/components'
import i18next from 'i18next'
import S_Event from '@/services/api/v1/event'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const DashboardEventList = (props) => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // PROPS
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
    event_status: 1,
    order_way: 'desc',
    order_by: 'occur_at',
    page: 1
  })

  // HELPER
  const $_setStatusFont = event => {
    return S_Event.getStatusFont(event, t)
  }
  const $_setStatusBgc = event => {
    return S_Event.getStatusBgColor(event, t)
  }

  // NAVIGATION OPTIONS
  const $_setNavigationOption = () => {
    if (systemClass && type) {
      const titleStatusText = type == 1 ? t('新增') : t('累計')
      navigation.setOptions({
        title: `[${t(systemClass.name)}] ${t(`${titleStatusText}風險事件`)}`
      })
    }
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
          serviceIndexKey={type == 1 ? 'currentAddIndex' : 'index'}
          service={S_Event}
          padding={0}
          params={params}
          renderItem={({ item, index, isLastItem }) => {
            const titleStatusText = type == 1 ? t('新增') : t('累計')
            return (
              <>
                <TouchableOpacity
                  testID={`${systemClass.name}-${titleStatusText}-第${index + 1}筆`}
                  onPress={() => {
                    navigation.push('RoutesEvent', {
                      screen: 'EventShow',
                      params: {
                        id: item.id
                      }
                    })
                  }}>
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginBottom: 8,
                    }}>
                    <View
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: 16
                      }}>
                      <WsTag
                        backgroundColor={item ? $_setStatusBgc(item) : ''}
                        textColor={$color.gray4d}>
                        {item ? $_setStatusFont(item) : ''}
                      </WsTag>
                    </View>
                    <WsText style={{ maxWidth: width * 0.75 }}>{`${item.name}`}</WsText>
                    <WsFlex
                      flexWrap="wrap"
                      justifyContent="space-between"
                      style={{
                        marginTop: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap'
                        }}>
                        {item.system_subclasses.map(
                          (subClass, subClassIndex) => {
                            return (
                              <>
                                <WsTag
                                  img={subClass.icon}
                                  style={{
                                    marginRight: 4,
                                    marginBottom: 4
                                  }}>
                                  {t(subClass.name)}
                                </WsTag>
                              </>
                            )
                          }
                        )}
                      </View>
                    </WsFlex>
                    <WsDes>
                      {i18next.t('發生時間')}{' '}
                      {moment(item.occur_at).format('YYYY-MM-DD HH:mm')}
                    </WsDes>
                  </WsPaddingContainer>
                </TouchableOpacity>
              </>
            )
          }}
        />
        <WsGradientButton
          testID={'前往事件列表'}
          isFullWidth={false}
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 16,
            margin: 16,
          }}
          borderRadius={24}
          onPress={() => {
            navigation.navigate('EventIndex')
          }}>
          {i18next.t('前往事件列表')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default DashboardEventList
