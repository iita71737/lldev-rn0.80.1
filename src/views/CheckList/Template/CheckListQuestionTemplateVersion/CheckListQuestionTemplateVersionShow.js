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
  WsCollapsible
} from '@/components'
import { LlInfoContainer001, LlIconCard001 } from '@/components'
import { WsPreviewImage001 } from '@/components/seed'
import S_url from '@/__reactnative_stone/services/app/url'
import gColor from '@/__reactnative_stone/global/color'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { LocaleConfig } from 'react-native-calendars'
import ViewActShow from '@/views/Act/Show'
import S_CheckListQuestionTemplateVersion from '@/services/api/v1/checklist_question_template_version'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

const CheckListQuestionTemplateVersionShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const { id, lastVersionId } = route.params

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
    console.log(lastVersionId, 'lastVersionId');
    const res = await S_CheckListQuestionTemplateVersion.show({
      modelId: lastVersionId
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
      {checkListQuestion && (
        <ScrollView>
          <LlInfoContainer001>
            {checkListQuestion.title && (
              <WsInfo
                label={t('標題')}
                value={checkListQuestion.title}
              />
            )
            }

            {checkListQuestion.keypoint == 1 && (
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
              marginTop: 8
            }}
          >
            {checkListQuestion &&
              checkListQuestion.is_in_stats !== null && (
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  label={t('列入結果統計、不合規排行榜、今日點檢結論')}
                  value={checkListQuestion.is_in_stats ? t('是') : t('否')}
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
            checkListQuestion.question_type_setting &&
            checkListQuestion.question_type_setting.value === 'num' &&
            checkListQuestion.question_template_setting_items &&
            checkListQuestion.question_template_setting_items.length == 0 &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.name && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('條件設定')}
                  type="text"
                  value={t(checkListQuestion.answer_setting.name)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion.question_type_setting &&
            checkListQuestion.question_type_setting.value === 'single-choice' &&
            checkListQuestion.question_template_setting_items &&
            checkListQuestion.question_template_setting_items.length == 3 &&
            checkListQuestion.question_template_setting_items[0] &&
            checkListQuestion.question_template_setting_items[1] &&
            checkListQuestion.question_template_setting_items[2] && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                <WsInfo
                  label={t('選項')}
                  type="text"
                  value={' '}
                  style={{
                    marginBottom: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <WsInfo
                  label={`${t('合規')} :`}
                  type="text"
                  value={
                    t(`無異常`)
                  }
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                />
                <WsInfo
                  label={`不合規`}
                  type="text"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={' '}
                />
                <LlInfoContainer001
                  style={{
                    padding: 0,
                  }}>
                  <View
                    style={{
                      borderLeftWidth: 2,
                    }}
                  >
                    <WsInfo
                      label={t(`Major(主要缺失)`)}
                      type="text"
                      value={
                        checkListQuestion.question_template_setting_items[1].question_template_setting_items[0].has_remark ? `${t('高風險')} / ${t('選答時要求必填備註')}` : `${t('高風險')} / ${t('選答時要求必填備註')}`
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 4
                      }}
                    />
                  </View>
                  <View
                    style={{
                      borderLeftWidth: 2,
                    }}
                  >
                    <WsInfo
                      label={t(`Minor(次要缺失)`)}
                      type="text"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 4,
                      }}
                      value={
                        checkListQuestion.question_template_setting_items[1].question_template_setting_items[1].has_remark ? `${t('中風險')} / ${t('選答時要求必填備註')}` : `${t('中風險')} / ${t('選答時要求必填備註')}`
                      }
                    />
                  </View>
                  <View
                    style={{
                      borderLeftWidth: 2,
                    }}
                  >
                    <WsInfo
                      label={t(`OFI(待改善)`)}
                      type="text"
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 4,
                      }}
                      value={
                        checkListQuestion.question_template_setting_items[1].question_template_setting_items[2].has_remark ? `${t('低風險')} / ${t('選答時要求必填備註')}` : `${t('低風險')} / ${t('選答時要求必填備註')}`
                      }
                    />
                  </View>
                </LlInfoContainer001>
                <WsInfo
                  label={t(`不適用`)}
                  type="text"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={t('選答時要求必填備註')}
                />
              </LlInfoContainer001>
            )}

          {checkListQuestion &&
            checkListQuestion &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.name &&
            checkListQuestion.question_type_setting &&
            checkListQuestion.question_type_setting.value !== 'single-choice' && (
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
            checkListQuestion &&
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.type === 'custom-num' &&
            checkListQuestion.question_template_setting_items &&
            checkListQuestion.question_template_setting_items.length >= 2 && (
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
                  {checkListQuestion.question_template_setting_items.map((question_setting_item, index) => {
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
            checkListQuestion.answer_setting &&
            checkListQuestion.answer_setting.type === 'control-limit' &&
            checkListQuestion.question_template_setting_items &&
            checkListQuestion.question_template_setting_items.length == 1 &&
            checkListQuestion.question_template_setting_items[0] && (
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
                  <WsInfo
                    label={`Control Limit（${t('管制界線')}）`}
                    type="text"
                    value={`${checkListQuestion.question_template_setting_items[0].control_limit_lower} - ${checkListQuestion.question_template_setting_items[0].control_limit_upper}`}
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
                    value={`${checkListQuestion.question_template_setting_items[0].spec_limit_lower} - ${checkListQuestion.question_template_setting_items[0].spec_limit_upper}`}
                  />
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


          <LlInfoContainer001
            style={{
              marginTop: 8
            }}>
            <WsInfo
              style={{
              }}
              textColor={checkListQuestion.ocap_remark ? $color.black : $color.gray}
              labelIcon={'ws-outline-light'}
              label={t('合規標準')}
              value={
                checkListQuestion.remark
                  ? checkListQuestion.remark
                  : t('無')
              }
            />
            {checkListQuestion.attaches &&
              checkListQuestion.attaches.length > 0 && (
                <WsInfo
                  type="filesAndImages"
                  style={{
                    marginTop: 8,
                  }}
                  value={checkListQuestion.attaches}
                />
              )}
          </LlInfoContainer001>

          {checkListQuestion.article_versions && checkListQuestion.article_versions.length > 0 && (
            <LlInfoContainer001
              style={{
                marginTop: 8,
                flex: 1,
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
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
              {checkListQuestion && checkListQuestion.article_versions.length != 0 && (
                <>
                  <FlatList
                    style={{
                      marginTop: 16,
                      marginLeft: 8
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
                                alignItems: 'center'
                              }}>
                              <WsInfo
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

              {/* 關聯法規 */}
              {checkListQuestion.act_version_alls &&
                checkListQuestion.act_version_alls.length > 0 && (
                  <>
                    <FlatList
                      style={{
                        marginLeft: 8
                      }}
                      data={checkListQuestion.act_version_alls}
                      keyExtractor={item => item.id}
                      renderItem={({ item, index }) => {
                        return (
                          <>
                            <TouchableOpacity
                              onPress={() => {
                                setModalAct(true)
                                setActId(item.id)
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'flex-start',
                                  alignItems: 'center'
                                }}>
                                <WsInfo
                                  type="link"
                                  value={item.name}
                                  style={{
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 4
                                  }}
                                  onPress={() => {
                                    setModalAct(true)
                                    setActId(item.id)
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

              <WsFlex
              >
                {checkListQuestion &&
                  checkListQuestion.effects &&
                  checkListQuestion.effects.length > 0 && (
                    <WsFlex>
                      {checkListQuestion.effects.map(r => (
                        <>
                          <View
                            style={{
                              marginTop: 16,
                              backgroundColor: $color.danger10l,
                              borderRadius: 10,
                              width: 70,
                              height: 70,
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginLeft: 8
                            }}>
                            <Image
                              style={{
                                width: 30,
                                height: 30
                              }}
                              source={{ uri: r.icon }}
                            />
                            <WsText size={12} color={$color.danger}>{r.name}</WsText>
                          </View>
                        </>
                      ))}
                    </WsFlex>
                  )}

                {checkListQuestion &&
                  checkListQuestion.factory_effects &&
                  checkListQuestion.factory_effects.length > 0 && (
                    <WsFlex>
                      {checkListQuestion.factory_effects.map(r => (
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
          )}


          <LlInfoContainer001
            style={{
              marginTop: 8
            }}>
            <WsInfo
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              textColor={checkListQuestion.ocap_remark ? $color.black : $color.gray}
              label="OCAP"
              value={checkListQuestion.ocap_remark
                ? checkListQuestion.ocap_remark
                : t('無')
              }
            />
            {checkListQuestion.ocap_attaches &&
              checkListQuestion.ocap_attaches.length > 0 && (
                <WsInfo
                  type="filesAndImages"
                  style={{
                    marginTop: 8
                  }}
                  value={checkListQuestion.ocap_attaches}
                />
              )}
          </LlInfoContainer001>



          {/* {checkListQuestion &&
            checkListQuestion.template_attaches.length > 0 && (
              <LlInfoContainer001
                style={{
                  marginTop: 8
                }}>
                {checkListQuestion.template_attaches && (
                  <WsInfo
                    label={t('OCAP相關附件')}
                    type="files"
                    value={checkListQuestion.template_attaches}
                  />
                )}
              </LlInfoContainer001>
            )} */}

          {checkListQuestion.checklist_question_template_version && (
            <LlInfoContainer001
              style={{
                marginTop: 8
              }}>
              {checkListQuestion.checklist_question_template_version.title && (
                <>
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
                        labelIcon={'ws-outline-light'}
                        label={t('合規標準')}
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
                              // borderWidth:1,
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
                </>
              )}
            </LlInfoContainer001>
          )}

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

      <WsModal
        title={t('法規依據')}
        visible={modalAct}
        headerLeftOnPress={() => {
          setModalArticle(false)
        }}
        onBackButtonPress={() => {
          setModalArticle(false)
        }}>
        <></>
      </WsModal>
    </>
  )
}

export default CheckListQuestionTemplateVersionShow
