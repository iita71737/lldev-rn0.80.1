import React from 'react'
import {
  Pressable,
  View,
  TouchableOpacity,
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsDes,
  WsIcon,
  WsCard,
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ServiceCard from '@/services/api/v1/card'

interface LlLicenseCard001Props {
  item: any;
  style?: any;
  onPress: () => void;
  testID: string;
}

const LlLicenseCard001: React.FC<LlLicenseCard001Props> = props => {
  const { t } = useTranslation()

  // Props
  const {
    item,
    style,
    onPress,
    testID
  } = props

  // Function
  const $_isExpired = () => {
    return moment().isBefore(item.last_version.retraining_remind_date != null ? item.last_version.retraining_remind_date : item.last_version.remind_date)
  }

  // Render
  return (
    <TouchableOpacity onPress={onPress} testID={testID}>
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
          padding={0}
        >
          <WsPaddingContainer>

            <WsFlex
              flexWrap={'wrap'}
              style={{ marginBottom: 8 }}
            >
              {item.last_version &&
                item.last_version.valid_end_date &&
                moment().isAfter(item.last_version.valid_end_date) && (
                  <WsTag
                    textColor={$color.danger}
                    backgroundColor={$color.danger11l}>
                    {t('逾期')}
                  </WsTag>
                )}

              {item.last_version && item.last_version.using_status == 0 && (
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
                  <WsFlex
                    justifyContent="space-between"
                    alignItems="flex-start"
                    style={{
                      marginLeft: 4,
                      marginTop: 4,
                      marginRight: 4,
                    }}
                  >
                    <WsTag
                      backgroundColor={gColor.yellow11l}
                      textColor={gColor.gray}
                    >
                      {ServiceCard.getTags(item, 'props')}
                    </WsTag>
                  </WsFlex>
                )}

              {/* crash */}
              {item?.last_version?.license_status_number != null && (
                <WsTag
                  textColor={
                    item.last_version.license_status_number == 1 ? $color.primary : $color.gray3d
                  }
                  backgroundColor={
                    item.last_version.license_status_number == 1
                      ? $color.primary11l
                      : $color.yellow11l
                  }
                  style={{
                    marginLeft: 4
                  }}
                >
                  {item.last_version.license_status_number == 1 ? t('已核准') : t('辦理中')}
                </WsTag>
              )}

              {/* crash */}
              {/* {item.last_version &&
                item.last_version?.using_status &&
                item.last_version?.using_status !== undefined && (
                  <WsTag
                    textColor={item.last_version?.using_status == 1 ? $color.primary : $color.gray3d}
                    backgroundColor={item.last_version?.using_status == 1 ? $color.primary11l : $color.yellow11l}
                    style={{
                      marginLeft: 4
                    }}
                  >
                    {item.last_version?.using_status == 1 ? t('使用中') : t('已停用')}
                  </WsTag>
                )} */}
            </WsFlex>

            {item.name && (
              <WsText style={{}}>{item.name}</WsText>
            )}

            <WsFlex justifyContent="space-between" style={{ marginBottom: 8 }} />
            {item.system_subclasses && (
              <WsFlex style={{ marginBottom: 8 }} flexWrap={'wrap'}>
                {item.system_subclasses.map(
                  (systemSubclass: { icon: any; name: any }, systemSubclassIndex: React.Key | null | undefined) => {
                    return (
                      <View key={systemSubclassIndex}>
                        <WsTag
                          img={systemSubclass.icon}
                          style={{
                            marginRight: 8,
                            marginBottom: 4
                          }}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      </View>
                    )
                  }
                )}
              </WsFlex>
            )}

            {item.last_version && item.last_version.license_number && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText
                  size={12}
                  color={$color.gray3d}
                  style={{
                    width: 64
                  }}
                >
                  {t('證號')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.last_version.license_number}
                </WsText>
              </WsFlex>
            )}

            {item.last_version &&
              item.last_version.taker && (
                <WsFlex style={{ marginBottom: 8 }}>
                  <WsText
                    size={12}
                    color={$color.gray3d}
                    style={{
                      width: 64
                    }}
                  >
                    {t('持有人')}
                  </WsText>
                  <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                    {item.last_version.taker.name}
                  </WsText>
                </WsFlex>
              )}

            {item.last_version && item.last_version.approval_letter && (
              <WsFlex
                style={{
                  marginBottom: 8,
                }}>
                <WsText
                  size={12}
                  color={$color.gray3d}
                  style={{
                    width: 64
                  }}
                >
                  {t('核准函號')}
                </WsText>
                <WsText
                  size={12}
                  color={$color.gray}
                  style={{
                    marginLeft: 8,
                    flex: 1,
                  }}>
                  {item.last_version.approval_letter}
                </WsText>
              </WsFlex>
            )}

            <WsFlex style={{ marginBottom: 8 }}>
              <WsText size={12} color={$color.gray3d} style={{ width: 64 }}>
                {t('效期')}
              </WsText>
              <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                {item.last_version?.valid_start_date
                  ? `${moment(item.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${item.last_version.valid_end_date
                    ? moment(item.last_version.valid_end_date).format('YYYY-MM-DD')
                    : t('無')}`
                  : t('無')}
              </WsText>
            </WsFlex>

            {item.setup_by_license_versions &&
              // item.setup_by_license_versions.length > 0 && // 250522-issue
              !item.license_type?.show_fields.some(field => field === 'retraining_rule') &&
              item.license_type?.show_fields.some(field => field === 'license_owner') && (
                <WsFlex style={{ marginBottom: 8 }}>
                  <WsText
                    size={12}
                    color={$color.gray3d}
                    style={{
                      width: 64
                    }}
                  >
                    {t('屬性')}
                  </WsText>
                  {item.setup_by_license_versions.length > 0 ? (
                    <>
                      <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                        {t('本單位報准掛證人員')}
                      </WsText>
                      <WsIcon
                        name="bih-check-circle-filled"
                        size={20}
                        color={$color.primary}
                      ></WsIcon>
                    </>
                  ) : (
                    <>
                      <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                        {t('非本單位報准掛證人員')}
                      </WsText>
                    </>
                  )}
                </WsFlex>
              )}

            {item.last_version &&
              item.last_version.reminder && (
                <WsFlex style={{ marginBottom: 8 }}>
                  <WsText
                    size={12}
                    color={$color.gray3d}
                    style={{
                      width: 64
                    }}
                  >
                    {t('管理者')}
                  </WsText>
                  <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                    {item.last_version.reminder.name}
                  </WsText>
                </WsFlex>
              )}

          </WsPaddingContainer>

          {item.last_version &&
            (item.last_version.retraining_remind_date != null || item.last_version.remind_date) && (
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
                  {item.last_version.retraining_remind_date ? moment(item.last_version.retraining_remind_date).format('YYYY-MM-DD') : moment(item.last_version.remind_date).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            )}

        </WsCard>
      )}
    </TouchableOpacity>
  )
}
export default LlLicenseCard001