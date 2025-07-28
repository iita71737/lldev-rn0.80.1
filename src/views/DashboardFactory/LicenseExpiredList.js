import React from 'react'
import {
  ScrollView,
  Pressable,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList
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
  WsCard,
  WsSkeleton,
  WsGradientButton,
  WsDialog,
  WsEmpty,
  WsInfiniteScroll
} from '@/components'
import DashBoardSystemClass from '@/sections/Dashboard/DashBoardSystemClasses'
import i18next from 'i18next'
import S_License from '@/services/api/v1/license'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import S_Event from '@/services/api/v1/event'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const DashboardLicenseExpiredList = (props) => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const navigation = useNavigation()

  // PROPS
  const { systemClass, type } = props

  // State
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
    order_way: 'asc',
    order_by: 'valid_end_date',
    time_field: 'valid_end_date',
    page: 1,
  })

  // HELPER
  const $_setStatusFont = license => {
    return S_License.getStatusFont(license, t)
  }
  const $_setStatusBgc = license => {
    return S_License.getStatusBgColor(license, t)
  }
  const $_setStatusFontColor = license => {
    return S_License.getStatusFontColor(license, t)
  }

  // Option
  const $_setNavigationOption = () => {
    const titleStatusText = type == 1 ? t('已逾期證照') : t('即將到期證照')
    navigation.setOptions({
      title: `[${t(systemClass.name)}] ${t(titleStatusText)}`
    })
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
          serviceIndexKey={type == 1 ? 'expiredIndex' : 'expiringIndex'}
          service={S_License}
          params={params}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  style={{
                    marginTop: 16,
                    marginHorizontal: 16,
                  }}
                  key={index}
                  onPress={() => {
                    navigation.navigate('RoutesLicense', {
                      screen: 'LicenseShow',
                      params: {
                        id: item.id
                      }
                    })
                  }}>
                  <WsCard
                    style={{
                      backgroundColor: $color.white,
                      marginBottom: 8
                    }}>
                    <WsText>{item.name}</WsText>
                    <WsFlex flexWrap={'wrap'} justifyContent="space-between">
                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap'
                        }}>
                        {item.system_subclasses.map(
                          (subClass, subClassIndex) => {
                            return (
                              <WsTag
                                img={subClass.icon}
                                style={{
                                  marginRight: 4,
                                  marginTop: 4
                                }}>
                                {t(subClass.name)}
                              </WsTag>
                            )
                          }
                        )}
                      </View>
                      <View
                        style={{
                          marginVertical: 4
                        }}>
                        <WsTag
                          backgroundColor={item ? $_setStatusBgc(item) : ''}
                          textColor={item ? $_setStatusFontColor(item) : ''}>
                          {item ? $_setStatusFont(item) : ''}
                        </WsTag>
                      </View>
                    </WsFlex>
                    <WsFlex style={{ marginTop: 8 }}>
                      <WsDes style={{ marginRight: 8 }}>
                        {i18next.t('到期日')}
                      </WsDes>
                      <WsDes color={type == 1 ? $color.danger : $color.gray}>
                        {moment(item.last_version.valid_end_date).format('YYYY-MM-DD')}
                      </WsDes>
                    </WsFlex>
                    <WsFlex style={{ marginTop: 8 }}>
                      <WsDes style={{ marginRight: 8 }}>
                        {i18next.t('持有人')}
                      </WsDes>
                      <WsDes>
                        {item.last_version && item.last_version.taker
                          ? item.last_version.taker.name
                          : '無'}
                      </WsDes>
                    </WsFlex>
                    <WsFlex style={{ marginTop: 8 }}>
                      <WsDes style={{ marginRight: 8 }}>
                        {i18next.t('管理者')}
                      </WsDes>
                      <WsDes>
                        {item.last_version && item.last_version.reminder
                          ? item.last_version.reminder.name
                          : '無'}
                      </WsDes>
                    </WsFlex>
                  </WsCard>
                </TouchableOpacity>
              </>
            )
          }}
        />
        <WsGradientButton
          testID={'前往證照列表'}
          isFullWidth={false}
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 16,
            margin: 16,
          }}
          borderRadius={24}
          onPress={() => {
            navigation.navigate('RoutesLicense', {
              screen: 'LicenseIndex'
            })
          }}
        >
          {i18next.t('前往列表')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default DashboardLicenseExpiredList
