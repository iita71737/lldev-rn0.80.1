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
  WsLoading,
  WsSkeleton,
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

const CheckListQuestionTemplateShow = ({ navigation, route, id: propsId }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const id = propsId || route?.params?.id;
  const simplifyInfo = route?.params?.simplifyInfo

  console.log(simplifyInfo, 'simplifyInfo---');

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
    const res = await S_CheckListQuestion.showV2({
      modelId: id
    })
    setCheckListQuestion(res)
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
      {checkListQuestion ? (
        <ScrollView
          testID={'ScrollView'}
        >
          <LlInfoContainer001>
            {checkListQuestion.last_version &&
              checkListQuestion.last_version.title && (
                <WsText
                  size={18}
                  fontWeight={600}
                >
                  {checkListQuestion.last_version.title}
                </WsText>
              )
            }

            {checkListQuestion.last_version &&
              checkListQuestion.last_version.keypoint != undefined &&
              checkListQuestion.last_version.keypoint == 1 && (
                <WsFlex>
                  <WsTag
                    style={{
                      marginTop: 8
                    }}>
                    {t('重點關注')}
                  </WsTag>
                </WsFlex>
              )}
          </LlInfoContainer001>

          {checkListQuestion && (
            <View
              style={{
                marginTop: 8,
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              {checkListQuestion.updated_user?.avatar && (
                <WsAvatar
                  size={40}
                  source={checkListQuestion.updated_user?.avatar}
                />
              )}
              {checkListQuestion.updated_user?.name &&
                checkListQuestion.updated_at && (
                  <View
                    style={{
                      marginLeft: 8
                    }}>
                    <WsText color={$color.gray}>
                      {t(checkListQuestion.updated_user?.name)}
                    </WsText>
                    <WsText color={$color.gray}>
                      {t('編輯時間')}{' '}
                      {moment(checkListQuestion.updated_at).format(
                        'YYYY-MM-DD HH:MM'
                      )}
                    </WsText>
                  </View>
                )
              }
            </View>
          )}

          {!simplifyInfo && (
            <LlInfoContainer001
              style={{
                marginTop: 8,
              }}
            >
              {checkListQuestion.last_version &&
                checkListQuestion.last_version.is_in_stats !== null && (
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                    label={t('列入結果統計、不合規排行榜、今日點檢結論')}
                    value={checkListQuestion.last_version.is_in_stats ? t('是') : t('否')}
                  />
                )}
            </LlInfoContainer001>
          )}


          {!simplifyInfo && (
            <LlInfoContainer001
              style={{
                marginTop: 8
              }}
            >
              {checkListQuestion.last_version &&
                checkListQuestion.last_version.question_type_setting &&
                checkListQuestion.last_version.question_type_setting.name && (
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('題型')}
                    value={checkListQuestion.last_version.question_type_setting.name}
                  />
                )
              }
            </LlInfoContainer001>
          )}


          {checkListQuestion &&
            checkListQuestion.last_version &&
            checkListQuestion.last_version.answer_setting &&
            checkListQuestion.last_version.answer_setting.name &&
            checkListQuestion.last_version.answer_setting.type != 'single-choice' &&
            !simplifyInfo && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('條件設定方式')}
                  type="text"
                  value={t(checkListQuestion.last_version.answer_setting.name)}
                  style={{
                  }}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.last_version &&
            checkListQuestion.last_version.answer_setting &&
            checkListQuestion.last_version.answer_setting.type === 'control-limit' &&
            checkListQuestion.last_version.question_setting_items &&
            checkListQuestion.last_version.question_setting_items.length == 1 &&
            checkListQuestion.last_version.question_setting_items[0] &&
            !simplifyInfo && (
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
                    label={`Control Limit（${t('管制界線')}）`}
                    type="text"
                    value={`${checkListQuestion.last_version.question_setting_items[0].control_limit_lower} - ${checkListQuestion.last_version.question_setting_items[0].control_limit_upper}`}
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
                    value={`${checkListQuestion.last_version.question_setting_items[0].spec_limit_lower} - ${checkListQuestion.last_version.question_setting_items[0].spec_limit_upper}`}
                  />
                </LlInfoContainer001>
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.last_version &&
            checkListQuestion.last_version.answer_setting &&
            checkListQuestion.last_version.answer_setting.type === 'custom-num' &&
            checkListQuestion.last_version.question_setting_items &&
            !simplifyInfo &&
            (
              <LlInfoContainer001
                style={{
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
                    padding: 0
                  }}>
                  {checkListQuestion.last_version.question_setting_items.map((question_setting_item, index) => {
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
            checkListQuestion.last_version &&
            checkListQuestion.last_version.question_type_setting &&
            checkListQuestion.last_version.question_type_setting.value === 'single-choice' &&
            checkListQuestion.last_version.question_setting_items &&
            !simplifyInfo && (
              <LlInfoContainer001
                style={{
                  marginTop: 8,
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
                    padding: 0,
                    // borderWidth:1,
                  }}>
                  {checkListQuestion.last_version.question_setting_items &&
                    checkListQuestion.last_version.question_setting_items.length > 0 &&
                    checkListQuestion.last_version.question_setting_items.map((question_setting_item, index) => {
                      if (!question_setting_item.question_setting_items) {
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
                              // borderWidth:2,
                            }}
                          />
                        )
                      } else if (question_setting_item.question_setting_items && question_setting_item.question_setting_items.length > 0) {
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
                              }}
                            >
                              {question_setting_item.question_setting_items.map((question_setting_item, index) => {
                                return (
                                  <WsInfo
                                    label={`${t(question_setting_item.name)}：`}
                                    type="text"
                                    value={
                                      question_setting_item.has_remark != undefined && question_setting_item.risk_level ?
                                        ` ${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)} / ${t('選答時要求必填備註')}` :
                                        ` ${S_CheckListQuestion.getRiskText(question_setting_item.risk_level)} / ${t('選答時要求必填備註')}`
                                    }
                                    style={{
                                      paddingLeft: 2,
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
            checkListQuestion.last_version &&
            checkListQuestion.last_version.unit && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('單位')}
                  type="text"
                  value={checkListQuestion.last_version.unit}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion.question_type &&
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
                  label={`Control Limit（${t('管制界線')}）`}
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
            checkListQuestion.last_version && (
              <LlInfoContainer001
                style={{
                  marginTop: 8,
                }}>
                <WsInfo
                  style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                  iconColor={$color.black}
                  textColor={checkListQuestion.last_version.remark ? $color.black : $color.gray}
                  labelIcon={'ws-outline-reminder'}
                  label={t('合規標準')}
                  value={
                    checkListQuestion.last_version.remark
                      ? checkListQuestion.last_version.remark
                      : t('無')
                  }
                />
                {checkListQuestion &&
                  checkListQuestion.last_version &&
                  checkListQuestion.last_version.template_attaches &&
                  checkListQuestion.last_version.template_attaches.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.last_version.template_attaches}
                    />
                  )}
                {checkListQuestion &&
                  checkListQuestion.last_version &&
                  checkListQuestion.last_version.file_attaches &&
                  checkListQuestion.last_version.file_attaches.length > 0 && (
                    <WsInfo
                      type="filesAndImages"
                      style={{
                        marginTop: 8
                      }}
                      value={checkListQuestion.last_version.file_attaches}
                    />
                  )}
              </LlInfoContainer001>
            )}

          {/* {checkListQuestion &&
            checkListQuestion.last_version &&
            checkListQuestion.last_version.ocap_remark && ( */}
          <LlInfoContainer001
            style={{
              marginTop: 8
            }}>
            <WsInfo
              style={{
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              iconColor={$color.black}
              labelIcon={"ws-outline-help-outline"}
              textColor={checkListQuestion.last_version.ocap_remark ? $color.black : $color.gray}
              label="OCAP"
              value={checkListQuestion.last_version.ocap_remark
                ? checkListQuestion.last_version.ocap_remark
                : t('無')
              }
            />
            {checkListQuestion &&
              checkListQuestion.last_version &&
              checkListQuestion.last_version.file_ocap_attaches &&
              checkListQuestion.last_version.file_ocap_attaches.length > 0 &&
              (
                <WsInfo
                  testID={'OCAP附件'}
                  type="filesAndImages"
                  style={{
                    marginTop: 8
                  }}
                  value={checkListQuestion.last_version.file_ocap_attaches}
                />
              )}
          </LlInfoContainer001>
          {/* )
          } */}

          {!!(
            (
              checkListQuestion &&
              checkListQuestion.last_version &&
              checkListQuestion.last_version.article_versions &&
              checkListQuestion.last_version.article_versions.length > 0
            ) ||
            (
              checkListQuestion &&
              checkListQuestion.last_version &&
              checkListQuestion.last_version.act_version_alls &&
              checkListQuestion.last_version.act_version_alls.length > 0
            )
          ) && (
              <LlInfoContainer001
                style={{
                  marginTop: 8,
                  flex: 1,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <WsIcon
                    color={$color.black}
                    name="ll-nav-law-filled"
                    size={20}
                    style={{
                      marginRight: 4
                    }}
                  />
                  <WsText
                    size={14}
                    fontWeight={'600'}
                  >
                    {t('法規依據')}
                  </WsText>
                </View>
                {/* 關聯法規 */}
                {checkListQuestion &&
                  checkListQuestion.last_version &&
                  checkListQuestion.last_version.act_version_alls &&
                  checkListQuestion.last_version.act_version_alls.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.last_version.act_version_alls}
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
                                    marginTop: index == 0 ? 0 : 8
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
                  checkListQuestion.last_version &&
                  checkListQuestion.last_version.article_versions &&
                  checkListQuestion.last_version.article_versions.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.last_version.article_versions}
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
                                    marginTop: index == 0 ? 0 : 8
                                  }}>
                                  <WsInfo
                                    testID={`法條-${index}`}
                                    type="link"
                                    value={$_setArticleText(item)}
                                    style={{
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
            checkListQuestion.last_version &&
            checkListQuestion.last_version.effects &&
            checkListQuestion.last_version.effects.length > 0) || (
              checkListQuestion &&
              checkListQuestion.last_version &&
              checkListQuestion.last_version.factory_effects &&
              checkListQuestion.last_version.factory_effects.length > 0
            )) && (
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
                    {t('風險燈號')}
                  </WsText>
                </View>
                <WsFlex
                  flexWrap="wrap"
                >
                  {checkListQuestion &&
                    checkListQuestion.last_version &&
                    checkListQuestion.last_version.effects &&
                    checkListQuestion.last_version.effects.length > 0 && (
                      <WsFlex
                        flexWrap="wrap"
                      >
                        {checkListQuestion.last_version.effects.map(r => (
                          <>
                            <View
                              style={{
                                marginTop: 16,
                                backgroundColor: $color.danger10l,
                                borderRadius: 10,
                                minWidth: 70,
                                minHeight: 70,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 8,
                              }}>
                              <Image
                                style={{
                                  width: 30,
                                  height: 30
                                }}
                                source={{ uri: r.icon }}
                              />
                              <WsText
                                style={{
                                  // borderWidth:1,
                                }}
                                size={12}
                                color={$color.danger}
                              >{t(r.name)}
                              </WsText>
                            </View>
                          </>
                        ))}
                      </WsFlex>
                    )}
                  {checkListQuestion &&
                    checkListQuestion.last_version &&
                    checkListQuestion.last_version.factory_effects &&
                    checkListQuestion.last_version.factory_effects.length > 0 && (
                      <WsFlex
                        flexWrap="wrap"
                      >
                        {checkListQuestion.last_version.factory_effects.map(r => (
                          <>
                            <View
                              style={{
                                marginTop: 16,
                                backgroundColor: $color.danger10l,
                                borderRadius: 10,
                                width: 70,
                                height: 70,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginLeft: 8
                              }}>
                              {r.icon && (
                                <Image
                                  style={{
                                    width: 30,
                                    height: 30
                                  }}
                                  source={{ uri: r.icon }}
                                />
                              )}
                              <WsText size={12} color={$color.danger}>{r.name}</WsText>
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
            checkListQuestion.last_version) && (
              <WsPaddingContainer
                style={{
                  marginTop: 8,
                  backgroundColor: $color.white,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                  <WsIcon
                    size={20}
                    color={$color.black}
                    name={"ll-nav-internalegulations-outline"}
                    style={{
                      marginRight: 4
                    }}
                  ></WsIcon>
                  <WsText
                    size={14}
                    fontWeight={'600'}
                    style={{
                    }}
                  >
                    {t('相關內規')}
                  </WsText>

                  {checkListQuestion.last_version.related_guidelines &&
                    checkListQuestion.last_version.related_guidelines.length == 0 && (
                      <WsText fontWeight={400} style={{ marginLeft: 16 }} color={$color.gray}>{t('無')}</WsText>
                    )}
                </View>
                {checkListQuestion &&
                  checkListQuestion.last_version &&
                  checkListQuestion.last_version.related_guidelines &&
                  checkListQuestion.last_version.related_guidelines.length > 0 && (
                    <>
                      <FlatList
                        style={{
                        }}
                        data={checkListQuestion.last_version.related_guidelines}
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
                        backgroundColor: $color.primary11l,
                        // borderWidth:1,
                      }}>
                      <WsInfo
                        iconColor={$color.black}
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
                                  marginRight: 4
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
                                                alignItems: 'center',
                                                marginTop: index == 0 ? 0 : 8
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
              height: 60
            }}
          ></View>
        </ScrollView>
      ) : (
        <>
          <WsSkeleton></WsSkeleton>
        </>
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

export default CheckListQuestionTemplateShow
