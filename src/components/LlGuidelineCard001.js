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
  WsIconBtn,
  WsInfo,
  WsDialogDelete,
} from '@/components'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import store from '@/store'
import S_Act from '@/services/api/v1/act'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import { useSelector } from 'react-redux'
import {
  setCurrentUser,
  setRefreshCounter,
  setFactoryTags,
  addToCollectGuidelineIds,
  deleteCollectGuidelineId,
} from '@/store/data'
import S_Guideline from '@/services/api/v1/guideline'

const LlGuidelineCard001 = props => {
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
    onPressEdit,
    onPressGuidelineVersionAdminStore,
    onPressGuidelineVersionAdminDelete,
    item,
    announce_at_visible = false,
    effect_at_visible = false,
    deletable = false,
    editable = false,
    updatable = false,
    guideline_status,
    is_collect,
    is_collect_visible = false,
    setSnackBarText,
    isSnackBarVisible,
    setIsSnackBarVisible,
    tags,
    ownerVisible = false
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const collectGuidelineIds = useSelector(state => state.data.collectGuidelineIds)

  // STATE
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isCollect, setIsCollect] = React.useState(is_collect)

  // Functions
  const $_isCollection = () => {
    return collectGuidelineIds.includes(item.id)
  }
  const $_setCollection = async () => {
    if ($_isCollection()) {
      setIsCollect(false)
      setIsSnackBarVisible(false)
      setSnackBarText('已從我的收藏中移除')
      store.dispatch(deleteCollectGuidelineId(item.id))
      // store.dispatch(setRefreshCounter(currentRefreshCounter + 1)) //https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1851
      setIsSnackBarVisible(true)
      await S_Guideline.removeMyCollect(item.id)
    } else {
      setIsCollect(true)
      setIsSnackBarVisible(false)
      setSnackBarText('已儲存至「我的收藏」')
      store.dispatch(addToCollectGuidelineIds(item.id))
      // store.dispatch(setRefreshCounter(currentRefreshCounter + 1)) //https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1851
      setIsSnackBarVisible(true)
      await S_Guideline.addMyCollect(item.id)
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
      >
        <WsCard
          padding={16}
          style={[
            style,
            guideline_status &&
            guideline_status.id === 3 &&
            {
              backgroundColor: $color.danger9l
            }
          ]
          }
        >
          {is_collect_visible && (
            <WsIconBtn
              style={{
                top: 0,
                right: 0,
                position: 'absolute',
                zIndex: 99,
              }}
              name={isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
              size={28}
              onPress={() => {
                $_setCollection()
              }}
            />
          )}

          <View
            style={{
              flexDirection: 'column',
              flexWrap: 'nowrap',
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
            <WsFlex
              flexWrap={'wrap'}
            >
              {isChange && (
                <WsTag
                  borderRadius={16}
                  backgroundColor={$color.yellow11l}
                  textColor={$color.gray}
                  style={{ marginBottom: 8, marginRight: 8 }}>
                  {isChange ? isChange : null}
                </WsTag>
              )}

              {item.guideline_status && (
                <WsTag
                  backgroundColor={$color.yellow11l}
                  textColor={$color.gray}
                  style={{
                    marginBottom: 8,
                    marginRight: 8
                  }}>
                  {item.guideline_status && item.guideline_status.name ? t(item.guideline_status.name) : null}
                </WsTag>
              )}

              {item.has_unreleased != undefined && (
                <WsTag
                  backgroundColor={item.has_unreleased === 0 ? $color.green11l : $color.white2d}
                  textColor={item.has_unreleased === 0 ? $color.green : $color.gray}
                  style={{
                    marginBottom: 8,
                  }}>
                  {item.has_unreleased === 0 ? t('發布') : t('未發布')}
                </WsTag>
              )}
            </WsFlex>

            <WsText
              style={{
                maxWidth: width * 0.8
              }}
            >{title}
            </WsText>

          </View>
          <WsFlex
            style={{
              marginBottom: 4
            }}
            flexWrap={'wrap'}
          >
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

          {item &&
            item.last_version &&
            item.last_version.announce_at &&
            announce_at_visible && (
              <WsFlex>
                <WsText color={$color.gray} size={12}>
                  {t('修正發布日')}{' '}
                  {moment(item.last_version.announce_at).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            )}

          {item &&
            item.last_version &&
            item.last_version.effect_at &&
            effect_at_visible && (
              <WsFlex>
                <WsText color={$color.gray} size={14}>
                  {t('生效日')}{' '}
                  {moment(item.last_version.effect_at).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            )}

          {item?.owner &&
            ownerVisible && (
              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                type="user"
                labelFontWeight={400}
                labelSize={12}
                labelColor={$color.gray}
                label={t('管理者')}
                value={item?.owner ? item.owner : null}
              />
            )}

        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlGuidelineCard001
