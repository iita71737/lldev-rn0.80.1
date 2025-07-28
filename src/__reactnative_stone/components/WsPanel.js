import React from 'react'
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsIcon,
  WsIconBtn,
  WsPopup,
  WsInfiniteScroll,
  WsPaddingContainer,
  WsTag,
  WsDes,
  WsGradientButton,
  LlCheckListResultCard
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import i18next from 'i18next'
import S_Event from '@/services/api/v1/event'
import S_CheckList from '@/services/api/v1/checklist'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import config from '@/__config'

const WsPanel = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const { panelInfo, toggleListOrDetail, navigation, units, todayData } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  // STATE
  const [popupType, setPopupType] = React.useState()
  const [popupActive, setPopupActive] = React.useState(false)
  const [paramsAddEvent] = React.useState({
    order_way: 'desc',
    order_by: 'occur_at',
    time_field: 'occur_at',
    get_all: 1,
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
  })
  const [paramsAddChecklistRecord] = React.useState({
    order_way: 'desc',
    order_by: 'record_at',
    time_field: 'record_at',
    get_all: 1,
    start_time: moment().format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
  })

  // HELPER
  const $_setStatusFont = event => {
    return S_Event.getStatusFont(event, t)
  }
  const $_setStatusBgc = event => {
    return S_Event.getStatusBgColor(event, t)
  }

  return (
    <>
      {panelInfo && (
        <View
          style={{
            flex: 1
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              marginHorizontal: 16,
              paddingVertical: 16
            }}>

            <View
              style={{
                alignItems: 'center'
              }}>

              {!toggleListOrDetail && (
                <>
                  {currentOrganization && currentOrganization.name && (
                    <WsText
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                      }}>
                      {currentOrganization.name}  {t('共')}{units.length}{t('廠')}
                    </WsText>
                  )}
                </>
              )
              }

              {panelInfo.factoryName && toggleListOrDetail && (
                <WsFlex
                  justifyContent={'center'}
                >
                  <WsText
                    style={{
                      fontSize: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      letterSpacing: 0.6
                    }}>
                    {panelInfo.factoryName}
                  </WsText>
                </WsFlex>
              )}
            </View>

          </View>
          {toggleListOrDetail ? (
            <View
              style={{
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setPopupType('checklist')
                  setPopupActive(true)
                }}
                style={{
                  marginBottom: 10,
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  borderTopWidth: 0.4
                }}>
                <WsFlex
                  justifyContent={'space-between'}
                >
                  <WsFlex>
                    <View
                      style={{
                        height: 24,
                        width: 24,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      <View
                        style={{
                          height: 12,
                          width: 12,
                          borderRadius: 25,
                          backgroundColor:
                            todayData?.checklist_risk_level == 23
                              ? '#dd4e41' :
                              todayData?.checklist_risk_level == 22 ?
                                '#ffd500' :
                                todayData?.checklist_risk_level == 21 ?
                                  '#0585d3'
                                  : '#35b487'
                        }}
                      />
                    </View>
                    <WsText
                      style={{
                        fontSize: 14,
                        marginLeft: 8,
                        marginRight: 4
                      }}>
                      {t('本日點檢結果')}
                    </WsText>
                    <WsText
                      style={{
                        marginLeft: 4,
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>
                      {todayData?.checklist_result
                        ? todayData?.checklist_result + '%'
                        : '-'}
                    </WsText>
                  </WsFlex>
                  <WsIconBtn
                    padding={0}
                    name="bih-chevron-right"
                    size={28}
                    onPress={() => {
                      setPopupActive(true)
                    }}
                  />
                </WsFlex>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setPopupType('event')
                  setPopupActive(true)
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  borderTopWidth: 0.4
                }}>
                <WsFlex
                  justifyContent={'space-between'}
                >
                  <WsFlex>
                    <WsIcon size={24} name="ws-filled-flag" />
                    <WsText
                      style={{
                        fontSize: 14,
                        marginLeft: 8,
                        marginRight: 8
                      }}>
                      {t('本日新增事件')}
                    </WsText>
                    <WsText
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold'
                      }}>
                      {todayData?.event_add_count
                        ? todayData?.event_add_count
                        : '-'}
                    </WsText>
                  </WsFlex>
                  <WsIconBtn
                    padding={0}
                    name="bih-chevron-right"
                    size={28}
                    onPress={() => {
                      // $_fetchCurrentAdd()
                      setPopupActive(true)
                    }}
                  />
                </WsFlex>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: $color.white,
                borderTopWidth: 1,
                borderTopColor: $color.white5d
              }}
              onPress={() => {
                navigation.navigate('EachFactoryIndexingData')
              }}>
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  padding: 16,
                  flex: 1
                }}>
                <WsText>{t('前往各廠指標數據')}</WsText>
                <WsIcon name="bih-chevron-right" size={30} />
              </WsFlex>
            </TouchableOpacity>
          )}
        </View>
      )}

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.6,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>
          <WsText style={{ marginBottom: 16 }}>{panelInfo.factoryName}{'-'}{popupType == 'event' ? t('本日新增風險事件') : t('本日新增點檢結果')}</WsText>

          {popupType == 'event' && (
            <WsInfiniteScroll
              service={S_Event}
              serviceIndexKey={'currentAddIndex'}
              params={paramsAddEvent}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('RoutesEvent', {
                        screen: 'EventShow',
                        params: {
                          id: item.id
                        }
                      })
                      setPopupActive(false)
                    }}>
                    <WsPaddingContainer
                      style={{
                        borderColor: $color.primary11l,
                        borderWidth: 1,
                        borderRadius: 10,
                        shadowColor: 'gray',
                        shadowOffset: {
                          width: 2,
                          height: 2
                        },
                        shadowOpacity: 0.2,
                        shadowRadius: 5.16,
                        elevation: 5,
                        backgroundColor: $color.white,
                        marginBottom: 8
                      }}>
                      <WsText>{`${item.name}`}</WsText>
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
                        <View
                          style={{
                            marginVertical: 4
                          }}>
                          <WsTag
                            backgroundColor={item ? $_setStatusBgc(item) : ''}
                            textColor={$color.gray4d}>
                            {item ? $_setStatusFont(item) : ''}
                          </WsTag>
                        </View>
                      </WsFlex>
                      <WsDes>
                        {i18next.t('發生時間')}{' '}
                        {moment(item.occur_at).format('YYYY-MM-DD HH:mm')}
                      </WsDes>
                    </WsPaddingContainer>
                  </TouchableOpacity>
                )
              }}
            />
          )
          }

          {popupType == 'checklist' && (
            <WsInfiniteScroll
              service={S_CheckListRecord}
              serviceIndexKey={'factoryIndex'}
              params={paramsAddChecklistRecord}
              hasMeta={false}
              getAll={true}
              renderItem={({ item, index }) => {
                return (
                  <>
                    <LlCheckListResultCard
                      item={item}
                      id={item.id}
                      risk={item.risk_level}
                      title={item.name}
                      btnText={i18next.t('查看結果')}

                      passRate={item.pass_rate}
                      date={moment(item.record_at).format('YYYY-MM-DD')}
                      review={item.reviewer ? item.reviewer.name : i18next.t('無')}
                      style={[
                        index == 0
                          ? null
                          : {
                            marginTop: 12,
                          },
                        {
                          borderColor: $color.white2d,
                          borderWidth: 1,
                          borderRadius: 10,
                          shadowColor: 'gray',
                          shadowOffset: {
                            width: 2,
                            height: 2
                          },
                          shadowOpacity: 0.2,
                          shadowRadius: 5.16,
                          elevation: 5,
                          backgroundColor: $color.white,
                          marginBottom: 8
                        }
                      ]}
                      onPress={() => {
                        navigation.navigate({
                          name: 'CheckListAssignmentShow',
                          params: {
                            id: item.id
                          }
                        })
                      }}
                    />
                  </>
                  // <TouchableOpacity
                  //   onPress={() => {
                  //     // navigation.navigate('RoutesEvent', {
                  //     //   screen: 'EventShow',
                  //     //   params: {
                  //     //     id: item.id
                  //     //   }
                  //     // })
                  //     // setPopupActive(false)
                  //   }}>
                  //   <WsPaddingContainer
                  //     style={{
                  //       borderColor: $color.primary11l,
                  //       borderWidth: 1,
                  //       borderRadius: 10,
                  //       shadowColor: 'gray',
                  //       shadowOffset: {
                  //         width: 2,
                  //         height: 2
                  //       },
                  //       shadowOpacity: 0.2,
                  //       shadowRadius: 5.16,
                  //       elevation: 5,
                  //       backgroundColor: $color.white,
                  //       marginBottom: 8
                  //     }}>
                  //     <WsText>{`${item.name}`}</WsText>
                  //     <WsDes>
                  //       {i18next.t('填表日期')}{' '}
                  //       {moment(item.occur_at).format('YYYY-MM-DD HH:mm')}
                  //     </WsDes>
                  //   </WsPaddingContainer>
                  // </TouchableOpacity >
                )
              }}
            />
          )
          }

          {popupType == 'event' && (
            <WsGradientButton
              style={{
                width: width * 0.85,
                position: 'absolute',
                bottom: 16,
              }}
              borderRadius={24}
              onPress={() => {
                if (popupType == 'event') {
                  navigation.navigate('RoutesEvent', {
                    screen: 'EventIndex'
                  })
                  setPopupActive(false)
                } else if (popupType == 'checklist') {
                  // navigation.navigate('RoutesCheckList', {
                  //   screen: 'CheckList'
                  // })
                }
              }}>
              {popupType == 'event' ? i18next.t('前往事件列表') : i18next.t('前往點檢結果列表')}
            </WsGradientButton>
          )}

        </View >
      </WsPopup >
    </>
  )
}
export default WsPanel
