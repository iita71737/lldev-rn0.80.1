import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  FlatList,
  Animated
} from 'react-native'
import {
  WsDes,
  WsBtn,
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsTitle,
  WsHtmlRender,
  LlBtnAct001,
  WsModal,
  WsStateInput,
  WsIcon,
  WsLoading,
  WsInfo,
  LlNavButton002,
  WsCollapsible,
  LlRelatedLicenseTemplateCard001,
  LlRelatedChecklistTemplateCard001,
  LlRelatedAuditTemplateCard001,
  LlRelatedContractorLicenseTemplateCard001,
  LlRelatedTrainingTemplateCard001,
  LlRelatedAuditDocs001,
  LlRelatedTrainingDocs001,
  LlRelatedLicenseDocs001,
  LlRelatedContractorLicenseDocs001,
  LlRelatedChecklistDocs001,
  WsGradientButton,
  WsTag,
  LlRelatedFileStoreFiles001,
  LlTaskCard002,
  WsState,
  WsIconBtn,
  LlInfoContainer001,
  WsIconHint,
  LlRelatedGuidelineItem001,
  LlRelatedTaskCard001,
  LlRelatedGuidelineVersionsDocs001,
  LlGuidelineRelatedGuidelineArticleVersionsDocs001
} from '@/components'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-community/async-storage'
import { useRoute } from '@react-navigation/native'
import GuidelineArticleHistory from '@/views/ActGuideline/GuidelineArticleHistory'
import { useNavigation } from '@react-navigation/native'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'

const LlGuidelineArticleCard001 = props => {
  const { t, i18n } = useTranslation()
  const route = useRoute()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()


  // Props
  const {
    style,
    item,
    guidelineVersionId,
    index,
    animatedValue,
    guideline_id,
    guidelineVersionTitle
  } = props

  // state
  const [guidelineRelatedTaskCollapsed, setGuidelineRelatedTaskCollapsed] = React.useState(true)
  const [guidelineRelatedGuidelineCollapsed, setGuidelineRelatedGuidelineCollapsed] = React.useState(true)
  const [guidelineRelatedDocsCollapsed, setGuidelineRelatedDocsCollapsed] = React.useState(true)
  const [guidelineRelatedActCollapsed, setGuidelineRelatedActCollapsed] = React.useState(true)
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  // helper
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }
  const getDepthRecursive = (sequence) => {
    if (!sequence) return 0;
    const dashIndex = sequence.indexOf('-');
    if (dashIndex === -1) return 1;
    return 1 + getDepthRecursive(sequence.slice(dashIndex + 1));
  }
  const depth = item.sequence ? getDepthRecursive(item.sequence) : 0;


  // States
  const [stateModal, setStateModal] = React.useState(false)

  const $_isEffect = effect => {
    const diff = moment(new Date()).diff(moment(effect), 'days')
    if (diff < 0) {
      return true
    } else {
      return false
    }
  }


  return (
    <>
      {item && (
        <>
          <WsPaddingContainer
            padding={0}
            style={[
              {
                backgroundColor: $color.white,
                paddingHorizontal: 16,
              },
              {
                marginTop: index === 0 ? 8 : 0,
                paddingTop: depth === 1 ? 16 : 8
              },
              {
                paddingLeft: depth > 0 ? 16 * depth : 0
              },
              {
                paddingBottom: 16,
                // borderWidth: 2,
              },
              style
            ]}
          >


            {(item.no_text != '' || item.name != '') && (
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  // borderWidth: 1,
                }}
              >
                <WsFlex>
                  <WsText
                    style={{
                      maxWidth: (item.guideline_article && item.guideline_article.has_versions) ? width * 0.5 : width * 0.8
                    }}
                    size={24}
                    fontWeight={'600'}>
                    {item.no_text ? item.no_text : item.name ? item.name : ''}
                  </WsText>
                  {item &&
                    guidelineVersionId &&
                    (guidelineVersionId === item.guideline_version?.id) ? (
                    <WsTag
                      backgroundColor={$color.yellow11l}
                      textColor={$color.gray2d}
                      style={{
                        marginLeft: 8,
                      }}
                    >
                      {t('更新')}
                    </WsTag>
                  ) : (
                    <View></View>
                  )}
                  {animatedValue && (
                    <WsIconHint
                      animatedValue={animatedValue}
                      style={{
                        marginLeft: 8
                      }}
                    ></WsIconHint>
                  )}
                </WsFlex>

                <WsFlex
                  style={{
                    marginLeft: 8,
                    flexDirection: 'column',
                  }}
                >
                  {item.guideline_article &&
                    item.guideline_article.has_versions && (
                      <TouchableOpacity
                        style={{
                          borderColor: $color.gray,
                          borderWidth: 1,
                          borderRadius: 25,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 16,
                          paddingVertical: 8
                        }}
                        onPress={() => {
                          setStateModal(true)
                        }}>
                        <WsText color={$color.gray} size={12}>{t('沿革')}</WsText>
                      </TouchableOpacity>
                    )}
                </WsFlex>
              </WsFlex>
            )}

            {$_isEffect(item.effect_at) && (
              <WsDes
                style={{
                  marginBottom: 16
                }}>
                {t('生效日')}
                {moment(item.effect_at).format('YYYY-MM-DD')}
              </WsDes>
            )}

            <View
              style={[
                {
                  // paddingLeft: depth > 0 ? 16 * depth : 16,
                  // paddingRight: depth > 0 ? 16 * depth : 0,
                  paddingLeft: 32,
                  marginTop: item.rich_content ? 8 : 0,
                },
              ]}
            >

              <View
                style={{
                  // paddingLeft: depth > 0 ? 16 * (depth - 1) : 16,
                  paddingRight: depth > 0 ? 16 * depth : 0,
                }}
              >
                {item.rich_content ? (
                  <WsHtmlRender
                    content={item.rich_content}
                    contentWidth={width * 0.8}
                  />
                ) : (
                  <WsText style={{ paddingLeft: 8 }} size={18}>{item.content ? item.content.replace(/&nbsp;/ig, "") : ''}</WsText>
                )}
              </View>

              {((item &&
                item.effects &&
                item.effects.length > 0) || (
                  item &&
                  item.factory_effects &&
                  item.factory_effects.length > 0)) && (
                  <>
                    <WsFlex
                      flexWrap="wrap"
                      style={{
                        marginTop: 8
                      }}
                    >
                      {item &&
                        item.effects &&
                        item.effects.map(r => (
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

                      {item &&
                        item.factory_effects &&
                        item.factory_effects.length > 0 && (
                          <WsFlex
                            flexWrap="wrap"
                          >
                            {item.factory_effects.map((r, index) => (
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
                  </>
                )}

              {item &&
                item.attaches &&
                item.attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 8,
                    }}
                    type="filesAndImages"
                    label={t('附件')}
                    value={item.attaches}
                  />
                )}

              {((item.act_version_alls &&
                item.act_version_alls.length > 0) ||
                (item.article_versions &&
                  item.article_versions.length > 0)) && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      backgroundColor: $color.white,
                    }}>
                    <LlBtnAct001
                      style={{
                        marginTop: 8,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomLeftRadius: guidelineRelatedActCollapsed ? 10 : 0,
                        borderBottomRightRadius: guidelineRelatedActCollapsed ? 10 : 0,
                      }}
                      onPress={() => {
                        setGuidelineRelatedActCollapsed(!guidelineRelatedActCollapsed)
                      }}
                    >
                      <WsText color={$color.primary3l}>{t('相關法規')}</WsText>
                      <WsIcon
                        name={guidelineRelatedActCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                        size={24}
                        color={$color.primary3l}
                      ></WsIcon>
                    </LlBtnAct001>
                    {!guidelineRelatedActCollapsed && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            paddingHorizontal: 16,
                            paddingBottom: 16,
                            borderBottomRightRadius: guidelineRelatedActCollapsed ? 0 : 10,
                            borderBottomLeftRadius: guidelineRelatedActCollapsed ? 0 : 10,
                            backgroundColor: $color.primary11l
                          }}
                        >
                          {item.act_version_alls &&
                            item.act_version_alls.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={item.act_version_alls}
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
                                              alignItems: 'center'
                                            }}>
                                            <WsInfo
                                              type="link"
                                              value={item.name}
                                              style={{
                                                maxWidth: width * 0.8
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
                          {item.article_versions &&
                            item.article_versions.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={item.article_versions}
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
                        </WsPaddingContainer>
                      </>
                    )}
                  </WsPaddingContainer>
                )}

              {item &&
                ((
                  item.has_guideline_version ||
                  item.has_guideline_article_version ||
                  item.has_license ||
                  item.has_checklist ||
                  item.has_audit ||
                  item.has_internal_training)) && (
                  <>
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8,
                      }}>
                      <LlBtnAct001
                        style={{
                          borderTopLeftRadius: 10,
                          borderTopRightRadius: 10,
                          borderBottomLeftRadius: guidelineRelatedDocsCollapsed ? 10 : 0,
                          borderBottomRightRadius: guidelineRelatedDocsCollapsed ? 10 : 0,
                        }}
                        onPress={() => {
                          setGuidelineRelatedDocsCollapsed(!guidelineRelatedDocsCollapsed)
                        }}
                      >
                        <WsText color={$color.primary3l}>{t('相關文件')}</WsText>
                        <WsIcon
                          name={guidelineRelatedDocsCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                          size={24}
                          color={$color.primary3l}
                        ></WsIcon>
                      </LlBtnAct001>
                      <WsCollapsible isCollapsed={guidelineRelatedDocsCollapsed}>
                        {!guidelineRelatedDocsCollapsed && (
                          <WsPaddingContainer
                            padding={0}
                            style={{
                              paddingBottom: 16,
                              borderBottomRightRadius: guidelineRelatedDocsCollapsed ? 0 : 10,
                              borderBottomLeftRadius: guidelineRelatedDocsCollapsed ? 0 : 10,
                              backgroundColor: $color.primary11l
                            }}
                          >

                            {item?.has_license && (
                              <LlRelatedLicenseDocs001
                                guideline_articles={item.guideline_article?.id}
                              ></LlRelatedLicenseDocs001>
                            )}

                            {item?.has_checklist ? (
                              <LlRelatedChecklistDocs001
                                guideline_articles={item.guideline_article?.id}
                              ></LlRelatedChecklistDocs001>
                            ) : null}

                            {item?.has_audit && (
                              <LlRelatedAuditDocs001
                                guideline_articles={item.guideline_article?.id}
                              ></LlRelatedAuditDocs001>
                            )}

                            {/* {guidelineVersion.has_contractor_license && (
                              <LlRelatedContractorLicenseDocs001
                                acts={act.id}
                              >
                              </LlRelatedContractorLicenseDocs001>
                            )} */}

                            {item?.has_internal_training && (
                              <LlRelatedTrainingDocs001
                                guideline_articles={item.guideline_article?.id}
                              ></LlRelatedTrainingDocs001>
                            )}

                            {item?.has_guideline_version && (
                              <LlRelatedGuidelineVersionsDocs001
                                guideline_articles={item.guideline_article?.id}
                              ></LlRelatedGuidelineVersionsDocs001>
                            )}


                            {item?.has_guideline_article_version && (
                              <LlGuidelineRelatedGuidelineArticleVersionsDocs001
                                guideline_id={guideline_id}
                                guideline_articles={item.guideline_article?.id}
                                guidelineArticleVersion={item}
                              ></LlGuidelineRelatedGuidelineArticleVersionsDocs001>
                            )}

                          </WsPaddingContainer>
                        )}
                      </WsCollapsible>
                    </WsPaddingContainer>
                  </>
                )}

              {/* 層級條文相關任務 */}
              {item.has_task && (
                <>
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      paddingTop: 8,
                      backgroundColor: $color.white,
                    }}>
                    <LlBtnAct001
                      style={{
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomLeftRadius: guidelineRelatedTaskCollapsed ? 10 : 0,
                        borderBottomRightRadius: guidelineRelatedTaskCollapsed ? 10 : 0,
                      }}
                      onPress={() => {
                        setGuidelineRelatedTaskCollapsed(!guidelineRelatedTaskCollapsed)
                      }}
                    >
                      <WsText color={$color.primary3l}>{t('相關任務')}</WsText>
                      <WsIcon
                        name={guidelineRelatedTaskCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                        size={24}
                        color={$color.primary3l}
                      ></WsIcon>
                    </LlBtnAct001>
                    {!guidelineRelatedTaskCollapsed && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          borderBottomRightRadius: guidelineRelatedTaskCollapsed ? 0 : 10,
                          borderBottomLeftRadius: guidelineRelatedTaskCollapsed ? 0 : 10,
                          backgroundColor: $color.primary11l,
                          paddingBottom: 16,
                        }}
                      >
                        {item.has_task && (
                          <LlRelatedTaskCard001
                            guideline_article_version={item.id}
                          ></LlRelatedTaskCard001>
                        )}
                      </WsPaddingContainer>
                    )}
                  </WsPaddingContainer>
                </>
              )}

              {/* 層級條文相關內規 */}
              {(item.related_guidelines &&
                item.related_guidelines.length > 0) && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      backgroundColor: $color.white,
                      marginTop: 8
                    }}>
                    <LlBtnAct001
                      style={{
                        marginBottom: guidelineRelatedGuidelineCollapsed ? 16 : 0,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomLeftRadius: guidelineRelatedGuidelineCollapsed ? 10 : 0,
                        borderBottomRightRadius: guidelineRelatedGuidelineCollapsed ? 10 : 0,
                      }}
                      onPress={() => {
                        setGuidelineRelatedGuidelineCollapsed(!guidelineRelatedGuidelineCollapsed)
                      }}
                    >
                      <WsText color={$color.primary3l}>{t('相關內規')}</WsText>
                      <WsIcon
                        name={guidelineRelatedGuidelineCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                        size={24}
                        color={$color.primary3l}
                      ></WsIcon>
                    </LlBtnAct001>
                    {!guidelineRelatedGuidelineCollapsed && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            paddingHorizontal: 16,
                            paddingBottom: 16,
                            marginBottom: 16,
                            borderBottomRightRadius: guidelineRelatedGuidelineCollapsed ? 0 : 10,
                            borderBottomLeftRadius: guidelineRelatedGuidelineCollapsed ? 0 : 10,
                            backgroundColor: $color.primary11l
                          }}
                        >
                          {item.related_guidelines &&
                            item.related_guidelines.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={item.related_guidelines}
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
                      </>
                    )}
                  </WsPaddingContainer>
                )}

            </View>

          </WsPaddingContainer>
        </>
      )
      }

      <WsModal
        title={t('沿革')}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        animationType="slide"
      >
        <GuidelineArticleHistory
          articleId={item.guideline_article?.id}
          guidelineVersionTitle={guidelineVersionTitle}
        ></GuidelineArticleHistory>
      </WsModal>

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

export default LlGuidelineArticleCard001
