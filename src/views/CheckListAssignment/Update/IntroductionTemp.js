import React from 'react'
import {
  Text,
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsBtn,
  WsBottomSheet,
  WsGradientButton,
  WsState,
  WsLoading,
  WsSkeleton,
  WsModal
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListQuestionVersion from '@/services/api/v1/checklist_question_version';
import {
  setCurrentLatLng,
  setCurrentChecklistRecordDraft,
  setCurrentCheckListQuestions
} from '@/store/data'
import S_CheckListRecordDraft from '@/services/api/v1/checklist_record_draft'
import S_CheckListRecordAnswerDraft from '@/services/api/v1/checklist_record_answer_draft'
import S_ConstantData from '@/services/api/v1/constant_data'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import AndroidOpenSettings from 'react-native-android-open-settings'
import { getLocation, getGeocode } from '@/__reactnative_stone/global/location'
import { getDistance } from 'geolib';

const IntroductionTemp = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentChecklistDraft = useSelector(state => state.data.currentChecklistRecordDraft)
  const currentPreloadChecklistAssignmentDraft = useSelector(state => state.data.preloadChecklistAssignmentDraft)

  // Params
  const {
    id,
    versionId,
    draftId,
    subTabIndex,
    index,
    linkId
  } = route.params

  console.log(linkId,'=linkId=');

  // States
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)
  const [noNeedToCheckBtnDisable, setNoNeedToCheckBtnDisable] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [status, setStatus] = React.useState(null)
  const [assignment, setAssignment] = React.useState(null)
  const [submitLoading, setSubmitLoading] = React.useState(false)

  const [constantData, setConstantData] = React.useState()
  const [reviewers, setReviewers] = React.useState()
  const [checklist, setChecklist] = React.useState()
  const [questions, setQuestions] = React.useState()
  const [loading, setLoading] = React.useState(true)

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

  // Services
  const $_fetchModel = async () => {
    try {
      const res = await S_Checklist.show({
        modelId: id
      })
      setChecklist(res)
      let _params = {
        get_all: 1
      }
      if (versionId) {
        _params.checklist_version_id = versionId
      } else if (res) {
        _params.get_all = 1,
          _params.checklists = res.id,
          _params.checklist_version_id = res.last_version.id
      }
      console.log(_params, 'indexV3-params');
      // 取得題目
      const _questions = await S_CheckListQuestion.indexV3({ params: _params })
      // FORMATTED FOR VIEW
      const _formattedQuestions = await S_CheckListQuestion.formattedQuestion003(_questions.data)
      setQuestions(_formattedQuestions)
      // 有無草稿
      if (draftId) {
        console.log(draftId, 'draftId');
        try {
          // 介紹頁覆核者
          const _checklistRecordDraft = await S_CheckListRecordDraft.showDraft({ draftId: draftId })
          setReviewers(_checklistRecordDraft.reviewers)
          // 答題過的草稿答案
          const _params = {
            checklist_record_draft: _checklistRecordDraft.id,
            factory: currentFactory.id
          }
          const _checklistRecordAnswerDraft = await S_CheckListRecordAnswerDraft.index({ params: _params })
          // FORMATTED FOR TEMP CHECKLIST
          let _formattedQuestionsWithDraft = await S_CheckListQuestion.formattedQuestionFromTempDraft003_V2(_checklistRecordAnswerDraft.data, _formattedQuestions)
          setQuestions(_formattedQuestionsWithDraft)
        } catch (e) {
          console.error(e, 'e');
        }
      }
      setLoading(false)
      setNoNeedToCheckBtnDisable(false)
      store.dispatch(setCurrentCheckListQuestions(_formattedQuestions))
    } catch (e) {
      store.dispatch(setCurrentChecklistRecordDraft(null))
      if (currentPreloadChecklistAssignmentDraft && currentPreloadChecklistAssignmentDraft[index] && currentPreloadChecklistAssignmentDraft.length > 0) {
        const _checklist = currentPreloadChecklistAssignmentDraft[index].assignment
        const _questions = currentPreloadChecklistAssignmentDraft[index].questions
        const _reviewers = currentPreloadChecklistAssignmentDraft[index].reviewers
        setChecklist(_checklist)
        setQuestions(_questions)
        setReviewers(_reviewers)
        setLoading(false)
      }
    }
  }

  // FUNC
  const $_onProcedurePress = () => {
    navigation.push('RoutesCheckList', {
      screen: 'CheckListAssignmentPreview',
      params: {
        id: id,
        versionId: versionId ? versionId : checklist.last_version?.id,
        record_draft: 'null',
        _reviewers: reviewers ? reviewers : [],
        _draftId: draftId,
        _questions: questions,
        questionFilteredBtnVisible: false,
        _constantData: constantData ? constantData : null,
        index: index, // 離線作業用
        linkId: linkId
      }
    })
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    // 過濾填答者為自己 或 無指定答題者的題目
    const _formattedQuestions = await S_CheckListRecord.formattedQuestionsForAPI(
      currentChecklistDraft ? currentChecklistDraft : questions,
      currentUser.id
    )
    console.log('1111');
    console.log(remarkImages, 'remarkImages');
    // 整理成送出API的格式
    const _submitValue = S_CheckListRecord.setSubmitValueV2(
      checklist,
      currentUser?.id,
      currentFactory?.id,
      currentChecklistDraft,
      checklist.last_version?.id,
      questions,
      _formattedQuestions,
      draftId,
      remark,
      status,
      remarkImages,
      reviewers,
    )
    // console.log(JSON.stringify(_submitValue), '_submitValue_introTemp');
    try {
      const res = await S_CheckListRecordAns.batchStoreV2({ params: _submitValue })
        .then(res => {
          // Alert.alert(res, t('作業送出成功'))
          store.dispatch(setCurrentChecklistRecordDraft(null))
        })
        .catch(err => {
          Alert.alert(t('作業送出發生錯誤'))
        })
    } catch (e) {
      console.error(e);
      Alert.alert(t('作業送出發生錯誤'))
      store.dispatch(setCurrentChecklistRecordDraft(null))
    }
    setSubmitLoading(false)
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
        }
      ],
      key: null
    })
  }

  // LatLng
  const $_requestLocationPermission = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
    } else if (Platform.OS === 'android') {
      permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }
    const result = await check(permission);
    console.log('權限檢查結果:', result);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const requestResult = await request(permission);
      console.log('權限請求結果:', requestResult);
      return requestResult === RESULTS.GRANTED;
    }
    if (result === RESULTS.BLOCKED) {
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
      return false;
    }
    // unavailable 或其他情況
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
      console.log(myLocation,'myLocation');
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
      if (Platform.OS === 'android') {
        AndroidOpenSettings.locationSourceSettings(); // ✅ 跳轉至定位(GPS)頁面
      }
    }
  }

  React.useEffect(() => {
    $_getLocation()
    $_fetchConstantData()
    $_fetchModel()
  }, [])

  React.useEffect(() => {
    if (remark && remark.trim()) {
      setRightOnPressIsDisabled(false)
    } else {
      setRightOnPressIsDisabled(true);
    }
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
            {checklist && !loading && (
              <>
                <WsPaddingContainer>
                  <WsText size={24}
                    style={{ marginBottom: 16 }}>
                    {checklist.name}
                  </WsText>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{ marginBottom: 24 }}
                  >
                    {checklist.system_subclasses.map((subClass, subClassIndex) => {
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
                  <WsInfo
                    type="user"
                    label={t('答題者')}
                    value={currentUser}
                    isUri={true}
                  />
                  <WsState
                    testID={'覆核者'}
                    style={{
                      marginTop: 16
                    }}
                    type={'belongstomany'}
                    label={t('覆核者')}
                    nameKey={'name'}
                    hasMeta={true}
                    modelName={'user'}
                    serviceIndexKey={'simplifyFactoryIndex'}
                    customizedNameKey={'userAndEmail'}
                    value={reviewers}
                    onChange={$event => {
                      setReviewers($event)
                    }}
                  >
                  </WsState>
                </WsPaddingContainer>
              </>
            )}
          </ScrollView>
          <View
            style={{
              paddingBottom: 16,
              backgroundColor: $color.white
            }}>
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
            <WsGradientButton
              testID={'開始'}
              disabled={loading}
              borderRadius={30}
              onPress={$_onProcedurePress}
              style={{
              }}
            >
              {t('開始')}
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
            headerRightText={t('送出')}
            RightOnPressIsDisabled={RightOnPressIsDisabled}
            headerRightOnPress={() => {
              setSubmitLoading(true)
              $_onHeaderRightPress()
              setStateModal(false)
            }}
            animationType="slide"
          >
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
              modelName="checklist_record_answer"
              // uploadUrl={`factory/${currentFactory.id}/checklist_record_answer/image`}
              value={remarkImages}
              onChange={$event => {
                setRemarkImages($event)
              }}
            />
          </WsModal>
        </>
      )}
    </>
  )
}

export default IntroductionTemp
