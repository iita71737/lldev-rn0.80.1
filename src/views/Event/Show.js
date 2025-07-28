import React from 'react'
import { ScrollView, View, Dimensions, SafeAreaView } from 'react-native'
import layouts from '@/__reactnative_stone/global/layout'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsIconBtn,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsInfoUser,
  WsInfo,
  WsBottomSheet,
  WsBtn,
  WsDialogDelete,
  LlNavButton002,
  WsGradientButton,
  WsErrorMessage,
  WsSkeleton,
  WsCard,
  WsDes,
  WsIcon,
  LlRelatedAlertCard001,
  WsAvatar,
  LlTaskCard001
} from '@/components'
import moment from 'moment'
import S_Event from '@/services/api/v1/event'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'


const EventShow = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts

  // Params
  const {
    id,
    apiAlertId,
  } = route.params

  // States
  const [showError, setShowError] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [event, setEvent] = React.useState()
  const [creator, setCreator] = React.useState()
  const [owner, setOwner] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const bottomSheetItems = React.useMemo(() => [
    {
      to: {
        name: 'EventUpdate',
        params: {
          id: id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      onPress: () => {
        setDialogVisible(true)
      },
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ], [id, route])

  // Services
  const $_fetchEvent = async () => {
    try {
      const res = await S_Event.show({
        modelId: id
      })
      setEvent(res)
      setLoading(false)
      if (res.owner) {
        setOwner({
          name: res.owner.name,
          id: res.owner.id,
          avatar: res.owner.avatar
        })
      }
      if (res.creator) {
        setCreator({
          name: res.creator.name,
          id: res.creator.id,
          avatar: res.creator.avatar,
          des: res.occur_at
            ? moment(res.occur_at).format('YYYY-MM-DD HH:mm')
            : null
        })
      }
    }
    catch (e) {
      setLoading(false)
      setShowError(true)
    }
  }

  const $_formattedDateTime = async () => {
    // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1715
    // console.log(event?.occur_at,'event?.occur_at--');
    const _event = {
      ...event,
      occur_at: new Date(moment(event?.occur_at)),
      improvement_limited_period: new Date(
        moment(event.improvement_limited_period)
      )
    }
    await AsyncStorage.setItem('EventUpdate', JSON.stringify(_event))
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: event && event.event_type ? `${t(event.event_type.name)}` : t('事件管理'),
      headerRight:
        // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1715
        id && event?.event_status !== 3 ? () => {
          return (
            <>
              <WsIconBtn
                testID={'ws-outline-edit-pencil'}
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                  marginRight: 4
                }}
                onPress={() => {
                  $_formattedDateTime()
                  setIsBottomSheetActive(true)
                }}
              />
            </>
          )
        } : undefined,
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name={'md-chevron-left'}
          color="white"
          size={32}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />
      )
    })
  }

  // Function
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  const $_setStatusFont = () => {
    return S_Event.getStatusFont(event, t)
  }
  const $_setStatusBgc = () => {
    return S_Event.getStatusBgColor(event, t)
  }

  useFocusEffect(
    React.useCallback(() => {
      setEvent(null)
      setShowError(false)
      $_fetchEvent()
    }, [id])
  )

  React.useEffect(() => {
    $_setNavigationOption()
  }, [event])

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        {showError &&
          (
            <View
              style={{
                paddingTop: 16
              }}
            >
              <WsErrorMessage fontSize={18}>{t('目前尚無資料')}</WsErrorMessage>
            </View>
          )
        }
        {loading && (
          <WsSkeleton></WsSkeleton>
        )}
        {event && (
          <>
            <ScrollView
              testID={'ScrollView'}
              style={{
              }}
            >
              <>
                <WsPaddingContainer
                  style={{
                    backgroundColor: $color.white,
                  }}>
                  {event && event.event_type && (
                    <WsFlex
                      justifyContent="space-between"
                      alignItems="flex-start"
                      style={{
                      }}
                    >
                      <WsText size={24} style={{ flex: 1 }}>
                        {event.name}
                      </WsText>
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                          marginLeft: 8,
                        }}
                      >
                      </View>
                    </WsFlex>
                  )}

                  {event && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        marginTop: 8
                      }}
                    >
                      {event.updated_user?.avatar && (
                        <WsAvatar
                          size={36}
                          source={event.updated_user?.avatar}
                        />
                      )}
                      {event.updated_user?.name &&
                        event.updated_at && (
                          <View
                            style={{
                              marginLeft: 8
                            }}>
                            <WsText color={$color.gray} size={12}>
                              {t(event.updated_user?.name)}
                            </WsText>
                            <WsText color={$color.gray} size={12}>
                              {t('編輯時間')}{' '}
                              {moment(event.updated_at).format(
                                'YYYY-MM-DD HH:mm:ss'
                              )}
                            </WsText>
                          </View>
                        )
                      }
                    </View>
                  )}

                </WsPaddingContainer>

                {(creator || owner) && (
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8,
                    }}
                  >
                    <WsFlex>
                      <WsText size={14} fontWeight="600" letterSpacing={1} style={{ width: 120 }}>
                        {t('類型')}
                      </WsText>
                      <WsTag
                        backgroundColor={event.event_type ? '#fbe0b6' : ''}
                        textColor={$color.black}>
                        {event.event_type ? t(event.event_type.name) : ''}
                      </WsTag>
                    </WsFlex>

                    <WsFlex
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsText size={14} fontWeight="600" letterSpacing={1} style={{ width: 120 }}>
                        {t('狀態')}
                      </WsText>
                      <WsTag
                        backgroundColor={$_setStatusBgc()}
                        textColor={$color.gray4d}>
                        {$_setStatusFont()}
                      </WsTag>
                    </WsFlex>

                    <WsFlex
                      style={{
                        marginTop: 8
                      }}
                      alignItems={'center'}
                    >
                      <WsText size={14} fontWeight="600" letterSpacing={1} style={{ width: 120 }}>
                        {t('領域')}
                      </WsText>
                      {event.system_subclasses &&
                        event.system_subclasses.length > 0 && (
                          <WsFlex
                            style={{
                              maxWidth: width * 0.6
                            }}
                            flexWrap="wrap"
                          >
                            {event.system_subclasses.map(
                              (systemSubClass, systemSubClassIndex) => {
                                return (
                                  <WsTag
                                    key={systemSubClass.id}
                                    img={systemSubClass.icon}
                                    style={{
                                      marginRight: 8,
                                      marginTop: 2,
                                    }}>
                                    {t(systemSubClass.name)}
                                  </WsTag>
                                )
                              }
                            )}
                          </WsFlex>
                        )}
                    </WsFlex>

                    {owner && (
                      <WsFlex
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsText size={14} fontWeight={600} style={{ width: 120 }}>{t('負責人')}</WsText>
                        <WsInfoUser
                          style={{ marginLeft: 8 }}
                          isUri={true}
                          value={owner}
                        />
                      </WsFlex>
                    )}

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        label={t('發生日期')}
                        value={moment(event.occur_at).format('YYYY-MM-DD')}
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
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={t('發生時間')}
                        value={moment(event.occur_at).format('HH:mm')}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={120}
                        style={{
                          flexDirection: 'row',
                        }}
                        label={t('說明')}
                        color={$color.black5l}
                        value={event.remark}
                      />
                    </View>

                    {event.file_attaches &&
                      event.file_attaches.length > 0 && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            style={{
                            }}
                            label={t('附件')}
                            type="filesAndImages"
                            value={event.file_attaches}
                          />
                        </View>
                      )}

                  </WsPaddingContainer>
                )}

                {event.improvement_limited_period && (
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8
                    }}>
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      label={t('改善期限')}
                      type="status"
                      value={{
                        icon: 'll-nav-alert-outline',
                        label: event.improvement_limited_period
                          ? moment(event.improvement_limited_period).format(
                            'YYYY-MM-DD'
                          )
                          : '無',
                        fontColor: $color.primary
                      }}
                    />
                  </WsPaddingContainer>
                )}

                {event.tasks.length != 0 && (
                  <>
                    <View
                      style={{
                        marginTop: 16
                      }}
                    >
                      <WsText
                        fontWeight={500}
                        style={{
                          paddingHorizontal: 16,
                        }}
                      >{t('相關任務')}
                      </WsText>
                      <LlTaskCard001
                        item={event.tasks[0]}
                        onPress={() => {
                          navigation.push('RoutesTask', {
                            screen: 'TaskShow',
                            params: {
                              id: event.tasks[0].id,
                            }
                          })
                        }}
                      />
                    </View>
                  </>
                )}

                {event.alert && (
                  <>
                    <LlRelatedAlertCard001
                      alert={event?.alert}
                    ></LlRelatedAlertCard001>
                  </>
                )}
              </>
            </ScrollView>
          </>
        )}
        <WsBottomSheet
          isActive={isBottomSheetActive}
          onDismiss={() => {
            setIsBottomSheetActive(false)
          }}
          items={bottomSheetItems}
          snapPoints={[150, 150]}
          onItemPress={$_onBottomSheetItemPress}
        />
        <WsDialogDelete
          id={id}
          to="EventIndex"
          modelName="event"
          visible={dialogVisible}
          title={t('確定刪除嗎？')}
          setVisible={setDialogVisible}
        />
      </SafeAreaView>
    </>
  )
}
export default EventShow
