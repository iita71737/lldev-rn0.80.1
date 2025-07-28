import React, { useState, useEffect } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  Image,
  FlatList
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
  WsSkeleton,
  LlInfoContainer001,
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
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import GuidelineArticleHistory from '@/views/ActGuideline/GuidelineArticleHistory'
import { useNavigation } from '@react-navigation/native'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'

const LlGuidelineArticleEditCard001 = props => {
  const { t, i18n } = useTranslation()
  const route = useRoute()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // Props
  const {
    index,
    item,
    style,
    onPressAdd,
    onPressEdit,
    onPressCreateVersion,
    onPressDelete,
    guideline,
    guidelineVersion,
    pickValue
  } = props

  // state
  const [guidelineRelatedDocsCollapsed, setGuidelineRelatedDocsCollapsed] = React.useState(true)
  const [guidelineRelatedTaskCollapsed, setGuidelineRelatedTaskCollapsed] = React.useState(true)
  const [guidelineRelatedGuidelineCollapsed, setGuidelineRelatedGuidelineCollapsed] = React.useState(true)

  const [guidelineRelatedActCollapsed, setGuidelineRelatedActCollapsed] = React.useState(true)
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  const [articleInfoCollapsed, setArticleInfoCollapsed] = React.useState(true)
  const [articleVersion, setArticleVersion] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [stateModal, setStateModal] = React.useState(false)

  // Functions
  const $_setStorage = async () => {
    const _articleVersion = await $_fetchShow()
    const _defaultValue = {
      guideline_article_version: _articleVersion ? _articleVersion?.id : undefined,
      redirect_routes: [
        {
          name: 'GuidelineAdminIndex',
        },
        {
          name: 'GuidelineAdminShow',
          params: {
            id: guideline?.id,
            refreshKey: Date.now()
          }
        },
      ]
    }
    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
    navigation.push('RoutesTask', {
      screen: 'TaskCreate',
      params: {
      }
    })
  }

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

  // Services
  const $_fetchShow = async () => {
    try {
      setLoading(true)
      const _params = {
        guideline_article_version: item.id,
        guideline_version: guidelineVersion.id
      }
      // console.log(_params,'_params--');
      const res = await S_GuidelineArticleVersionAdmin.show({ params: _params })
      setArticleVersion(res)
      setLoading(false)
      return res
    } catch (e) {
      console.error(e);
    }
  }

  const renderRecursiveItem = (item, level = 0) => {
    const marginLeft = level === 1 ? 0 : (level - 1) * 16;

    return (
      <View
        key={item.id}
        style={{
          marginLeft,
        }}
      >
        <View
          style={{
            marginTop: level === 0 ? 0 : 8,
            paddingVertical: 16,
            // paddingHorizontal: 8,
            borderRadius: 10,
            borderColor: $color.white,
            backgroundColor: $color.white,
            borderBottomLeftRadius: articleInfoCollapsed ? 10 : 0,
            borderBottomRightRadius: articleInfoCollapsed ? 10 : 0,
            borderBottomWidth: articleInfoCollapsed ? 0.4 : 0,
            // borderWidth:1,
          }}
          justifyContent={"space-between"}
        >
          {/* sequence除錯用 */}
          {/* <WsDes style={{ position: "absolute", top: 4, left: 8 }}>
            {item.sequence}
          </WsDes> */}

          <WsFlex
            style={{
              // borderWidth: 2,
              // maxWidth: (guidelineVersion?.id != item.guideline_version?.id) ? width * 0.4 : width * 0.45,
              maxWidth: width * 0.75
            }}
          >
            <WsIcon
              style={{
                // borderWidth:1,
                marginHorizontal: 8
              }}
              name={articleInfoCollapsed ? "md-unfold-more" : "md-unfold-less"}
              size={24}
              color={$color.primary3l}
            />
            <WsText
              style={{
                marginRight: 8,
              }}
            >
              {item.name}
            </WsText>

            {item &&
              guidelineVersion &&
              guidelineVersion.id &&
              (guidelineVersion.id === item.guideline_version?.id) ? (
              <WsTag
                backgroundColor={$color.yellow11l}
                textColor={$color.gray2d}
                style={{
                  alignSelf: 'flex-start'
                }}
              >
                {t('更新')}
              </WsTag>
            ) : (
              <View></View>
            )}
          </WsFlex>

          <WsFlex
            style={{
              // alignSelf: 'flex-end',
              backgroundColor: $color.white,
              marginTop: 16,
              // marginLeft: 16,
              // borderWidth:1,
            }}
          >
            <View
              style={{
                width: 36
              }}
            >
            </View>
            <WsIconBtn
              padding={0}
              name="md-add"
              size={24}
              color={$color.primary}
              style={{ marginRight: 8 }}
              onPress={onPressAdd}
            />
            <WsIconBtn
              padding={0}
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.primary}
              style={{ marginRight: 8 }}
              onPress={onPressEdit}
            />
            {/* https://www.notion.so/514294a3bd174503a6e6db3c03739778?pvs=4#473a980def034497b09fff8eb3d49e49 */}
            {
              ((guideline?.last_version?.id === pickValue?.id) &&
                guideline?.has_unreleased == 1 &&
                guidelineVersion &&
                guidelineVersion.id &&
                (guidelineVersion.id != item.guideline_version?.id)) && (
                <WsIconBtn
                  padding={0}
                  name="md-update"
                  size={24}
                  color={$color.primary}
                  style={{ marginRight: 8 }}
                  onPress={onPressCreateVersion}
                />
              )}
            {/* 建立任務 */}
            {(
              (guideline?.last_version?.id === pickValue?.id)
            ) && (
                <WsIconBtn
                  padding={0}
                  name="ll-nav-assignment-filled"
                  size={24}
                  style={{ marginRight: 8 }}
                  onPress={() => {
                    $_setStorage()
                  }}
                />
              )}
            {/* https://www.notion.so/514294a3bd174503a6e6db3c03739778?pvs=4#647082e88c71407fbc999781c2101bee */}
            {(
              // articleVersion &&
              // articleVersion.has_internal_training === false &&
              // articleVersion.has_license === false &&
              // articleVersion.has_guideline_version === false &&
              // articleVersion.has_guideline_article_version === false &&
              // articleVersion.has_checklist === false &&
              // articleVersion.has_audit === false &&
              // articleVersion.has_task === false
              !item.has_related_models
            ) && (
                <WsIconBtn
                  padding={0}
                  name="ws-outline-delete"
                  size={24}
                  color={$color.danger}
                  onPress={onPressDelete}
                />
              )}
          </WsFlex>

        </View>


        {/* 顯示內容 */}
        {!articleInfoCollapsed &&
          articleVersion ? (
          <WsPaddingContainer
            padding={0}
            style={{
              borderRadius: 10,
              borderColor: $color.white,
              backgroundColor: $color.white,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              paddingBottom: 16,
            }}
          >
            <WsFlex
              justifyContent={'space-between'}
              style={{
                paddingHorizontal: 13,
                // borderWidth:1,
              }}
            >
              <View></View>
              <WsFlex
                style={{
                  flexDirection: 'column',
                }}
                justifyContent="flex-end"
              >
                {articleVersion &&
                  articleVersion.guideline_article &&
                  articleVersion.guideline_article.has_versions && (
                    <TouchableOpacity
                      style={{
                        marginTop: !articleVersion.task ? 4 : 0,
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

            <View
              style={{
                paddingTop: (articleVersion?.rich_content || articleVersion?.content) ? 8 : 0,
                paddingHorizontal: 32,
                // borderWidth: 1,
              }}
            >
              {articleVersion.rich_content ? (
                <WsHtmlRender
                  content={articleVersion.rich_content}
                  contentWidth={width * 0.8}
                />
              ) : articleVersion?.content ? (
                <WsText style={{ paddingLeft: 8 }} size={14}>
                  {articleVersion?.content?.replace(/&nbsp;/gi, "") || ""}
                </WsText>
              ) : (
                <></>
              )}

              {((articleVersion &&
                articleVersion.effects &&
                articleVersion.effects.length > 0) || (
                  articleVersion &&
                  articleVersion.factory_effects &&
                  articleVersion.factory_effects.length > 0)) && (
                  <>
                    <WsFlex
                      flexWrap="wrap"
                      style={{
                        marginTop: 8
                      }}
                    >
                      {articleVersion &&
                        articleVersion.effects &&
                        articleVersion.effects.map(r => (
                          <>
                            <View
                              style={{
                                marginTop: 8,
                                backgroundColor: $color.danger10l,
                                borderRadius: 10,
                                paddingHorizontal: 8,
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

                      {articleVersion &&
                        articleVersion.factory_effects &&
                        articleVersion.factory_effects.length > 0 && (
                          <WsFlex
                            flexWrap="wrap"
                          >
                            {articleVersion.factory_effects.map((r, index) => (
                              <>
                                <View
                                  style={{
                                    marginTop: index > 2 ? 8 : 0,
                                    backgroundColor: $color.danger10l,
                                    borderRadius: 10,
                                    paddingHorizontal: 8,
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

              <View
                style={{
                  marginTop: (articleVersion?.rich_content || articleVersion?.content) ? 8 : 0,
                }}
              >
                <WsInfo
                  style={{
                    flexDirection: 'row',
                  }}
                  labelWidth={100}
                  label={t('修正發布日')}
                  value={articleVersion?.announce_at ? moment(articleVersion.announce_at).format('YYYY-MM-DD') : t('無')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  style={{
                    flexDirection: 'row',
                  }}
                  labelWidth={100}
                  label={t('生效日')}
                  value={articleVersion?.effect_at ? moment(articleVersion.effect_at).format('YYYY-MM-DD') : t('無')}
                />
              </View>

              {articleVersion?.guideline_status?.name && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                    }}
                    labelWidth={100}
                    label={t('施行狀態')}
                    value={articleVersion?.guideline_status?.name ? (articleVersion.guideline_status.name) : t('無')}
                  />
                </View>
              )}


              {articleVersion &&
                articleVersion.attaches &&
                articleVersion.attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 8,
                    }}
                    type="filesAndImages"
                    label={t('附件')}
                    value={articleVersion.attaches}
                  />
                )}

              {/* 層級條文相關法規法條 */}
              {((articleVersion.act_version_alls &&
                articleVersion.act_version_alls.length > 0) ||
                (articleVersion.article_versions &&
                  articleVersion.article_versions.length > 0)) && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      marginTop: 8,
                      // borderWidth:1,
                    }}>
                    <LlBtnAct001
                      style={{
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
                          {articleVersion.act_version_alls &&
                            articleVersion.act_version_alls.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={articleVersion.act_version_alls}
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
                                              testID={`法條-${index}`}
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
                          {articleVersion.article_versions &&
                            articleVersion.article_versions.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={articleVersion.article_versions}
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

              {articleVersion &&
                ((
                  articleVersion.has_guideline_version ||
                  articleVersion.has_guideline_article_version ||
                  articleVersion.has_license ||
                  articleVersion.has_checklist ||
                  articleVersion.has_audit ||
                  // articleVersion.has_contractor_license ||
                  articleVersion.has_internal_training) &&
                  (true)) && (
                  <>
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8,
                      }}>
                      {/* <WsText size={14} fontWeight={'600'} style={{ marginBottom: 8 }}>{t('內規條文相關文件')}</WsText> */}
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

                            {articleVersion?.has_license && (
                              <LlRelatedLicenseDocs001
                                guideline_articles={articleVersion.guideline_article?.id}
                              ></LlRelatedLicenseDocs001>
                            )}

                            {articleVersion?.has_checklist ? (
                              <LlRelatedChecklistDocs001
                                guideline_articles={articleVersion.guideline_article?.id}
                              ></LlRelatedChecklistDocs001>
                            ) : null}

                            {articleVersion?.has_audit && (
                              <LlRelatedAuditDocs001
                                guideline_articles={articleVersion.guideline_article?.id}
                              ></LlRelatedAuditDocs001>
                            )}

                            {/* {guidelineVersion.has_contractor_license && (
                              <LlRelatedContractorLicenseDocs001
                                acts={act.id}
                              >
                              </LlRelatedContractorLicenseDocs001>
                            )} */}

                            {articleVersion?.has_internal_training && (
                              <LlRelatedTrainingDocs001
                                guideline_articles={articleVersion.guideline_article?.id}
                              ></LlRelatedTrainingDocs001>
                            )}

                            {articleVersion?.has_guideline_version && (
                              <LlRelatedGuidelineVersionsDocs001
                                guideline_articles={articleVersion.guideline_article?.id}
                              ></LlRelatedGuidelineVersionsDocs001>
                            )}


                            {articleVersion?.has_guideline_article_version && (
                              <LlGuidelineRelatedGuidelineArticleVersionsDocs001
                                guideline_id={guideline?.id}
                                guideline_articles={articleVersion.guideline_article?.id}
                                guidelineArticleVersion={articleVersion}
                              ></LlGuidelineRelatedGuidelineArticleVersionsDocs001>
                            )}

                          </WsPaddingContainer>
                        )}
                      </WsCollapsible>
                    </WsPaddingContainer>
                  </>
                )}

              {/* 層級條文相關任務 */}
              {articleVersion.has_task && (
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
                        {articleVersion.has_task && (
                          <LlRelatedTaskCard001
                            guideline_article_version={articleVersion.id}
                          ></LlRelatedTaskCard001>
                        )}
                      </WsPaddingContainer>
                    )}
                  </WsPaddingContainer>
                </>
              )}

              {/* 層級條文相關內規 */}
              {(articleVersion.related_guidelines &&
                articleVersion.related_guidelines.length > 0) && (
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
                          {articleVersion.related_guidelines &&
                            articleVersion.related_guidelines.length > 0 && (
                              <>
                                <FlatList
                                  style={{
                                  }}
                                  data={articleVersion.related_guidelines}
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
        ) : !articleInfoCollapsed && <WsLoading />
        }

      </View >
    );
  };

  return (
    <>
      <TouchableOpacity
        style={{
          paddingHorizontal: 8
        }}
        key={item.id}
        onPress={() => {
          $_fetchShow()
          setArticleInfoCollapsed(!articleInfoCollapsed)
        }}
      >
        {renderRecursiveItem(item, item.sequence?.split('-').length)}
      </TouchableOpacity >

      {articleVersion && (
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
            articleId={articleVersion?.guideline_article?.id}
            guidelineVersion={guidelineVersion}
            admin={true}
          ></GuidelineArticleHistory>
        </WsModal>
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

export default LlGuidelineArticleEditCard001
