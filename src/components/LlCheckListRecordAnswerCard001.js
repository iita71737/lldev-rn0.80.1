import React, { useEffect, useCallback, useMemo } from 'react'
import { TouchableOpacity, View, Dimensions, Image } from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsIcon,
  WsCard,
  WsDes,
  WsCollapsible,
  WsInfo,
  WsModal,
  WsState,
  WsAvatar,
  WsLoading,
  WsPaddingContainer,
  WsIconBtn
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { useTranslation } from 'react-i18next'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import CheckBox from '@react-native-community/checkbox'
import moment from 'moment'
import { useNavigation } from '@react-navigation/native'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

const LlCheckListRecordAnswerCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // Props
  const {
    no,
    style,
    onPress,
    answer,
    mode,
    cardColor,
    checkboxVisible = false,
    checkboxOnPress,
    checked,
    done,
    testID
  } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [question, setQuestion] = React.useState()

  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  const [loading, setLoading] = React.useState(true)
  const [acts, setActs] = React.useState([])

  // Function
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  const $_scoreText = () => {
    return S_CheckListRecordAns.getScoreTextV2(answer)
  }

  const $_scoreDes = () => {
    if (answer.question_type == 1 &&
      answer.control_limit_lower &&
      answer.control_limit_upper) {
      return ` ( Control Limit: ${answer.control_limit_lower} - ${answer.control_limit_upper} )`
    }
    if (answer.question_type == 1 &&
      answer.spec_limit_lower &&
      answer.spec_limit_upper) {
      return ` ( Spec Limit: ${answer.spec_limit_lower} - ${answer.spec_limit_upper} )`
    }
  }
  const $_setEffectText = () => {
    let _text
    answer.effects.forEach((effect, index) => {
      if (index == 0) {
        _text = effect.name
      } else {
        _text = _text + '、' + effect.name
      }
    })
    answer.factory_effects.forEach((effect, index) => {
      if (!_text) {
        _text = effect.name
      } else {
        _text = _text + '、' + effect.name
      }
    })
    return _text
  }

  const $_setIcon = () => {
    return S_CheckListRecordAns.getScoreIconV2(answer)
  }
  const $_setIconColor = () => {
    return S_CheckListRecordAns.getScoreIconColorV2(answer)
  }
  const $_checkRemark = () => {
    return S_CheckListRecordAns.validationRemark(answer)
  }

  // Functions
  const fetchQuestion = useCallback(async () => {
    if (done) {
      setLoading(false);
      return
    }
    if (answer?.id) {
      try {
        const res = await S_CheckListRecordAns.showV2({ modelId: answer.id });
        if (res) {
          setQuestion(res);
          setActs(res?.last_version?.article_versions || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  }, [answer?.id]);

  // Use effect for fetching question data when collapsed state changes
  useEffect(() => {
    if (!isCollapsed) {
      fetchQuestion();
    }
  }, [isCollapsed, fetchQuestion])

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={style}
      >
        <WsCard padding={16} color={cardColor}>


          <WsIconBtn
            name="md-visibility"
            size={30}
            style={{
              position: 'absolute',
              right: 4,
              top: 4,
              zIndex: 999
            }}
            onPress={() => {
              navigation.push('RoutesCheckList', {
                screen: 'CheckListQuestionRecordAnswerShow',
                params: {
                  id: answer.id,
                }
              })
            }}
          >
          </WsIconBtn>

          <WsFlex
            justifyContent="space-between"
            style={{
              marginBottom: 8
            }}
          >
            <WsFlex
              style={{
              }}
            >
              {
                (currentUser &&
                  checkboxVisible &&
                  answer.question_type == 2 &&
                  (answer.question_setting == null ||
                    answer.question_setting && answer.question_setting.checkers && answer.question_setting.checkers.length === 0 ||
                    answer &&
                    currentUser &&
                    answer.question_setting &&
                    answer.question_setting.checkers.some(checker => checker.id === currentUser.id))) ?
                  (
                    <CheckBox
                      boxType={'square'}
                      animationDuration={0}
                      disabled={false}
                      style={{ width: 20, height: 20, marginRight: 16 }}
                      value={checked ? checked : false}
                      onValueChange={newValue => {
                        answer.checked = newValue
                        checkboxOnPress(answer)
                      }}
                    />
                  ) : (
                    <View></View>
                  )}

              {answer.keypoint != undefined && answer.keypoint === 1 && (
                <WsTag
                  style={{
                    backgroundColor: $color.primary11l,
                    textColor: $color.primary
                  }}>
                  {t('重點關注')}
                </WsTag>
              )}
              {answer.is_in_stats != undefined && answer.is_in_stats === 0 && (
                <WsTag
                  style={{
                    backgroundColor: $color.yellow11l,
                  }}
                  textColor={$color.black}
                >
                  {t('不列入統計')}
                </WsTag>
              )}
            </WsFlex>

            {!done &&
              answer &&
              currentUser &&
              ((answer.question_setting &&
                currentUser &&
                answer.question_setting.checkers &&
                answer.question_setting.checkers.some(checker => checker.id === currentUser.id) || answer.question_setting == null) ||
                answer.question_setting.checkers && answer.question_setting.checkers.length === 0) &&
              !answer.answer_value &&
              (
                <WsFlex
                  style={{
                  }}>
                  <TouchableOpacity
                    testID={`${testID}-前往答題頁`}
                    onPress={onPress}
                  >
                    <WsTag
                      backgroundColor={$color.danger10l}
                      textColor={$color.danger}>
                      {t('前往答題頁')}
                    </WsTag>
                  </TouchableOpacity>
                </WsFlex>
              )}
          </WsFlex>

          <WsFlex alignItems="flex-start" justifyContent="space-between">
            <WsFlex
              alignItems="flex-start"
              style={{
                marginRight: 8,
              }}>
              <WsText size={14} style={{ marginRight: 8 }}>
                {answer.sequence}
                {' .'}
              </WsText>
              <WsText size={14} style={{ maxWidth: width * 0.5 }}>
                {answer.title}
              </WsText>
            </WsFlex>
          </WsFlex>

          <WsFlex
            style={{
              paddingTop: 8,
            }}
          >
            <WsIcon name={$_setIcon()} size={20} color={$_setIconColor()} />
            <WsText
              style={{
                marginLeft: 4,
              }}
              size={14}
              fontWeight="400"
            >
              {$_scoreText()}
              <WsDes>{$_scoreDes()}</WsDes>
            </WsText>
            <WsText
              style={{
                marginLeft: 8,
              }}
              size={14}
              fontWeight="600"
            >
              {answer.unit ? answer.unit : ''}
            </WsText>
          </WsFlex>

          {!answer.updated_user &&
            answer.question_setting &&
            answer.question_setting.checkers &&
            answer.question_setting.checkers.length > 0 && (
              <>
                <WsFlex>
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: 120,
                      marginLeft: 16,
                    }}
                    type="users"
                    label={t('答題者')}
                    labelSize={14}
                    isUri={true}
                    value={answer.question_setting.checkers}
                  />
                </WsFlex>
              </>
            )
          }

          {answer.updated_user && (
            <>
              <View
                style={{
                  marginTop: 16,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
              >
                <WsText
                  size={14}
                  fontWeight="400"
                  style={[
                    {
                      width: 68,
                    },
                  ]}
                >
                  {t('答題者')}
                </WsText>
                <View>
                  <WsFlex
                    style={{
                    }}
                  >
                    <WsAvatar
                      size={32}
                      isUri={true}
                      source={answer.updated_user.avatar ? answer.updated_user.avatar : null}
                      style={{
                        marginRight: 4
                      }}
                    />
                    <View
                      style={{
                        justifyContent: 'center',
                      }}
                    >
                      <WsFlex>
                        <WsText
                          size={12}
                          style={{
                          }}
                        >
                          {answer.updated_user.name}
                        </WsText>
                        {answer.updated_user && answer.updated_at &&
                          (
                            <WsFlex
                              style={{
                                paddingLeft: 8
                              }}
                            >
                              {answer.updated_at && (
                                <WsTag>
                                  {t('已完成')}
                                </WsTag>
                              )}
                            </WsFlex>
                          )}
                      </WsFlex>
                      {answer.updated_user && answer.updated_at &&
                        (
                          <WsDes
                            style={{
                            }}
                          >
                            {answer.updated_at ?
                              moment(answer.updated_at).format('YYYY-MM-DD HH:mm') :
                              null
                            }
                          </WsDes>
                        )}
                    </View>
                  </WsFlex>
                </View>
              </View>
            </>
          )}

          {answer.effects &&
            answer.effects.length != 0 && (
              <>
                <WsFlex
                  style={{
                  }}
                >
                  <WsIcon color={$color.danger} name="md-info-outline" />
                  <WsText
                    style={{
                      marginTop: 8,
                      marginLeft: 8,
                      marginRight: 8
                    }}
                    color={$color.danger}
                    size={14}
                    fontWeight="600"
                  >
                    {`${t('風險')}`}
                  </WsText>
                </WsFlex>
                <WsFlex>
                  <WsFlex
                    flexWrap={'wrap'}
                    style={{
                      width: width - 72
                    }}
                  >
                    {answer.effects &&
                      answer.effects.length > 0 &&
                      answer.effects.map((item, index) => (
                        <WsTag
                          key={index}
                          backgroundColor={$color.danger10l}
                          textColor={$color.danger}
                          style={{
                            marginTop: 4,
                            marginRight: 8
                          }}
                        >
                          {`${item.name}`}
                        </WsTag>
                      ))}
                    {answer.factory_effects &&
                      answer.factory_effects.length > 0 &&
                      answer.factory_effects.map((item, index) => (
                        <WsTag
                          key={index}
                          backgroundColor={$color.danger10l}
                          textColor={$color.danger}
                          style={{
                            marginTop: 4,
                            marginRight: 8
                          }}
                        >
                          {`${item.name}`}
                        </WsTag>
                      ))}
                  </WsFlex>
                </WsFlex>
              </>
            )}

          {$_checkRemark() &&
            !answer.remark &&
            (
              <>
                <WsFlex
                  style={{
                    marginTop: 4,
                    // borderWidth:1,
                  }}
                >
                  <WsIcon name={'ws-outline-edit'} size={16} color={$color.danger} />
                  <WsText
                    style={{
                      marginLeft: 8
                    }}
                    color={$color.danger}
                    size={12}>
                    {t('尚未填寫備註')}
                  </WsText>
                </WsFlex>
                <WsFlex
                  style={{
                    marginTop: 4,
                  }}
                >
                  <WsIcon name={'sc-liff-help-circle'} size={16} color={$color.danger} />
                  <WsText
                    style={{
                      marginLeft: 8
                    }}
                    color={$color.danger}
                    size={12}>
                    {t('必填資料尚未填寫完整')}
                  </WsText>
                </WsFlex>
              </>

            )
          }

          {isCollapsed && answer.images && answer.images.length > 0 && (
            <WsInfo
              style={{
                marginTop: 8,
              }}
              label={t('相關圖片')}
              type="filesAndImages"
              value={answer.images}>
            </WsInfo>
          )}

          <WsCollapsible isCollapsed={isCollapsed}>
            <View
              style={{
              }}>
              {question &&
                question.remark && (
                  <WsInfo
                    style={{
                      marginTop: 8
                    }}
                    label={t('備註')}
                    value={
                      question.remark
                        ? question.remark
                        : t('無')
                    }
                  />
                )}

              {/* 250523-issue */}
              {question &&
                question.file_images &&
                question.file_images.length > 0 && (
                  <WsInfo
                    label={t('附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.file_images}
                  />
                )}

              {question &&
                question.ocap_remark && (
                  <WsInfo
                    labelWidth={60}
                    style={{
                      marginTop: 8,
                    }}
                    label="OCAP"
                    value={
                      question.ocap_remark
                        ? question.ocap_remark
                        : t('無')
                    }
                  />
                )}

              {question &&
                question.ocap_attaches &&
                question.ocap_attaches.length > 0 && (
                  <WsInfo
                    label={t('OCAP相關附件')}
                    type="filesAndImages"
                    style={{
                      marginTop: 8
                    }}
                    value={question.last_version.ocap_attaches}
                  />
                )}

              {answer.remark && (
                <WsInfo
                  style={{
                    marginTop: 8
                  }}
                  label={t('備註')}
                  value={answer.remark ? answer.remark : t('無')}
                />
              )}

              {answer.images && answer.images.length > 0 && (
                <WsFlex
                  style={{
                    width: width,
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    style={{
                      marginTop: 8,
                    }}
                    label={t('相關圖片')}
                    type="filesAndImages"
                    value={answer.images}>
                  </WsInfo>
                </WsFlex>
              )}

              {answer.file_images && answer.file_images.length > 0 && (
                <WsFlex
                  style={{
                    width: width,
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    style={{
                      marginTop: 8,
                    }}
                    label={t('相關圖片')}
                    type="filesAndImages"
                    value={answer.file_images}>
                  </WsInfo>
                </WsFlex>
              )}

              {((answer.article_versions &&
                answer.article_versions.length != 0) ||
                (acts &&
                  acts.length != 0)) && (
                  <WsFlex
                    style={{
                      marginTop: 8,
                    }}>
                    <WsText
                      style={{
                        marginRight: 16,
                      }}
                      size={14}
                      fontWeight={'600'}
                    >
                      {t('法規依據')}
                    </WsText>
                  </WsFlex>
                )}

              {question &&
                question.act_version_alls &&
                question.act_version_alls.length != 0 && (
                  <>
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 8,
                        backgroundColor: $color.white,
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                      }}>
                      <View
                        style={{
                          flexDirection: 'row'
                        }}>
                        <WsIcon name={'ll-nav-law-outline'} size={24} />
                        <WsText size={14}>{t('法規依據')}</WsText>
                      </View>
                      {question.act_version_alls.map(
                        (article, articleIndex) => {
                          return (
                            <WsInfo
                              style={{
                                marginTop: 8
                              }}
                              type="link"
                              value={
                                article.name
                              }
                              onPress={() => {
                                navigation.push('RoutesAct', {
                                  screen: 'ActShow',
                                  params: {
                                    id: article.act.id,
                                  }
                                })
                              }}
                            />
                          )
                        }
                      )}
                    </WsPaddingContainer>
                  </>
                )}

              <View
                style={{
                }}
              >
                {loading &&
                  <WsLoading type="b" ></WsLoading>
                }
                {!loading &&
                  acts &&
                  acts.length != 0 && (
                    <>
                      {acts.map((article, articleIndex) => {
                        return (
                          <>
                            <TouchableOpacity
                              style={{
                              }}
                              onPress={() => {
                                setStateModal(true)
                                setSelectVersionId(article.id)
                              }}>
                              <WsInfo
                                type="link"
                                value={$_setArticleText(article)}
                                style={{
                                }}
                                onPress={() => {
                                  setSelectVersionId(article.id)
                                  setStateModal(true)
                                }}
                              />
                            </TouchableOpacity>
                          </>
                        )
                      })}
                    </>
                  )}

                {answer.checklist_question_template &&
                  answer.checklist_question_template.last_version &&
                  answer.checklist_question_template.last_version.article_versions &&
                  answer.checklist_question_template.last_version.article_versions.length > 0 && (
                    <WsFlex
                      style={{
                        marginTop: 8,
                      }}>
                      <WsIcon name="ll-nav-law-filled" size={24} />
                      <WsText style={{ marginLeft: 4 }} size={14} fontWeight={'600'}>
                        {t('法規依據')}
                      </WsText>
                    </WsFlex>
                  )}
              </View>

              <View
                style={{
                }}
              >
                {answer.article_versions &&
                  answer.article_versions.length != 0 && (
                    <>
                      {answer.article_versions.map((article, articleIndex) => {
                        return (
                          <>
                            <TouchableOpacity
                              style={{
                              }}
                              onPress={() => {
                                setStateModal(true)
                                setSelectVersionId(article.id)
                              }}>
                              <WsInfo
                                type="link"
                                value={$_setArticleText(article)}
                                style={{
                                }}
                                onPress={() => {
                                  setStateModal(true)
                                  setSelectVersionId(article.id)
                                }}
                              />
                            </TouchableOpacity>
                          </>
                        )
                      })}
                    </>
                  )}

                {answer.checklist_question_template &&
                  answer.checklist_question_template.last_version &&
                  answer.checklist_question_template.last_version.article_versions &&
                  answer.checklist_question_template.last_version.article_versions.length > 0 && (
                    <WsFlex
                      style={{
                        marginTop: 8,
                        // borderWidth:1,
                      }}>
                      <WsIcon name="ll-nav-law-filled" size={24} />
                      <WsText style={{ marginLeft: 4 }} size={14} fontWeight={'600'}>
                        {t('法規依據')}
                      </WsText>
                    </WsFlex>
                  )}
              </View>

              <WsFlex>
                {answer.checklist_question_template &&
                  answer.checklist_question_template.last_version &&
                  answer.checklist_question_template.last_version.article_versions &&
                  answer.checklist_question_template.last_version.article_versions.length > 0 && (
                    <>
                      {answer.checklist_question_template.last_version.article_versions.map((article, articleIndex) => {
                        return (
                          <>
                            <TouchableOpacity
                              onPress={() => {
                                setStateModal(true)
                                setSelectVersionId(article.id)
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center'
                                }}>
                                <WsInfo
                                  type="link"
                                  value={$_setArticleText(article)}
                                  style={{
                                    marginTop: 8,
                                    marginLeft: 28,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 4
                                  }}
                                  onPress={() => {
                                    setStateModal(true)
                                    setSelectVersionId(article.id)
                                  }}
                                />
                              </View>
                            </TouchableOpacity>
                          </>
                        )
                      })}
                    </>
                  )}
              </WsFlex>
            </View>
          </WsCollapsible>
        </WsCard>
      </TouchableOpacity>
      <WsModal
        title={t('法規依據')}
        visible={stateModal}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        onBackButtonPress={() => {
          setStateModal(false)
        }}>
        <ViewArticleShowForModal versionId={selectVersionId} />
      </WsModal>
    </>
  )
}

export default LlCheckListRecordAnswerCard001
