import React from 'react'
import {
  View,
  ScrollView,
  Alert,
  TouchableOpacity,
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
  WsState,
  WsLoading,
  WsSkeleton,
  WsModal,
  WsIcon
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import {
  setCurrentLatLng,
  setCurrentChecklistRecordDraft,
  setCurrentCheckListQuestions
} from '@/store/data'
import S_ConstantData from '@/services/api/v1/constant_data'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { getLocation } from '@/__reactnative_stone/global/location'
import { getDistance } from 'geolib';
import S_ChecklistQuestionVersion from '@/services/api/v1/checklist_question_version'

const IntroductionTemp = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Params
  const {
    id,
    versionId,
    draftId,
    index,
    linkId,
    _reviewers,
    refreshCounter
  } = route.params

  // States
  const [RightOnPressIsDisabled, setRightOnPressIsDisabled] = React.useState(true)
  const [noNeedToCheckBtnDisable, setNoNeedToCheckBtnDisable] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [remark, setRemark] = React.useState()
  const [remarkImages, setRemarkImages] = React.useState()
  const [status, setStatus] = React.useState(null)
  const [submitLoading, setSubmitLoading] = React.useState(false)
  const [procedureLoading, setProcedureLoading] = React.useState(false)

  const [constantData, setConstantData] = React.useState()
  const [reviewers, setReviewers] = React.useState(_reviewers ? _reviewers : [])
  const [checklist, setChecklist] = React.useState()
  const [questions, setQuestions] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const hasShownLocationReminderRef = React.useRef(false)

  const $_getReviewerIdsForPayload = () => reviewers ? reviewers.map(item => item.id) : []
  const $_getRemarkImagesForPayload = (_images = []) => {
    if (!Array.isArray(_images)) return []
    return _images
      .map(item => item?.id || item?.file?.id)
      .filter(Boolean)
      .map(fileId => ({ file: fileId }))
  }
  const $_getChecklistRecordCreateParams = (_checklistVersionId) => ({
    checklist: id,
    checklist_version: _checklistVersionId,
    factory: currentFactory.id,
    reviewers: $_getReviewerIdsForPayload(), // QA: 如果沒特別指定覆核者，是否要送空陣列 or null or 不送這個參數?
    from_module_link_id: linkId ? linkId : undefined,
  })
  const $_resetToCheckListAssignment = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'CheckListAssignment',
          subTabIndex: 2
        }
      ],
      key: null
    })
  }

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
      const _params = {
        checklist_version_id: versionId || checklist?.last_version?.id || res?.last_version?.id
      }
      console.log(_params, 'indexByChecklistVersion-params');
      const _questions = await S_ChecklistQuestionVersion.indexByChecklistVersion({ params: _params })
      const _formattedQuestions = await S_CheckListQuestion.formattedQuestion003(_questions.data)
      let _questionsForView = _formattedQuestions
      setQuestions(_formattedQuestions)
      if (draftId) {
        console.log(draftId, 'draftId');
        try {
          const _checklistRecordAnswerDraft = await S_CheckListRecordAns.indexV2({ parentId: draftId })
          let _formattedQuestionsWithDraft = await S_CheckListQuestion.formattedQuestionWithIndexV2(
            _checklistRecordAnswerDraft.data,
            _formattedQuestions
          )
          _questionsForView = _formattedQuestionsWithDraft
          setQuestions(_formattedQuestionsWithDraft)
        } catch (e) {
          console.error(e, 'e');
        }
      }
      setLoading(false)
      setNoNeedToCheckBtnDisable(false)
      store.dispatch(setCurrentCheckListQuestions(_questionsForView))
    } catch (e) {
      store.dispatch(setCurrentChecklistRecordDraft(null))
      console.error(e, 'e')
    }
  }

  const $_getReviewerIds = (_users) => {
    return (_users || [])
      .map(item => item && item.id ? item.id : item)
      .filter(item => item !== null && item !== undefined)
  }

  const $_isReviewerChanged = () => {
    const _originReviewerIds = $_getReviewerIds(_reviewers)
    const _currentReviewerIds = $_getReviewerIds(reviewers)
    if (_originReviewerIds.length !== _currentReviewerIds.length) {
      return true
    }
    const _originKey = _originReviewerIds.map(item => String(item)).sort().join(',')
    const _currentKey = _currentReviewerIds.map(item => String(item)).sort().join(',')
    return _originKey !== _currentKey
  }

  // FUNC
  const $_onProcedurePress = async () => {
    setProcedureLoading(true)
    try {
      let checklistRecordId = draftId
      if (draftId && $_isReviewerChanged()) {
        const _reviewerIds = $_getReviewerIds(reviewers)
        console.log('S_CheckListRecord.update')
        await S_CheckListRecord.update({
          modelId: draftId,
          data: {
            reviewers: _reviewerIds
          }
        })
      }
      if (!checklistRecordId) {
        // 建立空白紀錄
        const _params = $_getChecklistRecordCreateParams(versionId ? versionId : checklist.last_version?.id)
        console.log('S_CheckListRecord.store')
        const _checklistRecord = await S_CheckListRecord.store({ params: _params })
        if (!_checklistRecord?.id) {
          throw new Error('Failed to create checklist record id')
        }
        checklistRecordId = _checklistRecord.id
      }
      // 新作業一律先清空本機暫存，避免沿用上一份 Preview 的草稿陣列
      store.dispatch(setCurrentChecklistRecordDraft(null))
      // 跳轉總覽頁
      navigation.navigate('CheckListAssignmentPreview', {
        id: id,
        versionId: versionId ? versionId : checklist.last_version?.id,
        _reviewers: reviewers ? reviewers : [],
        _draftId: draftId,
        _questions: questions,
        questionFilteredBtnVisible: false,
        _constantData: constantData ? constantData : null,
        index: index, // 離線作業用
        linkId: linkId,
        subTabIndex: 2,
        checklistRecordId: checklistRecordId
      })
    } catch (error) {
      console.error('Failed to create checklist record draft:', error)
      Alert.alert(t('建立點檢記錄失敗'))
    } finally {
      setProcedureLoading(false)
    }
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    try {
      const checklistVersionId = versionId ? versionId : checklist?.last_version?.id
      if (!id || !currentFactory?.id || !checklistVersionId) {
        throw new Error('Missing required checklist params')
      }
      // 建立空白紀錄
      const _params = $_getChecklistRecordCreateParams(checklistVersionId)
      const _result = await S_CheckListRecord.store({ params: _params })
      if (!_result?.id) {
        throw new Error('Failed to create checklist record')
      }
      const _nochecklistParams = {
        checklist_record_id: _result.id,
        remark: remark,
        images: $_getRemarkImagesForPayload(remarkImages),
      }
      console.log(_nochecklistParams, '_nochecklistParams')
      await S_CheckListRecord.noChecklist({ params: _nochecklistParams })
      store.dispatch(setCurrentChecklistRecordDraft(null))
      $_resetToCheckListAssignment()
      Alert.alert(t('作業已送出'))
    } catch (error) {
      console.error('Failed to create checklist record draft:', error)
    } finally {
      setSubmitLoading(false)
    }
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
    console.log('權限檢查結果:', result);
    if (result === RESULTS.GRANTED) {
      return true;
    }
    if (result === RESULTS.DENIED || result === RESULTS.LIMITED) {
      const requestResult = await request(permission);
      console.log('權限請求結果:', requestResult);
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
      console.log(myLocation, 'myLocation');
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
    $_getLocation()
    $_fetchConstantData()
    $_fetchModel()
  }, [])

  React.useEffect(() => {
    if (refreshCounter) {
      $_fetchConstantData()
      $_fetchModel()
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
      ) : (submitLoading || procedureLoading) ? (
        <Modal
          visible={submitLoading || procedureLoading}
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
                    style={{ marginBottom: 16 }}
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

                  <WsText
                    size={16}
                    letterSpacing={1}
                    style={{
                      marginBottom: 16,
                    }}>
                    {t('共{number}題', { number: questions.length })}
                  </WsText>

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
              disabled={loading || procedureLoading}
              borderRadius={30}
              onPress={$_onProcedurePress}
              style={{
                marginBottom: Platform.OS === 'ios' ? 16 : 48,
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
              modelName="checklist_record_answer"
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
