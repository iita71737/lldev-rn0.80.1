import React, { useCallback } from 'react'
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  View,
  Dimensions,
  Platform
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsModal,
  WsIconTitle,
  WsBtn,
  WsState,
  WsDialog,
  WsFlex,
  WsTitle,
  WsIcon,
  WsSkeleton,
  WsPopup,
  WsTag,
  WsInfo,
  WsDes,
  WsInfoUser,
  WsGradientButton
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import debounce from 'lodash/debounce';
import ViewCheckListAssignmentPassStandard from '@/views/CheckListAssignment/PassStandard'
import moment from 'moment'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import ViewCheckListQuestionShow from '@/views/CheckListQuestionTemplate/Show'
import Geolocation from '@react-native-community/geolocation';
import { useFocusEffect } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';

const CheckListAssignmentStep = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const { title, question_type, onChange, question } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentChecklistDraft = useSelector(state => state.data.currentChecklistRecordDraft)
  const currentLatLng = useSelector(state => state.data.currentLatLng)

  // States
  const [popupActive003, setPopupActive003] = React.useState(false)

  const [loading, setLoading] = React.useState(false)
  const [questionShow, setQuestionShow] = React.useState()
  const [popupActive, setPopupActive] = React.useState(false)

  const [modalVisible001, setStateModal001] = React.useState(false)
  const [modalVisible002, setStateModal002] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  const [itemsToggleBtn, setItemToggleBtn] = React.useState([])
  const [selectedMainIndex, setSelectedMainIndex] = React.useState(question.itemsToggleBtnSelected != undefined ? question.itemsToggleBtnSelected : undefined)
  const [minorToggleBtn, setMinorToggleBtn] = React.useState([])
  const [minorValueToggle, setMinorValueToggle] = React.useState(question.answer_value ? question.answer_value : null)
  const [selectedMinorIndex, setSelectedMinorIndex] = React.useState(question.minorToggleBtnSelected != undefined ? question.minorToggleBtnSelected : undefined)
  const [questionSettingItems, setQuestionSettingItems] = React.useState([])

  // HELPER
  const $_getScoreTextV5 = (answer) => {
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
          : _score == 22 ?
            `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
            : _score == 23 ?
              `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
              : _score == 25 ?
                `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
                : `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${answer.answer_value}`
          : _score == 22 ?
            `${answer.answer_value}`
            : _score == 23 ?
              `${answer.answer_value}`
              : _score == 25 ?
                `${answer.answer_value}`
                : `${answer.answer_value}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value}${_unit ? _unit : ''}`
          : _score == 22 ?
            `${answer.answer_value}${_unit ? _unit : ''}`
            : _score == 23 ?
              `${answer.answer_value}${_unit ? _unit : ''}`
              : `${answer.answer_value}${_unit ? _unit : ''}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) &&
      answer.answer_value[0]
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
          : _score == 22 ?
            `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
            : _score == 23 ?
              `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
              : _score == 25 ?
                `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
                : ``
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) &&
      answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value ? answer.answer_value.label : ''}`
          : _score == 22 ?
            `${answer.answer_value ? answer.answer_value.label : ''}`
            : _score == 23 ?
              `${answer.answer_value ? answer.answer_value.label : ''}`
              : _score == 25 ?
                `${answer.answer_value ? answer.answer_value.label : ''}`
                : ``
    }
    else {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
          : _score == 22 ?
            `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
            : _score == 23 ?
              `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
              : _score == 25 ?
                `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
                : `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
    }
  }
  const $_getScoreTextV4 = (answer) => {
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return `${t('觀測日期')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return `${t('觀測內容')}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return `${t('觀測值')}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) && // 確認是陣列
      answer.answer_value[0]
    ) {
      return `${t('選項')}`
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) && // 確認不是陣列（可能是字串或物件）
      answer.answer_value
    ) {
      return `${t('選項')}`
    }
    else {
      return ``
    }
  }
  const $_getScoreIconColorV3 = (answer) => {
    const _score = answer.risk_level
    return _score == 23
      ? $color.danger
      : _score == 22
        ? $color.yellow
        : _score == 21
          ? $color.primary
          : _score == 25
            ? $color.green
            : $color.gray;
  }
  const $_getScoreIconV3 = (answer) => {
    const _score = answer.risk_level
    return _score == 21 || _score == 22 || _score == 23 ? 'ws-filled-warning' : 'md-check-circle'
  }
  const $_getScoreTextV3 = (answer) => {
    // const { t, i18n } = useTranslation(); // crash
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    return answer.answer_value == null || Number.isNaN(answer.answer_value)
      ? `${t('未答題')}`
      : _score == 21 ?
        `${t('低風險')}`
        : _score == 22 ?
          `${t('中風險')}`
          : _score == 23 ?
            `${t('高風險')}`
            : _score == 25 ?
              `${t('無異常')}`
              : `${t('不涉及風險')}`
  }

  // Functions
  const $_setItemToggleBtn = (event, index) => {
    // 替換特定項目
    const updatedItemsToggleBtn = itemsToggleBtn.map((item, itemIndex) => {
      if (itemIndex == selectedMainIndex) {
        return {
          id: itemsToggleBtn[selectedMainIndex].id,
          label: itemsToggleBtn[selectedMainIndex].label,
          value: `secondary-${selectedMainIndex}`
        };
      }
      return item; // 其他項目不變
    });
    setItemToggleBtn(updatedItemsToggleBtn)
    setVisible(false)
  }

  const $_onPassStandardPress = () => {
    setStateModal001(true)
  }

  // HELPER
  const checkAvailable = (question) => {
    if (question && question.done_at) {
      return false
    }
    if ((question &&
      question.question_setting &&
      question.question_setting.checkers &&
      question.question_setting.checkers.length > 0)) {
      return question.question_setting.checkers.some(checker => checker.id == currentUser.id);
    } else if (question && question.question_setting == null) {
      return true
    } else {
      return true
    }
  }

  // Services
  const $_fetchCheckListQuestion = async () => {
    try {
      setLoading(true)
      const res = await S_CheckListQuestion.showV2({
        modelId: question.id
      });
      setQuestionShow(res)
      if (res) {
        let _items = [];
        const questionSettingItems = res.last_version.question_setting_items;
        const answerSetting = res.last_version.answer_setting
        const unit = res.last_version.unit
        const _last_version = res.last_version
        // 從前端，送Show後，加入題目欄位中
        onChange(questionSettingItems, 'question_setting_items', question, 'question')
        onChange(answerSetting, 'answer_setting', question, 'question')
        onChange(unit, 'unit', question, 'question')
        onChange(_last_version, 'last_version', question, 'question')
        onChange(currentLatLng, 'latLng', question, 'question')
        questionSettingItems.forEach((item, index) => {
          if (item.name) {
            let _newItem = {
              id: item.id,
              label: item.name,
              value: item.question_setting_items ? `secondary-${index}` : item.risk_level ? item.risk_level : item.name === '不適用' ? 20 : item.value
            };
            _items.push(_newItem);
          }
        });
        setQuestionSettingItems(questionSettingItems)
        setItemToggleBtn(_items);
        setLoading(false)
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 驗證此題是否被編輯過
  const $_isQuestionUpdated = () => {
    if (
      question.last_version &&
      question.last_version.updated_at &&
      question.updated_at &&
      moment.utc(question.last_version.updated_at).isAfter(moment.utc(question.answer_updated_at)) &&
      question.isNeedCheckAns
    ) {
      setPopupActive003(true)
    }
  }


  React.useEffect(() => {
    $_fetchCheckListQuestion()
    $_isQuestionUpdated()
  }, [question, currentLatLng])

  return (
    <>
      {loading ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <ScrollView
          testID={'ScrollView'}
          style={{
            flex: 1,
            // borderWidth: 1,
          }}
        >
          <WsPopup
            active={popupActive}
            onClose={() => {
              setPopupActive(false)
            }}>
            {question.last_version && (
              <View
                style={{
                  width: width * 0.9,
                  height: height * 0.3,
                  backgroundColor: $color.white,
                  borderRadius: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <WsText color={$color.black}>{question.last_version.remark}</WsText>
              </View>
            )}
          </WsPopup>

          {checkAvailable(question) ? (
            <>
              <WsPaddingContainer>
                <WsText
                  size={18}
                  style={{
                    marginBottom: 40
                  }}>
                  {title}
                </WsText>
                <TouchableOpacity
                  style={{
                    marginVertical: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                  }}
                  onPress={() => {
                    $_onPassStandardPress()
                  }}>
                  <WsIcon
                    style={{
                      marginTop: -6
                    }}
                    name={'ws-outline-light'}
                    size={24}
                  />
                  <WsTitle fontSize={14} fontWeight="400" color={$color.primary}>
                    {t('查看合規標準')}
                  </WsTitle>
                </TouchableOpacity>
                {question_type &&
                  question_type.value === 'date' && (
                    <>
                      <WsText>{'觀測時間'}</WsText>
                      <WsState
                        testID={'日期'}
                        style={{
                          marginTop: 8
                        }}
                        type="date"
                        value={question.answer_value ? question.answer_value.toString() : null}
                        onChange={$event => {
                          onChange($event, 'answer_value', question, 'question')
                        }}
                        backgroundColor={$color.primary11l}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="time"
                        value={question.answer_value ? question.answer_value.toString() : null}
                        onChange={$event => {
                          onChange($event, 'answer_value', question, 'question')
                        }}
                        placeholder={t('請選擇時間')}
                        backgroundColor={$color.primary11l}
                      />
                    </>
                  )}

                {question_type &&
                  question_type.value === 'text' && (
                    <>
                      <WsText>{'觀測內容'}</WsText>
                      <WsState
                        testID={'文字題'}
                        style={{
                          marginTop: 8
                        }}
                        multiline={true}
                        type="text"
                        value={question.answer_value ? question.answer_value : null}
                        onChange={$event => {
                          onChange($event, 'answer_value', question, 'question')
                        }}
                        placeholder={t('輸入')}
                        backgroundColor={$color.primary11l}
                      />
                    </>
                  )}

                {question_type &&
                  question_type.value === 'num' && (
                    <>
                      <WsText>{'觀測值'}</WsText>
                      <WsFlex>
                        <WsState
                          testID={'數值題'}
                          style={{
                            flex: 1,
                            marginTop: 8,
                            marginRight: 4
                          }}
                          type="number"
                          value={question.answer_value ? question.answer_value.toString() : null}
                          onChange={$event => {
                            onChange(parseFloat($event), 'answer_value', question, 'question')
                          }}
                          placeholder={t('請輸入觀測值')}
                          backgroundColor={$color.primary11l}
                        />
                        {question.unit && (
                          <WsText>{question.unit}</WsText>
                        )}
                      </WsFlex>
                    </>
                  )
                }

                {question_type &&
                  question_type.value === 'single-choice' && (
                    <>
                      <WsText>{'選項'}</WsText>
                      <WsState
                        stateStyle={{
                          height: 64,
                          borderWidth: 0,
                          shadowColor: 'rgba(0, 0, 0, 0.3)',
                          shadowOpacity: 0.7,
                          shadowOffset: {
                            width: 4,
                            height: 4
                          }
                        }}
                        type="toggleBtn"
                        items={itemsToggleBtn}
                        value={selectedMinorIndex != null ? itemsToggleBtn[selectedMainIndex] : question.answer_value}
                        onChange={($event, index) => {
                          if (!$event) {
                            return
                          }
                          // 新增次級規格選項
                          if ($event && $event.value && typeof $event.value === 'string' && $event.value.includes('secondary')) {
                            let _2nd_items = [];
                            const questionSettingItems = questionShow.last_version.question_setting_items[index].question_setting_items;
                            questionSettingItems.forEach((item, index) => {
                              if (item.name) {
                                let _newItem = {
                                  id: item.id,
                                  label: item.name,
                                  value: item.value ? item.value : item.risk_level ? item.risk_level : null
                                };
                                _2nd_items.push(_newItem);
                              }
                            });
                            setMinorToggleBtn(_2nd_items)
                            onChange(index, 'itemsToggleBtnSelected', question, 'question')
                            setSelectedMainIndex(index)
                            setVisible(true)
                          }
                          else {
                            setSelectedMinorIndex(null)
                            setMinorValueToggle($event)
                            onChange($event, 'answer_value', question, 'question')
                          }
                        }}
                      />
                    </>
                  )}
              </WsPaddingContainer>

              <WsDialog
                contentHeight={300}
                dialogVisible={visible}
                setDialogVisible={() => {
                  setVisible(false)
                }}
                contentStyle={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: width * 0.9,
                }}
              >
                <WsState
                  stateStyle={{
                    backgroundColor: 'rgba(242, 248, 253, 1)',
                    height: 64,
                    width: width * 0.7,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOpacity: 0.6,
                    shadowOffset: {
                      width: 4,
                      height: 4
                    },
                  }}
                  type="toggleBtn"
                  items={minorToggleBtn}
                  value={minorValueToggle}
                  onChange={($event, index) => {
                    if ($event) {
                      setSelectedMinorIndex(index)
                      setMinorValueToggle($event)
                      onChange($event, 'secondary', question, 'question')
                      onChange(index, 'minorToggleBtnSelected', question, 'question')
                      $_setItemToggleBtn($event, index)
                    }
                  }}
                />
              </WsDialog>
              <>
                <WsState
                  testID={'備註'}
                  label={t('備註')}
                  labelIcon={'ws-outline-edit-pencil'}
                  multiline={true}
                  style={{
                    marginHorizontal: 16,
                  }}
                  placeholder={t('輸入')}
                  placeholderTextColor={question.answer_value ? S_CheckListRecordAns.getScoreRemarkColor(question) : $color.gray}
                  value={question.remark}
                  onChange={$event => {
                    onChange($event, 'remark', question, 'question')
                  }}
                />
                <WsState
                  style={{
                    marginVertical: 16,
                    padding: 16
                  }}
                  type="Ll_filesAndImages"
                  label={t('附件')}
                  labelIcon={'md-photo'}
                  value={question.images}
                  onChange={$event => {
                    onChange($event, 'images', question, 'question')
                  }}
                  modelName="checklist_record_answer"
                />
              </>
            </>
          ) : (
            <>
              <WsPaddingContainer
                style={{
                  height: height * 0.7,
                  // flex: 1,
                  // borderWidth: 1,
                }}
              >
                <WsText
                  size={18}
                  style={{
                    marginBottom: 40
                  }}>
                  {title}
                </WsText>
                {question.last_version && question.last_version.remark && (
                  <TouchableOpacity
                    style={{
                      marginVertical: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row'
                    }}
                    onPress={() => {
                      $_onPassStandardPress()
                    }}>
                    <WsIcon
                      style={{
                        marginTop: -6
                      }}
                      name={'ws-outline-light'}
                      size={24}
                    />
                    <WsTitle fontSize={14} fontWeight="400" color={$color.primary}>
                      {t('查看合規標準')}
                    </WsTitle>
                  </TouchableOpacity>
                )}

                <>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      flex: 1,
                      // borderWidth: 1,
                    }}
                  >
                    <WsText size={28}>{
                      question.risk_level == 25 ? t('合規') :
                        question.risk_level == 26 ? t('數值已紀錄') :
                          question.risk_level == 21 ? t('不合規') :
                            question.risk_level == 22 ? t('不合規') :
                              question.risk_level == 23 ? t('不合規') :
                                question.risk_level == 20 ? t('不適用') :
                                  t('未答題')
                    }
                    </WsText>
                    <WsFlex
                      justifyContent="center"
                    >
                      <WsIcon
                        size={24}
                        name={
                          question.risk_level == 25 ? 'md-check-circle' :
                            question.risk_level == 26 ? 'md-check-circle' :
                              question.risk_level == 20 ? 'scc-liff-close-circle' :
                                'ws-filled-warning'
                        }
                        color={
                          question.risk_level == 25 ? $color.green :
                            question.risk_level == 20 ? $color.gray :
                              question.risk_level == 21 ? $color.primary :
                                question.risk_level == 22 ? $color.yellow :
                                  question.risk_level == 23 ? $color.danger :
                                    $color.gray
                        }
                      ></WsIcon>
                      <WsTag
                        backgroundColor={
                          question.risk_level == 25 ? $color.green11l :
                            question.risk_level == 20 ? $color.gray :
                              question.risk_level == 21 ? $color.primary11l :
                                question.risk_level == 22 ? $color.yellow11l :
                                  question.risk_level == 23 ? $color.danger11l :
                                    $color.gray
                        }
                        textColor={
                          question.risk_level == 25 ? $color.green :
                            question.risk_level == 20 ? $color.gray :
                              question.risk_level == 21 ? $color.primary :
                                question.risk_level == 22 ? $color.black :
                                  question.risk_level == 23 ? $color.danger :
                                    $color.white
                        }
                      >
                        {question.risk_level == 25 ? t('無異常') :
                          question.risk_level == 26 ? t('數值已紀錄') :
                            question.risk_level == 21 ? t('不合規') :
                              question.risk_level == 22 ? t('不合規') :
                                question.risk_level == 23 ? t('不合規') :
                                  question.risk_level == 20 ? t('不適用') : t('未答題')}
                      </WsTag>
                    </WsFlex>
                  </View>

                  {question &&
                    question.updated_user && (
                      <WsFlex
                        justifyContent="center"
                      >
                        <WsText size={14}
                          fontWeight="300"
                          style={[
                            {
                              marginRight: 8
                            },
                          ]}
                        >
                          {t('答題者')}
                        </WsText>
                        <WsInfoUser
                          style={{
                            width: 120
                          }}
                          fontsize={14}
                          isUri={true}
                          value={question.updated_user}
                        />
                        {question.updated_user && (
                          <>
                            <WsFlex
                              style={{
                                // borderWidth:1,
                              }}
                            >
                              <WsTag>
                                {t('已完成')}
                              </WsTag>
                              <WsDes
                                style={{
                                  marginLeft: 4
                                }}
                              >
                                {`(${moment(question.updated_at).format('YYYY-MM-DD HH:hh')})`}
                              </WsDes>
                            </WsFlex>
                          </>
                        )}
                      </WsFlex>
                    )}

                  {question?.latLng && (
                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        type="link"
                        label={t('答題位置')}
                        labelFontWeight={300}
                        labelWidth={80}
                        style={{
                          flexDirection: 'row',
                        }}
                        value={`${question?.latLng?.latitude} , ${question?.latLng?.longitude}`}
                        onPress={() => {
                          if (currentFactory?.map_url) {
                            if (currentFactory?.map_url === 'google') {
                              // GOOGLE MAP
                              const url = `https://www.google.com/maps/search/?api=1&query=${question?.latLng?.latitude},${question?.latLng?.longitude}`;
                              Linking.openURL(url);
                            } else if (currentFactory?.map_url === 'google') {
                              // AMAP
                              const url1 = `https://uri.amap.com/marker?position=${question?.latLng?.latitude},${question?.latLng?.longitude}`;
                              Linking.openURL(url1);
                            } else if (currentFactory?.map_url === 'google') {
                              // NAVER MAP
                              const url2 = `https://map.naver.com/v5/?c=${question?.latLng?.latitude},${question?.latLng?.longitude},17,0,0,0,d`;
                              Linking.openURL(url2);
                            }
                          } else {
                            // GOOGLE MAP
                            const url = `https://www.google.com/maps/search/?api=1&query=${question?.latLng?.latitude},${question?.latLng?.longitude}`;
                            Linking.openURL(url);
                          }
                        }}
                      />
                    </View>
                  )}

                  {question?.ip && (
                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        label={t('IP')}
                        labelFontWeight={300}
                        labelWidth={80}
                        value={`${question?.ip}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      />
                    </View>
                  )}

                </>


              </WsPaddingContainer>
              <TouchableOpacity
                style={{
                  height: 60,
                  width: width,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgb(219,230,238)',
                  flexDirection: 'row'
                }}
                minHeight={64}
                color={$color.gray}
                borderRadius={0}
                onPress={() => {
                  setStateModal002(true)
                }}>
                <WsIcon color={$color.black} name="ws-outline-edit-pencil" size={30}>
                </WsIcon>
                <WsText
                  style={{
                    marginLeft: 8
                  }}
                  letterSpacing={1}
                  fontWeight="300">
                  {t('查看備註')}
                </WsText>
              </TouchableOpacity>
            </>
          )}

          <WsModal
            title={t('查看合規標準')}
            visible={modalVisible001}
            onBackButtonPress={() => {
              setStateModal001(false)
            }}
            headerLeftOnPress={() => {
              setStateModal001(false)
            }}
            headerRightOnPress={() => {
            }}
            animationType="slide"
            footerBtnRightOnPress={() => {
              setStateModal001(false)
            }}
            footerBtnLeftOnPress={() => {
              setStateModal001(false)
            }}>
            <ViewCheckListAssignmentPassStandard
              id={question.id}
            >
            </ViewCheckListAssignmentPassStandard>
          </WsModal>

          <WsModal
            visible={modalVisible002}
            onBackButtonPress={() => {
              setStateModal002(false)
            }}
            headerLeftOnPress={() => {
              setStateModal002(false)
            }}
            headerRightOnPress={() => {
              $_onHeaderRightPress()
              setStateModal002(false)
            }}
            animationType="slide"
          >
            <WsPaddingContainer>
              <WsInfo
                value={
                  question.remark ? question.remark : t('無')
                }
                label={t('備註')}
                style={{
                  marginTop: 24
                }}
              />
            </WsPaddingContainer>
          </WsModal>
        </ScrollView >
      )}

      <WsPopup
        active={popupActive003}
        onClose={() => {
          // 引導選擇其一按鈕，不給關閉
          // setPopupActive003(false)
        }}>
        <View
          style={{
            width: width * 0.9,
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
          >{t('題目已變更，是否保留先前作答、備註、附件？若題型變更，僅會保留備註與附件')}
          </WsText>

          {question && (
            <View
              style={{
                paddingVertical: 100,
                height: height * 0.8,
                width: width * 0.9
              }}
            >
              {question && (
                <>
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                    }}
                  >
                    <WsInfo
                      style={{
                        paddingLeft: 16,
                        flexDirection: 'row'
                      }}
                      label={t('作答')}
                      value={' '}
                    />
                    <WsText
                      style={{
                      }}
                      fontWeight="600"
                      size={14}
                    >
                      {$_getScoreTextV4(question)}
                    </WsText>
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={14}
                    >
                      {$_getScoreTextV5(question)}
                    </WsText>
                  </WsFlex>
                </>
              )}
              {$_getScoreTextV3(question) && (
                <>
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                    }}
                  >
                    <WsInfo
                      style={{
                        paddingLeft: 16,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      label={t('風險')}
                      value={' '}
                    />
                    <WsIcon
                      style={{
                      }}
                      name={$_getScoreIconV3(question)}
                      size={20}
                      color={$_getScoreIconColorV3(question)}
                    />
                    <WsText
                      style={{
                        marginLeft: 8,
                      }}
                      size={14}
                      fontWeight="600"
                    >
                      {$_getScoreTextV3(question)}
                    </WsText>
                  </WsFlex>
                </>
              )}
              <ViewCheckListQuestionShow
                id={question?.id}
              ></ViewCheckListQuestionShow>
            </View>
          )}

          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              testID={'保留答案'}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                let $event = null
                onChange($event, 'clear_isNeedCheckAns', question, 'question')
                setPopupActive003(false)
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('保留答案')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              btnColor={[$color.danger, $color.danger5l]}
              style={{
                width: 110,
              }}
              onPress={() => {
                let $event = null
                onChange($event, 'clear_answer_value', question, 'question')
                setPopupActive003(false)
              }}>
              {t('清除答案')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default CheckListAssignmentStep
