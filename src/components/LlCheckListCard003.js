import React from 'react'
import { Pressable, TouchableOpacity, FlatList, View, Dimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsSpec,
  WsBtn,
  WsDes,
  WsAvatar,
  WsInfo
} from '@/components'
import LlBtn001 from '@/components/LlBtn001'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

const LlCheckListCard003 = (props) => {
  const { t, i18n } = useTranslation();

  const {
    name,
    style,
    onPress,
    tagIcon,
    tagText,
    checkers,
    reviewers,
    recordAt,
    btnText,
    btnColor,
    textColor,
    borderColor,
    item,
    testID,
    record_at,
    status
  } = props

  // Functions
  const $_getCheckerString = users => {
    let usersName = ''
    users.forEach((item, index) => {
      if (index == 0) {
        usersName = item.name
      }
      if (index !== 0) {
        usersName = usersName + ', ' + item.name
      }
    })
    return usersName
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={
        onPress
      }
    >
      <WsCard style={
        [
          {
            alignItems: 'flex-start'
          },
          style
        ]}>
        <WsText
        >{name}</WsText>
        {tagIcon && tagText && (
          <WsTag
            style={{
              marginTop: 8
            }}
            icon={tagIcon}
          >{tagText}</WsTag>
        )}

        <WsSpec
          fontWeight={600}
          labelWidth={108}
          style={{
            marginTop: 8,
          }}
          title={t("填表日期")}
        >{recordAt}
        </WsSpec>

        {item &&
          item.assignment_start_time &&
          item.assignment_end_time && (
            <>
              <WsSpec
                fontWeight={600}
                labelWidth={108}
                style={{
                  marginTop: 8,
                }}
                title={t('時段')}>
                {`${moment(item.assignment_start_time).format('HH:mm')}-${moment(item.assignment_end_time).format('HH:mm')}`}
              </WsSpec>
            </>
          )}


        <View
          style={{
            flexDirection: 'row',
            marginTop: 8
          }}
        >
          <WsText size={12}
            fontWeight="300"
            color={$color.gray3d}
            style={[
              {
                marginRight: 8,
                width: 64,
                // borderWidth:1,
              },
            ]}
          >
            {t('答題者')}
          </WsText>
          <View>
            {checkers &&
              checkers.length > 0 &&
              <FlatList
                data={checkers}
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
                              {item.name}
                            </WsText>
                            {item.checklist_record_answer && item.checklist_record_answer.updated_at && (
                              <WsTag>
                                {t('已完成')}
                              </WsTag>
                            )}
                            {record_at && status == 1 && (
                              <WsTag>
                                {t('已完成')}
                              </WsTag>
                            )}
                          </WsFlex>
                          {item.checklist_record_answer && item.checklist_record_answer.updated_at &&
                            (
                              <WsFlex>
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

                              </WsFlex>
                            )}

                          {record_at && status == 1 &&
                            (
                              <WsFlex
                              >
                                <WsDes
                                  style={{
                                    padding: 4
                                  }}
                                >
                                  {
                                    record_at ?
                                      moment(record_at).format('YYYY-MM-DD HH:mm') :
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
            }
          </View>
        </View>


        {item &&
          item.reviewers &&
          item.reviewers.length > 0 && (
            <>
              <WsFlex
                flexWrap="wrap"
                style={{
                  flex: 1,
                  width: Dimensions.get('window').width - 80,
                  // borderBottomWidth: 2,
                  // borderBottomColor: $color.white3d,
                  paddingTop: 8,
                  paddingBottom: 8
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    // alignItems: 'center',
                    // borderWidth: 1,
                  }}
                >
                  <WsText size={12}
                    fontWeight="300"
                    color={$color.gray3d}
                    style={[
                      {
                        marginRight: 8,
                        width: 64,
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
                              // borderWidth:1,
                            }}
                          >
                            <WsAvatar
                              size={42}
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
                  />
                </View>
              </WsFlex>
            </>
          )}

        <LlBtn001
          isFullWidth={true}
          style={{
            marginTop: 16,
          }}
          textColor={textColor}
          onPress={onPress}
        >
          {btnText}
        </LlBtn001>

      </WsCard>
    </TouchableOpacity>
  )
}

export default LlCheckListCard003