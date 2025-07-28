import React from 'react'
import {
  ScrollView,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions
} from 'react-native'
import {
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsInfoImage,
  WsIcon,
  WsModal,
  LlBtnAct001,
  WsCollapsible,
  WsEmpty,
  LlRelatedGuidelineItem001
} from '@/components'
import { LlInfoContainer001, LlIconCard001 } from '@/components'
import { WsPreviewImage001 } from '@/components/seed'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListQuestionVersion from '@/services/api/v1/checklist_question_version';
import S_url from '@/__reactnative_stone/services/app/url'
import gColor from '@/__reactnative_stone/global/color'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { LocaleConfig } from 'react-native-calendars'
import ViewActShow from '@/views/Act/Show'
import { changeLanguage } from 'i18next'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'

const RecordAnswerShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
  } = route.params

  // State
  const [relatedTemplateCollapsed, setRelatedTemplateCollapsed] = React.useState(true)
  const [checkListQuestion, setCheckListQuestion] = React.useState(null)

  const [specLimitAttach, setSpecLimitAttach] = React.useState(null)
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()
  const [modalAct, setModalAct] = React.useState(false)
  const [actId, setActId] = React.useState()

  // Services
  const $_fetchCheckListQuestion = async () => {
    try {
      const res = await S_CheckListRecordAns.showV2({ modelId: id });
      if (res) {
        setCheckListQuestion(res)
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Function
  const $_getSpecLimitAttaches = () => {
    const attaches = []
    if (checkListQuestion) {
      if (
        checkListQuestion.file_attaches &&
        checkListQuestion.file_attaches.length > 0 &&
        checkListQuestion.template_attaches &&
        checkListQuestion.template_attaches.length != 0
      ) {
        checkListQuestion.template_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        checkListQuestion.file_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      } else if (
        checkListQuestion &&
        checkListQuestion.file_attaches &&
        checkListQuestion.file_attaches.length != 0
      ) {
        checkListQuestion.file_attaches.forEach(image => {
          const name = S_url.getFileName(image)
          attaches.push({
            name: name,
            source: image
          })
        })
        return attaches
      }
      else {
        return null
      }
    }
  }

  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  React.useEffect(() => {
    $_fetchCheckListQuestion()
  }, [])

  return (
    <>
      {checkListQuestion && (
        <ScrollView
          testID={'ScrollView'}
        >
          <LlInfoContainer001>
            {checkListQuestion &&
              checkListQuestion.title && (
                <WsInfo
                  label={t('標題')}
                  value={checkListQuestion.title}
                />
              )
            }

            {checkListQuestion &&
              checkListQuestion.keypoint != undefined &&
              checkListQuestion.keypoint == 1 && (
                <WsFlex>
                  <WsTag
                    style={{
                      marginTop: 16
                    }}>
                    {t('重點關注')}
                  </WsTag>
                </WsFlex>
              )}
          </LlInfoContainer001>

          <LlInfoContainer001
            style={{
              marginTop: 8,
            }}
          >
            {checkListQuestion &&
              checkListQuestion.is_in_stats !== null && (
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                  label={t('列入結果統計、不合規排行榜、今日點檢結論')}
                  value={checkListQuestion.is_in_stats ? `${t('是')}` : `${t('否')}`}
                />
              )}
          </LlInfoContainer001>

          <LlInfoContainer001
            style={{
              marginTop: 8
            }}
          >
            {checkListQuestion &&
              checkListQuestion.question_type_setting &&
              checkListQuestion.question_type_setting.name && (
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  label={t('題型')}
                  value={checkListQuestion.question_type_setting.name}
                />
              )
            }
          </LlInfoContainer001>

          {checkListQuestion &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.name &&
            checkListQuestion.answer_setting.type != 'single-choice' && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('條件設定方式')}
                  type="text"
                  value={t(checkListQuestion.answer_setting.name)}
                  style={{
                  }}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.type === 'control-limit' &&
            checkListQuestion.record_answer_items &&
            checkListQuestion.record_answer_items.length == 1 &&
            checkListQuestion.record_answer_items[0] && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('條件設定')}
                  type="text"
                  value={' '}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <WsInfo
                    label={`${t('Control Limit (管制界線)')}`}
                    type="text"
                    value={`${checkListQuestion.record_answer_items[0].control_limit_lower} - ${checkListQuestion.record_answer_items[0].control_limit_upper}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  />
                  <WsInfo
                    label={`${t('Spec Limit (合規界線)')}`}
                    type="text"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={`${checkListQuestion.record_answer_items[0].spec_limit_lower} - ${checkListQuestion.record_answer_items[0].spec_limit_upper}`}
                  />
                </LlInfoContainer001>
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.type === 'custom-num' &&
            checkListQuestion.record_answer_items &&
            checkListQuestion.record_answer_items.length >= 2 && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('條件設定')}
                  type="text"
                  value={' '}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <LlInfoContainer001
                  style={{
                  }}>
                  {checkListQuestion.record_answer_items.map((question_setting_item, index) => {
                    return (
                      <WsInfo
                        label={` `}
                        type="text"
                        value={
                          question_setting_item.value_operator === 'lt' ?
                            `${t('當')} ${t('小於 <')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                            question_setting_item.value_operator === 'lte' ?
                              `${t('當')} ${t('小於等於 ≦')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                              question_setting_item.value_operator === 'gt' ?
                                `${t('當')} ${t('大於 >')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                question_setting_item.value_operator === 'gte' ?
                                  `${t('當')} ${t('大於等於 ≧')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                  question_setting_item.value_operator === 'in' ?
                                    `${t('當')} ${t('介於')} ${question_setting_item.limit_lower} ${t('與')} ${question_setting_item.limit_upper} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                    question_setting_item.value_operator === 'eq' ?
                                      `${t('當')} ${t('等於 =')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                      question_setting_item.value_operator === 'neq' ?
                                        `${t('當')} ${t('不等於 ≠')} ${question_setting_item.value} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                        question_setting_item.value_operator === 'not_in' ?
                                          `${t('當')} ${t('不介於')} ${question_setting_item.limit_lower} ${t('與')} ${question_setting_item.limit_upper} ${t('符合')} ${t(S_CheckListQuestion.getRiskText(question_setting_item.risk_level))}` :
                                          ""
                        }
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      />
                    )
                  }
                  )}
                </LlInfoContainer001>
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.question_type_setting &&
            checkListQuestion.question_type_setting.value === 'single-choice' &&
            checkListQuestion.record_answer_items && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('選項設定')}
                  type="text"
                  value={' '}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <LlInfoContainer001
                  style={{
                    marginTop: 8,
                    padding: 0
                  }}
                >
                  {checkListQuestion.record_answer_items &&
                    checkListQuestion.record_answer_items.length > 0 &&
                    checkListQuestion.record_answer_items.map((question_setting_item, index) => {
                      if (!question_setting_item.record_answer_items) {
                        return (
                          <WsInfo
                            label={`${t(question_setting_item.name)}：`}
                            type="text"
                            value={
                              question_setting_item.has_remark && question_setting_item.risk_level ?
                                `${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)} / ${t('選答時要求必填備註')}` :
                                question_setting_item.risk_level ?
                                  `${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)}` :
                                  question_setting_item.has_remark ?
                                    `${t('選答時要求必填備註')}` :
                                    ""
                            }
                            style={{
                              flexDirection: 'row'
                            }}
                          />
                        )
                      } else if (question_setting_item.record_answer_items && question_setting_item.record_answer_items.length > 0) {
                        return (
                          <>
                            <WsInfo
                              label={`${t(question_setting_item.name)}：`}
                              type="text"
                              value={
                                ' '
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                            <LlInfoContainer001
                              style={{
                                padding: 0,
                                borderLeftWidth: 2,
                                marginLeft: 4,
                                // borderWidth:1,
                              }}>
                              {question_setting_item.record_answer_items.map((question_setting_item, index) => {
                                return (
                                  <WsInfo
                                    label={`${t(question_setting_item.name)}：`}
                                    type="text"
                                    value={
                                      question_setting_item.has_remark != undefined && question_setting_item.risk_level ?
                                        `${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)} / ${t('選答時要求必填備註')}` :
                                        `${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)} / ${t('選答時要求必填備註')}`
                                    }
                                    style={{
                                      paddingLeft: 4,
                                    }}
                                  />
                                )
                              })}
                            </LlInfoContainer001>
                          </>
                        )
                      }
                    })}
                </LlInfoContainer001>
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.unit && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('單位')}
                  type="text"
                  value={checkListQuestion.unit}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.question_type &&
            checkListQuestion.question_type == 1 &&
            checkListQuestion.control_limit_lower != undefined &&
            checkListQuestion.control_limit_upper != undefined &&
            checkListQuestion.spec_limit_lower != undefined &&
            checkListQuestion.spec_limit_upper != undefined && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={`${t('Control Limit (管制界線)')}`}
                  type="text"
                  value={`${checkListQuestion.control_limit_lower} - ${checkListQuestion.control_limit_upper}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <WsInfo
                  label={`${t('Spec Limit (合規界線)')}`}
                  type="text"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={`${checkListQuestion.spec_limit_lower} - ${checkListQuestion.spec_limit_upper}`}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.question_remark && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  textColor={checkListQuestion.question_remark ? $color.black : $color.gray}
                  label={t('合規標準')}
                  value={
                    checkListQuestion.question_remark
                      ? checkListQuestion.question_remark
                      : t('無')
                  }
                />
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.template_attaches &&
                  checkListQuestion.template_attaches.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.template_attaches}
                    />
                  )}
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.file_attaches &&
                  checkListQuestion.file_attaches.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.file_attaches}
                    />
                  )}
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.file_question_images &&
                  checkListQuestion.file_question_images.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.file_question_images}
                    />
                  )}
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.file_question_attaches &&
                  checkListQuestion.file_question_attaches.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.file_question_attaches}
                    />
                  )}
              </LlInfoContainer001>
            )}

          {(checkListQuestion &&
            (checkListQuestion?.ocap_remark ||
              (checkListQuestion?.file_ocap_attaches &&
                checkListQuestion?.file_ocap_attaches.length > 0))
          ) && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  testID={'OCAP'}
                  style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  textColor={checkListQuestion?.ocap_remark ? $color.black : $color.black}
                  label={t("OCAP")}
                  value={checkListQuestion?.ocap_remark
                    ? checkListQuestion.ocap_remark
                    : t('無')
                  }
                />
                {checkListQuestion &&
                  checkListQuestion.file_ocap_attaches &&
                  checkListQuestion.file_ocap_attaches.length > 0 &&
                  (
                    <WsInfo
                      testID={'OCAP附件'}
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.file_ocap_attaches}
                    />
                  )}
              </LlInfoContainer001>
            )
          }

          {((
            (
              checkListQuestion &&
              checkListQuestion &&
              checkListQuestion.article_versions &&
              checkListQuestion.article_versions.length > 0
            ) ||
            (
              checkListQuestion &&
              checkListQuestion &&
              checkListQuestion.act_version_alls &&
              checkListQuestion.act_version_alls.length > 0
            ))
          ) && (
              <LlInfoContainer001
                style={{
                  marginTop: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <WsText size={14} fontWeight={'600'}>
                    {t('法規依據')}
                  </WsText>
                </View>
                {/* 關聯法規 */}
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.act_version_alls &&
                  checkListQuestion.act_version_alls.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.act_version_alls}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                          return (
                            <>
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.push('RoutesAct', {
                                    screen: 'ActShow',
                                    params: {
                                      id: item.act.id,
                                    }
                                  })
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    marginTop: 8
                                  }}>
                                  <WsInfo
                                    testID={`法條-${index}`}
                                    type="link"
                                    value={item.name}
                                    style={{
                                    }}
                                    onPress={() => {
                                      navigation.push('RoutesAct', {
                                        screen: 'ActShow',
                                        params: {
                                          id: item.act.id,
                                        }
                                      })
                                    }}
                                  />
                                </View>
                              </TouchableOpacity>
                            </>
                          )
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <WsEmpty />
                          )
                        }}
                      />
                    </>
                  )}
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.article_versions &&
                  checkListQuestion.article_versions.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.article_versions}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                          return (
                            <>
                              <TouchableOpacity
                                onPress={() => {
                                  setModalArticle(true)
                                  setArticleVersionId(item.id)
                                }}>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                  }}>
                                  <WsInfo
                                    testID={`法條-${index}`}
                                    type="link"
                                    value={$_setArticleText(item)}
                                    style={{
                                      maxWidth: width * 0.8
                                    }}
                                    onPress={() => {
                                      setModalArticle(true)
                                      setArticleVersionId(item.id)
                                    }}
                                  />
                                </View>
                              </TouchableOpacity>
                            </>
                          )
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <WsEmpty />
                          )
                        }}
                      />
                    </>
                  )}
              </LlInfoContainer001>
            )}

          {((checkListQuestion &&
            checkListQuestion &&
            checkListQuestion.effects &&
            checkListQuestion.effects.length > 0) || (
              checkListQuestion &&
              checkListQuestion &&
              checkListQuestion.factory_effects &&
              checkListQuestion.factory_effects.length > 0
            )) && (
              <LlInfoContainer001
                style={{
                  padding: 0,
                  paddingHorizontal: 16,
                  paddingBottom: 8,
                }}>
                <WsFlex
                  flexWrap="wrap"
                >
                  {checkListQuestion &&
                    checkListQuestion &&
                    checkListQuestion.effects &&
                    checkListQuestion.effects.length > 0 && (
                      <WsFlex
                        flexWrap="wrap"
                      >
                        {checkListQuestion.effects.map(r => (
                          <>
                            <View
                              style={{
                                marginTop: 8,
                                backgroundColor: $color.danger10l,
                                borderRadius: 10,
                                paddingHorizontal: 16,
                                paddingVertical: 4,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 8
                              }}>
                              <WsFlex>
                                <Image
                                  style={{
                                    width: 14,
                                    height: 14,
                                    marginRight: 4,
                                  }}
                                  source={{ uri: r.icon }}
                                />
                                <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                              </WsFlex>
                            </View>
                          </>
                        ))}
                      </WsFlex>
                    )}
                  {checkListQuestion &&
                    checkListQuestion &&
                    checkListQuestion.factory_effects &&
                    checkListQuestion.factory_effects.length > 0 && (
                      <WsFlex
                        flexWrap="wrap"
                        style={{
                        }}
                      >
                        {checkListQuestion.factory_effects.map((r, index) => (
                          <>
                            <View
                              style={{
                                marginTop: index > 2 ? 8 : 0,
                                backgroundColor: $color.danger10l,
                                borderRadius: 10,
                                paddingHorizontal: 16,
                                paddingVertical: 4,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 8
                              }}>
                              {r.icon && (
                                <Image
                                  style={{
                                    width: 14,
                                    height: 14,
                                    marginRight: 4,
                                  }}
                                  source={{ uri: r.icon }}
                                />
                              )}
                              <WsText color={$color.danger} size={12} fontWeight={500}>{r.name}</WsText>
                            </View>
                          </>
                        ))}
                      </WsFlex>
                    )}
                </WsFlex>
              </LlInfoContainer001>
            )
          }

          {(checkListQuestion &&
            checkListQuestion.related_guidelines &&
            checkListQuestion.related_guidelines.length > 0) && (
              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  marginTop: 8,
                  backgroundColor: $color.white,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <WsText size={14} fontWeight={'600'} style={{}}>
                    {t('相關內規')}
                  </WsText>
                </View>
                {checkListQuestion &&
                  checkListQuestion &&
                  checkListQuestion.related_guidelines &&
                  checkListQuestion.related_guidelines.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.related_guidelines}
                        keyExtractor={item => item.id}
                        renderItem={({ item, index }) => {
                          return (
                            <LlRelatedGuidelineItem001
                              key={index}
                              item={item}
                            />
                          );
                        }}
                        ListEmptyComponent={() => {
                          return (
                            <WsEmpty />
                          )
                        }}
                      />
                    </>
                  )}
              </WsPaddingContainer>
            )}

          {checkListQuestion.checklist_question_template_version &&
            checkListQuestion.checklist_question_template_version.title && (
              <>
                <LlInfoContainer001
                  style={{
                    marginTop: 8
                  }}>
                  <WsText size={14} fontWeight={600} color={$color.black}>{t('關聯題目')}</WsText>
                  <LlBtnAct001
                    style={{
                      marginTop: 16,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: relatedTemplateCollapsed ? 10 : 0,
                      borderBottomRightRadius: relatedTemplateCollapsed ? 10 : 0,
                    }}
                    onPress={() => {
                      setRelatedTemplateCollapsed(!relatedTemplateCollapsed)
                    }}
                  >
                    <WsText
                      style={{
                        paddingHorizontal: 16,
                      }}
                      color={$color.primary3l}
                    >{t(checkListQuestion.checklist_question_template_version.title)}
                    </WsText>
                    <WsIcon
                      name={relatedTemplateCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  <WsCollapsible isCollapsed={relatedTemplateCollapsed}>
                    <WsPaddingContainer
                      padding={16}
                      style={{
                        backgroundColor: $color.primary11l
                      }}>
                      <WsInfo
                        labelIcon={'ws-outline-reminder'}
                        label={t('合規標準')}
                        style={{

                        }}
                        value={
                          checkListQuestion.checklist_question_template_version.remark
                            ? checkListQuestion.checklist_question_template_version.remark
                            : t('無')
                        } />
                      {checkListQuestion &&
                        checkListQuestion.checklist_question_template_version &&
                        checkListQuestion.checklist_question_template_version.article_versions &&
                        checkListQuestion.checklist_question_template_version.article_versions.length != 0 && (
                          <LlInfoContainer001
                            style={{
                              padding: 0,
                              marginTop: 8,
                              backgroundColor: $color.primary11l,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                              }}>
                              <WsIcon
                                name={'ll-nav-law-outline'}
                                size={24}
                                style={{
                                  marginRight: 8
                                }}
                              />
                              <WsText size={14} fontWeight={'600'}>
                                {t('法規依據')}
                              </WsText>
                            </View>
                            {checkListQuestion &&
                              checkListQuestion.checklist_question_template_version &&
                              checkListQuestion.checklist_question_template_version.article_versions &&
                              checkListQuestion.checklist_question_template_version.article_versions.length > 0 && (
                                <>
                                  <FlatList
                                    data={checkListQuestion.checklist_question_template_version.article_versions}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item, index }) => {
                                      return (
                                        <>
                                          <TouchableOpacity
                                            onPress={() => {
                                              setModalArticle(true)
                                              setArticleVersionId(item.id)
                                            }}>
                                            <View
                                              style={{
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center'
                                              }}>
                                              <WsInfo
                                                testID={`法條-${index}`}
                                                type="link"
                                                value={$_setArticleText(item)}
                                                style={{
                                                  justifyContent: 'center',
                                                  alignItems: 'center',
                                                  marginRight: 4
                                                }}
                                                onPress={() => {
                                                  setModalArticle(true)
                                                  setArticleVersionId(item.id)
                                                }}
                                              />
                                            </View>
                                          </TouchableOpacity>
                                        </>
                                      )
                                    }}
                                    ListEmptyComponent={() => {
                                      return (
                                        <WsEmpty />
                                      )
                                    }}
                                  />
                                </>
                              )}
                            {checkListQuestion.checklist_question_template_version &&
                              checkListQuestion.checklist_question_template_version.effects &&
                              checkListQuestion.checklist_question_template_version.effects.map(r => (
                                <>
                                  <View
                                    style={{
                                      marginTop: 16,
                                      backgroundColor: $color.danger10l,
                                      borderRadius: 10,
                                      width: 100,
                                      height: 100,
                                      flexDirection: 'column',
                                      justifyContent: 'center',
                                      alignItems: 'center'
                                    }}>
                                    <Image
                                      style={{
                                        width: 50,
                                        height: 50
                                      }}
                                      source={{ uri: r.icon }}
                                    />
                                    <WsText color={$color.danger}>{r.name}</WsText>
                                  </View>
                                </>
                              ))}
                          </LlInfoContainer001>
                        )}

                    </WsPaddingContainer>
                  </WsCollapsible>
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                      marginTop: 16,
                    }}
                  >
                    <WsIcon
                      name={'bih-warning-outline'}
                      size={18}
                    >
                    </WsIcon>
                    <WsText
                      size={12}
                      style={{
                        maxWidth: width * 0.85,
                        // borderWidth:1,
                      }}
                      color={$color.gray}
                    >
                      {t('當關聯題目有更新版本時，您將會收到通知提醒，讓您可以參考公版題目來更新您的題目。若您不再需要參考此關聯題目，您可以解除綁定。')}
                    </WsText>
                  </WsFlex>
                </LlInfoContainer001>
              </>
            )}

          <View
            style={{
              height: 100
            }}
          ></View>
        </ScrollView>
      )}

      <WsModal
        title={t('法條依據')}
        visible={modalArticle}
        headerLeftOnPress={() => {
          setModalArticle(false)
        }}
        onBackButtonPress={() => {
          setModalArticle(false)
        }}>
        <ViewArticleShowForModal
          versionId={articleVersionId}
        />
      </WsModal>
    </>
  )
}

export default RecordAnswerShow
