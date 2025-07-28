import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, FlatList } from 'react-native'
import {
  LlCheckListCard002,
  WsPaddingContainer,
  WsInfiniteScroll,
  WsText
} from '@/components'
import { useTranslation } from 'react-i18next'
import gColor from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import S_CheckList from '@/services/api/v1/checklist'
import { useSelector } from 'react-redux'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordDraft from '@/services/api/v1/checklist_record_draft'
import moment from 'moment'

const CheckListAssignmentHasDraftList = props => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()

  // Props
  const {
    record_draft,
    subTabIndex
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentConnectionState = useSelector(state => state.data.connectionState)
  const currentPreloadChecklistAssignmentDraft = useSelector(state => state.data.preloadChecklistAssignmentDraft)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      checker: currentUser && currentUser.id ? currentUser.id : null
    }
    return params
  }, [currentRefreshCounter, currentUser.id]);

  // helper
  const $_setFrequency = (frequency, expired_before_days) => {
    return S_CheckList.getChecklistContentDeadline(
      frequency,
      expired_before_days
    )
  }
  const $_getExpiredDate = (frequency, expired_before_days) => {
    return S_CheckList.getExpiredDate(frequency, expired_before_days)
  }

  // 已下載的離線作業
  const renderEmptyList = () => {
    return (
      <FlatList
        data={currentPreloadChecklistAssignmentDraft}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => {
          return (
            <View key={item.assignment?.id} >
              <LlCheckListCard002
                key={item.assignment?.id}
                item={item.assignment}
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12,
                    }
                ]}
                draft={true}
                name={item.assignment?.name}
                tagIcon={item.assignment?.tagIcon}
                tagText={item.assignment?.tagText}
                checkers={item.checklist_assignment?.checkers ? item.checklist_assignment?.checkers : currentUser ? currentUser : []}
                reviewers={
                  item.assignment?.reviewers
                    ? item.assignment.reviewers
                    : item.reviewers ?
                      item.reviewers : []
                }
                owner={
                  item.assignment?.owner ? item.assignment?.owner.name : t('無')
                }
                frequency={$_setFrequency(
                  item.assignment?.frequency,
                  item.assignment?.expired_before_days
                )}
                deadline={$_getExpiredDate(
                  item.assignment?.frequency,
                  item.assignment?.expired_before_days
                )}
                onPress={() => {
                  if (item.assignment?.checklist_assignment) {
                    navigation.push('CheckListAssignmentIntroduction', {
                      id: item.checklist_assignment && item.checklist_assignment.id ? item.checklist_assignment.id : null,
                      draftId: item.assignment?.id,
                      subTabIndex: subTabIndex,
                    })
                  } else {
                    navigation.push('CheckListAssignmentIntroductionTemp', {
                      id: item.assignment?.id,
                      draftId: item.id,
                      subTabIndex: subTabIndex,
                      index: index
                    })
                  }
                }}
              />
            </View >
          )
        }}
      />
    )
  }

  return (
    <>
      {currentConnectionState === false ? (
        renderEmptyList()
      ) : (
        <WsInfiniteScroll
          padding={16}
          service={S_CheckListRecordDraft}
          serviceIndexKey={'index'}
          params={_params}
          renderItem={({ item, index }) => {
            return (
              <View key={item.id} >
                <LlCheckListCard002
                  testID={`LlCheckListCard002-${index}`}
                  key={item.id}
                  item={item}
                  style={[
                    index == 0
                      ? null
                      : {
                        marginTop: 12
                      }
                  ]}
                  draft={true}
                  name={item.checklist.name}
                  tagIcon={item.tagIcon}
                  tagText={item.tagText}
                  checkers={
                    item.checklist_assignment?.checkers ? item.checklist_assignment.checkers :
                      currentUser ? [
                        {
                          avatar: currentUser.avatar,
                          id: currentUser.id,
                          name: currentUser.name
                        }
                      ] : []}
                  reviewers={
                    item.assignment?.reviewers
                      ? item.assignment.reviewers
                      : item.reviewers ?
                        item.reviewers : []
                  }
                  owner={
                    item.checklist.owner ? item.checklist.owner.name : t('無')
                  }
                  frequency={$_setFrequency(
                    item.checklist.frequency,
                    item.checklist.expired_before_days
                  )}
                  deadline={item.checklist_assignment?.record_at ? moment(item.checklist_assignment?.record_at).format('YYYY-MM-DD') : '無'}
                  onPress={() => {
                    if (item.checklist_assignment) {
                      navigation.push('CheckListAssignmentIntroduction', {
                        id: item.checklist_assignment && item.checklist_assignment.id ? item.checklist_assignment.id : null,
                        draftId: item.id,
                        subTabIndex: subTabIndex,
                      })
                    } else {
                      navigation.push('CheckListAssignmentIntroductionTemp', {
                        id: item.checklist.id,
                        draftId: item.id,
                        subTabIndex: subTabIndex,
                        index: index
                      })
                    }
                  }}
                />
              </View >
            )
          }}
          ListFooterComponent={() => {
            return (
              <>
                <View
                  style={{
                    height: 60,
                  }}
                >
                </View>
              </>
            )
          }}
        />
      )}
    </>
  )
}

export default CheckListAssignmentHasDraftList
