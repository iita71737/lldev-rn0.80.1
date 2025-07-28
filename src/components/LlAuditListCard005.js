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

const LlAuditListCard005 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    onPress,
    style,
    item
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
    <TouchableOpacity onPress={onPress}>
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
        ]}
      >
        {item.last_version &&
          item.last_version.updated_at &&
          ServiceCard.getTags(item, 'props') && (
            <WsFlex justifyContent="space-between" alignItems="flex-start" style={{ marginBottom: 8 }}>
              <WsTag
                backgroundColor={gColor.yellow11l}
                textColor={gColor.gray}>
                {ServiceCard.getTags(item, 'props')}
              </WsTag>

              {item.status == 2 && (
                <WsTag
                  style={{
                    marginLeft: 4
                  }}
                  backgroundColor={gColor.yellow11l}
                  textColor={gColor.gray}>
                  {t('修訂中')}
                </WsTag>
              )}
            </WsFlex>
          )
        }

        <WsText
          style={{
            // maxWidth: width * 0.75 //https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1880
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
                  {t(tag.text)}
                </WsTag>
              )}
            </View>
          )
        })}

        {item.last_version &&
          item.last_version.updated_at && (
            <WsFlex style={{ marginTop: 8 }}>
              <WsText size={12} style={{ marginRight: 8 }}>{t('更新日期')}</WsText>
              <WsDes>{moment(item.last_version.updated_at).format('YYYY-MM-DD')}</WsDes>
            </WsFlex>
          )}

        {item.related_count >= 0 && (
          <WsFlex style={{ marginTop: 8 }}>
            <WsText size={12} style={{ marginRight: 8 }}>{t('引用數量')}</WsText>
            <WsDes>{`${item.related_count}`}</WsDes>
          </WsFlex>
        )}

      </WsCard>
    </TouchableOpacity>
  )
}

export default LlAuditListCard005
