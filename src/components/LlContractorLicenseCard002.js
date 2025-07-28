import React from 'react'
import { Pressable, View, TouchableOpacity, Dimensions } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsSpec,
  WsBtn,
  WsIconBtn,
  WsDes
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import ServiceCheckList from '@/services/api/v1/checklist'
import ServiceCard from '@/services/api/v1/card'
import $color from '@/__reactnative_stone/global/color'

const LlContractorLicenseCard002 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    onPress,
    style,
    item,
    testID
  } = props

  const $_getTagsBySystemSubclasses = system_subclasses => {
    const _tags = []
    system_subclasses.forEach(system_subclass => {
      _tags.push({
        icon: system_subclass.icon,
        text: system_subclass.name
      })
    })
    return _tags
  }

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}>
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
          {
            alignItems: 'flex-start',
          },
          style
        ]}>
        {item.last_version && item.last_version.updated_at && ServiceCard.getTags(item, 'props') && (
          <WsFlex justifyContent="space-between" alignItems="flex-start" style={{ marginBottom: 16 }}>
            <WsTag
              backgroundColor={gColor.yellow11l}
              textColor={gColor.gray}>
              {ServiceCard.getTags(item, 'props')}
            </WsTag>
          </WsFlex>
        )
        }
        <WsText
          style={{
            maxWidth: width * 0.75
          }}>
          {item.name}
        </WsText>
        {item.tagIcon && item.tagText && (
          <WsTag
            style={{
              marginTop: 8
            }}
            icon={item.tagIcon}>
            {item.tagText}
          </WsTag>
        )}
        {item.system_subclasses && $_getTagsBySystemSubclasses(item.system_subclasses).map((tag, tagIndex) => {
          return (
            <View key={tagIndex}>
              {tag.icon && tag.text && (
                <WsTag
                  style={{
                    marginTop: 8,
                    marginRight: 8
                  }}
                  img={tag.icon}>
                  {tag.text}
                </WsTag>
              )}
            </View>
          )
        })}

        {item.last_version && item.last_version.license_number && (
          <WsFlex style={{ marginBottom: 8, marginTop: 8 }}>
            <WsText size={12} color={$color.gray3d}>
              {t('證號')}
            </WsText>
            <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
              {item.last_version.license_number}
            </WsText>
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

        {item.last_version && item.last_version.reminder && (
          <WsFlex style={{}}>
            <WsDes style={{ marginRight: 8 }}>
              {t('管理者')}
            </WsDes>
            <WsDes>
              {item.last_version && item.last_version.reminder
                ? item.last_version.reminder.name
                : '無'}
            </WsDes>
          </WsFlex>
        )}

        {item.last_version &&
          item.last_version.updated_at && (
            <WsFlex style={{ marginTop: 8 }}>
              <WsText size={12} style={{ marginRight: 8 }}>{t('更新日期')}</WsText>
              <WsDes>{moment(item.last_version.updated_at).format('YYYY-MM-DD')}</WsDes>
            </WsFlex>
          )}

        {item.related_count >= 0 && (
          <WsFlex>
            <WsText size={12} style={{ marginRight: 8 }}>{t('引用數量')}</WsText>
            <WsDes>{`${item.related_count}`}</WsDes>
          </WsFlex>
        )}

      </WsCard>
    </TouchableOpacity>
  )
}

export default LlContractorLicenseCard002
