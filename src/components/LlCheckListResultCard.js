import React from 'react'
import {
  Pressable,
  ScrollView,
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsBtn,
  WsIconCircle,
  WsDot,
  WsCard,
  WsAvatar,
  WsDes,
  WsTag,
  LlBtn001,
  WsInfo,
  WsIcon,
  WsSkeleton,
  WsSpec
} from '@/components'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import i18next from 'i18next'

const LlCheckListResultCard = prop => {
  const { t, i18n } = useTranslation()

  const {
    id,
    backgroundColor = $color.white,
    onPress,
    disabled,
    icon,
    iconBgc,
    iconColor,
    passRate,
    reviewers,
    risk,
    status,
    title,
    date,
    style,
    reviewer,
    btnText,
    item,
    constantData,
    reviewerVisible = true,
    testID,
    undo
  } = prop


  // STATE
  const [riskStyle, setRiskStyle] = React.useState()

  // Function
  const getRiskStyle = () => {
    const _riskStyle = S_CheckListRecordAns.getResultRiskStyle(risk, status, constantData)
    setRiskStyle(_riskStyle)
  }

  const $_checkReviewRecord = () => {
    if (reviewers) {
      return reviewers.some((reviewer) => reviewer.checklist_review_record !== null)
    } else {
      return false
    }
  }

  React.useEffect(() => {
    getRiskStyle()
  }, [])

  return (
    <>
      {constantData ? (
        <TouchableOpacity
          testID={testID}
          style={[
            {
              marginTop: 16,
              marginHorizontal: 16,
              borderRadius: 10,
              backgroundColor: backgroundColor,
              // borderWidth:1,
            },
            style
          ]}
          disabled={disabled}
          onPress={onPress}
        >
          <WsFlex
            style={[
              styles.cardRight,
              {
                // borderWidth:1,
              },
            ]}>
            <View style={styles.cardLeft}>
              <WsText
                testID={'標題'}
                size="16"
                fontWeight="600"
                style={{
                }}>
                {title}
              </WsText>


              {/* <WsFlex
                flexWrap="wrap"
                style={{
                  marginTop: 8,
                  marginBottom: 8
                }}
                alignItems={'center'}
              >
                {item.checklist &&
                  item.checklist.system_subclasses &&
                  item.checklist.system_subclasses.length > 0 && (
                    <>
                    </>
                  )}
              </WsFlex> */}

              {riskStyle &&
                riskStyle.score && (
                  <WsFlex
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <WsText size={12} style={{ width: 90 }} fontWeight={600}>{t('結果')}</WsText>
                    <WsIcon name={riskStyle.icon} size={20} color={riskStyle.color} style={{}} />
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      color={riskStyle.color}
                      size={12}
                      fontWeight="400"
                    >
                      {riskStyle.title}
                    </WsText>
                  </WsFlex>
                )}

              {item.status == 1 && (
                <WsFlex
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={12} style={{ width: 90 }} fontWeight={600}>{t('結果')}</WsText>
                  <WsIcon name={'ws-filled-approved'} size={20} color={$color.gray} style={{}} />
                  <WsText
                    style={{
                      marginLeft: 4
                    }}
                    size={12}
                    fontWeight="400"
                  >
                    {t('不需點檢')}
                  </WsText>
                </WsFlex>
              )}

              {item.status != 1 &&
                item.risk_level == null &&
                !undo && (
                  <WsFlex
                    style={{
                    }}
                  >
                    <WsText
                      size={12}
                      style={{ width: 90 }}
                      fontWeight={600}
                    >
                      {t('結果')}
                    </WsText>
                    <WsIcon name={'ws-filled-approved'} size={20} color={$color.gray} style={{}} />
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={12}
                      fontWeight="400"
                    >
                      {t('不涉及風險或不列入統計')}
                    </WsText>
                  </WsFlex>
                )}

              {date && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={80}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={passRate != undefined ? t('填表日期') : t('填表日期')}
                    labelSize={12}
                    type='date'
                    value={date ? date : t('無')}
                  />
                </View>
              )}

              {passRate != undefined && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={80}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('合規率')}
                    labelSize={12}
                    value={passRate != undefined ? `${passRate}%` : t('無')}
                  />
                </View>
              )}

              {passRate === null && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={80}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('合規率')}
                    labelSize={12}
                    value={`${t('不需點檢')}`}
                  />
                </View>
              )}

              {/* {item && (
                <>
                  <View
                    style={{
                      marginTop: 8,
                    }}
                  >
                    <WsInfo
                      labelWidth={80}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      label={t('時段')}
                      labelSize={12}
                      value={item.start_time && item.end_time ? `${moment(item.start_time).format('HH:mm')}-${moment(item.end_time).format('HH:mm')}` : t('無')}
                    />
                  </View>
                </>
              )} */}

              <WsFlex
                flexWrap="wrap"
                style={{
                  width: Dimensions.get('window').width - 100,
                  borderTopColor: $color.white3d,
                  borderBottomColor: $color.white3d,
                  // borderWidth:1,
                }}>

                <View
                  style={{
                    flexDirection: 'row',
                    // alignItems: 'center',
                    marginTop: 16,
                    // borderWidth: 1,
                  }}
                >
                  <WsText
                    size={12}
                    fontWeight="600"
                    style={[
                      {
                        width: 90,
                        // borderWidth:1,
                      },
                    ]}
                  >
                    {t('答題者')}
                  </WsText>
                  <View>
                    {item &&
                      item.checkers &&
                      item.checkers.length > 0 &&
                      <FlatList
                        data={item.checkers}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item: checkerItem, index }) => {
                          return (
                            <>
                              <WsFlex
                                flexWrap={'wrap'}
                                style={{
                                  // borderWidth:1,
                                }}
                              >
                                <WsAvatar
                                  size={36}
                                  isUri={true}
                                  source={checkerItem?.avatar ? checkerItem.avatar : null}
                                  style={{
                                    marginRight: 4
                                  }}
                                />
                                <View
                                  style={{
                                    justifyContent: 'center',
                                  }}
                                >
                                  <WsFlex>
                                    <WsText
                                      size={12}
                                      style={{
                                        marginRight: 4
                                      }}
                                    >
                                      {checkerItem.name}
                                    </WsText>
                                    {checkerItem.checklist_record_answer && checkerItem.checklist_record_answer.updated_at && (
                                      <WsTag>
                                        {t('已完成')}
                                      </WsTag>
                                    )}
                                  </WsFlex>
                                  {checkerItem.checklist_record_answer && checkerItem.checklist_record_answer.updated_at &&
                                    (
                                      <WsFlex
                                      >
                                        <WsDes
                                          style={{
                                          }}
                                        >
                                          {checkerItem.checklist_record_answer &&
                                            checkerItem.checklist_record_answer.updated_at ?
                                            moment(checkerItem.checklist_record_answer.updated_at).format('YYYY-MM-DD HH:mm') :
                                            null
                                          }
                                        </WsDes>
                                      </WsFlex>
                                    )}

                                  {item.status == 1 &&
                                    item.record_at &&
                                    (
                                      <WsFlex
                                      >
                                        {item.status == 1 &&
                                          item.record_at && (
                                            <WsTag>
                                              {t('已完成')}
                                            </WsTag>
                                          )}
                                        <WsDes
                                          style={{
                                            padding: 4
                                          }}
                                        >
                                          {item.record_at ? moment(item.record_at).format('YYYY-MM-DD HH:mm') : null}
                                        </WsDes>
                                      </WsFlex>
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
              </WsFlex>

              {item &&
                reviewerVisible && (
                  <>
                    <WsFlex
                      flexWrap="wrap"
                      style={{
                        flex: 1,
                        width: Dimensions.get('window').width - 100,
                        paddingBottom: 8,
                        // borderWidth:1,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          // alignItems: 'center',
                          marginTop: 16
                        }}
                      >
                        <WsText
                          testID={`覆核者`}
                          size={12}
                          fontWeight="600"
                          style={[
                            {
                              width: 90,
                              // borderWidth:1,
                            },
                          ]}
                        >
                          {t('覆核者')}
                        </WsText>
                        <FlatList
                          data={item.reviewers}
                          keyExtractor={(item) => item.id}
                          renderItem={({ item, index }) => {
                            return (
                              <>
                                <WsFlex
                                  style={{
                                    marginBottom: 8,
                                    // borderWidth:1,
                                  }}
                                >
                                  <WsAvatar
                                    size={36}
                                    isUri={true}
                                    source={item.avatar ? item.avatar : null}
                                    style={{
                                      marginRight: 4
                                    }}
                                  />
                                  <View
                                    style={{
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <WsFlex>
                                      <WsText
                                        size={12}
                                        style={{
                                          marginRight: 4
                                          // borderWidth:1,
                                        }}
                                      >
                                        {item.name}
                                      </WsText>
                                      {item.checklist_review_record && item.checklist_review_record.updated_at && (
                                        <WsTag>
                                          {t('已完成')}
                                        </WsTag>
                                      )}
                                    </WsFlex>
                                    {item.checklist_review_record && item.checklist_review_record.updated_at &&
                                      (
                                        <WsFlex
                                        >
                                          <WsDes
                                            style={{
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
                          ListEmptyComponent={() => {
                            return (
                              <WsText
                                size={12}
                                style={{
                                }}
                              >
                                {t('無')}
                              </WsText>
                            )
                          }}
                        />
                      </View>
                    </WsFlex>

                    {/* <View
                      style={{
                        borderBottomWidth: 0.5,
                        borderBottomColor: $color.white3d,
                        paddingBottom: 16
                      }}
                    >
                      <WsInfo
                        testID={`覆核狀態`}
                        labelWidth={100}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        label={t('覆核狀態')}
                        labelSize={12}
                        value={$_checkReviewRecord() ? t('已覆核') : t('尚未覆核')}
                      />
                    </View> */}


                    {passRate == undefined &&
                      item.status != 1 &&
                      item.risk_level != undefined && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={80}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            label={t('尚未作答')}
                            labelSize={12}
                            value={t(' ')}
                          />
                        </View>
                      )}
                  </>
                )}
            </View>
          </WsFlex>

          {btnText && (
            <LlBtn001
              isFullWidth={true}
              borderWidth={0}
              style={{
                marginBottom: 16,
              }}
              onPress={onPress}
            >
              {btnText}
            </LlBtn001>
          )}

        </TouchableOpacity>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  cardRight: {
    alignItems: 'flex-start',
    padding: 16
  },
  cardLeft: {
    flex: 1,
    paddingLeft: 16
  },
  longMargin: {
    marginRight: 8
  },
  shortMargin: {
    marginRight: 4
  }
})

export default LlCheckListResultCard
