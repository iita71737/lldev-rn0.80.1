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
  WsDes,
  WsInfo
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import ServiceCheckList from '@/services/api/v1/checklist'
import ServiceCard from '@/services/api/v1/card'
import $color from '@/__reactnative_stone/global/color'

const LlCheckListCard004 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    name,
    style,
    onPress,
    tagIcon,
    tagText,
    reviewer,
    checkers = [],
    taker,
    system_subclasses = [],
    frequency,
    is_collect,
    id,
    factory_tags,
    item,
    testID
  } = props

  const [isCollect, setIsCollect] = React.useState(is_collect)

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

  const bookmarkOnPress = async () => {
    try {
      if (isCollect) {
        await ServiceCheckList.unCollect(id)
        setIsCollect(!isCollect)
      } else {
        await ServiceCheckList.collect(id)
        setIsCollect(!isCollect)
      }
    } catch (error) {
      alert(error)
    }
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
        ]}
      >
        {item.last_version && item.last_version.updated_at && ServiceCard.getTags(item, 'props') && (
          <WsFlex justifyContent="space-between" alignItems="flex-start" style={{ marginBottom: 16 }}>
            <WsTag
              backgroundColor={gColor.yellow11l}
              textColor={gColor.gray}>
              {ServiceCard.getTags(item, 'props')}
            </WsTag>
          </WsFlex>
        )}
        <WsText
          style={{
            maxWidth: width * 0.75
          }}>
          {name}
        </WsText>
        {tagIcon && tagText && (
          <WsTag
            style={{
              marginTop: 8
            }}
            icon={tagIcon}>
            {tagText}
          </WsTag>
        )}
        {$_getTagsBySystemSubclasses(system_subclasses).map((tag, tagIndex) => {
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

        {item.owner && (
          <WsFlex
            style={{
              marginTop: 8
            }}>
            <WsDes
              color={$color.black}
              style={{
                marginRight: 8
              }}
            >
              {t('管理者')}
            </WsDes>
            <WsDes>{item.owner?.name}</WsDes>
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

        <WsFlex
          flexWrap="wrap"
        >
          {factory_tags && factory_tags.length > 0 && factory_tags.map((tag, tagIndex) => {
            return (
              <View key={tagIndex}>
                {tag.id && (
                  <WsTag
                    size={12}
                    backgroundColor={'#f5f5f5'}
                    textColor={'#373737'}
                    style={{
                      marginTop: 8,
                      marginRight: 8
                    }}
                  >
                    {`#${tag.name}`}
                  </WsTag>
                )}
              </View>
            )
          })}
        </WsFlex>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlCheckListCard004
