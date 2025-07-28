import React from 'react'
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  View,
  Dimensions,
  KeyboardAvoidingView
} from 'react-native'
import {
  WsCalendarCombinedWow,
  WsPopup,
  WsText,
  WsGradientButton,
  WsLoading,
  WsCard,
  WsModal,
  WsState,
  WsIconBtn,
  WsInfo,
  WsFlex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_License from '@/services/api/v1/license'
import S_Event from '@/services/api/v1/event'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_Training from '@/services/api/v1/training'
import S_Task from '@/services/api/v1/task'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_LicenseVersion from '@/services/api/v1/license_version'
import { WsPaddingContainer } from '@/components'

const BoardCalendar = ({ navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [stateModal, setStateModal] = React.useState(false)
  const [moduleType, setModuleType] = React.useState([])
  const [filterLoading, setFilterLoading] = React.useState(true)

  const [popupActive, setPopupActive] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [popupContentType, setPopupContentType] = React.useState()
  const [popupContent, setPopupContent] = React.useState()

  const [dateOfList, setDateOfList] = React.useState()
  const [listOfTheDay, setListOfTheDay] = React.useState()

  const [servicesData, setServiceData] = React.useState([
    {
      id: 'event',
      parentId: currentFactory.id,
      time_field: 'occur_at',
      type: 'event',
      service: S_Event,
      serviceIndexKey: 'indexBoard',
      bgc: $color.white1d,
      icon: 'ws-outline-calendar-duedate',
      nameKey: 'occur_at',
      format: 'YYYY-MM-DD',
      textColor: $color.black,
      preText: `[${t('事件')}]`
    },
    {
      id: 'enter',
      parentId: currentFactory.id,
      service: S_ContractorEnterRecord,
      type: 'enter_record',
      serviceIndexKey: 'indexBoard',
      bgc: $color.white1d,
      icon: 'll-nav-alert-outline',
      nameKey: 'enter_start_date',
      format: 'YYYY-MM-DD',
      textColor: $color.black,
      preText: `[${t('進場')}]`,
      params: {
        get_all: 1
      }
    },
    {
      id: 'license',
      parentId: currentFactory.id,
      bgc: $color.white1d,
      service: S_License,
      icon: 'ws-outline-calendar-extension',
      nameKey: 'remind_date',
      time_field: 'remind_date',
      textColor: $color.black,
      type: 'license',
      format: 'YYYY-MM-DD',
      serviceIndexKey: 'index',
      preText: `[${t('證照')}]`,
      params: {
        reminder: currentUser.id
      }
    },
    {
      id: 'training',
      parentId: currentFactory.id,
      bgc: $color.white1d,
      service: S_Training,
      serviceIndexKey: 'indexBoard',
      icon: 'ws-outline-calendar-extension',
      nameKey: 'train_at',
      time_field: 'train_at',
      format: 'YYYY-MM-DD',
      textColor: $color.black,
      type: 'training',
      preText: `[${t('教育訓練')}]`,
      params: {
        reminder: currentUser.id
      }
    },
    {
      id: 'task',
      parentId: currentFactory.id,
      bgc: $color.white1d,
      service: S_Task,
      serviceIndexKey: 'indexBoard',
      icon: 'ws-outline-calendar-extension',
      nameKey: 'expired_at',
      time_field: 'expired_at',
      textColor: $color.black,
      type: 'task',
      format: 'YYYY-MM-DD',
      preText: `[${t('任務')}]`, params: {
        taker: currentUser.id
      }
    },
    {
      id: 'license',
      parentId: currentFactory.id,
      time_field: 'remind_date',
      service: S_License,
      serviceIndexKey: 'indexBoard',
      type: 'remind',
      bgc: $color.yellow11l,
      icon: 'll-nav-alert-outline',
      nameKey: 'remind_date',
      textColor: $color.black,
      preText: t('[續辦提醒]')
    },
    {
      id: 'license',
      parentId: currentFactory.id,
      bgc: $color.primary11l,
      icon: 'ws-outline-calendar-extension',
      time_type: 'statitory_extension_period',
      service: S_License,
      serviceIndexKey: 'indexBoard',
      nameKey: 'statitory_extension_date',
      textColor: $color.black,
      type: 'extension',
      preText: t('[辦理展延]'),
      format: 'YYYY-MM-DD'
    },
    {
      id: 'license',
      parentId: currentFactory.id,
      time_field: 'valid_end_date',
      type: 'endTime',
      service: S_License,
      serviceIndexKey: 'indexBoard',
      bgc: $color.danger11l,
      icon: 'ws-outline-calendar-duedate',
      nameKey: 'valid_end_date',
      textColor: $color.black,
      preText: `[${t('期限到期')}]`
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
      type: 'license',
    },
    {
      id: 'audit',
      parentId: currentFactory.id,
      bgc: $color.white1d,
      service: S_AuditRequest,
      serviceIndexKey: 'indexBoard',
      icon: 'ws-outline-calendar-extension',
      nameKey: 'record_at',
      time_field: 'record_at',
      textColor: $color.black,
      type: 'audit_request',
      format: 'YYYY-MM-DD',
      preText: `[${t('稽核')}]`,
      params: {
        auditors: currentUser.id
      }
    },
    {
      id: 'audit',
      parentId: currentFactory.id,
      bgc: $color.white1d,
      service: S_AuditRequest,
      serviceIndexKey: 'indexBoard',
      icon: 'ws-outline-calendar-extension',
      nameKey: 'record_at',
      time_field: 'record_at',
      textColor: $color.black,
      type: 'audit_request',
      format: 'YYYY-MM-DD',
      preText: `[${t('稽核')}]`,
      params: {
        auditees: currentUser.id,
        get_all: 1
      }
    }
  ])

  const $_onSubmit = () => {
    const _service = [
      {
        id: 'event',
        time_field: 'occur_at',
        type: 'event',
        service: S_Event,
        serviceIndexKey: 'indexBoard',
        bgc: $color.white1d,
        icon: 'ws-outline-calendar-duedate',
        nameKey: 'occur_at',
        format: 'YYYY-MM-DD',
        textColor: $color.black,
        preText: `[${t('事件')}]`
      },
      {
        id: 'enter',
        service: S_ContractorEnterRecord,
        type: 'enter_record',
        serviceIndexKey: 'indexBoard',
        bgc: $color.white1d,
        icon: 'll-nav-alert-outline',
        nameKey: 'enter_start_date',
        format: 'YYYY-MM-DD',
        textColor: $color.black,
        preText: `[${t('進場')}]`
      },
      {
        id: 'license',
        bgc: $color.white1d,
        service: S_License,
        icon: 'ws-outline-calendar-extension',
        nameKey: 'remind_date',
        time_field: 'remind_date',
        textColor: $color.black,
        type: 'license',
        format: 'YYYY-MM-DD',
        serviceIndexKey: 'index',
        preText: `[${t('證照')}]`,
        params: {
          reminder: currentUser.id
        }
      },
      {
        id: 'training',
        bgc: $color.white1d,
        service: S_Training,
        serviceIndexKey: 'indexBoard',
        icon: 'ws-outline-calendar-extension',
        nameKey: 'train_at',
        time_field: 'train_at',
        format: 'YYYY-MM-DD',
        textColor: $color.black,
        type: 'training',
        preText: `[${t('教育訓練')}]`,
        params: {
          reminder: currentUser.id
        }
      },
      {
        id: 'task',
        bgc: $color.white1d,
        service: S_Task,
        serviceIndexKey: 'indexBoard',
        icon: 'ws-outline-calendar-extension',
        nameKey: 'expired_at',
        time_field: 'expired_at',
        textColor: $color.black,
        type: 'task',
        format: 'YYYY-MM-DD',
        preText: `[${t('任務')}]`
      },
      {
        id: 'license',
        time_field: 'remind_date',
        service: S_License,
        serviceIndexKey: 'indexBoard',
        type: 'remind',
        bgc: $color.yellow11l,
        icon: 'll-nav-alert-outline',
        nameKey: 'remind_date',
        textColor: $color.black,
        preText: `[${t('續辦提醒')}]`
      },
      {
        id: 'license',
        bgc: $color.primary11l,
        icon: 'ws-outline-calendar-extension',
        time_type: 'statitory_extension_period',
        service: S_License,
        serviceIndexKey: 'indexBoard',
        nameKey: 'statitory_extension_date',
        textColor: $color.black,
        type: 'extension',
        preText: `[${t('辦理展延')}]`,
        format: 'YYYY-MM-DD'
      },
      {
        id: 'license',
        time_field: 'valid_end_date',
        type: 'endTime',
        service: S_License,
        serviceIndexKey: 'indexBoard',
        bgc: $color.danger11l,
        icon: 'ws-outline-calendar-duedate',
        nameKey: 'valid_end_date',
        textColor: $color.black,
        preText: `[${t('期限到期')}]`,
      },

      {
        id: 'audit',
        bgc: $color.white1d,
        service: S_AuditRequest,
        serviceIndexKey: 'indexBoard',
        icon: 'ws-outline-calendar-extension',
        nameKey: 'record_at',
        time_field: 'record_at',
        textColor: $color.black,
        type: 'audit_request',
        format: 'YYYY-MM-DD',
        preText: `[${t('稽核')}]`,
        params: {
          auditors: currentUser.id
        }
      },
      {
        id: 'audit',
        bgc: $color.white1d,
        service: S_AuditRequest,
        serviceIndexKey: 'indexBoard',
        icon: 'ws-outline-calendar-extension',
        nameKey: 'record_at',
        time_field: 'record_at',
        textColor: $color.black,
        type: 'audit_request',
        format: 'YYYY-MM-DD',
        preText: `[${t('稽核')}]`,
        params: {
          auditees: currentUser.id,
          get_all: 1
        }
      }
    ]
    const _filterService = _service.filter(item => moduleType.includes(item.id))
    setServiceData(_filterService)
  }

  // Function
  const $_markedDateOnPress = async $event => {
    console.log(JSON.stringify($event), '$event');
    setLoading(true)
    setPopupActive(true)
    let _content = {
      title: $event.text,
      ...$event
    }
    const _res = await $_fetchPopupData($event)
    console.log(_res, '$_fetchPopupData');
    _content = {
      ..._content,
      ..._res
    }
    setPopupContentType($event?.type ? $event?.type : 'content')
    setPopupContent(_content)
    setLoading(false)
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

  const $_routeToPage = $event => {
    if ($event.type == 'event') {
      navigation.push('RoutesEvent', {
        screen: 'EventShow',
        params: {
          id: $event.id
        }
      })
    } else if ($event.type == 'enter_record') {
      navigation.push('RoutesContractorEnter', {
        screen: 'ContractorEnterShow',
        params: {
          id: $event.id
        }
      })
    } else if ($event.type == 'audit_request') {
      console.log($event, '$event');
      navigation.push('RoutesAudit', {
        screen: 'AuditShow',
        params: {
          id: $event.audit.id,
        }
      })
    } else if (
      $event.type == 'license' ||
      $event.type == 'extension' ||
      $event.type == 'endTime' ||
      $event.type == 'remind'
    ) {
      navigation.push('RoutesLicense', {
        screen: 'LicenseShow',
        params: {
          id: $event.id
        }
      })
    } else if ($event.type == 'training') {
      navigation.push('RoutesTraining', {
        screen: 'TrainingShow',
        params: {
          id: $event.id
        }
      })
    } else if ($event.type == 'task') {
      navigation.push('RoutesTask', {
        screen: 'TaskShow',
        params: {
          id: $event.id
        }
      })
    }
    setPopupActive(false)
  }

  const $_fetchPopupData = async $event => {
    let id = $event.id
    if ($event.type == 'event') {
      try {
        const res = await S_Event.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===error===')
      }
    } else if ($event.type == 'enter_record') {
      try {
        const res = await S_ContractorEnterRecord.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    } else if ($event.type == 'audit_request') {
      try {
        const res = await S_AuditRequest.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===error===')
      }
    } else if ($event.type == 'license') {
      try {
        const res = await S_License.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===extension err===')
      }
    } else if ($event.type == 'training') {
      try {
        const res = await S_Training.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===error===')
      }
    } else if ($event.type == 'task') {
      try {
        const res = await S_Task.show({ modelId: id })
        return res
      } catch (e) {
        console.error(e.message, '===error===')
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

  // helper 
  const $_userFormat = (user, date) => {
    return {
      name: user.name,
      avatar: user.avatar,
      des: date ? moment(date).format('YYYY-MM-DD') : t('尚未完成審核')
    }
  }

  // Render
  return (
    <>
      <WsCalendarCombinedWow
        servicesData={servicesData}
        markedDateOnPress={$_markedDateOnPress}
        onDayPress={$_onDayPress}
        setFilterLoading={setFilterLoading}
      />

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

                    {/* 事件 */}
                    {popupContentType === 'event' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              label={t('發生日期')}
                              value={
                                popupContent.occur_at
                                  ? moment(popupContent.occur_at).format('YYYY-MM-DD')
                                  : '無'
                              }
                              style={{
                                flexDirection: 'row'
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              label={t('發生時間')}
                              value={
                                popupContent.occur_at
                                  ? moment(popupContent.occur_at).format('HH:mm')
                                  : '無'
                              }
                              style={{
                                flexDirection: 'row'
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              label={t('說明')}
                              value={popupContent.remark ? popupContent.remark : null}
                              style={{
                                flexDirection: 'row'
                              }}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 任務 */}
                    {popupContentType === 'task' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              label={t('期限')}
                              icon="ws-outline-calendar-duedate"
                              color={$color.black5l}
                              value={moment(popupContent.expired_at).format('YYYY-MM-DD')}
                            />
                          </View>

                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('說明')}
                              color={$color.black5l}
                              value={popupContent.remark}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              type="user"
                              label={t('負責人')}
                              color={$color.black5l}
                              value={$_userFormat(
                                popupContent.taker,
                                popupContent.checked_at ? popupContent.checked_at : null
                              )}
                            />
                          </View>

                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 教育訓練 */}
                    {popupContentType === 'training' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <WsInfo
                            labelWidth={100}
                            style={{
                              flexDirection: 'row'
                            }}
                            label={t('訓練日期')}
                            value={moment(popupContent.train_at).format('YYYY-MM-DD')}
                          />

                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('負責人')}
                              type={'user'}
                              value={popupContent.principal ? popupContent.principal : t('無')}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 進場 */}
                    {popupContentType === 'enter_record' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              label={t("進場日期")}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                popupContent.enter_start_date
                                  ? moment(popupContent.enter_start_date).format('YYYY-MM-DD')
                                  : null
                              }
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('作業地點')}
                              value={popupContent.operate_location}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('作業內容')}
                              value={popupContent.task_content}
                            />
                          </View>
                        </WsPaddingContainer>
                      </>
                    )}

                    {/* 稽核 */}
                    {popupContentType === 'audit_request' && (
                      <>
                        <WsText color={$color.black} size={18}>{popupContent.title}</WsText>
                        <WsPaddingContainer>
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              label={t('稽核日期')}
                              value={moment(popupContent.record_at).format('YYYY-MM-DD')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                            />
                          </View>

                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type="users"
                              label={t('稽核者')}
                              value={popupContent.auditors}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                            />
                          </View>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type="users"
                              label={t('受稽者')}
                              value={popupContent.auditees}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
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

      {!filterLoading && (
        <WsIconBtn
          name="bih-filter"
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
            setStateModal(true)
          }}
        />
      )}

      <WsModal
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        headerRightText={t('儲存')}
        headerRightOnPress={() => {
          $_onSubmit()
          setStateModal(false)
        }}
        animationType="slide"
        title={t('')}
      >
        <KeyboardAvoidingView
          style={{
            flex: 1,
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          enabled
        >
          <View
            style={{
              flex: 1,
              padding: 16
            }}
          >
            <WsState
              style={{
              }}
              type="checkboxes"
              items={[
                {
                  id: 'event',
                  name: t('事件')
                },
                {
                  id: 'enter',
                  name: t('進場')
                },
                {
                  id: 'audit',
                  name: t('稽核')
                },
                {
                  id: 'license',
                  name: t('證照')
                },
                {
                  id: 'training',
                  name: t('教育訓練')
                },
                {
                  id: 'task',
                  name: t('任務待辦')
                }
              ]}
              value={moduleType}
              onChange={e => {
                setModuleType(e)
              }}
            >
            </WsState>
          </View>
        </KeyboardAvoidingView>
      </WsModal>
    </>
  )
}

export default BoardCalendar
