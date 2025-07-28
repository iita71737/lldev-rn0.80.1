import React from 'react'
import {
  Pressable,
  View,
  Dimensions,
  ScrollView
} from 'react-native'
import {
  WsCalendarCombined,
  WsCalendarCombinedWow,
  WsIconBtn,
  WsPopup,
  WsLoading,
  WsGradientButton,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsCard
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_License from '@/services/api/v1/license'
import S_LicenseTemplateVersion from '@/services/api/v1/license_template_version'
import { useSelector } from 'react-redux'
import S_Calendar from '@/__reactnative_stone/services/wasa/calendar'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import S_LicenseVersion from '@/services/api/v1/license_version'

const LicenseCalendarList = (props) => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes
  const { width, height } = Dimensions.get('window')

  const {
    tabFocus
  } = props

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // PROPS
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupContentType, setPopupContentType] = React.useState()
  const [dateOfList, setDateOfList] = React.useState()
  const [listOfTheDay, setListOfTheDay] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [popupContent, setPopupContent] = React.useState()

  const markedDotsType = [
    {
      type: 'endTime',
      color: $color.danger
    },
    {
      type: 'remind',
      color: $color.yellow
    },
    {
      type: 'extension',
      color: $color.primary
    }
  ]

  // STATES
  const [filterLoading, setFilterLoading] = React.useState(true)
  const [servicesData, setServicesData] = React.useState()

  const $_setServicesData = () => {
    setServicesData([
      {
        time_field: 'valid_end_date',
        dots: 'endTime',
        service: S_License,
        serviceIndexKey: 'index',
        bgc: $color.danger11l,
        icon: 'ws-outline-calendar-duedate',
        nameKey: 'valid_end_date',
        textColor: $color.black,
        preText: `[${t('期限到期')}]`,
        type: 'endTime',
      },
      {
        time_field: 'remind_date',
        service: S_License,
        dots: 'remind',
        serviceIndexKey: 'index',
        bgc: $color.yellow11l,
        icon: 'll-nav-alert-outline',
        nameKey: 'remind_date',
        textColor: $color.black,
        preText: `[${t('續辦提醒')}]`,
        type: 'remind',
      },
      {
        bgc: $color.primary11l,
        icon: 'ws-outline-calendar-extension',
        time_type: 'statitory_extension_period',
        nameKey: 'statitory_extension_date',
        service: S_License,
        serviceIndexKey: 'index',
        textColor: $color.black,
        dots: 'extension',
        preText: `[${'辦理展延'}]`,
        format: 'YYYY-MM-DD',
        type: 'extension',
      },
      {
        time_field: 'retraining_remind_date',
        nameKey: 'retraining_remind_date',
        dots: 'remind',
        service: S_License,
        serviceIndexKey: 'index',
        bgc: $color.danger11l,
        icon: 'ws-outline-calendar-duedate',
        textColor: $color.danger,
        preText: t('[回訓提醒]'),
        type: 'remind',
      },
    ])
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => null,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  // Function
  const $_fetchPopupData = async $event => {
    let id = $event.id
    if ($event.type == 'license') {
      try {
        const res = await S_License.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    } else if ($event.type == 'remind') {
      try {
        const res = await S_LicenseVersion.show({ modelId: $event?.payload[0]?.last_version?.id })
        return res
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    } else if ($event.type == 'endTime') {
      try {
        const res = await S_LicenseVersion.show({ modelId: $event?.payload[0]?.last_version?.id })
        return res
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    } else if ($event.type == 'extension') {
      try {
        return $event.payload[0]
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    }
  }
  const $_onDayPress = (event, journeyItems) => {
    const _date = event.dateString
    const _data = journeyItems ? journeyItems[_date] : null
    setPopupActive(true)
    setPopupContentType('list')
    setDateOfList(_date)
    setListOfTheDay(_data)
    setLoading(false)
  }
  const $_markedDateOnPress = async $event => {
    // console.log(JSON.stringify($event), '$event');
    setLoading(true)
    setPopupActive(true)
    let _content = {
      title: $event.text,
      ...$event
    }
    const _res = await $_fetchPopupData($event)
    // console.log(_res, '$_fetchPopupData');
    _content = {
      ..._content,
      ..._res
    }
    setPopupContentType($event?.type ? $event?.type : 'content')
    setPopupContent(_content)
    setLoading(false)
  }
  const $_routeToPage = $event => {
    if ($event?.preText && $event?.preText?.includes(t('回訓提醒'))) {
      console.log('1111');
      navigation.navigate('RoutesLicense', {
        screen: 'LicenseShow',
        params: {
          id: $event.payload[0]?.id,
          type: {
            name: t('人員證照（須回訓者）')
          }
        }
      })
    } else {
      console.log('222');
      navigation.navigate('RoutesLicense', {
        screen: 'LicenseShow',
        params: {
          id:  $event.payload[0]?.id,
        }
      })
    }
    setPopupActive(false)
  }


  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [])


  React.useEffect(() => {
    $_setServicesData()
  }, [])

  return (
    <>
      {servicesData && (
        <WsCalendarCombinedWow
          setFilterLoading={setFilterLoading}
          markedDotsType={markedDotsType}
          servicesData={servicesData}
          onDayPress={$_onDayPress}
          markedDateOnPress={$_markedDateOnPress}
        />
      )}

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            maxHeight: height * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
            justifyContent: loading ? 'center' : 'flex-start',
            alignItems: loading ? 'center' : popupContentType === 'list' ? 'center' : 'flex-start'
          }}>
          {loading ? (
            <WsLoading />
          ) : (
            <>
              {popupContent && popupContentType && (
                <>
                  <ScrollView>
                    {/* 續辦提醒 */}
                    {popupContentType === 'remind' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              label={t('續辦提醒')}
                              icon="ws-outline-reminder"
                              color={$color.primary3l}
                              textColor={$color.primary}
                              value={
                                popupContent.remind_date
                                  ? moment(popupContent.remind_date).format('YYYY-MM-DD')
                                  : t('未設定')
                              }
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type="user"
                              label={t('管理者')}
                              value={
                                popupContent.reminder
                                  ? popupContent.reminder
                                  : t('無')
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                popupContent.taker
                                  ? popupContent.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              value={
                                popupContent.license_number
                                  ? popupContent.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              label={t('有效起迄')}
                              value={
                                popupContent?.valid_start_date && popupContent?.valid_end_date ?
                                  `${moment(popupContent.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(popupContent.valid_end_date).format('YYYY-MM-DD')}` :
                                  popupContent?.valid_start_date ?
                                    `${moment(popupContent.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                    `${t('無')}`
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 期限到期 */}
                    {popupContentType === 'endTime' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              label={t('期限到期')}
                              icon="ws-outline-reminder"
                              color={$color.primary3l}
                              textColor={$color.primary}
                              value={
                                popupContent.valid_end_date
                                  ? moment(popupContent.valid_end_date).format('YYYY-MM-DD')
                                  : t('未設定')
                              }
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type="user"
                              label={t('管理者')}
                              value={
                                popupContent.reminder
                                  ? popupContent.reminder
                                  : t('無')
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                popupContent.taker
                                  ? popupContent.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              value={
                                popupContent.license_number
                                  ? popupContent.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              label={t('有效起迄')}
                              value={
                                popupContent?.valid_start_date && popupContent?.valid_end_date ?
                                  `${moment(popupContent.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(popupContent.valid_end_date).format('YYYY-MM-DD')}` :
                                  popupContent?.valid_start_date ?
                                    `${moment(popupContent.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                    `${t('無')}`
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 辦法展延 */}
                    {popupContentType === 'extension' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              label={t('法定展延')}
                              icon="ws-outline-reminder"
                              color={$color.primary3l}
                              textColor={$color.primary}
                              value={
                                popupContent.statitory_extension_date
                                  ? moment(popupContent.statitory_extension_date).format('YYYY-MM-DD')
                                  : t('未設定')
                              }
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type="user"
                              label={t('管理者')}
                              value={
                                popupContent?.last_version?.reminder
                                  ? popupContent?.last_version?.reminder
                                  : t('無')
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                popupContent?.last_version?.taker
                                  ? popupContent?.last_version?.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              value={
                                popupContent?.last_version?.license_number
                                  ? popupContent?.last_version?.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={80}
                              label={t('有效起迄')}
                              value={
                                popupContent?.last_version?.valid_start_date && popupContent?.last_version?.valid_end_date ?
                                  `${moment(popupContent?.last_version?.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(popupContent?.last_version?.valid_end_date).format('YYYY-MM-DD')}` :
                                  popupContent?.last_version?.valid_start_date ?
                                    `${moment(popupContent?.last_version?.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                    `${t('無')}`
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                  </ScrollView>
                </>
              )}
              {dateOfList && popupContentType === 'list' && (
                <WsText color={$color.black} style={{ marginBottom: 16 }}>
                  {dateOfList}
                </WsText>
              )}
              <>
                <ScrollView>
                  {listOfTheDay &&
                    popupContentType === 'list' &&
                    listOfTheDay.length > 0 &&
                    listOfTheDay.map(dateItem => {
                      return (
                        <WsCard
                          padding={0}
                          style={{
                            marginBottom: 4,
                            paddingVertical: 8,
                            paddingHorizontal: 8
                          }}>
                          <WsText>{dateItem.text}</WsText>
                          {/* <WsText>{JSON.stringify(dateItem)}</WsText> */}
                        </WsCard>
                      )
                    })}
                </ScrollView>
              </>
              {popupContentType != 'list' && (
                <WsGradientButton onPress={() => $_routeToPage(popupContent)}>
                  {t('查看詳細資料')}
                </WsGradientButton>
              )}
            </>
          )}
        </View>
      </WsPopup>

    </>
  )
}
export default LicenseCalendarList
