import React, { useState, useEffect } from 'react'
import { View, SafeAreaView, FlatList, Text, Dimensions } from 'react-native'
import {
  WsText,
  WsState,
  WsModal,
  WsPaddingContainer,
  WsBottomRoundContainer,
  WsStateSubtaskCardShow,
  WsBtn,
  WsInfoForm,
  WsSkeleton,
  WsSnackBar,
  WsEmpty,
  WsInfoUser,
  LlBtn002,
  WsFlex,
  WsIcon,
  LlMySubtaskTaskCard
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_SubTask from '@/services/api/v1/sub_task'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigationState } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import S_Task from '@/services/api/v1/task'

const MySubtasks = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes
  const navigationState = useNavigationState(state => state);
  const isFocused = useIsFocused();

  const {
    tabFocus,
    _setSortValue,
    _setSortValue002
  } = props

  // redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [sortValue, setSortValue] = React.useState('隱藏已完成項目')
  const [sortValue002, setSortValue002] = React.useState('依效期由近至遠')

  const [loadingExpired, setLoadingExpired] = React.useState(true)
  const [loadingUpcoming, setLoadingUpcoming] = React.useState(true)
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('你無權限標記他人的待辦事項')
  )

  const [expired, setExpired] = React.useState([])

  const [expiredCount, setExpiredCount] = React.useState()
  const [upcoming, setUpcoming] = React.useState([])
  const [upcomingCount, setUpcomingCount] = React.useState()
  const [subtasksSortbyTask, setSubtasksSortbyTask] = React.useState()

  const [reply, setReply] = React.useState()
  const [replyImages, setReplyImages] = React.useState()
  const [replyAttaches, setReplyAttaches] = React.useState()

  const [reviewRemark, setReviewRemark] = React.useState()
  const [reviewAttaches, setReviewAttaches] = React.useState()
  const [reviewImages, setReviewImages] = React.useState()

  const [expiredPage, setExpiredPage] = React.useState(1)
  const [expiredLastPage, setExpiredLastPage] = React.useState(1)
  const [incomingPage, setIncomingPage] = React.useState(1)
  const [incomingLastPage, setIncomingLastPage] = React.useState(1)
  const [myTasksPage, setMyTasksPage] = React.useState(1)
  const [tasksLastPage, setTasksLastPage] = React.useState(1)

  const [currentTask, setCurrentTask] = React.useState()
  const [currentSubtask, setCurrentSubtask] = React.useState()

  const [stateModalSubtask, setStateModalSubtask] = React.useState(false)
  const [stateModalForReviewSubtask, setStateModalForReviewSubtask] =
    React.useState(false)
  const [stateModalForReplySubtask, setStateModalForReplySubtask] =
    React.useState(false)
  const [fields, setFields] = React.useState()

  // Fields
  const $_setFields = subtask => {
    if (!currentFactory) {
      return
    }
    setFields({
      expired_at: {
        label: i18next.t('待辦期限'),
        type: 'date',
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      task: {
        label: i18next.t('所屬任務'),
        type: 'belongsto',
        nameKey: 'name',
        onPress: $event => {
          setStateModalSubtask(false)
          $_goTaskShow($event)
        },
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      task_taker: {
        label: t('負責人'),
        type: 'user',
        value: subtask.task && subtask.task.taker ? subtask.task.taker : null,
        isUri: true,
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      taker: {
        label: i18next.t('執行者'),
        type: 'user',
        isUri: true,
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      remark: {
        label: i18next.t('備註'),
        displayCheck(fieldsValue) {
          if (fieldsValue.remark) {
            return true
          } else {
            return false
          }
        },
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_attaches: {
        label: i18next.t('附件檔案'),
        type: 'filesAndImages',
        displayCheck(fieldsValue) {
          if (fieldsValue.file_attaches && fieldsValue.file_attaches.length > 0) {
            return true
          } else {
            return false
          }
        },
        style: {
          marginVertical: 4
        },
        labelWidth: 100
      },
      reply: {
        testID: `回覆執行結果`,
        label: `${t('回覆執行結果')}`,
        emptyText: t('尚無回覆'),
        labelBtnText: currentUser && currentUser.id && subtask.taker && subtask.taker.id && currentUser.id == subtask.taker.id ? i18next.t('編輯') : null,
        labelBtnOnPress:
          (currentUser && currentUser.id && subtask.taker && subtask.taker.id && currentUser.id == subtask.taker.id)
            ? () => {
              setReply(subtask.reply)
              setStateModalForReplySubtask(true)
            }
            : null,
        labelRemarkIcon: subtask.reply_updated_at && 'ws-outline-time',
        labelRemarkIconSize: 24,
        labelRemarkIconColor: $color.gray,
        labelRemarkText:
          subtask.reply_updated_at &&
          `${t('編輯時間')} ` +
          `${moment(subtask.reply_updated_at).format('YYYY-MM-DD HH:mm')} `,
        labelRemarkTextUser:
          subtask.reply_update_user &&
          <WsInfoUser
            value={subtask.reply_update_user}
            isUri={true}
          />,
        style: {
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_reply_images: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        displayCheck(fieldsValue) {
          if (fieldsValue.file_reply_images && fieldsValue.file_reply_images.length > 0) {
            return true
          } else {
            return false
          }
        },
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_reply_attaches: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      review_remark: {
        label: `${t('回覆審核結果')}`,
        emptyText: t('尚無回覆'),
        labelBtnText:
          currentUser && currentUser.id && subtask.task && subtask.task.taker && subtask.task.taker.id && currentUser.id === subtask.task.taker.id ? t('編輯') : null,
        labelBtnOnPress:
          currentUser && currentUser.id && subtask.task && subtask.task.taker && subtask.task.taker.id && currentUser.id === subtask.task.taker.id
            ? () => {
              setStateModalForReviewSubtask(true)
            }
            : null,
        labelRemarkIcon: subtask.review_updated_at ? 'ws-outline-time' : null,
        labelRemarkIconSize: 24,
        labelRemarkIconColor: $color.gray,
        labelRemarkText:
          subtask.review_updated_at ?
            `${t('編輯時間')} ` +
            `${moment(subtask.review_updated_at).format('YYYY-MM-DD HH:mm')} ` : null,
        labelRemarkTextUser:
          subtask.review_update_user &&
          <WsInfoUser
            value={subtask.review_update_user}
            isUri={true}
          />,
        style: {
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_review_images: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_review_attaches: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      }
    })
  }

  // Services
  // 我的待辦
  const $_getExpired = async () => {
    let _params = {
      status: 'expired',
      page: 1,
    }
    // 我的待辦-逾期
    _params = S_SubTask.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_SubTask.getAuthSubtasks({ params: _params })
    setExpired(res.data)
    setExpiredCount(res.meta.total)
    setExpiredLastPage(res.meta.last_page)
    setLoadingExpired(false)
  }
  // 我的待辦-載入更多
  // 逾期
  const $_getExpiredMore = async () => {
    let _params = {
      status: 'expired',
      page: expiredPage
    }
    _params = S_SubTask.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_SubTask.getAuthSubtasks({ params: _params })
    const more = res.data
    if (more.length === 0) {
      setMoreBtnVisible(false)
    }
    if (res.meta) {
      setExpiredLastPage(res.meta.last_page)
    }
    const _expired = expired.concat(more)
    setExpired(_expired)
  }
  // 我的待辦-即將到來
  const $_getUpcoming = async () => {
    let _params = {
      status: 'upcoming',
      page: incomingPage,
    }
    _params = S_SubTask.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_SubTask.getAuthSubtasks({ params: _params })
    setUpcoming(res.data)
    setUpcomingCount(res.meta.total)
    setIncomingLastPage(res.meta.last_page)
    setLoadingUpcoming(false)
  }
  // 標記完成 
  const $_setDone = async id => {
    try {
      if (!reply) {
        return
      }
      const res = await S_SubTask.done(id)
      setCurrentSubtask(res)
    } catch (e) {
      console.error(e);
    } finally {
      $_getExpired()
      $_getUpcoming()
    }
  }
  // 標記未完成
  const $_setUndo = async id => {
    try {
      const res = await S_SubTask.undo(id)
      setCurrentSubtask(res)
    } catch (e) {
      console.error(e);
    } finally {
      $_getExpired()
      $_getUpcoming()
    }
  }
  // 儲存執行結果
  const $_editReply = async (subTaskId) => {
    if (!reply || reply.trim() === "") {
      return
    }
    if (reply && reply !== '') {
      const _data = {
        ...currentSubtask,
        reply: reply,
        reply_attaches: replyAttaches ? S_SubTask.formattedForFileStore(replyAttaches) : [],
        reply_images: replyImages ? S_SubTask.formattedForFileStore(replyImages) : [],
      }
      if (!currentSubtask.done_at) {
        $_setDone(currentSubtask.id)
      } else if (currentSubtask.done_at) {
        $_setUndo(currentSubtask.id)
      }
      try {
        const res = await S_SubTask.subTask_reply_update({
          modelId: subTaskId,
          data: _data
        }).then(res => {
          setCurrentSubtask($_helperFunc(res))
          $_getExpired()
          $_getUpcoming()
          setStateModalSubtask(false)
          setStateModalForReplySubtask(false)
        })
      } catch (err) {
        console.log(err, 'error')
      }
    }
  }
  // 編輯審核結果
  const $_editReview = async subTaskId => {
    try {
      const _data = {
        review_remark: reviewRemark,
        review_attaches: reviewAttaches ? S_SubTask.formattedForFileStore(reviewAttaches) : [],
        review_images: reviewImages ? S_SubTask.formattedForFileStore(reviewImages) : []
      }
      const res = await S_SubTask.subTask_review_update({
        modelId: subTaskId,
        data: _data
      }).then(res => {
        setCurrentSubtask($_helperFunc(res))
        $_getExpired()
        $_getUpcoming()
      })
    } catch (err) {
      console.log(err, 'error')
    }
  }
  // 取得我的任務
  const $_getMyTasks = async () => {
    let _params = {
      page: myTasksPage,
    }
    _params = S_Task.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_Task.getAuthTasks({ params: _params })
    // 二次篩選
    const _filterTasks = S_Task.filterSubTasksWithNullDoneAt(res.data, sortValue)
    setSubtasksSortbyTask(_filterTasks)
  }
  // 取得我的任務-載入更多
  const $_getMyTasksMore = async () => {
    let _params = {
      page: myTasksPage
    }
    _params = S_Task.getPickerParams(_params, sortValue, sortValue002)
    const res = await S_Task.getAuthTasks({ params: _params })
    const more = res.data
    const _subtasksSortbyTask = [...subtasksSortbyTask, ...more]
    setSubtasksSortbyTask(_subtasksSortbyTask)
  }


  // 點擊icon與查看編輯modal後觸發
  const $_subTaskCardOnChange = (subTask) => {
    const _takerId = subTask && subTask.taker ? subTask.taker.id : null
    const _userId = currentUser && currentUser.id ? currentUser.id : null
    if (_userId !== _takerId) {
      setIsSnackBarVisible(true)
    }
    // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1712
    if (currentUser &&
      subTask &&
      subTask.taker &&
      ((currentUser.id === subTask.taker.id) || (currentUser.id === subTask.task?.taker?.id))) {
      if (!subTask.done_at) {
        console.log('$_subTaskCardOnChange$_subTaskCardOnChange');
        $_setFields(subTask)
        setCurrentSubtask($_helperFunc(subTask))
        setCurrentTask(subTask.task)
        setReply(subTask.reply)
        setReplyAttaches(subTask.file_reply_attaches)
        setReplyImages(subTask.file_reply_images)
        setReviewRemark(subTask.review_remark)
        setReviewAttaches(subTask.file_review_attaches)
        setReviewImages(subTask.file_review_images)
        setStateModalSubtask(true)
        // setStateModalForReplySubtask(true)
        setTimeout(() => {
          setStateModalForReplySubtask(true);
        }, 300);
      } else {
        $_setUndo(subTask.id)
      }
    }
  }

  const $_goTaskShow = $event => {
    navigation.push('RoutesTask', {
      screen: 'TaskShow',
      params: {
        id: $event.id,
      }
    })
  }

  // Helper func for remove null or undefined value key in object
  const $_helperFunc = obj => {
    let newObj = Object.keys(obj)
      .filter((k) => obj[k] != null)
      .reduce((a, k) => ({ ...a, [k]: obj[k] }), {});
    newObj.task_taker = obj.task.taker
    newObj.creator = obj.creator ? obj.creator : undefined
    return newObj
  }

  React.useEffect(() => {
    if (tabFocus && sortValue && sortValue002) {
      $_getExpired(sortValue)
      $_getUpcoming(sortValue)
      $_getMyTasks()
      setExpiredPage(1)
      setIncomingPage(1)
    }
  }, [tabFocus, currentFactory, sortValue, sortValue002])

  React.useEffect(() => {
    if (expiredPage > 1) {
      $_getExpiredMore()
    }
    if (incomingPage > 1) {
      $_getExpiredMore()
    }
    if (myTasksPage > 1) {
      $_getMyTasksMore()
    }
  }, [expiredPage, incomingPage, myTasksPage])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入 我的待辦');
    });
    const unsubscribeBlur = navigation.addListener('blur', () => {
      console.log('離開 我的待辦');
    });
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  return (
    <>
      {tabFocus === 'mysubtask' && (
        <>
          <WsSnackBar
            text={snackBarText}
            setVisible={setIsSnackBarVisible}
            visible={isSnackBarVisible}
            quickHidden={true}
          />

          {currentSubtask && currentTask && fields && (
            <WsModal
              style={{
                margin: 0
              }}
              animationType={'slide'}
              visible={stateModalSubtask}
              iconLeftSize={30}
              iconLeftColor={currentSubtask && currentSubtask.done_at ? $color.primary : $color.gray}
              iconLeftName={
                currentSubtask && currentSubtask.done_at
                  ? 'ws-filled-check-circle'
                  : 'ws-outline-check-circle-outline'
              }
              headerLeftOnPress={() => {
                if (
                  currentUser &&
                  currentSubtask &&
                  currentSubtask.taker &&
                  (currentUser.id !== currentSubtask.taker.id)
                ) {
                  setSnackBarText(t('尚未填寫執行結果'))
                  setIsSnackBarVisible(true)
                }
                else if (
                  currentUser &&
                  (currentUser.id == currentSubtask.taker.id)
                ) {
                  $_subTaskCardOnChange(currentSubtask)
                }
              }}
              onBackButtonPress={() => {
              }}
              headerRightOnPress={() => {
                setStateModalSubtask(false)
              }}
              iconRightName="ws-outline-chevron-down"
              contentStyle={{
                padding: 20
              }}
              title={currentSubtask.name}
              hasReduce={false}>
              <ScrollView
                testID={'ScrollView'}
              >
                <WsInfoForm
                  style={{
                    padding: 16,
                  }}
                  fields={fields}
                  value={currentSubtask}
                />
              </ScrollView>
              <WsModal
                animationType={'slide'}
                visible={stateModalForReplySubtask}
                onBackButtonPress={() => {
                }}
                headerLeftOnPress={() => {
                  // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1712
                  // if (currentSubtask.done_at) {
                  //   const _value = { ...currentSubtask }
                  //   _value.done_at = null
                  //   setCurrentSubtask($_helperFunc(_value))
                  // } else if (currentSubtask.reply) {
                  //   const _value = { ...currentSubtask }
                  //   _value.done_at = moment().utc()
                  //   setCurrentSubtask($_helperFunc(_value))
                  // }
                  setStateModalForReplySubtask(false)
                }}
                headerRightOnPress={() => {
                  $_editReply(currentSubtask.id)
                }}
                RightOnPressIsDisabled={reply ? false : true}
                headerRightText={t('儲存')}
                title={t('我的待辦-回覆執行結果')}
              >
                <ScrollView
                  testID={'ScrollView'}
                >
                  <WsPaddingContainer>
                    <WsState
                      style={{
                        marginVertical: 8,
                      }}
                      stateStyle={{
                        borderColor: reply == '' || reply == undefined ? $color.danger : $color.black
                      }}
                      label={t('回覆執行結果') ? t('回覆執行結果') : '回覆執行結果'}
                      placeholder={t('請輸入執行結果...')}
                      multiline={true}
                      value={reply}
                      onChange={(e) => {
                        setReply(e)
                      }}
                      rules={'required'}
                    />
                    <WsState
                      style={{
                        marginVertical: 8,
                      }}
                      type="Ll_filesAndImages"
                      label={t('圖片')}
                      value={replyImages}
                      onChange={setReplyImages}
                      modelName="sub_task"
                    // uploadUrl={`factory/${currentFactory.id}/sub_task/reply_image`}
                    />
                    <WsState
                      style={{
                        marginVertical: 8,
                      }}
                      type="Ll_filesAndImages"
                      label={t('回覆執行結果附件') ? t('回覆執行結果附件') : '回覆執行結果附件'}
                      value={replyAttaches}
                      onChange={setReplyAttaches}
                      modelName="sub_task"
                    // uploadUrl={`factory/${currentFactory.id}/sub_task/reply_attach`}
                    />
                  </WsPaddingContainer>
                </ScrollView>
              </WsModal>

              <WsModal
                visible={stateModalForReviewSubtask}
                onBackButtonPress={() => {
                  setStateModalForReviewSubtask(false)
                }}
                headerLeftOnPress={() => {
                  setStateModalForReviewSubtask(false)
                }}
                headerRightOnPress={() => {
                  setStateModalForReviewSubtask(false)
                  $_editReview(currentSubtask.id)
                }}
                headerRightText={t('儲存')}
                title={t('我的待辦-回覆審核結果')}
              >
                <ScrollView>
                  <WsPaddingContainer>
                    <WsState
                      style={{
                        marginVertical: 8
                      }}
                      textCounter={true}
                      maxLength={3000}
                      label={t('回覆審核結果')}
                      placeholder={t('請詳細說明待辦事項審核結果')}
                      multiline={true}
                      value={reviewRemark}
                      onChange={setReviewRemark}
                    />
                    <WsState
                      style={{
                        marginVertical: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('新增審核結果圖片')}
                      value={reviewImages}
                      onChange={setReviewImages}
                      modelName="sub_task"
                      uploadUrl={`factory/${currentFactory.id}/sub_task/review_image`}
                    />
                    <WsState
                      style={{
                        marginVertical: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('新增審核結果附件')}
                      value={reviewAttaches}
                      onChange={setReviewAttaches}
                      modelName="sub_task"
                      uploadUrl={`factory/${currentFactory.id}/sub_task/review_attach`}
                    />
                  </WsPaddingContainer>
                </ScrollView>
              </WsModal>

            </WsModal>
          )}

          <WsBottomRoundContainer>
            <WsFlex
              style={{
                marginBottom: 16,
              }}
            >
              <WsState
                style={{
                  flex: 1,
                  borderColor: $color.gray
                }}
                borderWidth={0.3}
                borderRadius={10}
                type="picker"
                value={sortValue}
                onChange={e => {
                  setSortValue(e)
                  _setSortValue(e)
                }}
                placeholder={i18next.t('排序方式')}
                items={[
                  {
                    label: i18next.t('全部'),
                    value: '全部'
                  },
                  {
                    label: i18next.t('隱藏已完成項目'),
                    value: '隱藏已完成項目'
                  }
                ]}
              />
              <WsState
                style={{
                  marginLeft: 16,
                  flex: 1,
                  borderColor: $color.gray
                }}
                borderWidth={0.3}
                borderRadius={10}
                type="picker"
                value={sortValue002}
                onChange={e => {
                  setSortValue002(e)
                  _setSortValue002(e)
                }}
                placeholder={i18next.t('排序方式')}
                items={[
                  {
                    label: i18next.t('依效期由近至遠'),
                    value: '依效期由近至遠'
                  },
                  {
                    label: i18next.t('依任務排序'),
                    value: '依任務排序'
                  }
                ]}
              />
            </WsFlex>

            {sortValue002 !== '依任務排序' ? (
              <>
                {expired && !loadingExpired ? (
                  <>
                    <WsText
                      style={{
                        padding: 8
                      }}
                      fontWeight="bold"
                      textAlign="center">
                      {`${i18next.t('逾期')} ( ${expiredCount} )`}
                    </WsText>

                    {!loadingExpired && (
                      <FlatList
                        data={expired}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                          return (
                            <>
                              <WsStateSubtaskCardShow
                                testID={`WsStateSubtaskCardShow-${index}`}
                                key={index}
                                sortValue={sortValue002}
                                // onPress={async () => {
                                //   $_setFields(item)
                                //   setCurrentTask(item.task)
                                //   const _subtask = await S_SubTask.show({ subTaskId: item.id })
                                //   await setCurrentSubtask($_helperFunc(_subtask))
                                //   setReply(item.reply)
                                //   setReplyAttaches(item.file_reply_attaches)
                                //   setReplyImages(item.file_reply_images)
                                //   setReviewRemark(item.review_remark)
                                //   setReviewAttaches(item.file_review_attaches)
                                //   setReviewImages(item.file_review_images)
                                //   setStateModalSubtask(true)
                                // }}
                                onPress={() => {
                                  // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1717
                                  if (item.task?.done_at && item.task?.checked_at) {
                                    setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                                    setIsSnackBarVisible(true)
                                    return
                                  }
                                  $_setFields(item)
                                  setCurrentTask(item.task)
                                  setCurrentSubtask($_helperFunc(item))
                                  setReply(item.reply)
                                  setReplyAttaches(item.file_reply_attaches)
                                  setReplyImages(item.file_reply_images)
                                  setReviewRemark(item.review_remark)
                                  setReviewAttaches(item.file_review_attaches)
                                  setReviewImages(item.file_review_images)
                                  setStateModalSubtask(true)
                                }}
                                headerRightOnPress={() => {
                                  setStateModalSubtask(false)
                                }}
                                stateModal={stateModalSubtask}
                                style={{
                                  marginTop: 8
                                }}
                                text={i18next.t('通知')}
                                date={item.expired_at}
                                attachCount={item.attaches.length}
                                user={item.taker.name}
                                value={item}
                                onChange={(_value) => {
                                  if (currentUser && (currentUser.id !== item.taker.id)) {
                                    setIsSnackBarVisible(true)
                                  }
                                  else if (item.task?.done_at && item.task?.checked_at) {
                                    // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1717
                                    setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                                    setIsSnackBarVisible(true)
                                  }
                                  else {
                                    $_subTaskCardOnChange(_value)
                                  }
                                }}
                                done_at={item && item.done_at ? item.done_at : null}
                                setIsSnackBarVisible={setIsSnackBarVisible}
                              >
                              </WsStateSubtaskCardShow>
                            </>
                          )
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <WsEmpty image={null} emptyTitle={t('目前沒有逾期事項')} emptyText={""} />
                          )
                        }}
                        ListFooterComponent={
                          <>
                            {expiredPage !== expiredLastPage && (
                              <WsBtn
                                onPress={() => {
                                  if (expiredPage < expiredLastPage) {
                                    setExpiredPage(expiredPage + 1)
                                  }
                                }}
                                style={{
                                  marginTop: 8,
                                  marginBottom: 16,
                                }}
                                borderColor={$color.gray}
                                borderWidth={0.4}
                                textColor={$color.gray}
                                color={$color.white}
                                borderRadius={25}>
                                {t('載入更多')}
                              </WsBtn>
                            )}
                          </>
                        }
                      />
                    )}
                  </>
                ) : (
                  <WsSkeleton></WsSkeleton>
                )}
                {upcoming && !loadingUpcoming ? (
                  <>
                    <WsText
                      style={{
                        marginTop: 16,
                      }}
                      fontWeight="bold"
                      textAlign="center">
                      {i18next.t('即將到來')}({upcomingCount})
                    </WsText>

                    {upcoming && (
                      <FlatList
                        data={upcoming}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                          return (
                            <View key={index}>
                              {item.task && (
                                <WsStateSubtaskCardShow
                                  sortValue={sortValue002}
                                  onPress={async () => {
                                    $_setFields(item)
                                    setCurrentTask(item.task)
                                    const _subtask = await S_SubTask.show({ subTaskId: item.id })
                                    setCurrentSubtask($_helperFunc(_subtask))
                                    setReply(item.reply)
                                    setReplyAttaches(item.file_reply_attaches)
                                    setReplyImages(item.file_reply_images)
                                    setReviewRemark(item.review_remark)
                                    setReviewAttaches(item.file_review_attaches)
                                    setReviewImages(item.file_review_images)
                                    setStateModalSubtask(true)
                                  }}
                                  style={{
                                    marginTop: 8
                                  }}
                                  isDone={false}
                                  text={i18next.t('通知')}
                                  date={item.expired_at}
                                  attachCount={item.attaches.length}
                                  user={item.taker.name}
                                  name={item.name}
                                  value={item}
                                  title={item.name}
                                  done_at={item.done_at}
                                  onChange={(_value) => {
                                    if (currentUser.id !== item.taker.id) {
                                      setIsSnackBarVisible(true)
                                    }
                                    else if (item.task?.done_at && item.task?.checked_at) {
                                      // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1717
                                      setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                                      setIsSnackBarVisible(true)
                                    }
                                    else {
                                      $_subTaskCardOnChange(_value)
                                    }
                                  }}>
                                </WsStateSubtaskCardShow>
                              )}
                            </View>
                          )
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <WsEmpty image={null} emptyTitle={t('目前沒有即將到來事項')} emptyText={""} />
                          )
                        }}
                        ListFooterComponent={
                          <>
                            {incomingPage !== incomingLastPage && (
                              <WsBtn
                                onPress={() => {
                                  if (incomingPage < incomingLastPage) {
                                    setIncomingLastPage(incomingPage + 1)
                                  }
                                }}
                                style={{
                                  marginTop: 8,
                                  marginBottom: 16,
                                }}
                                borderColor={$color.gray}
                                borderWidth={0.4}
                                textColor={$color.gray}
                                color={$color.white}
                                borderRadius={25}>
                                {t('載入更多')}
                              </WsBtn>
                            )}
                          </>
                        }
                      />
                    )
                    }
                  </>
                ) : (
                  <WsSkeleton></WsSkeleton>
                )}
              </>
            ) : (
              <>
                {subtasksSortbyTask && subtasksSortbyTask.length > 0 ? (
                  <>
                    <FlatList
                      data={subtasksSortbyTask}
                      keyExtractor={item => item.id}
                      renderItem={({ item, index }) => {
                        return (
                          <>
                            <LlMySubtaskTaskCard
                              item={item}
                              key={index}
                              sortValue={sortValue002}
                              onPress={async () => {
                                $_setFields(item.sub_tasks[0])
                                setCurrentTask(item)
                                const _subtask = await S_SubTask.show({ subTaskId: item.sub_tasks[0].id })
                                setCurrentSubtask($_helperFunc(_subtask))

                                setReply(item.sub_tasks[0].reply)
                                setReplyAttaches(item.sub_tasks[0].reply_attaches)
                                setReplyImages(item.sub_tasks[0].reply_images)
                                setReviewRemark(item.sub_tasks[0].review_remark)
                                setReviewAttaches(item.sub_tasks[0].review_attaches)
                                setReviewImages(item.sub_tasks[0].review_images)

                                setStateModalSubtask(true)
                              }}
                              style={{
                                marginTop: 8
                              }}
                              isDone={false}
                              text={i18next.t('通知')}
                              date={item.sub_tasks[0] && item.sub_tasks[0].expired_at ? item.sub_tasks[0].expired_at : ''}
                              user={item.sub_tasks[0] && item.sub_tasks[0].taker && item.sub_tasks[0].taker.name ? item.sub_tasks[0].taker.name : ''}
                              name={item.sub_tasks[0] && item.sub_tasks[0].name ? item.sub_tasks[0].name : ''}
                              value={item.sub_tasks[0]}
                              title={item.sub_tasks[0] && item.sub_tasks[0].name ? item.sub_tasks[0].name : ''}
                              done_at={item.sub_tasks[0] && item.sub_tasks[0].done_at ? item.sub_tasks[0].done_at : ''}
                              attachCount={item.sub_tasks[0] && item.sub_tasks[0].attaches && item.sub_tasks[0].attaches.length > 0 ? item.sub_tasks[0].attaches.length : 0}
                              onChange={() => {
                                if (item.sub_tasks[0] && item.sub_tasks[0].taker && currentUser && (currentUser.id != item.sub_tasks[0].taker.id)) {
                                  setIsSnackBarVisible(true)
                                } else {
                                  $_subTaskCardOnChange(item.sub_tasks[0])
                                }
                              }}
                              sub_tasks={item && item.sub_tasks}
                            ></LlMySubtaskTaskCard>
                          </>
                        )
                      }}
                      ListEmptyComponent={() => {
                        return (
                          <WsEmpty image={null} emptyTitle={t('目前沒有待辦事項')} emptyText={""} />
                        )
                      }}
                      ListFooterComponent={
                        <>
                        </>
                      }
                    />
                    {myTasksPage !== tasksLastPage && (
                      <WsBtn
                        onPress={() => {
                          if (tasksLastPage < tasksLastPage) {
                            setPage(myTasksPage + 1)
                          }
                        }}
                        style={{
                          marginTop: 8,
                          marginBottom: 16,
                          // borderWidth:2,
                        }}
                        borderColor={$color.gray}
                        borderWidth={0.4}
                        textColor={$color.gray}
                        color={$color.white}
                        borderRadius={25}>
                        {t('載入更多')}
                      </WsBtn>
                    )}
                  </>
                ) : (
                  <WsEmpty emptyTitle={t('目前尚無資料')} emptyText={""} />
                )
                }
              </>
            )}
          </WsBottomRoundContainer>
        </>
      )}
    </>
  )
}

export default MySubtasks
