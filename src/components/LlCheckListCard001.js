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
  WsDes,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ServiceCheckList from '@/services/api/v1/checklist'
import moment from 'moment'
import ServiceCard from '@/services/api/v1/card'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'
import { useSelector } from 'react-redux'

const LlCheckListCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    name,
    style,
    onPress,
    tagIcon,
    tagText,
    reviewers,
    checkers = [],
    taker,
    system_subclasses = [],
    frequency,
    is_collect,
    id,
    factory_tags,
    item,
    bookmarkBtnVisible = false,
    testID,
    modelName
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // STATE
  const [isCollect, setIsCollect] = React.useState(is_collect)

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

  const $_getTagsBySystemSubclasses = system_subclasses => {
    const _tags = []
    system_subclasses.forEach(system_subclass => {
      _tags.push({
        icon: system_subclass.icon,
        text: t(system_subclass.name)
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
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
    } catch (error) {
      alert(error)
    }
  }

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            alignItems: 'flex-start'
          },
          style
        ]}>
        {item.last_version && item.last_version.updated_at && (
          <WsFlex justifyContent="space-between" alignItems="flex-start" style={{ marginBottom: 8 }}>
            {(ServiceCard.getTags(item, 'props')) && (
              <WsTag
                backgroundColor={gColor.yellow11l}
                textColor={gColor.gray}>
                {ServiceCard.getTags(item, 'props')}
              </WsTag>
            )}
            {item.status && item.status == 2 && (
              <WsTag
                testID={'標籤'}
                style={{
                  marginLeft: 4
                }}
                backgroundColor={gColor.yellow11l}
                textColor={gColor.gray}>
                {t('修訂中')}
              </WsTag>
            )}
          </WsFlex>
        )}


        {item.has_renew_template === 1 && (
          <WsFlex
            justifyContent="space-between"
            alignItems="flex-start"
            style={{
              marginBottom: 8
            }}
          >
            <WsTag
              backgroundColor={gColor.yellow11l}
              textColor={gColor.gray}>
              {t('版本更新')}
            </WsTag>
          </WsFlex>
        )}

        <WsFlex
          flexWrap="wrap"
          alignItems="flex-start"
        >
          <WsText
            style={{
              maxWidth: width * 0.8,
              flex: 1
            }}>
            {name}
          </WsText>

          {bookmarkBtnVisible && (
            <WsIconBtn
              padding={0}
              testID={`${testID}-${isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}`}
              style={{
                marginLeft: 8,
              }}
              name={isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
              size={28}
              onPress={() => {
                bookmarkOnPress()
              }}
            />
          )}
        </WsFlex>

        {tagIcon && tagText && (
          <WsTag
            style={{
              marginTop: 8
            }}
            icon={tagIcon}>
            {tagText}
          </WsTag>
        )}

        <WsFlex
          flexWrap="wrap"
        >
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
        </WsFlex>

        {checkers && checkers.length > 0 && (
          <WsSpec
            style={{
              marginTop: 8
            }}
            title={t('答題者')}>
            {$_getCheckerString(checkers)}
          </WsSpec>
        )
        }

        {reviewers && reviewers.length > 0 && (
          <WsSpec
            style={{
              marginTop: 8
            }}
            title={t('覆核者')}>
            {$_getCheckerString(reviewers)}
          </WsSpec>
        )
        }

        {taker.name && (
          <WsSpec
            colorTitle={$color.black}
            style={{
              marginTop: 8
            }}
            title={t('管理者')}>
            {taker.name}
          </WsSpec>
        )}

        {frequency &&
          modelName === 'checklist_template' && (
            <WsSpec
              colorTitle={$color.black}
              style={{
                marginTop: 8
              }}
              title={t('頻率')}>
              {frequency}
            </WsSpec>
          )}

        {item.last_version &&
          item.last_version.updated_at && (
            <WsFlex>
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

export default LlCheckListCard001
