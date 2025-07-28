import React from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions
} from 'react-native'
import moment from 'moment'
import {
  WsCard,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsStateFormModal,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsSubtaskCard = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    desColor = $color.gray,
    name,
    date,
    attachCount,
    user,
    style,
    value,
    onChange,
    deleteOnPress,
    _dateCompare,
    onPress,
    placeholderTitle = t('主旨'),
    placeholderRemark = t('說明'),
  } = props


  // Dimension
  const { width, height } = Dimensions.get('window')

  // Render
  return (
    <>
      <TouchableOpacity
        onPress={onPress}>
        <WsCard
          padding={16}
          style={[
            style,
            !name ?
              {
                borderWidth: 1,
                borderColor: $color.danger,
                backgroundColor: $color.danger11l
              }
              : null
          ]
          }
        >
          <WsFlex style={{}} justifyContent="space-between">
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <WsIconCircle
                name="ws-outline-check"
                size={30}
                iconStyle={{}}
                color={value && value.done_at ? $color.white : $color.gray}
                gradientColor={
                  value && value.done_at
                    ? [$color.primary, $color.primary3l]
                    : [$color.white, $color.white]
                }
                isGradient={true}
                gradientBorder={value && value.done_at ? 0 : 2}
              />
              <View
                style={[
                  {
                    maxWidth: width * 0.5
                  }
                ]}>
                <WsText
                  size="14"
                  fontWeight="500"
                  style={{
                  }}
                  color={name ? $color.black : $color.gray}
                >
                  {name ? name : placeholderTitle}
                </WsText>
                <WsFlex
                  style={[
                    {
                    }
                  ]}>
                  {date && (
                    <WsFlex
                      style={{
                        marginRight: 12
                      }}>
                      <WsIcon
                        name="ws-outline-calendar-duedate"
                        size={18}
                        color={desColor}
                      />
                      <WsText
                        style={{
                          marginLeft: 4
                        }}
                        size={12}
                        color={desColor}>
                        {moment(date).format('YYYY-MM-DD')}
                      </WsText>
                    </WsFlex>
                  )}
                  {value && value.expired_at && (
                    <>
                      <WsFlex
                        style={{
                          marginRight: 12
                        }}>
                        <WsIcon
                          name="ws-outline-calendar-duedate"
                          size={18}
                          color={_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 ? $color.danger : desColor}
                        />
                        <WsText
                          style={{
                            marginLeft: 4
                          }}
                          size={12}
                          color={_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 ? $color.danger : desColor}>
                          {moment(value.expired_at).format('YYYY-MM-DD')}
                        </WsText>
                      </WsFlex>
                    </>
                  )}
                  {attachCount != undefined && attachCount > 0 && (
                    <WsFlex
                      style={{
                        marginRight: 12
                      }}>
                      <WsIcon
                        name="ws-outline-attachment"
                        size={18}
                        color={desColor}
                      />
                      <WsText
                        style={{
                          marginLeft: 4
                        }}
                        size={12}
                        color={desColor}>
                        {t('附件')} ({attachCount})
                      </WsText>
                    </WsFlex>
                  )}
                  {user && (
                    <WsFlex
                      style={{
                        marginRight: 16
                      }}>
                      <WsIcon
                        name="ws-outline-outline-perm-identity"
                        size={18}
                        color={desColor}
                      />
                      <WsText
                        style={{
                          marginLeft: 4
                        }}
                        size={12}
                        color={desColor}>
                        {user}
                      </WsText>
                    </WsFlex>
                  )}
                </WsFlex>
                {_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 && (
                  <WsFlex>
                    <WsIcon
                      color={$color.danger}
                      name={'ws-outline-warning'}
                      size={14}
                    >
                    </WsIcon>
                    <WsText
                      size={12}
                      color={$color.danger}
                    >
                      {t('待辦事項期限超過任務期限')}
                    </WsText>
                  </WsFlex>
                )}

                {value?.taker && (
                  <WsFlex
                    style={{
                    }}>
                    <WsDes color={$color.gray3d} style={{ marginRight: 4 }}>
                      {t('執行人員')}
                    </WsDes>
                    <WsDes>{value?.taker?.name}</WsDes>
                  </WsFlex>
                )}


              </View>
            </View>
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="transparent"
              onPress={deleteOnPress}>
              <WsIconCircle
                padding={12}
                name="ws-outline-delete"
                size={24}
                color={$color.white}
                backgroundColor={$color.danger}
              />
            </TouchableHighlight>
          </WsFlex>
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default WsSubtaskCard
