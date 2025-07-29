import React from 'react'
import {
  ScrollView,
  View,
  Text,
  SafeAreaView,
  Dimensions,
  Alert,
  Modal,
  Linking,
  TouchableOpacity
} from 'react-native'
import {
  WsIcon,
  WsInfo,
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsModal,
  WsBottomSheet,
  WsIconBtn,
  WsDialogDelete,
  WsStateSubtaskCardShow,
  WsSnackBar,
  WsState,
  WsAvatar,
  LlTaskHeaderCard001,
  LlNavButton002,
  WsLoading,
  WsInfoForm,
  WsBtn,
  WsGradientButton,
  WsInfoUser,
  WsTag,
  WsGradientProgressBar,
  WsCard,
  LlRelatedGuidelineArticleVersionCard001,
  LlRelatedGuidelineVersionCard001,
  LlRelatedAlertCard001,
  LlRelatedAuditRecordCard001,
  LlEventCard001,
  LlRelatedChecklistRecordCard001,
  LlRelatedESGoalBroadcastCard001,
  LlRelatedActCard001,
  LlRelatedArticleCard001,
  WsPassageCollapse,
  WsPopup
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Task from '@/services/api/v1/task'
import S_SubTask from '@/services/api/v1/sub_task'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useRoute } from '@react-navigation/native'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import ViewGuidelineArticleShowForModal from '@/views/ActGuideline/GuidelineArticleShowForModal'
import store from '@/store'
import {
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentViewMode,
  setRefreshCounter
} from '@/store/data'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import S_Factory from '@/services/api/v1/factory'
import App_Notification from '@/services/app/notification'
import S_ModulePage from '@/services/api/v1/module_page'

const TaskShow = ({ navigation, route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes

  // Props
  const {
    id,
    refreshKey
  } = route.params

  console.log(id, '=id=');

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // States
  const [popupActive003, setPopupActive003] = React.useState(false)

  const [popupActive002, setPopupActive002] = React.useState(false)
  const [popupContentRelatedModule, setPopupContentRelatedModule] = React.useState()
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupContent, setPopupContent] = React.useState()

  const [submitLoading, setSubmitLoading] = React.useState(false)

  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  const [actModal, setActModal] = React.useState(false)

  const [refreshCounter, _setRefreshCounter] = React.useState(0);

  const [task, setTask] = React.useState()
  const [currentSubtask, setCurrentSubtask] = React.useState()

  const [replyAttaches, setReplyAttaches] = React.useState()
  const [replyImages, setReplyImages] = React.useState()
  const [reply, setReply] = React.useState()

  const [reviewRemark, setReviewRemark] = React.useState()
  const [reviewAttaches, setReviewAttaches] = React.useState()
  const [reviewImages, setReviewImages] = React.useState()

  const [fields, setFields] = React.useState()

  const [loading, setLoading] = React.useState(true)

  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)

  const [stateModalSubtask, setStateModalSubtask] = React.useState(false)
  const [stateModalForReplySubtask, setStateModalForReplySubtask] =
    React.useState(false)
  const [stateModalForReviewSubtask, setStateModalForReviewSubtask] =
    React.useState(false)

  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('你無權限標記他人的待辦事項')
  )
  const bottomSheetItems = React.useMemo(() => [
    {
      to: {
        name: 'TaskUpdate',
        params: {
          id: id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      icon: 'ws-outline-delete',
      color: $color.danger,
      label: t('刪除'),
      labelColor: $color.danger,
      onPress: () => {
        setDialogVisible(true);
      }
    }
  ], [id, route])

  // Storage
  const $_setStorage = async () => {
    const _formatted = S_Task.transformTaskLinksToRelatedModules(task)
    const _task = JSON.stringify(_formatted)
    await AsyncStorage.setItem('TaskUpdate', _task)
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1717
      headerRight: (task?.done_at && task?.checked_at) ? undefined : () => {
        return (
          <>
            <WsIconBtn
              testID={'ws-outline-edit-pencil'}
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                $_setStorage()
                setIsBottomSheetActive(true)
              }}
            />
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="md-chevron-left"
            color="white"
            size={32}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
              if (refreshKey) {
                setTimeout(() => {
                  store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
                }, 300) // 延遲 300 毫秒
              }
            }}
          />
        )
      }
    })
  }
  // Services
  const $_fetchTask = React.useCallback(async () => {
    try {
      const res = await S_Task.show({ modelId: id });
      setTask(res);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  const $_setDone = async id => {
    const res = await S_SubTask.done(id)
    $_fetchTask()
    const _subtask = await S_SubTask.show({ subTaskId: id })
    setCurrentSubtask(_subtask)
    _setRefreshCounter(refreshCounter + 1)
  }
  const $_setUndo = async id => {
    const res = await S_SubTask.undo(id)
    $_fetchTask()
    const _subtask = await S_SubTask.show({ subTaskId: id })
    setCurrentSubtask(_subtask)
    _setRefreshCounter(refreshCounter + 1)
  }

  // 儲存執行結果
  const $_editReply = async subTaskId => {
    if (!reply || reply.trim() === "") {
      return
    }
    if (reply && reply !== '') {
      const _data = {
        reply: reply,
        reply_attaches: replyAttaches ? S_SubTask.formattedForFileStore(replyAttaches) : [],
        reply_images: replyImages ? S_SubTask.formattedForFileStore(replyImages) : [],
      }
      const res = await S_SubTask.subTask_reply_update({
        modelId: subTaskId,
        data: _data
      }).then(res => {
        setCurrentSubtask(res)
        $_setDone(subTaskId)
        $_fetchTask()
        setStateModalForReplySubtask(false)
        setStateModalSubtask(false)
      })
    }
  }

  // 編輯審核結果
  const $_editReview = async subTaskId => {
    const _data = {
      review_remark: reviewRemark,
      review_attaches: reviewAttaches && reviewAttaches.length > 0 ? S_SubTask.formattedForFileStore(reviewAttaches) : [],
      review_images: reviewImages && reviewImages.length > 0 ? S_SubTask.formattedForFileStore(reviewImages) : []
    }
    const res = await S_SubTask.subTask_review_update({
      modelId: subTaskId,
      data: _data
    }).then(res => {
      setCurrentSubtask(res)
      $_setDone(subTaskId)
      $_fetchTask()
    })
  }

  // 待辦皆完成時，負責人可完成審核
  const $_checkTask = async () => {
    try {
      const res = await S_Task.checkTask(id)
      Alert.alert('完成審核')
      navigation.push('TaskIndex', {
        _tabIndex: 1
      })
    } catch (error) {
      Alert.alert('完成審核發生異常')
      console.error(error)
    }
  }

  // 已審核任務，負責人可取消審核
  // const $_UnCheckTask = async () => {
  //   console.log(id, 'id--');
  //   try {
  //     const res = await S_Task.uncheckTask(id)
  //     Alert.alert('取消審核成功')
  //     navigation.push('TaskIndex', {
  //       _tabIndex: 2
  //     })
  //   } catch (error) {
  //     Alert.alert('取消審核發生異常')
  //     console.error(error)
  //   }
  // }

  // Function
  const $_userFormat = (user, date) => {
    return {
      name: user.name,
      avatar: user.avatar,
      des: date ? moment(date).format('YYYY-MM-DD') : t('尚未完成審核')
    }
  }
  const $_isDone = subTasks => {
    const _isDone = subTasks.filter(task => {
      return task.done_at
    })
    return _isDone.length
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  // 待辦流程
  const $_subTaskCardOnChange = subTask => {
    setSubmitLoading(true)
    if (!fields) {
      console.log('$_subTaskCardOnChange 1');
      $_setFields(subTask)
    }
    // 已經有執行結果
    if (subTask.reply) {
      if (subTask?.done_at) {
        $_setUndo(subTask?.id)
      } else if (!subTask?.done_at) {
        $_setDone(subTask?.id)
      }
      setSubmitLoading(false)
      return
    }
    if (currentUser &&
      subTask &&
      subTask.taker &&
      ((currentUser?.id === subTask.taker?.id) || (currentUser?.id === task.taker?.id))) {
      console.log('$_subTaskCardOnChange 3');
      if (!subTask.done_at) {
        setCurrentSubtask(subTask)
        setStateModalSubtask(true)
        console.log('setStateModalForReplySubtask');
        setTimeout(() => {
          setStateModalForReplySubtask(true)
        }, 100)
      } else {
        $_setUndo(subTask.id)
      }
    }
    else if (currentUser &&
      currentUser.id &&
      subTask &&
      subTask.taker &&
      subTask.taker.id &&
      (currentUser.id !== subTask.taker.id) &&
      !subTask.reply
    ) {
      console.log('$_subTaskCardOnChange 4');
      setIsSnackBarVisible(true)
    }
    setSubmitLoading(false)
  }

  const $_subtaskCardOnPress = (subTask) => {
    $_setFields(subTask)
    setCurrentSubtask(subTask)
    setStateModalSubtask(true)
  }

  const $_setFields = subtask => {
    setFields({
      expired_at: {
        type: 'date',
        label: t('待辦期限') ? t('待辦期限') : '待辦期限',
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      task: {
        label: t('所屬任務'),
        type: 'belongsto',
        nameKey: 'name',
        onPress: $event => {
          setStateModalSubtask(false)
        },
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      taker: {
        label: t('執行者'),
        nameKey: 'name',
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
        label: t('備註'),
        style: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 4
        },
        labelWidth: 100
      },
      file_attaches: {
        label: t('附件'),
        emptyText: t('無'),
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
      },
      reply: {
        testID: '回覆執行結果',
        label: `${t('執行結果')}`,
        emptyText: t('尚無回覆'),
        labelBtnText:
          ((subtask && currentUser && subtask.taker && currentUser.id == subtask.taker.id) || (currentUser.id === task.taker.id) && (!task.done_at))
            ? t('編輯')
            : null,
        labelBtnOnPress:
          (subtask && currentUser && subtask.taker && (currentUser.id == subtask.taker.id) || (currentUser.id === task.taker.id) && (!task.done_at))
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
          t('編輯時間') +
          moment(subtask.reply_updated_at).format('YYYY-MM-DD HH:mm'),
        style: {
          marginVertical: 4
        },
      },
      file_reply_images: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        uploadUrl: `factory/${factoryId}/sub_task/reply_image`,
        displayCheck(fieldsValue) {
          if (fieldsValue.file_reply_images && fieldsValue.file_reply_images.length > 0) {
            return true
          } else {
            return true
          }
        },
        style: {
          marginVertical: 4
        },
      },
      file_reply_attaches: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        uploadUrl: `factory/${factoryId}/sub_task/reply_attach`,
        displayCheck(fieldsValue) {
          if (
            fieldsValue.file_reply_attaches &&
            fieldsValue.file_reply_attaches.length > 0
          ) {
            return true
          } else {
            return true
          }
        },
        style: {
          marginVertical: 4
        },
      },
      review_remark: {
        testID: '審核結果',
        label: `${t('審核結果')}`,
        emptyText: t('尚無回覆'),
        labelBtnText:
          // 250609-issue
          //  ((subtask && currentUser && subtask.taker && currentUser.id == subtask.taker.id) || (currentUser.id === task.taker.id) && (!task.done_at && !task.checked_at))
          ((currentUser.id === task.taker.id) && (!task.done_at && !task.checked_at) && (scopePermission('task-check-taker', currentUserScope)))
            ? t('編輯')
            : null,
        labelBtnOnPress:
          ((subtask && currentUser && subtask.taker && currentUser.id == subtask.taker.id) || (currentUser.id === task.taker.id)) && currentUserScope.includes('task-check-taker')
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
        uploadUrl: `factory/${factoryId}/sub_task/review_image`,
        displayCheck(fieldsValue) {
          if (
            fieldsValue.file_review_images &&
            fieldsValue.file_review_images.length > 0
          ) {
            return true
          } else {
            return true
          }
        },
        style: {
          marginVertical: 4
        },
      },
      file_review_attaches: {
        type: 'filesAndImages',
        emptyText: t('') ? t('') : '',
        modelName: 'sub_task',
        uploadUrl: `factory/${factoryId}/sub_task/review_attach`,
        displayCheck(fieldsValue) {
          if (
            fieldsValue.file_review_attaches &&
            fieldsValue.file_review_attaches.length > 0
          ) {
            return true
          } else {
            return true
          }
        },
        style: {
          marginVertical: 4
        },
      }
    })
  }

  const $_setProgress = (task) => {
    if (!task) {
      return
    }
    return Math.floor((task.sub_tasks_done_count / task.sub_tasks_count * 100));
  }

  // Local Storage
  const $_setLocalStorage = async (item, mode) => {
    if (mode === 'factory') {
      try {
        await AsyncStorage.setItem('factory', JSON.stringify(item))
        await AsyncStorage.removeItem('organization');
      }
      catch (exception) {
        console.log(exception)
      }
    }
    if (mode === 'organization') {
      try {
        await AsyncStorage.setItem('organization', JSON.stringify(item))
        await AsyncStorage.removeItem('factory');
      }
      catch (exception) {
        console.log(exception)
      }
    }
  }
  const $_getRedirectFactory = async (_factoryId, data) => {
    try {
      const _redirectFactory = await S_Factory.show({ modelId: _factoryId })
      const _data = {
        redirectFactory: _redirectFactory,
        payload: data
      }
      setPopupContent(_data)
      setPopupActive(true)
    } catch (e) {
      console.error(e);
    }
  }
  const $_readAndRedirect = async () => {
    // 不同廠的系統通知則切換工廠
    if (popupContent &&
      popupContent?.redirectFactory &&
      (popupContent?.redirectFactory?.id !== factoryId)) {
      console.log('AAAAA');
      console.log(popupContent, 'popupContent--');
      if (popupContent?.redirectFactory?.name?.includes('集團')) {
        // 250717-issue-currentUser內才有child_factories 跳轉ViewsFactoryDashboardShow後才會正常選項
        const matchedFactory = currentUser.factories.find(factory => factory?.id === popupContent?.redirectFactory?.id);
        await $_checkoutOrganization(matchedFactory)
        setTimeout(() => {
          S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
        }, 1000)
      } else {
        console.log('ccccc');
        try {
          await $_checkoutFactory(popupContent?.redirectFactory?.id)
          setTimeout(() => {
            S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
          }, 1000)
        } catch (e) {
          Alert.alert(t('您無此單位內相關權限，請聯絡系統管理員'))
          return
        }
      }
    } else {
      console.log('bbbbbb');
    }
  }
  const $_checkoutFactory = async (id) => {
    try {
      const _factory = popupContent?.redirectFactory
      $_setLocalStorage(_factory, 'factory')
      store.dispatch(setCurrentFactory(_factory))
    } catch (e) {
      console.error(e);
    }
  }
  const $_checkoutOrganization = async (_factory) => {
    // const _payload = popupContent?.payload
    // const _factory = popupContent?.redirectFactory
    $_setLocalStorage(_factory, 'organization')
    store.dispatch(setCurrentOrganization(_factory))
    store.dispatch(setCurrentFactory(_factory))
    store.dispatch(setCurrentViewMode('organization'))
  }

  const openURL = async (url) => {
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      console.warn("Can't open URL:", url)
    }
  }

  React.useEffect(() => {
    setLoading(true);
    $_fetchTask()
  }, [id])

  React.useEffect(() => {
    if (currentSubtask) {
      setReply(currentSubtask.reply)
      setReplyImages(currentSubtask.file_reply_images)
      setReplyAttaches(currentSubtask.file_reply_attaches)
      setReviewRemark(currentSubtask.review_remark)
      setReviewImages(currentSubtask.file_review_images)
      setReviewAttaches(currentSubtask.file_review_attaches)
    }
  }, [currentSubtask])

  React.useEffect(() => {
    if (task) {
      $_setNavigationOption()
      $_setStorage()
      setLoading(false)
    }
  }, [task])

  return (
    <>
      <Modal
        visible={submitLoading}
        transparent
        animationType="fade"
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)', // 半透明背景
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            padding: 20,
            borderRadius: 10,
            backgroundColor: 'transparent',
          }}>
            <WsLoading size={30}></WsLoading>
          </View>
        </View>
      </Modal>

      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        <ScrollView
          scrollIndicatorInsets={{ right: 1 }}
        >
          {!loading ? (
            <>
              <LlTaskHeaderCard001
                title={task.name}
                task={task}
              />
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <View
                  style={{
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    label={t('期限')}
                    icon="ws-outline-calendar-duedate"
                    color={$color.black5l}
                    value={moment(task.expired_at).format('YYYY-MM-DD')}
                  />
                </View>
                {task && task.taker && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      labelWidth={100}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      type="user"
                      label={t('負責人')}
                      color={$color.black5l}
                      value={$_userFormat(
                        task.taker,
                        task.checked_at ? task.checked_at : null
                      )}
                    />
                  </View>
                )}
                <WsFlex
                  style={{
                    marginTop: 4,
                  }}>
                  <WsText size={14} fontWeight={'600'} style={{ width: 100 }}>
                    {'領域'}
                  </WsText>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{
                      marginLeft: 8,
                      marginRight: 16,
                      flex: 1, // overflow換行
                    }}>
                    {task.system_subclasses && task.system_subclasses.length > 0 && task.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                      return (
                        <WsTag
                          img={systemSubclass.icon}
                          key={systemSubclassIndex}
                          style={{
                            marginTop: 4,
                            marginRight: 8
                          }}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      )
                    })}
                  </WsFlex>
                </WsFlex>
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      maxWidth: width * 0.5,
                    }}
                    label={t('說明')}
                    color={$color.black5l}
                    value={task.remark}
                  />
                </View>


                <WsFlex
                  style={{
                    marginTop: 8
                  }}
                  flexWrap={'wrap'}
                >
                  {task.factory_tags.map(
                    (tag, index) => {
                      return (
                        <WsTag
                          style={{
                            marginRight: 8,
                            marginTop: 4
                          }}
                          key={index}
                          backgroundColor={$color.white2d}
                          textColor={$color.black}
                        >
                          {`#${t(tag.name)}`}
                        </WsTag>
                      )
                    }
                  )}
                </WsFlex>


                {task.links &&
                  task.links.length > 0 && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 8,
                        paddingBottom: 16,
                        backgroundColor: $color.white,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <WsText size={14} fontWeight={'600'} style={{}}>
                          {t('相關資料')}
                        </WsText>
                      </View>
                      {task.links &&
                        task.links.length > 0 && (
                          <>
                            <WsPassageCollapse
                              type={'array'}
                            >
                              {task.links.map(
                                (item, index) => {
                                  return (
                                    <>
                                      <View
                                        key={index}
                                        style={{
                                          marginTop: 8
                                        }}
                                      >
                                        <WsInfo
                                          type="link"
                                          value={item.name}
                                          style={{
                                            maxWidth: width * 0.8,
                                            flexWrap: 'wrap',
                                          }}
                                          onPress={() => {
                                            // console.log(item, 'item');
                                            setPopupContentRelatedModule(item)
                                            setPopupActive002(true)
                                          }}
                                        />

                                        {/* 遞迴渲染 record_links（如果有） */}
                                        {Array.isArray(item.record_links) &&
                                          item.record_links.length > 0 && (
                                            <View
                                              style={{
                                                // borderWidth: 1,
                                                backgroundColor: $color.primary11l,
                                                padding: 8,
                                                borderRadius: 10,
                                              }}
                                            >
                                              {Array.isArray(item.record_links) &&
                                                item.record_links.length > 0 && (

                                                  <View
                                                    style={{
                                                      marginTop: 4,
                                                      flexDirection: 'row',
                                                      alignItems: 'center',
                                                    }}
                                                  >
                                                    <WsText size={14} fontWeight={'600'} style={{}}>
                                                      {t('關聯連結')}
                                                    </WsText>
                                                  </View>
                                                )}
                                              {Array.isArray(item.record_links) &&
                                                item.record_links.map((subItem, subIndex) => (
                                                  <View
                                                    style={{
                                                      marginTop: 8
                                                    }}
                                                  >
                                                    <WsInfo
                                                      // label={t('關聯連結')}
                                                      type="link"
                                                      value={`${subItem.name} (${moment(subItem.created_at).format('YYYY-MM-DD HH:mm:ss')}) `}
                                                      style={{
                                                        // maxWidth: width * 0.8,
                                                        flexWrap: 'wrap',
                                                      }}
                                                      onPress={() => {
                                                        console.log(subItem, 'subItem');

                                                        setPopupContentRelatedModule(subItem)
                                                        setPopupActive002(true)
                                                      }}
                                                    />
                                                  </View>
                                                ))}
                                            </View>
                                          )}
                                      </View>
                                    </>
                                  )
                                }
                              )}
                            </WsPassageCollapse>
                          </>
                        )}
                    </WsPaddingContainer>
                  )}

              </WsPaddingContainer>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsFlex
                  justifyContent="space-between"
                  style={{
                    marginRight: 4
                  }}>
                  <WsText>{t('待辦事項')}</WsText>
                  <WsFlex>
                    <WsIcon
                      name="ws-filled-check-circle"
                      size={18}
                      color={$color.gray}
                      style={{
                        marginRight: 4,
                      }}
                    />
                    {task.sub_tasks && (
                      <WsText size={12} color={$color.gray}>
                        {$_isDone(task.sub_tasks)} / {task.sub_tasks.length}
                      </WsText>
                    )}
                  </WsFlex>
                </WsFlex>

                <WsGradientProgressBar progress={$_setProgress(task)} />

                {($_isDone(task.sub_tasks) === task.sub_tasks?.length) &&
                  task.done_at &&
                  !task.checked_at && (
                    <WsFlex
                      style={{
                        backgroundColor: $color.danger11l,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 10,
                        marginTop: 4
                      }}
                    >
                      <WsIcon name="bih-warning-filled" size={24} color={$color.danger}></WsIcon>
                      <WsText color={$color.danger}>{t('待辦事項完成之後，儘快完成審核。')}</WsText>
                    </WsFlex>
                  )}

                {task.sub_tasks && currentUser &&
                  task.sub_tasks.map((subTask, index) => {
                    return (
                      <>
                        <WsStateSubtaskCardShow
                          testID={`WsStateSubtaskCardShow-${index}`}
                          key={index}
                          onPress={() => {
                            $_subtaskCardOnPress(subTask)
                          }}
                          onChange={() => {
                            console.log('aaa');
                            if (task.done_at && task.checked_at) {
                              setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                              setIsSnackBarVisible(true)
                              return
                            }
                            if (currentUser &&
                              ((currentUser.id === task.taker.id) || (currentUser.id === subTask.taker.id))
                            ) {
                              $_subTaskCardOnChange(subTask)
                            }
                            else if (task.done_at && task.checked_at) {
                              // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1717
                              setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                              setIsSnackBarVisible(true)
                            }
                            else {
                              setIsSnackBarVisible(true)
                            }
                          }}
                          setDone={$_setDone}
                          setUndo={$_setUndo}
                          headerRightOnPress={() => {
                            setStateModalSubtask(false)
                          }}
                          style={{
                            backgroundColor: $color.primary11l,
                            marginTop: 8
                          }}
                          done_at={subTask.done_at ? true : false}
                          date={subTask.expired_at ? subTask.expired_at : ''}
                          attachCount={
                            subTask.attaches ? subTask.attaches.length : '0'
                          }
                          name={subTask.name ? subTask.name : ''}
                          value={subTask ? subTask : {}}
                          title={subTask.name ? subTask.name : ''}
                          subTask={subTask}
                          currentUser={currentUser}
                          setIsSnackBarVisible={setIsSnackBarVisible}
                          task={task}
                        />
                      </>
                    )
                  })}
              </WsPaddingContainer>

              {task.event && (
                <>
                  <View
                    style={{
                      marginTop: 16
                    }}
                  >
                    <WsText
                      fontWeight={500}
                      style={{
                        paddingHorizontal: 16,
                      }}
                    >{t('相關事件')}</WsText>
                    <LlEventCard001
                      event={task.event}
                      style={{
                        marginTop: 8,
                        marginHorizontal: 16
                      }}
                      onPress={() => {
                        navigation.push('RoutesEvent', {
                          screen: 'EventShow',
                          params: {
                            id: task.event.id
                          }
                        })
                      }}
                    />
                  </View>
                </>
              )}

              {task.alert && (
                <>
                  <LlRelatedAlertCard001
                    alert={task?.alert}
                  ></LlRelatedAlertCard001>
                </>
              )}

              {task.checklist_record && (
                <>
                  <LlRelatedChecklistRecordCard001
                    item={task.checklist_record}
                    onPress={() => {
                      navigation.push('RoutesCheckList', {
                        screen: 'CheckListAssignmentShow',
                        params: {
                          id: task.checklist_record.id,
                        }
                      })
                    }}
                  >
                  </LlRelatedChecklistRecordCard001>
                </>
              )}

              {task.audit_record && (
                <>
                  <LlRelatedAuditRecordCard001
                    item={task.audit_record}
                  >
                  </LlRelatedAuditRecordCard001>
                </>
              )}

              {task.article_version &&
                task.article_version.id && (
                  <>
                    <LlRelatedArticleCard001
                      item={task.article_version}
                      onPress={() => {
                        setActModal(true)
                      }}
                    >
                    </LlRelatedArticleCard001>
                  </>
                )}

              {task.ll_broadcast &&
                task.ll_broadcast.id && (
                  <>
                    <LlRelatedESGoalBroadcastCard001
                      item={task.ll_broadcast}
                      onPress={() => {
                        navigation.push('RoutesApp', {
                          screen: 'BroadCastShow',
                          params: {
                            id: task.ll_broadcast.id,
                          }
                        })
                      }}
                    ></LlRelatedESGoalBroadcastCard001>
                  </>
                )}

              {task.act_version &&
                task.act_version.id &&
                task.act_version.act && (
                  <>
                    <LlRelatedActCard001
                      item={task.act_version}
                      onPress={() => {
                        navigation.push('RoutesAct', {
                          screen: 'ActShow',
                          params: {
                            id: task.act_version?.act?.id,
                          }
                        })
                      }}
                    ></LlRelatedActCard001>
                  </>
                )}

              {task.guideline_version &&
                task.guideline_version.id && (
                  <>
                    {/* 相關內規版本 */}
                    <LlRelatedGuidelineVersionCard001
                      guideline_version={task.guideline_version}
                    ></LlRelatedGuidelineVersionCard001>
                  </>
                )}

              {task.guideline_article_version &&
                task.guideline_article_version.id && (
                  <>
                    {/* 相關內規條文版本 */}
                    <LlRelatedGuidelineArticleVersionCard001
                      guideline_article_version={task.guideline_article_version}
                    ></LlRelatedGuidelineArticleVersionCard001>
                  </>
                )}

              <WsModal
                title={t('相關內規')}
                visible={modalArticle}
                headerLeftOnPress={() => {
                  setModalArticle(false)
                }}
                onBackButtonPress={() => {
                  setModalArticle(false)
                }}>
                <ViewGuidelineArticleShowForModal
                  versionId={articleVersionId}
                />
              </WsModal>

              <WsModal
                title={t('法規依據')}
                visible={actModal}
                headerLeftOnPress={() => {
                  setActModal(false)
                }}
                onBackButtonPress={() => {
                  setActModal(false)
                }}>
                <ViewArticleShowForModal versionId={task.article_version?.id} />
              </WsModal>

              {currentSubtask && stateModalSubtask && (
                <WsModal
                  testID={'stateModalSubtask'}
                  style={{
                    margin: 0,
                  }}
                  animationType={'slide'}
                  visible={stateModalSubtask}
                  iconLeftSize={30}
                  iconLeftColor={
                    currentSubtask.done_at ? $color.primary : $color.gray
                  }
                  iconLeftName={
                    currentSubtask.done_at
                      ? 'ws-filled-check-circle'
                      : 'ws-outline-check-circle-outline'
                  }
                  headerLeftOnPress={() => {
                    console.log('headerLeftOnPress');
                    if (task.checked_at) {
                      console.log('headerLeftOnPress 1');
                      setSnackBarText(t('已完成覆核的待辦事項，不可編輯'))
                      setIsSnackBarVisible(true)
                      return
                    }
                    if (
                      currentUser &&
                      currentSubtask &&
                      (currentUser.id === currentSubtask.taker.id)
                    ) {
                      console.log('headerLeftOnPress 2');
                      $_subTaskCardOnChange(currentSubtask)
                    } else {
                      console.log('headerLeftOnPress 4');
                      if (!task.done_at) {
                        console.log('headerLeftOnPress 5');
                        setSnackBarText(t('尚未填寫執行結果'))
                        setIsSnackBarVisible(true)
                        return
                      }
                      if ((currentUser.id !== currentSubtask.taker.id) && (currentUser?.id !== task.taker?.id)) {
                        console.log('headerLeftOnPress 6');
                        setSnackBarText(t('你無權限標記他人的待辦事項'))
                        setIsSnackBarVisible(true)
                        return
                      }
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


                  {/* <ScrollView> */}
                  <WsInfoForm
                    style={{ padding: 16 }}
                    fields={fields}
                    value={currentSubtask}
                  >
                    {currentSubtask.links &&
                      currentSubtask.links.length > 0 && (
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            paddingHorizontal: 16,
                            backgroundColor: $color.white,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          >
                            <WsText size={14} fontWeight={'600'} style={{}}>
                              {t('相關資料')}
                            </WsText>
                          </View>
                          {currentSubtask.links &&
                            currentSubtask.links.length > 0 && (
                              <>
                                <WsPassageCollapse
                                  type={'array'}
                                >
                                  {currentSubtask.links.map(
                                    (item, index) => {
                                      return (
                                        <>
                                          <View
                                            key={index}
                                            style={{
                                              marginTop: 8
                                            }}
                                          >
                                            <WsInfo
                                              type="link"
                                              value={item.name}
                                              style={{
                                                maxWidth: width * 0.8,
                                                flexWrap: 'wrap',
                                              }}
                                              onPress={async () => {
                                                console.log(item, 'item');
                                                setPopupContentRelatedModule(item)
                                                setPopupActive003(true)
                                              }}
                                            />

                                            {/* 遞迴渲染 record_links（如果有） */}
                                            {Array.isArray(item.record_links) &&
                                              item.record_links.length > 0 && (
                                                <View
                                                  style={{
                                                    // borderWidth: 1,
                                                    backgroundColor: $color.primary11l,
                                                    padding: 8,
                                                    borderRadius: 10,
                                                  }}
                                                >
                                                  {Array.isArray(item.record_links) &&
                                                    item.record_links.length > 0 && (

                                                      <View
                                                        style={{
                                                          marginTop: 4,
                                                          flexDirection: 'row',
                                                          alignItems: 'center',
                                                        }}
                                                      >
                                                        <WsText size={14} fontWeight={'600'} style={{}}>
                                                          {t('關聯連結')}
                                                        </WsText>
                                                      </View>
                                                    )}
                                                  {Array.isArray(item.record_links) &&
                                                    item.record_links.map((subItem, subIndex) => (
                                                      <View
                                                        style={{
                                                          marginTop: 8
                                                        }}
                                                      >
                                                        <WsInfo
                                                          // label={t('關聯連結')}
                                                          type="link"
                                                          value={`${subItem.name} (${moment(subItem.created_at).format('YYYY-MM-DD HH:mm:ss')}) `}
                                                          style={{
                                                            // maxWidth: width * 0.8,
                                                            flexWrap: 'wrap',
                                                          }}
                                                          onPress={() => {
                                                            console.log(subItem, 'subItem');
                                                            setPopupContentRelatedModule(subItem)
                                                            setPopupActive003(true)
                                                          }}
                                                        />
                                                      </View>
                                                    ))}
                                                </View>
                                              )}

                                          </View>
                                        </>
                                      )
                                    }
                                  )}
                                </WsPassageCollapse>
                                <View
                                  style={{
                                    height: 100
                                  }}
                                >
                                </View>
                              </>
                            )}
                        </WsPaddingContainer>
                      )}

                  </WsInfoForm>
                  {/* </ScrollView> */}


                  {stateModalForReplySubtask && (
                    <WsModal
                      visible={stateModalForReplySubtask}
                      onBackButtonPress={() => {
                        setStateModalForReplySubtask(false)
                      }}
                      headerLeftOnPress={() => {
                        setStateModalForReplySubtask(false)
                      }}
                      headerRightOnPress={() => {
                        setStateModalForReplySubtask(false)
                        $_editReply(currentSubtask?.id)
                      }}
                      RightOnPressIsDisabled={!reply}
                      headerRightText={t('儲存')}
                      title={t('回覆執行結果')}>
                      <ScrollView
                        testID={'ScrollView'}
                      >
                        <WsPaddingContainer>
                          <WsState
                            testID={'回覆執行結果'}
                            style={{
                              marginVertical: 8
                            }}
                            stateStyle={{
                              borderColor: reply == '' || reply == undefined ? $color.danger : $color.black
                            }}
                            label={t('回覆執行結果')}
                            multiline={true}
                            value={reply}
                            onChange={setReply}
                            rules={'required'}
                            placeholder={t('請詳細說明待辦事項執行結果')}
                          />
                          <WsState
                            style={{
                              marginVertical: 8
                            }}
                            type="Ll_filesAndImages"
                            label={t('附件')}
                            value={replyAttaches}
                            onChange={setReplyAttaches}
                            modelName="sub_task"
                          />
                          <WsState
                            style={{
                              marginVertical: 8
                            }}
                            type="Ll_filesAndImages"
                            label={t('圖片')}
                            value={replyImages}
                            onChange={setReplyImages}
                            modelName="sub_task"
                          />
                        </WsPaddingContainer>
                      </ScrollView>
                    </WsModal>
                  )
                  }

                  {stateModalForReviewSubtask && (
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
                        $_editReview(currentSubtask?.id)
                      }}
                      headerRightText={t('儲存')}
                      title={t('回覆審核結果')}>
                      <WsPaddingContainer>
                        <WsState
                          testID={'回覆審核結果'}
                          style={{
                            marginVertical: 8
                          }}
                          multiline={true}
                          value={reviewRemark}
                          onChange={setReviewRemark}
                          label={t('回覆審核結果')}
                          placeholder={t('請詳細說明待辦事項審核結果')}
                        />
                        <WsState
                          style={{
                            marginVertical: 8
                          }}
                          type="Ll_filesAndImages"
                          label={t('附件')}
                          value={reviewAttaches}
                          onChange={setReviewAttaches}
                          modelName="sub_task"
                        />
                        <WsState
                          style={{
                            marginVertical: 8
                          }}
                          type="Ll_filesAndImages"
                          label={t('圖片')}
                          value={reviewImages}
                          onChange={setReviewImages}
                          modelName="sub_task"
                        />
                      </WsPaddingContainer>
                    </WsModal>
                  )
                  }

                  <WsPopup
                    active={popupActive003}
                    onClose={() => {
                      setPopupActive003(false)
                    }}>
                    <View
                      style={{
                        width: width * 0.9,
                        backgroundColor: $color.white,
                        borderRadius: 10,
                        padding: 16,
                      }}>

                      {popupContentRelatedModule?.name && (
                        <View
                          style={{
                          }}
                        >
                          <WsInfo
                            labelWidth={80}
                            value={
                              popupContentRelatedModule?.name
                                ? popupContentRelatedModule.name
                                : t('無')
                            }
                            type="link"
                            label={t('名稱')}
                            style={{
                              flexDirection: 'row',
                            }}
                            onPress={async () => {
                              console.log('22222QAQ');
                              setStateModalSubtask(false)
                              let item = popupContentRelatedModule
                              // console.log(item, '--item');
                              if (!item.from_module) {
                                openURL(item?.url)
                                return
                              }
                              try {
                                const _params = {
                                  url: item?.url
                                }
                                const _res2 = await S_ModulePage.findAppPage({ params: _params })
                                item.factoryId = _res2.data?.params?.factory
                                item.from_module = item.from_module || _res2.data?.module
                                item.route = _res2.data?.route
                                item.modelId = _res2.data?.params?.id
                                item.params = { ..._res2.data?.params }
                                if (factoryId === item?.factoryId) {
                                  const result = await S_ModulePage.redirectByAPIParams(item, navigation)
                                  if (result === '404') {
                                    Alert.alert(t('請至電腦版使用。'))
                                  }
                                }
                                else {
                                  console.log('2222QAQ');
                                  if (item.from_module) {
                                    console.log('33333QAQ');
                                    $_getRedirectFactory(item?.factoryId, item)
                                  } else {
                                    openURL(item?.url)
                                  }
                                }
                                console.log('111111');
                                setPopupActive003(false)
                              } catch (e) {
                                console.error(e, 'e');
                                setPopupActive003(false)
                                if (item.from_module) {
                                  Alert.alert(t('請至電腦版使用。'))
                                }
                              }
                            }}
                          />
                        </View>
                      )}

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={80}
                          value={
                            popupContentRelatedModule?.remark
                              ? popupContentRelatedModule.remark
                              : t('無')
                          }
                          label={t('備註')}
                          style={{
                            flexDirection: 'row',
                          }}
                        />
                      </View>
                    </View>
                  </WsPopup>

                </WsModal>
              )}
            </>
          ) : (
            <SafeAreaView>
              <WsLoading
                style={{
                  marginTop: 16
                }}
              />
            </SafeAreaView>
          )}
        </ScrollView>

        <View
          style={{
            position: 'absolute',
            width: width,
            bottom: 16
          }}
        >
          {task &&
            currentUser &&
            task.taker &&
            (task.taker.id === currentUser.id) &&
            !task.checked_at &&
            $_setProgress(task) == '100' &&
            currentUserScope.includes('task-check-taker') && (
              <View
                style={{
                  bottom: 16
                }}>
                <WsGradientButton onPress={() => $_checkTask()}>
                  {t('完成審核')}
                </WsGradientButton>
              </View>
            )}
          {/* 250602-issue */}
          {/* {task &&
            currentUser &&
            task.checked_at &&
            (task.taker.id === currentUser.id) && (
              <View
                style={{
                  bottom: 16
                }}>
                <WsGradientButton
                  onPress={() => {
                    $_UnCheckTask()
                  }}>
                  {t('取消審核')}
                </WsGradientButton>
              </View>
            )} */}
        </View>

        <WsBottomSheet
          isActive={isBottomSheetActive}
          onDismiss={() => {
            $_setStorage()
            setIsBottomSheetActive(false)
          }}
          items={bottomSheetItems}
          snapPoints={[148, 200]}
          onItemPress={$_onBottomSheetItemPress}
        />
        <WsDialogDelete
          id={id}
          to={'TaskIndex'}
          modelName="task"
          visible={dialogVisible}
          text={t('確定刪除嗎？')}
          setVisible={setDialogVisible}
        />
        <WsSnackBar
          text={snackBarText}
          setVisible={setIsSnackBarVisible}
          visible={isSnackBarVisible}
        />
      </SafeAreaView >

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            padding: 16,
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              flexWrap: 'wrap',
            }}
          >{t(`即將前往{text}，若尚未儲存資料請先儲存`, { text: popupContent?.redirectFactory?.name })}
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
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                height: 48,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupActive(false)
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
              testID={'繼續前往'}
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupActive(false)
                // $_readAndRedirect()
                setTimeout(() => {
                  $_readAndRedirect()
                }, 1000)
              }}>
              {t('前往')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            // height: height * 0.3,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}>

          {popupContentRelatedModule?.name && (
            <View
              style={{
              }}
            >
              <WsInfo
                labelWidth={80}
                value={
                  popupContentRelatedModule?.name
                    ? popupContentRelatedModule.name
                    : t('無')
                }
                type="link"
                label={t('名稱')}
                style={{
                  flexDirection: 'row',
                }}
                onPress={async () => {
                  console.log('22222');
                  setStateModalSubtask(false)
                  let item = popupContentRelatedModule
                  console.log(item, '--item');
                  if (!item.from_module && item?.url) {
                    openURL(item?.url)
                    return
                  }
                  try {
                    const _params = {
                      url: item?.url
                    }
                    const _res2 = await S_ModulePage.findAppPage({ params: _params })
                    item.factoryId = _res2.data?.params?.factory
                    item.from_module = item.from_module || _res2.data?.module
                    item.route = _res2.data?.route
                    item.modelId = _res2.data?.params?.id
                    item.params = { ..._res2.data?.params }
                    if (factoryId === item?.factoryId) {
                      const result = await S_ModulePage.redirectByAPIParams(item, navigation)
                      console.log(result, 'result');
                      if (result === '404') {
                        Alert.alert(t('請至電腦版使用。'))
                      }
                    }
                    else {
                      console.log('2222QAQ');
                      if (item.from_module) {
                        console.log('33333QAQ');
                        $_getRedirectFactory(item?.factoryId, item)
                      } else {
                        openURL(item?.url)
                      }
                    }
                    setPopupActive002(false)
                  } catch (e) {
                    console.error(e, 'e');
                    setPopupActive002(false)
                    if (item.from_module) {
                      Alert.alert(t('請至電腦版使用。'))
                    }
                  }
                }}
              />
            </View>
          )}

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={80}
              value={
                popupContentRelatedModule?.remark
                  ? popupContentRelatedModule.remark
                  : t('無')
              }
              label={t('備註')}
              style={{
                flexDirection: 'row',
              }}
            />
          </View>
        </View>
      </WsPopup>
    </>
  )
}
export default TaskShow
