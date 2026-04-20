import React from 'react'
import { Pressable, TouchableOpacity, View, Dimensions, FlatList, Alert } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsSpec,
  WsBtn,
  WsLoading,
  WsIconBtn,
  WsInfo,
  WsAvatar,
  WsPopup,
  WsGradientButton,
  WsDes
} from '@/components'
import LlBtn001 from '@/components/LlBtn001'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import { useSelector } from 'react-redux'
import {
  setPreloadChecklistAssignmentDraft,
  setRefreshCounter
} from '@/store/data'
import store from '@/store'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'

const LlCheckListCard002 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  const {
    item,
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
    draft,
    testID
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentPreloadChecklistAssignmentDraft = useSelector(state => state.data.preloadChecklistAssignmentDraft)

  // STATES
  const [popupActive002, setPopupActive002] = React.useState(false)

  const [onPressPreloadLoading, setOnPressPreloadLoading] = React.useState(false)
  const [downloaded, setDownloaded] = React.useState(currentPreloadChecklistAssignmentDraft.some(_item => _item.id === item.id))
  const hasPeriod = !!item?.checklist_assignment?.start_time && !!item?.checklist_assignment?.end_time

  // 離線作業下載(草稿)
  const $_preloadDraft = async (draftId) => {
    setOnPressPreloadLoading(true)
    const _checklistId = item.checklist.id
    const _res = await S_ChecklistAssignment.preloadDraft({ _checklistId, draftId, currentFactory })
    setOnPressPreloadLoading(false)
    const deepCopyArray = JSON.parse(JSON.stringify(currentPreloadChecklistAssignmentDraft));
    deepCopyArray.push(_res)
    store.dispatch(setPreloadChecklistAssignmentDraft(deepCopyArray))
    setDownloaded(true)
  }

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

  // 刪除草稿
  const $_deleteChecklistDraft = async () => {
    try {
      await S_CheckListRecord.delete({ modelId: item.id })
      setPopupActive002(false)
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
    } catch (error) {
      console.log(error, 'S_CheckListRecordDraft.delete')
      Alert.alert(t('刪除草稿失敗'))
    }
  }

  return (
    <>
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

          <View
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 999,
            }}
          >
            <WsFlex>
              {/* {onPressPreloadLoading ? (
                <WsLoading></WsLoading>
              ) : downloaded ? (
                <WsText size={12}>{'已下載'}</WsText>
              ) : (
                <WsIconBtn
                  name={onPressPreloadLoading ? 'md-info' : 'fa-cloud-download-alt'}
                  color={$color.gray}
                  onPress={() => $_preloadDraft(item.id)}
                  padding={0}
                  size={32}
                />
              )} */}
              {draft && (
                <WsIconBtn
                  testID={'sc-liff-delete'}
                  style={{
                    marginLeft: 4,
                    zIndex: 999
                  }}
                  name={'sc-liff-delete'}
                  color={$color.danger}
                  onPress={() => setPopupActive002(true)}
                  padding={0}
                  size={28}
                />
              )}
            </WsFlex>
          </View>

          <WsFlex>
            <WsText
              size={16}
              fontWeight="400"
              testID={name}
              style={{
                // borderWidth:1
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

          {hasPeriod && (
            <WsSpec
              colorText={$color.black}
              titleSize={14}
              fontSize={14}
              labelWidth={64}
              style={{
                marginTop: 8
              }}
              title={t('時段')}>
              {`${moment(item.checklist_assignment?.start_time).format('HH:mm')}-${moment(item.checklist_assignment?.end_time).format('HH:mm')}`}
            </WsSpec>
          )}

          {deadline && (
            <WsSpec
              colorText={$color.black}
              titleSize={14}
              fontSize={14}
              labelWidth={64}
              style={{
                marginTop: 8,
                // borderWidth:1,
              }}
              title={t('期限')}>
              {deadline}
            </WsSpec>
          )}

          <View
            style={{
              flexDirection: 'row',
              marginTop: 8,
            }}
          >
            <WsText 
              size={14}
              fontWeight="400"
              color={$color.gray3d}
              style={[
                {
                  marginRight: 8,
                  width: 72,
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
                              testID={`答題者-${index}`}
                              size={14}
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
              testID={'覆核者'}
              avatarSize={42}
              labelWidth={80}
              labelSize={14}
              style={{
                flexDirection: 'row',
                marginTop: 8,
                // borderWidth:1
              }}
              label={t('覆核者')}
              labelFontWeight={300}
              labelColor={$color.gray3d}
              type='users'
              value={reviewers ? reviewers : []}
            />
          )}

          <WsInfo
            labelWidth={84}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            labelSize={14}
            labelFontWeight={400}
            labelColor={$color.gray3d}
            label={t('建立時間')}
            value={moment(item.created_at).format('YYYY-MM-DD HH:mm')}
            type="dateTime"
          />

          <LlBtn001
            style={{
              marginTop: 16
            }}
            onPress={onPress}>
            {draft ? t('繼續點檢') : t('開始點檢')}
          </LlBtn001>

        </WsCard>
      </TouchableOpacity>

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定刪除嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center',
                width: 110,
                height: 48,
                paddingVertical: 9,
              }}
              onPress={() => {
                setPopupActive002(false)
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              btnColor={[$color.danger, $color.danger5l]}
              style={{
                width: 110,
              }}
              onPress={() => {
                $_deleteChecklistDraft()
                setPopupActive002(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default LlCheckListCard002
