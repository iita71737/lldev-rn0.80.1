import React from 'react'
import { ScrollView, Pressable, View, Dimensions, FlatList } from 'react-native'
import {
  WsFlex,
  WsBtn,
  WsBtnLeftIconCircle,
  WsPaddingContainer,
  WsIcon,
  WsText,
  WsInfo,
  LlAlertCard001,
  WsTag,
  WsAvatar,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import CheckListResultSort from '@/sections/CheckList/CheckListResultSort'

const AlertShowChecklistRecord = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { apiAlert, alert } = props

  // Function
  const $_fetchSystemSubclassesName = () => {
    return apiAlert.payload.system_subclasses.map((subClass, subClassIndex) => {
      return (
        <WsTag
          key={`subClass${subClassIndex}`}
          img={subClass.icon}
          style={{
            marginRight: 8
          }}
        >
          {t(subClass.name)}
        </WsTag>
      )
    })
  }

  // console.log(JSON.stringify(apiAlert),'apiAlert--');

  // Render
  return (
    <>
      {apiAlert && alert && (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsText size={18} fontWeight={'600'} style={{}}>
              {t('資訊')}
            </WsText>


            <WsFlex
              flexWrap={'wrap'}
              style={{
                marginTop: 8
              }}
            >
              <WsText size={14} fontWeight={'600'} style={{ width: 108 }}>
                {t('領域')}
              </WsText>
              {$_fetchSystemSubclassesName()}
            </WsFlex>


            <WsFlex
              style={{
                marginTop: 8
              }}>
              <WsInfo
                labelWidth={100}
                label={t('完成日')}
                style={{
                  flexDirection: 'row'
                }}
                value={moment(apiAlert.payload.record_at).format('YYYY-MM-DD')}
              />
            </WsFlex>

            <View
              style={{
                flexDirection: 'row',
                marginTop: 8,
                alignItems: 'center'
              }}
            >
              <WsText
                size={14}
                fontWeight="600"
                color={$color.black}
                style={[
                  {
                    width: 108,
                  },
                ]}
              >
                {t('答題者')}
              </WsText>
              <View>
                {apiAlert.payload?.checkers &&
                  apiAlert.payload?.checkers.length > 0 &&
                  <FlatList
                    data={apiAlert.payload.checkers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          <WsFlex
                            style={{
                            }}
                          >
                            <WsAvatar
                              size={42}
                              isUri={true}
                              source={item.avatar ? item.avatar : null}
                              style={{
                              }}
                            />
                            <View
                              style={{
                                justifyContent: 'center',
                                marginLeft: 8
                              }}
                            >
                              <WsFlex>
                                <WsText
                                  testID={`答題者-${index}`}
                                  size={12}
                                  style={{
                                    marginRight: 4
                                  }}
                                >
                                  {item.name}
                                </WsText>
                                {item.checklist_record_answer && item.checklist_record_answer.updated_at &&
                                  (
                                    <WsFlex
                                    >
                                      {item.checklist_record_answer && item.checklist_record_answer.updated_at && (
                                        <WsTag>
                                          {t('已完成')}
                                        </WsTag>
                                      )}
                                    </WsFlex>
                                  )}
                              </WsFlex>
                              {item.checklist_record_answer && item.checklist_record_answer.updated_at &&
                                (
                                  <WsDes
                                    style={{
                                    }}
                                  >
                                    {item.checklist_record_answer &&
                                      item.checklist_record_answer.updated_at ?
                                      moment(item.checklist_record_answer.updated_at).format('YYYY-MM-DD HH:mm') :
                                      null
                                    }
                                  </WsDes>
                                )}
                            </View>
                          </WsFlex>
                        </>
                      )
                    }}
                  />
                }
              </View>
            </View>


            <>
              <WsFlex
                flexWrap="wrap"
                style={{
                  flex: 1,
                  width: Dimensions.get('window').width,
                  paddingTop: 8,
                  paddingBottom: 8
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    // borderWidth: 1,
                  }}
                >
                  <WsText
                    size={14}
                    fontWeight="600"
                    color={$color.black}
                    style={[
                      {
                        width: 108
                        // borderWidth:1,
                      },
                    ]}
                  >
                    {t('覆核者')}
                  </WsText>
                  {apiAlert.payload &&
                    apiAlert.payload.reviewers &&
                    apiAlert.payload.reviewers.length > 0 ? (
                    <FlatList
                      data={apiAlert.payload.reviewers}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item, index }) => {
                        return (
                          <>
                            <WsFlex
                              style={{
                                // borderWidth:1,
                              }}
                            >
                              <WsAvatar
                                size={42}
                                isUri={true}
                                source={item.avatar ? item.avatar : null}
                                style={{
                                }}
                              />
                              <View
                                style={{
                                  justifyContent: 'center',
                                }}
                              >
                                <WsText
                                  size={12}
                                  style={{
                                    paddingLeft: 8
                                  }}
                                >
                                  {item.name}
                                </WsText>
                                {item.checklist_review_record && item.checklist_review_record.updated_at &&
                                  (
                                    <WsFlex
                                    >
                                      {item.checklist_review_record && item.checklist_review_record.updated_at && (
                                        <WsTag>
                                          {t('已完成')}
                                        </WsTag>
                                      )}
                                      <WsDes
                                        style={{
                                          padding: 4,
                                          // borderWidth:1
                                        }}
                                      >
                                        {item.checklist_review_record &&
                                          item.checklist_review_record.updated_at ?
                                          moment(item.checklist_review_record.updated_at).format('YYYY-MM-DD HH:mm') :
                                          null
                                        }
                                      </WsDes>
                                    </WsFlex>
                                  )}
                              </View>
                            </WsFlex>
                          </>
                        )
                      }}
                    />
                  ) : (
                    <WsText>{t('無')}</WsText>
                  )}
                </View>
              </WsFlex>
            </>
          </WsPaddingContainer>
          
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsText size={24} fontWeight={'700'} style={{ marginBottom: 16 }}>
              {t('題目')}
            </WsText>
            <CheckListResultSort
              id={apiAlert.payload?.id ? apiAlert.payload.id : ''}
              apiAlertId={apiAlert.id}
            />
          </WsPaddingContainer>
        </>
      )}
    </>
  )
}

export default AlertShowChecklistRecord
