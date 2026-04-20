import React from 'react'
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  Platform,
  Dimensions
 } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsGradientButton,
  WsModal,
  WsState,
  WsSpec,
  WsLoading,
  WsSkeleton,
  WsIcon
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import moment from 'moment'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import { setCurrentChecklistRecordDraft, setCurrentCheckListQuestions, setCurrentLatLng } from '@/store/data'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_ConstantData from '@/services/api/v1/constant_data'
import S_ChecklistQuestionVersion from '@/services/api/v1/checklist_question_version'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { getLocation } from '@/__reactnative_stone/global/location'
import { getDistance } from 'geolib';

const Introduction = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const { width, height } = Dimensions.get('window')

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentPreloadChecklistAssignment = useSelector(state => state.data.preloadChecklistAssignment)

  // Params
  const {
    id,
    draftId,
    todayDone,
    subTabIndex,
    index,
    refreshCounter
  } = route.params

  // State
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)
  const [constantData, setConstantData] = React.useState()

  const [noNeedToCheckBtnDisable, setNoNeedToCheckBtnDisable] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [status, setStatus] = React.useState(null)
  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [submitLoading, setSubmitLoading] = React.useState(false)

  const [assignment, setAssignment] = React.useState()
  const [factoryTags, setFactoryTags] = React.useState()
  const [questions, setQuestions] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const hasShownLocationReminderRef = React.useRef(false)

  const $_getRefreshCounter = () => Math.floor(Math.random() * (100 - 1 + 1)) + 1
  const $_getRemarkImagesForPayload = (_images = []) => {
    if (!Array.isArray(_images)) return []
    return _images
      .map(item => item?.id || item?.file?.id)
      .filter(Boolean)
      .map(fileId => ({ file: fileId }))
      .filter(Boolean)
  }
  const $_resetToCheckListAssignment = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
          params: {
            refreshCounter: $_getRefreshCounter(),
          }
        }
      ],
      key: null
    })
  }
  const $_getNoChecklistParams = () => ({
    checklist_record_id: assignment && assignment.checklist_record ? assignment.checklist_record.id : null,
    remark: remark,
    images: $_getRemarkImagesForPayload(remarkImages),
  })

  // 取得存於API的RiskLevel & Score
  const $_fetchConstantData = async () => {
    try {
      const _params = {
        model: 'checklist',
        for: 'app'
      }
      const res = await S_ConstantData.index({
        params: _params
      })
      setConstantData(res.data)
    } catch (e) {
      console.error(e);
    }
  }

  const $_fetchApi = async () => {
    try {
      const _params = {
        id: id,
        lang: currentLang ? currentLang : undefined
      }
      const res = await S_ChecklistAssignment.show({
        params: _params
      })
      setAssignment(res)
      if (res.checklist) {
        const _checklistDetail = await S_Checklist.show({
          modelId: res.checklist.id
        })
        if (_checklistDetail &&
          _checklistDetail.factory_tags &&
          _checklistDetail.factory_tags.length > 0) {
          setFactoryTags(_checklistDetail.factory_tags)
        }

        const _params = {
          checklist_version_id: res.checklist_version.id,
          general_schedule_setting: res.general_schedule_setting.id,
        }
        console.log(_params, 'indexByChecklistVersion-params');
        const _checklistQuestionVersion = await S_ChecklistQuestionVersion.indexByChecklistVersion({ params: _params })

        let _validateNoNeedToCheck = S_CheckListQuestion.validateNoNeedToCheck(_checklistQuestionVersion.data)
        setNoNeedToCheckBtnDisable(_validateNoNeedToCheck)

        let _formattedQuestions = _checklistQuestionVersion.data
        setQuestions(_formattedQuestions)

        let _recordDraftId = res && res.checklist_record ? res.checklist_record.id : null
        if (_recordDraftId) {
          console.log(_recordDraftId, '_recordDraftId')
          try {
            const _checklistRecordAnswerDraft = await S_CheckListRecordAns.indexV2({ parentId: _recordDraftId })
            let _formattedQuestionsWithDraft = await S_CheckListQuestion.formattedQuestionWithIndexV2(
              _checklistRecordAnswerDraft.data,
              _formattedQuestions
            )
            setQuestions(_formattedQuestionsWithDraft)
          } catch (e) {
            console.error(e, 'e');
          }
        }

        setLoading(false)
      }
    } catch (e) {
      Alert.alert(t('伺服器忙碌中，請稍候再試'))
      navigation.goBack()
      console.error(e, 'e');
    }
  }

  // FUNC
  const $_onProcedurePress = () => {
    navigation.navigate('CheckListAssignmentPreview', {
      id: assignment && assignment.checklist ? assignment.checklist.id : null,
      versionId: assignment && assignment.checklist && assignment.checklist.last_version ? assignment.checklist.last_version.id : null,
      _checklist_assignment_id: id,
      _reviewers: assignment.reviewers ? assignment.reviewers : null,
      _checkers: assignment.checkers ? assignment.checkers : null,
      assignment: assignment,
      _questions: questions ? questions : currentPreloadChecklistAssignment && currentPreloadChecklistAssignment[index] && currentPreloadChecklistAssignment[index]?.questions ? currentPreloadChecklistAssignment[index].questions : [],
      _draftId: draftId ? draftId : null,
      _todayDone: todayDone ? true : false,
      _constantData: constantData ? constantData : null,
      subTabIndex: subTabIndex ? subTabIndex : 0,
      index: index,
      checklistRecordId: assignment && assignment.checklist_record ? assignment.checklist_record.id : null
    })
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    const _nochecklistParams = $_getNoChecklistParams()
    let _canContinue = false
    try {
      console.log(_nochecklistParams, '_nochecklistParams')
      await S_CheckListRecord.noChecklist({ params: _nochecklistParams })
      _canContinue = true
    } catch (error) {
      const _message = error?.response?.data?.message || error?.message
      if (_message === 'Record is already completed') {
        console.warn('noChecklist skipped: record already completed')
        _canContinue = true
      } else {
        console.error(error)
        Alert.alert(t('作業送出發生錯誤'))
      }
    } finally {
      setSubmitLoading(false)
    }

    if (!_canContinue) {
      return
    }

    $_resetToCheckListAssignment()
  }

  // LatLng
  const $_remindLocationPermission = () => {
    if (hasShownLocationReminderRef.current) {
      return
    }
    hasShownLocationReminderRef.current = true
    Alert.alert(
      t('定位權限未開啟'),
      t('未開啟定位權限仍可繼續作業，若需定位資訊可至系統設定開啟。'),
      [
        {
          text: t('取消'),
          style: 'cancel'
        },
        {
          text: t('前往設定'),
          onPress: async () => {
            try {
              await openSettings()
            } catch (error) {
              console.error(error)
            }
          }
        }
      ]
    )
  }

  const $_requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    const result = await check(permission);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const requestResult = await request(permission);
      if (requestResult === RESULTS.GRANTED) {
        return true
      }
      $_remindLocationPermission()
      return false
    }
    if (result === RESULTS.BLOCKED) {
      $_remindLocationPermission()
      return false;
    }
    // unavailable 或其他情況
    $_remindLocationPermission()
    return false;
  };

  const $_getLocation = async () => {
    const granted = await $_requestLocationPermission();
    if (!granted) {
      console.log('使用者未授權定位');
      return;
    }
    try {
      const myLocation = await getLocation()
      store.dispatch(setCurrentLatLng(myLocation))
      if (currentFactory?.lat && currentFactory?.lng) {
        const targetLocation = {
          latitude: currentFactory?.lat,
          longitude: currentFactory?.lng,
        };
        const distance = getDistance(myLocation, targetLocation);
        console.log(`距離目前單位約 ${distance} 公尺`);
      }
    } catch (e) {
      console.log(e, 'e');
      $_remindLocationPermission()
    }
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('進入Intro頁');
      $_getLocation()
      $_fetchConstantData()
      $_fetchApi()
    });

    return unsubscribe;
  }, [navigation, id]);

  React.useEffect(() => {
    if (refreshCounter) {
      $_fetchConstantData()
      $_fetchApi()
    }
  }, [refreshCounter])

  React.useEffect(() => {
    setRightOnPressIsDisabled(!(remark && remark.trim()))
  }, [remark]);

  return (
    <>
      {loading ? (
        <>
          <WsSkeleton />
        </>
      ) : submitLoading ? (
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
      ) : (
        <>
          <ScrollView
            style={{
              backgroundColor: $color.white
            }}>
            {assignment && assignment.checklist && (
              <>
                <WsPaddingContainer>
                  <WsText size={24}
                    style={{ marginBottom: 16 }}>
                    {assignment.checklist.name}
                  </WsText>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{ marginBottom: 24 }}
                  >
                    {assignment.checklist.system_subclasses.map((subClass, subClassIndex) => {
                      return (
                        <WsTag
                          style={{
                            marginRight: 8,
                            marginBottom: 8
                          }}
                          key={`subClass${subClassIndex}`}
                          img={subClass.icon}>
                          {t(subClass.name)}
                        </WsTag>
                      )
                    })}
                  </WsFlex>

                  {assignment.record_at && (
                    <WsSpec
                      labelWidth={60}
                      titleSize={14}
                      fontWeight={600}
                      fontSize={14}
                      style={{
                        marginTop: 8,
                      }}
                      title={t('期限')}>
                      {moment(assignment.record_at).format('YYYY-MM-DD')}
                    </WsSpec>
                  )}

                  {assignment &&
                    assignment.start_time &&
                    assignment.end_time && (
                      <>
                        <WsSpec
                          titleSize={14}
                          fontWeight={600}
                          fontSize={14}
                          labelWidth={60}
                          style={{
                            marginTop: 8,
                          }}
                          title={t('時段')}>
                          {`${moment(assignment.start_time).format('HH:mm')}-${moment(assignment.end_time).format('HH:mm')}`}
                        </WsSpec>
                      </>
                    )}


                  {assignment &&
                    assignment.checkers && (
                      <WsInfo
                        style={{
                          marginTop: 16
                        }}
                        type="users"
                        label={t('答題者')}
                        value={assignment.checkers}
                        isUri={true}
                      />
                    )}

                  {assignment &&
                    assignment.reviewers && (
                      <WsInfo
                        style={{
                          marginTop: 16,
                        }}
                        type="users"
                        label={t('覆核者')}
                        isUri={true}
                        value={assignment.reviewers}
                      />
                    )}

                  {factoryTags && factoryTags.length > 0 && (
                    <WsInfo
                      style={{
                        marginTop: 8
                      }}
                      type="tags"
                      label={t('標籤')}
                      value={factoryTags}
                    />
                  )}

                </WsPaddingContainer>
              </>
            )}
          </ScrollView>
          <View
            style={{
              paddingBottom: Platform.OS === 'ios' ? 16 : 32,
              backgroundColor: $color.white
            }}>
            {!todayDone && (
              <TouchableOpacity
                style={{
                  marginHorizontal: 8,
                  marginBottom: 16,
                  alignItems: 'center',
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  backgroundColor: noNeedToCheckBtnDisable ? $color.white2d : $color.white,
                  borderColor: noNeedToCheckBtnDisable ? $color.white2d : $color.primary,
                  borderWidth: 1,
                  borderRadius: 25,
                  height: 48
                }}
                disabled={noNeedToCheckBtnDisable}
                onPress={() => {
                  setStateModal(true)
                }}>
                <WsText
                  color={noNeedToCheckBtnDisable ? $color.gray : $color.primary}>
                  {t('不需點檢')}
                </WsText>
              </TouchableOpacity>
            )}
            <WsGradientButton
              testID={'開始'}
              disabled={loading}
              borderRadius={30}
              onPress={$_onProcedurePress}
              style={{
                marginBottom: 8
              }}
            >
              {todayDone ? t('查看') : t('開始')}
            </WsGradientButton>
          </View>
          <WsModal
            visible={stateModal}
            onBackButtonPress={() => {
              setStateModal(false)
            }}
            headerLeftOnPress={() => {
              setStateModal(false)
            }}
            headerRightText={t('完成')}
            RightOnPressIsDisabled={RightOnPressIsDisabled}
            headerRightOnPress={() => {
              setSubmitLoading(true)
              $_onHeaderRightPress()
              setStateModal(false)
            }}
            animationType="slide"
          >
            <WsFlex style={[
              {
                flexWrap: 'nowrap',
                paddingTop: 16,
                paddingHorizontal: 16,
                maxWidth: width * 0.9,
              }
            ]}
            >
              <WsIcon
                name="md-info-outline"
                color={$color.danger}
                style={{
                  marginRight: 6
                }}
                size={24}
              />
              <WsText
                color={$color.danger}
                style={{
                }}
                size={14}
              >{t('注意，送出後，將移除已回答題目的所有內容')}</WsText>
            </WsFlex>

            <WsState
              label={t('輸入備註')}
              labelIcon={'ws-outline-edit-pencil'}
              multiline={true}
              style={{
                padding: 16
              }}
              placeholder={t('請寫下不需點檢的原因與細部說明')}
              value={remark}
              onChange={$event => {
                setRemark($event)
                setStatus(1)
              }}
            />
            <WsState
              style={{
                paddingHorizontal: 16
              }}
              type="Ll_filesAndImages"
              label={t('圖片')}
              labelIcon={'md-photo'}
              value={remarkImages}
              onChange={$event => {
                setRemarkImages($event)
              }}
              modelName="checklist_record_answer"
            />
          </WsModal>
        </>
      )}
    </>
  )
}

export default Introduction
