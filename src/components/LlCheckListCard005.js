import React, { useCallback, useRef } from 'react'
import {
  Pressable,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Modal
} from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import $color from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsSpec,
  WsBtn,
  WsInfo,
  WsInfoUser,
  WsAvatar,
  WsDes,
  WsIconBtn,
  WsLoading
} from '@/components'
import LlBtn001 from '@/components/LlBtn001'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import {
  setPreloadChecklistAssignment
} from '@/store/data'
import store from '@/store'
import { useSelector } from 'react-redux'
import Config from "react-native-config";

const LlCheckListCard005 = props => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const { width, height } = Dimensions.get('window')

  const {
    name,
    style,
    onPress,
    tagIcon,
    tagText,
    writer,
    reviewers,
    checkers,
    owner,
    frequency,
    deadline,
    time_period,
    draft,
    disabled,
    todayDone,
    item,
    testID
  } = props

  // REDUX
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)

  // STATES
  const [downloaded, setDownloaded] = React.useState(currentPreloadChecklistAssignment && item && item.id ? currentPreloadChecklistAssignment.some(_item => _item.id === item.id) : null)
  const [onPressPreloadLoading, setOnPressPreloadLoading] = React.useState(false)

  // 離線作業下載
  const $_preload = async (id) => {
    try {
      setOnPressPreloadLoading(true);
      const _res = await S_ChecklistAssignment.preload({ id, currentLang });
      const deepCopyArray = currentPreloadChecklistAssignment ? [...currentPreloadChecklistAssignment] : [];
      deepCopyArray.push(_res);
      await store.dispatch(setPreloadChecklistAssignment(deepCopyArray));
      setDownloaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setOnPressPreloadLoading(false);
    }
  }

  return (
    <>
      <Modal
        visible={onPressPreloadLoading}
        transparent={true}
        onRequestClose={() => {
        }}
      >
        <WsLoading
          type={'b'}
          style={{
            flex: 1,
            zIndex: 9999
          }}
        ></WsLoading>
      </Modal >

      <TouchableOpacity
        testID={testID}
        disabled={disabled}
        onPress={onPress}
      >
        <WsCard
          style={[
            {
              alignItems: 'flex-start',
            },
            style
          ]}>

          {/* {Config.ENV === 'development' && (
            <View
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 999,
              }}
            >
              {onPressPreloadLoading ? (
                <WsLoading></WsLoading>
              ) : downloaded ? (
                <WsText size={12}>{'已下載'}</WsText>
              ) : (
                <WsIconBtn
                  disabled={onPressPreloadLoading ? true : false}
                  name={onPressPreloadLoading ? 'md-info' : 'fa-cloud-download-alt'}
                  color={$color.gray}
                  onPress={async () => {
                    await $_preload(item.id)
                  }}
                  padding={0}
                  size={32}
                />
              )}
            </View>
          )} */}

          <WsFlex>
            <WsText
              style={{
              }}
            >{`${name}`}</WsText>
            {tagIcon && tagText && (
              <WsTag
                style={{
                  marginTop: 8
                }}
                icon={tagIcon}>
                {tagText}
              </WsTag>
            )}
          </WsFlex>

          {deadline && (
            <WsSpec
              labelWidth={64}
              style={{
                marginTop: 8,
              }}
              title={t('期限')}>
              {deadline}
            </WsSpec>
          )}
          {time_period && (
            <WsSpec
              style={{
                marginTop: 8,
              }}
              title={t('時段')}>
              {time_period}
            </WsSpec>
          )}

          {item &&
            item.start_time &&
            item.end_time && (
              <>
                <WsSpec
                  labelWidth={64}
                  style={{
                    marginTop: 8,
                  }}
                  title={t('時段')}>
                  {`${moment(item.start_time).format('HH:mm')}-${moment(item.end_time).format('HH:mm')}`}
                </WsSpec>
              </>
            )}

          <View
            style={{
              flexDirection: 'row',
              // alignItems: 'center'
              marginTop: 8
            }}
          >
            <WsText size={12}
              fontWeight="300"
              color={$color.gray3d}
              style={[
                {
                  marginRight: 8,
                  width: 64,
                },
              ]}
            >
              {t('答題者')}
            </WsText>
            <View>
              {checkers &&
                checkers.length > 0 &&
                <FlatList
                  data={checkers}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item, index }) => {
                    return (
                      <>
                        <WsFlex
                          style={{
                          }}
                        >
                          <WsAvatar
                            size={42}
                            isUri={true}
                            source={item.avatar ? item.avatar : null}
                            style={{
                            }}
                          />
                          <View
                            style={{
                              justifyContent: 'center',
                            }}
                          >
                            <WsText
                              size={12}
                              style={{
                                paddingLeft: 8
                              }}
                            >
                              {item.name}
                            </WsText>
                            {item.checklist_record_answer && item.checklist_record_answer.updated_at &&
                              (
                                <WsFlex
                                >
                                  {item.checklist_record_answer && item.checklist_record_answer.updated_at && (
                                    <WsTag>
                                      {t('已完成')}
                                    </WsTag>
                                  )}
                                  <WsDes
                                    style={{
                                      padding: 4
                                    }}
                                  >
                                    {item.checklist_record_answer &&
                                      item.checklist_record_answer.updated_at ?
                                      moment(item.checklist_record_answer.updated_at).format('YYYY-MM-DD HH:mm') :
                                      null
                                    }
                                  </WsDes>
                                </WsFlex>
                              )}
                          </View>
                        </WsFlex>
                      </>
                    )
                  }}
                />
              }
            </View>
          </View>

          {reviewers && reviewers.length > 0 && (
            <WsInfo
              avatarSize={42}
              labelWidth={60}
              labelSize={12}
              style={{
                flexDirection: 'row',
                marginTop: 8
              }}
              label={t('覆核者')}
              labelFontWeight={300}
              labelColor={$color.gray3d}
              type='users'
              value={reviewers ? reviewers : []}
            />
          )}

          <LlBtn001
            disabled={disabled}
            isFullWidth={true}
            style={{
              marginTop: 16
            }}
            onPress={onPress}>
            {draft ? t('繼續點檢') : todayDone ? t('查看點檢') : t('開始點檢')}
          </LlBtn001>

        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlCheckListCard005
