import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsTag,
  WsText,
  WsIcon,
  WsFlex,
  WsPaddingContainer
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const LlChangeListCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const { item, style, onPress, testID } = props

  // State
  const tagText =
    item.change_status == 1
      ? t('評估中')
      : item.change_status == 2
        ? t('中止')
        : item.change_status == 3
          ? t('執行中')
          : t('已結案')
  const tagBgc =
    item.change_status == 1
      ? $color.yellow11l
      : item.change_status == 2
        ? $color.gray6l
        : item.change_status == 3
          ? $color.green11l
          : $color.gray3d
  const tagTxtc =
    item.change_status == 1
      ? $color.gray3d
      : item.change_status == 2
        ? $color.gray3d
        : item.change_status == 3
          ? $color.green
          : $color.white

  // Function
  const $_isExpired = () => {
    return moment().isBefore(item.last_version.expired_date)
  }

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard
          style={[
            {
              shadowColor: $color.gray,
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 2,
              shadowOpacity: 0.25,
              elevation: 4
            },
            style
          ]}
          padding={0}>
          <WsPaddingContainer>
            <WsFlex justifyCotent="space-between">
              <WsText style={{ flex: 1 }}>{item.name}</WsText>
              {/* <WsTag backgroundColor={tagBgc} textColor={tagTxtc}>
                {tagText}
              </WsTag> */}
            </WsFlex>
            {item.last_version && item.last_version.system_subclasses && (
              <WsFlex flexWrap="wrap">
                {item.last_version.system_subclasses.map(
                  (subClass, subClassIndex) => {
                    return (
                      <View key={subClassIndex}>
                        {/* {(subClassIndex == 0 || subClassIndex == 1) && ( */}
                        <WsTag
                          style={{
                            marginRight: 8,
                            marginTop: 8
                          }}
                          img={subClass.icon}>
                          {t(subClass.name)}
                        </WsTag>
                        {/* )} */}
                      </View>
                    )
                  }
                )}
                {/* {item.last_version.system_subclasses.length > 2 && (
                  <WsTag>{`+${
                    item.last_version.system_subclasses.length - 2
                  }`}</WsTag>
                )} */}
              </WsFlex>
            )}
            <WsFlex style={{ marginTop: 8 }}>
              <WsText color={$color.gray5d} size={12} style={{ marginRight: 8 }}>
                {t('負責人')}
              </WsText>
              <WsText size={12} color={$color.gray3d}>
                {item.last_version && item.last_version.owner
                  ? item.last_version.owner.name
                  : t('無')}
              </WsText>
            </WsFlex>
            {/* <WsFlex style={{ marginTop: 8 }}>
              <WsText color={$color.gray5d} size={12} style={{ marginRight: 8 }}>
                {t('建立日期')}
              </WsText>
              <WsText size={12} color={$color.gray3d}>
                {moment(item.created_at).format('YYYY-MM-DD')}
              </WsText>
            </WsFlex> */}
          </WsPaddingContainer>
          {item.last_version && item.last_version.expired_date && (
            <WsFlex
              justifyContent="center"
              style={{
                backgroundColor: $_isExpired()
                  ? $color.primary11l
                  : $color.danger11l,
                paddingVertical: 8,
                borderBottomRightRadius: 10,
                borderBottomLeftRadius: 10
              }}>
              <WsIcon
                color={$_isExpired() ? $color.primary : $color.danger}
                size={18}
                name="ws-outline-calendar-duedate"
              />
              <WsText
                size={12}
                color={$_isExpired() ? $color.primary : $color.danger}
                style={{
                  marginLeft: 8
                }}>
                {moment(item.last_version.expired_date).format('YYYY-MM-DD')}
              </WsText>
            </WsFlex>
          )}
        </WsCard>
      </TouchableOpacity>
    </>
  )
}
export default LlChangeListCard001
