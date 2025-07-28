import React, { useState, useEffect } from 'react'
import {
  Pressable,
  ScrollView,
  View,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsTag,
  WsIconBtn,
  WsTabView,
  WsState,
  WsDialog,
  WsBottomSheet,
  WsFlex,
  WsDialogDelete,
  LlTopAlertBar001,
  LlInfoUserCard001,
  WsSkeleton,
  WsGradientButton,
  WsModal,
  WsAvatar
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import CheckListQuestion from '@/sections/CheckList/CheckListQuestion'
import CheckListSampleRecordList from '@/sections/CheckList/CheckListSampleRecordList'
import CheckListGeneralScheduleList from '@/sections/CheckList/CheckListGeneralScheduleList'
import CheckListRecordList from '@/sections/CheckList/CheckListRecordList'
import CheckListOverview from '@/sections/CheckList/CheckListOverview'
import { useNavigation } from '@react-navigation/native'
import S_Checklist from '@/services/api/v1/checklist'
import S_ChecklistVersion from '@/services/api/v1/checklist_version'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import {
  setCurrentCheckList,
  setCurrentCheckListForUpdateVersion,
  setCurrentChecklistRecordDraft,
  setRefreshCounter,
} from '@/store/data'
import { useSelector } from 'react-redux'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import S_GeneralRecord from '@/services/api/v1/general_record'
import moment from 'moment'
import ServiceCheckList from '@/services/api/v1/checklist'

const CheckListShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes
  const routes = navigation.getState().routeNames;

  // Params
  const {
    id,
    bookmarkBtnVisible = true
  } = route.params

  console.log(id,'=id=');

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // State
  const [loading, setLoading] = useState(true)
  const [checkList, setCheckList] = useState()
  const [myAssignment, setMyAssignment] = useState()
  const [isCollect, setIsCollect] = useState()

  const [templateVersion, setTemplateVersion] = useState()
  const [lastTemplateVersion, setLastTemplateVersion] = useState()

  const [index, setIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListResultOverview',
      label: t('資訊'),
      view: CheckListOverview,
      props: {
        id: id
      }
    },
    {
      value: 'CheckListQuestion',
      label: t('題目'),
      view: CheckListQuestion,
      props: {
        id: id
      }
    },
    {
      value: 'GeneralSchedule',
      label: t('排程'),
      view: CheckListGeneralScheduleList,
      props: {
        id: id
      }
    },
    {
      value: 'CheckListRecordList',
      label: t('點檢記錄'),
      view: CheckListRecordList,
      props: {
        id: id
      }
    },
    {
      value: 'CheckListSampleRecordList',
      label: t('抽檢紀錄'),
      view: CheckListSampleRecordList,
      props: {
        id: id,
      }
    }
  ])

  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [copyDialogVisible, setCopyDialogVisible] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)

  const [copyChecklistName, setCopyChecklistName] = React.useState()
  const copyDialogButton = [
    {
      label: t('取消'),
      onPress: () => {
        setCopyDialogVisible(false)
      }
    },
    {
      label: t('確定'),
      onPress: () => {
        setCopyDialogVisible(false)
        $_postCopyChecklist()
      }
    }
  ]

  const fields = {
    checkers: {
      type: 'users',
      label: t('答題者')
    },
    reviewer: {
      type: 'user',
      label: t('覆核者')
    },
    deadline: {
      type: 'text',
      label: t('期限')
    }
  }

  // Sample
  const [selectedId, setSelectedId] = React.useState()
  const [selectedMode, setSelectedMode] = React.useState('')

  const [reviewContent, setReviewContent] = React.useState()
  const [reviewScore, setReviewScore] = React.useState(0)
  const [reviewUploadFileURL, setReviewUploadFileURL] = React.useState()
  const [reviewUploadFileURLIds, setReviewUploadFileURLIds] = React.useState([])

  const [sampleContent, setSampleContent] = React.useState()
  const [sampleScore, setSampleScore] = React.useState(0)
  const [sampleUploadFileURL, setSampleUploadFileURL] = React.useState()

  const [isBottomSheetActive002, setIsBottomSheetActive002] = React.useState(false)
  const [bottomSheetItems002] = React.useState([
    {
      type: 'edit',
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      type: 'delete',
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ])
  const [isDisabled, setIsDisabled] = React.useState(true);
  const [stateModal, setStateModal] = React.useState(false)

  // Services
  const $_fetchCheckList = async () => {
    try {
      const res = await S_Checklist.show({
        modelId: id
      })
      setCopyChecklistName(`${res.name}-${t('複製')}`)
      setCheckList(res)
      setIsCollect(res.is_collect)
      if (res.last_version && res.last_version.checklist_template_version) {
        setTemplateVersion(res.last_version.checklist_template_version.id)
      }
      if (res.checklist_template && res.checklist_template.last_version) {
        setLastTemplateVersion(res.checklist_template.last_version.id)
      }
      setLoading(false)
    } catch (e) {
      Alert.alert(
        t(`這個頁面已經不存在囉！這筆資料可能已被人刪除。`),
        '',
        [
          {
            text: t('返回'),
            onPress: () => navigation.goBack(),
          },
        ]
      );

    }
  }

  const $_fetchChecklistAssignment = async () => {
    try {
      const _params = {
        checklist: id
      }
      const res = await S_ChecklistAssignment.indexAuth({ params: _params })
      setMyAssignment(res.data)
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async () => {
    const _data = {
      ...checkList,
      frequency: S_Checklist.getFrequencyChinese(checkList.frequency)
    }
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('CheckListUpdate', _value)
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => (
        <WsIconBtn
          name="md-edit"
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            $_setStorage()
            setIsBottomSheetActive(true)
          }}
        />
      )
    })
  }

  const $_setNavigationOptionForBack = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <>
            <WsIconBtn
              testID={'backButton'}
              name="ws-outline-arrow-left"
              color="white"
              size={24}
              onPress={() => {
                navigation.goBack()
              }}
            />
          </>
        )
      }
    })
  }

  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }
  // BOTTOM SHEET PRESS ITEM
  const $_onBottomSheetItemPress002 = item => {
    if (item && item.type === 'edit') {
      setStateModal(true)
    } else if (item && item.type === 'delete') {
      $_onDelete()
    }
  }

  const $_setBottomSheet = () => {
    const _bottomSheet = [
      templateVersion == lastTemplateVersion
        ? {
          onPress: () => {
            navigation.navigate({
              name: 'CheckListUpdate',
              params: {
                id: id
              }
            })
          },
          icon: 'ws-outline-edit-pencil',
          label: t('編輯點檢表'),
          labelColor: $color.primary,
          color: $color.primary
        }
        : {
          onPress: () => {
            navigation.navigate({
              name: 'CheckListTemplateUpdate',
              params: {
                id: id,
                versionId: checkList.last_version ? checkList.last_version.id : null
              }
            })
          },
          label: t('更新點檢表'),
          icon: 'md-update',
          labelColor: $color.primary,
          color: $color.primary
        },
      {
        onPress: () => {
          setCopyDialogVisible(true)
        },
        icon: 'll-nav-add-assignment',
        label: t('複製點檢表'),
        labelColor: $color.black,
        color: $color.gray6d
      },
      {
        onPress: () => {
          setDialogVisible(true)
        },
        icon: 'md-delete',
        label: t('刪除點檢表'),
        labelColor: $color.danger,
        color: $color.danger
      }
    ]
    setBottomSheetItems(_bottomSheet)
  }

  const $_onEditPress = () => {
    navigation.navigate('CheckListUpdate')
  }

  const $_postCopyChecklist = async () => {
    try {
      const res = await S_Checklist.copyChecklist(id, copyChecklistName)
      Alert.alert(t('複製點檢表成功'))
    } catch (error) {
      console.error(error, '=error=')
      Alert.alert(t('複製點檢表失敗'))
    } finally {
    }
  }

  const $_setTabItems = () => {
    setTabItems([
      // {
      //   value: 'CheckListResultOverview',
      //   label: t('總覽'),
      //   view: CheckListOverview,
      //   props: {
      //     id: id
      //   }
      // },
      {
        value: 'CheckListQuestion',
        label: t('題目'),
        view: CheckListQuestion,
        props: {
          id: id,
          versionId: checkList.last_version ? checkList.last_version.id : null
        }
      },
      {
        value: 'GeneralSchedule',
        label: t('排程'),
        view: CheckListGeneralScheduleList,
        props: {
          id: id,
          versionId: checkList.last_version ? checkList.last_version.id : null
        }
      },
      {
        value: 'CheckListRecordList',
        label: t('點檢記錄'),
        view: CheckListRecordList,
        props: {
          id: id
        }
      },
      {
        value: 'CheckListSampleRecordList',
        label: t('抽檢紀錄'),
        view: CheckListSampleRecordList,
        props: {
          id: id,
          setIsBottomSheetActive: setIsBottomSheetActive002,
          setSelectedId: setSelectedId,
          setSelectedMode: setSelectedMode,

          setReviewContent: setReviewContent,
          setReviewScore: setReviewScore,
          setReviewUploadFileURL: setReviewUploadFileURL,
          setReviewUploadFileURLIds: setReviewUploadFileURLIds,

          setSampleContent: setSampleContent,
          setSampleScore: setSampleScore,
          setSampleUploadFileURL: setSampleUploadFileURL,
        }
      }
    ])
  }

  const startCheckOnPress = () => {
    if (myAssignment && myAssignment.length > 0) {
      if (routes.includes('RelatedChecklistAssignment')) {
        navigation.push('RoutesCheckList', {
          screen: 'RelatedChecklistAssignment',
          params: {
            id: id,
            checklistId: checkList.id,
            lastVersionId: checkList.last_version.id
          }
        })
      } else {
        navigation.push('RoutesCheckList', {
          screen: 'RelatedChecklistAssignment',
          params: {
            id: id,
            checklistId: checkList.id,
            lastVersionId: checkList.last_version.id
          }
        })
      }
    } else {
      navigation.push('RoutesCheckList', {
        screen: 'CheckListAssignmentIntroductionTemp',
        params: {
          id: id,
          versionId: checkList.last_version.id
        }
      })
    }
  }

  // 抽檢
  // Functions
  const $_onSubmit = async () => {
    const formattedForFileStore = (attaches) => {
      return attaches.map(item => {
        const newItem = {
          file: item.file.id
        };
        if (item.file_version) {
          newItem.file_version = item.file_version.id;
        }
        return newItem;
      });
    }
    const _params = {
      type: selectedMode === 'createSample' || selectedMode === 'editSample' ? "sample" : "review",
      recorder: currentUser ? currentUser.id : null,
      score: selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleScore : reviewScore,
      record_at: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      content: selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleContent : reviewContent,
      attaches: selectedMode === 'createSample' || selectedMode === 'editSample' ? formattedForFileStore(sampleUploadFileURL) : formattedForFileStore(reviewUploadFileURL),
      model: "checklist_record",
      model_id: id
    }
    console.log(_params, '_params');
    if (selectedMode === 'createSample') {
      try {
        const res = await S_GeneralRecord.create({
          params: _params
        }).then(res => {
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        })
      } catch (err) {
        console.error(err, 'sample create Error')
      }
    } else if (selectedMode === 'editSample') {
      try {
        const res = await S_GeneralRecord.patch({
          params: _params,
          modelId: selectedId
        }).then(res => {
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        })
      } catch (err) {
        console.error(err, 'sample create Error')
      }
    }
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


  React.useEffect(() => {
    if (id) {
      setLoading(true)
      $_fetchCheckList()
      $_setNavigationOptionForBack()
      $_fetchChecklistAssignment()
    }
  }, [id])

  React.useEffect(() => {
    if (checkList && checkList.last_version) {
      $_setTabItems()
      // $_setNavigationOption()  //HIDE_FOR_EDIT
    }
  }, [checkList])

  React.useEffect(() => {
    if (checkList && checkList.last_version) {
      $_setBottomSheet()
    }
  }, [checkList])

  // 抽檢
  React.useEffect(() => {
    const isSampleContentEmpty = !sampleContent || sampleContent.trim() === '';
    const isReviewContentEmpty = !reviewContent || reviewContent.trim() === '';
    if (selectedMode === 'createSample' || selectedMode === 'editSample') {
      setIsDisabled(isSampleContentEmpty || sampleScore === null);
    }
  }, [selectedMode, sampleContent, sampleScore, reviewContent, reviewScore]);

  // console.log(checkList,'checkList---');

  return (
    <>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View
          style={{
            flex: 1
          }}
        >
          {!loading && checkList ? (
            <>
              {templateVersion < lastTemplateVersion && (
                <LlTopAlertBar001
                  text={'更新提醒'}
                  onPress={() => {
                  }}>
                  {t('請儘速更新題庫版本，以降低法律風險')}
                </LlTopAlertBar001>
              )}

              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white
                }}>
                <WsFlex justifyContent="space-between" alignItems="flex-start">
                  <WsText
                    style={{
                      flex: 1
                    }}
                    size={24}>
                    {checkList.name}
                  </WsText>

                  {bookmarkBtnVisible && isCollect != undefined && (
                    <WsIconBtn
                      style={{
                      }}
                      name={isCollect != undefined && isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
                      size={28}
                      onPress={() => {
                        bookmarkOnPress()
                      }}
                    />
                  )}

                  {templateVersion < lastTemplateVersion && (
                    <WsTag
                      backgroundColor="rgb(255, 247, 208)"
                      textColor={$color.gray6d}>
                      {t('版本更新')}
                    </WsTag>
                  )}
                </WsFlex>
                <WsFlex
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}>
                  {checkList.system_subclasses.map(
                    (systemSubclass, systemSubclassIndex) => {
                      return (
                        <WsTag
                          key={systemSubclassIndex}
                          style={{
                            marginTop: 16,
                            marginRight: 8
                          }}
                          img={systemSubclass.icon}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      )
                    }
                  )}
                </WsFlex>

                <LlInfoUserCard001
                  frequency={checkList.frequency}
                  owner={
                    checkList.owner
                      ? checkList.owner
                      : checkList.taker
                        ? checkList.taker
                        : null
                  }
                  factory_tags={checkList.factory_tags}
                  fields={fields}
                  onPress={() => {
                    $_onEditPress()
                  }}
                  style={{
                  }}
                />

              </WsPaddingContainer>

              {tabItems && (
                <WsTabView
                  scrollEnabled={true}
                  items={tabItems}
                  index={index}
                  isAutoWidth={true}
                  setIndex={setIndex}
                  fixedContainerHeight={height - 256}
                />
              )}
            </>
          ) : (
            <WsSkeleton></WsSkeleton>
          )}
        </View>
      </ScrollView>

      <WsBottomSheet
        snapPoints={[148, 208]}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsBottomSheet
        isActive={isBottomSheetActive002}
        onDismiss={() => {
          setIsBottomSheetActive002(false)
        }}
        items={bottomSheetItems002}
        snapPoints={['25%', '25%']}
        onItemPress={$_onBottomSheetItemPress002}
        underlayColor={$color.primary11l}
      />
      <WsModal
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        headerRightText={t('儲存')}
        RightOnPressIsDisabled={isDisabled}
        headerRightOnPress={() => {
          $_onSubmit()
          setStateModal(false)
        }}
        animationType="slide"
        title={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('抽檢') : t('覆核')}
      >
        <KeyboardAvoidingView
          style={{
            // flex: 1, // DO NOT SET
          }}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          enabled
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                // flex: 1, // DO NOT SET
                padding: 16
              }}
            >
              <WsState
                style={{
                }}
                label={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('結果') : t('結果')}
                type="radio"
                items={[
                  { label: t('通過'), value: 10 },
                  { label: t('不通過'), value: 5 }
                ]}
                rules={'required'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleScore : reviewScore}
                onChange={selectedMode === 'createSample' || selectedMode === 'editSample' ? setSampleScore : setReviewScore}
              >
              </WsState>

              <WsState
                style={{
                  marginTop: 16,
                }}
                stateStyle={{
                  height: 140
                }}
                label={selectedMode === 'createSample' || selectedMode === 'editSample' ? t('內容') : t('內容')}
                placeholder={t('輸入')}
                multiline={true}
                rules={'required'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleContent : reviewContent}
                onChange={selectedMode === 'createSample' || selectedMode === 'editSample' ? setSampleContent : setReviewContent}
              >
              </WsState>

              <WsState
                style={{
                  marginTop: 16
                }}
                label={t('附件')}
                type={'Ll_filesAndImages'}
                modelName={'checklist_record'}
                value={selectedMode === 'createSample' || selectedMode === 'editSample' ? sampleUploadFileURL : reviewUploadFileURL}
                onChange={(e, ids) => {
                  if (selectedMode === 'createSample' || selectedMode === 'editSample') {
                    setSampleUploadFileURL(e)
                  } else if (selectedMode === 'editReview') {
                    setReviewUploadFileURL(e)
                  }
                }}
              >
              </WsState>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </WsModal>

      <WsDialogDelete
        id={id}
        to="CheckList"
        modelName="checklist"
        visible={dialogVisible}
        title={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
      <WsDialog
        btnBorderWidth={0}
        dialogVisible={copyDialogVisible}
        setDialogVisible={setCopyDialogVisible}
        title={t('複製點檢表')}
        dialogButtonItems={copyDialogButton}>
        <WsState
          label={t('名稱')}
          value={copyChecklistName}
          onChange={setCopyChecklistName}
          stateStyle={{
            width: 311,
            borderRadius: 10,
            borderWidth: 0.3
          }}
          rules={'required'}
        />
      </WsDialog>
      {(
        checkList &&
        checkList.last_version &&
        checkList.reviewer &&
        currentUser &&
        (checkList.reviewer.id === currentUser.id)) || scopePermission('checklist-record-manager', currentUserScope) && (
          <WsGradientButton
            testID={'開始點檢'}
            disabled={loading}
            borderRadius={30}
            style={{
              marginBottom: 16,
            }}
            onPress={startCheckOnPress}>
            {t('開始點檢')}
          </WsGradientButton>
        )}
    </>
  )
}

export default CheckListShow
