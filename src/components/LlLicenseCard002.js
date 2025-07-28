import React from 'react'
import {
  Pressable,
  View,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsDes,
  WsIcon,
  WsCard,
  WsInfo
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ServiceCard from '@/services/api/v1/card'

const LlLicenseCard002 = props => {
  const { t, i18n } = useTranslation()
  
  // Props
  const { item, style, onPress, testID } = props

  // Function
  const $_isExpired = () => {
    return moment().isBefore(item.last_version.remind_date)
  }
  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      {item && (
        <WsCard
          style={[
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 1,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 4,
              shadowOpacity: 0.25,
              elevation: 2
            },
            style
          ]}
          padding={0}>
          <WsPaddingContainer>
            
            <WsFlex style={{
              marginBottom: 8
            }}>
              {moment().isAfter(item.last_version.valid_end_date) && (
                <WsTag
                  textColor={$color.danger}
                  backgroundColor={$color.danger11l}>
                  {t('逾期')}
                </WsTag>
              )}
              {item.last_version.license_status_number == 0 && (
                <WsTag
                  textColor={$color.gray3d}
                  backgroundColor={$color.yellow11l}
                  style={{
                    width: 'auto',
                    marginLeft: 8
                  }}>
                  {t('辦理中')}
                </WsTag>
              )}
              {item.last_version.using_status == 0 && (
                <WsTag
                  textColor={$color.gray}
                  backgroundColor={$color.white2d}
                  style={{
                    width: 'auto',
                    marginLeft: 8
                  }}>
                  {t('已停用')}
                </WsTag>
              )}
              {item.last_version &&
                item.last_version.updated_at &&
                (ServiceCard.getTags(item, 'props')) && (
                  <WsFlex justifyContent="space-between" alignItems="flex-start" style={{ marginRight: 4 }}>
                    <WsTag
                      backgroundColor={gColor.yellow11l}
                      textColor={gColor.gray}>
                      {ServiceCard.getTags(item, 'props')}
                    </WsTag>
                  </WsFlex>
                )
              }
              {item.status && item.status == 2 && (
                <WsTag
                  style={{
                  }}
                  backgroundColor={gColor.yellow11l}
                  textColor={gColor.gray}>
                  {t('修訂中')}
                </WsTag>
              )}
            </WsFlex>

            <WsText style={{}}>{item.name}</WsText>

            <WsFlex justifyContent="space-between" style={{ marginBottom: 8 }} />

            {item.system_subclasses && (
              <WsFlex style={{ marginBottom: 8 }} flexWrap={'wrap'}>
                {item.system_subclasses.map(
                  (systemSubclass, systemSubclassIndex) => {
                    return (
                      <View key={systemSubclassIndex}>
                        <WsTag
                          img={systemSubclass.icon}
                          style={{
                            marginRight: 8
                          }}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      </View>
                    )
                  }
                )}
              </WsFlex>
            )}
            {item.license_type && (
              <WsFlex
                style={{
                }}
              >
                <WsText size={12}
                  style={{ marginRight: 8 }}>{t('類型')}</WsText>
                <WsDes>{item.license_type.name}</WsDes>
              </WsFlex>
            )}
            {item.last_version && (
              <WsFlex
                style={{
                  marginTop: 8
                }}
              >
                <WsText size={12} style={{ marginRight: 8 }}>{t('更新日期')}</WsText>
                <WsDes>{moment(item.last_version.updated_at).format('YYYY-MM-DD')}</WsDes>
              </WsFlex>
            )}
            
            {item.related_count >= 0 && (
              <WsFlex
                style={{
                  marginTop: 8
                }}
              >
                <WsText size={12} style={{ marginRight: 8 }}>{t('引用數量')}</WsText>
                <WsDes>{`${item.related_count}`}</WsDes>
              </WsFlex>
            )}

            {item.last_version && item.last_version.taker && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d}>
                  {t('人員')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.last_version.taker.name}
                </WsText>
              </WsFlex>
            )}
            {item.last_version && item.last_version.license_number && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d}>
                  {t('證號')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.last_version.license_number}
                </WsText>
              </WsFlex>
            )}
            {item.last_version && item.last_version.valid_start_date && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d}>
                  {t('效期')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.last_version.valid_start_date} -{' '}
                  {item.last_version.valid_end_date
                    ? item.last_version.valid_end_date
                    : t('無期限')}
                </WsText>
              </WsFlex>
            )}
            {item.setup_by_license_versions && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d}>
                  {t('核定設置證照')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.setup_by_license_versions && item.setup_by_license_versions.length > 0
                    ? t('已核定設置')
                    : t('尚未核定設置')}
                </WsText>
                {item.setup_by_license_versions && item.setup_by_license_versions.length > 0 && (
                  <WsIcon
                    name="md-check-circle"
                    size={18}
                    style={{
                      marginLeft: 8
                    }}
                  />
                )}
              </WsFlex>
            )
            }
          </WsPaddingContainer>
          {item.last_version && item.last_version.remind_date && (
            <WsFlex
              justifyContent="center"
              style={{
                backgroundColor: $_isExpired()
                  ? $color.primary11l
                  : $color.danger11l,
                paddingVertical: 8,
                borderBottomRadius: 8
              }}>
              <WsIcon
                color={$_isExpired() ? $color.primary : $color.danger}
                size={18}
                name="ll-nav-alert-outline"
              />
              <WsText
                size={12}
                color={$_isExpired() ? $color.primary : $color.danger}
                style={{
                  marginLeft: 8
                }}>
                {item.last_version.remind_date}
              </WsText>
            </WsFlex>
          )}
        </WsCard>
      )}
    </TouchableOpacity>
  )
}
export default LlLicenseCard002