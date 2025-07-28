import React from 'react'
import { Pressable, TouchableOpacity, View, Dimensions } from 'react-native'
import {
  WsText,
  WsTag,
  WsInfoLink,
  WsIcon,
  WsPaddingContainer,
  WsCard,
  WsFlex,
  WsDes,
  WsIconBtn
} from '@/components'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import store from '@/store'
import S_Act from '@/services/api/v1/act'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import {
  setCurrentUser,
  setRefreshCounter,
} from '@/store/data'
import { useSelector } from 'react-redux'

const LlActCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    isChange,
    systemSubClasses,
    title,
    tagText,
    tagIcon,
    des,
    style,
    onPress,
    item,
    announce_at_visible = false,
    effect_at_visible = false,
    act_status,
    is_collect,
    is_collect_visible = false,
    setSnackBarText,
    isSnackBarVisible,
    setIsSnackBarVisible,
    tags,
    testID
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // STATE
  const [isCollect, setIsCollect] = React.useState(is_collect)

  const bookmarkOnPress = async () => {
    try {
      if (isCollect) {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(false)
        setSnackBarText('已從我的收藏中移除')
        if (item.act_id) {
          await S_Act.removeMyCollect(item.act_id)
        }
        if (!item.act_id && item.last_version) {
          await S_Act.removeMyCollect(item.last_version.act_id)
        }
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        const userRes = await S_API_Auth.getUser()
        store.dispatch(setCurrentUser(userRes))
      } else {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(true)
        setSnackBarText('已儲存至「我的收藏」')
        if (item.act_id) {
          await S_Act.addMyCollect(item.act_id)
        }
        if (!item.act_id && item.last_version) {
          await S_Act.addMyCollect(item.last_version.act_id)
        }
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        const userRes = await S_API_Auth.getUser()
        store.dispatch(setCurrentUser(userRes))
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard padding={16} style={[style, act_status && act_status.id === 3 && { backgroundColor: $color.danger9l }]}>
        {is_collect_visible && (
          <WsIconBtn
            testID={`${testID}-收藏標籤-${isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}`}
            style={{
              top: 0,
              right: 0,
              position: 'absolute',
              zIndex: 99,
            }}
            name={isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
            size={28}
            onPress={() => {
              bookmarkOnPress()
            }}
          />
        )
        }
        <View
          style={{
            flexDirection: 'column',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
          <WsFlex>
            {isChange && (
              <WsTag
                borderRadius={16}
                backgroundColor={$color.yellow11l}
                textColor={$color.gray}
                style={{ marginBottom: 8, marginRight: 8 }}>
                {isChange ? isChange : null}
              </WsTag>
            )}

            {act_status && (
              <WsTag
                backgroundColor={$color.yellow11l}
                textColor={$color.gray}
                style={{
                  marginBottom: 8,
                }}>
                {act_status && act_status.name ? t(act_status.name) : null}
              </WsTag>
            )
            }
          </WsFlex>
          <WsText>{title}</WsText>
        </View>
        <WsFlex
          style={{
            marginBottom: 4
          }}
          flexWrap={'wrap'}
        >
             <WsText color={$color.gray} size={12}>
              {item.act_type?.name ? `${t(item.act_type?.name)} | `: ''}
            </WsText>
          {systemSubClasses && (
            <>
              {systemSubClasses.map((systemSubClass, systemSubClassIndex) => {
                return (
                  <WsTag
                    key={systemSubClassIndex}
                    img={systemSubClass.icon}
                    style={{
                      marginRight: 8,
                      marginBottom: 8
                    }}>
                    {t(systemSubClass.name)}
                  </WsTag>
                )
              })}
            </>
          )}
          {des && (
            <WsDes
              style={{
                marginLeft: 8
              }}>
              {des}
            </WsDes>
          )}
        </WsFlex>
        <WsFlex
          style={{
            marginBottom: 4
          }}
          flexWrap="wrap"
        >
          {tags && tags.length > 0 && tags.map((tag, tagIndex) => {
            return (
              <View key={tagIndex}>
                {tag.id && (
                  <WsTag
                    size={12}
                    backgroundColor={'#f5f5f5'}
                    textColor={'#373737'}
                    style={{
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
        {item && announce_at_visible && (
          <WsFlex>
            <WsText color={$color.gray} size={12}>
              {t('修正發布日')}{' '}
              {item.announce_at ? moment(item.announce_at).format('YYYY-MM-DD') : item.last_version?.announce_at ? moment(item.last_version?.announce_at).format('YYYY-MM-DD') : ''}
            </WsText>
          </WsFlex>
        )}
        {item && effect_at_visible && (
          <WsFlex>
            <WsText color={$color.gray} size={14}>
              {t('生效日')}{' '}
              {moment(item.effect_at).format('YYYY-MM-DD')}
            </WsText>
          </WsFlex>
        )}
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlActCard001
