import React, { useState } from 'react'
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Dimensions, ScrollView } from 'react-native'
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
  LlRelatedGuidelineItem001
} from '@/components'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-community/async-storage'
import { useRoute } from '@react-navigation/native'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'

const LlArticleCard001 = props => {
  const { t, i18n } = useTranslation()
  const route = useRoute()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    style,
    article,
    navigation,
    title,
    actId,
    articleId,
    actVersionId,
    pickValueId,
    system_subclasses,
    testID
  } = props

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [LLCommentIsCollapse, setLLCommentIsCollapsed] = React.useState(true)

  const [relatedTaskCollapsed, setRelatedTaskCollapsed] = React.useState(true)
  const [relatedTemplateCollapsed, setRelatedTemplateCollapsed] = React.useState(true)
  const [relatedDocsCollapsed, setRelatedDocsCollapsed] = React.useState(true)
  const [articleRelatedFileStoreFilesCollapsed, setArticleRelatedFileStoreFilesCollapsed] = React.useState(true)

  const [actVersionRelatedGuidelineCollapsed, setActVersionRelatedGuidelineCollapsed] = React.useState(true)
  const [actVersionRelatedGuideline, setActVersionRelatedGuideline] = React.useState()
  const [actVersionRelatedGuidelineArticles, setActVersionRelatedGuidelineArticles] = React.useState()


  // 取得法條版本相關內規
  const $_fetchRelativeGuideline = async (id) => {
    try {
      const _params = {
        lang: 'tw',
        article_versions: article.id
      }
      const _guidelineArticles = await S_GuidelineVersion.indexByAct({ params: _params })
      setActVersionRelatedGuideline(_guidelineArticles.data)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }
  // 取得法條版本相關內規條文
  const $_fetchRelativeGuidelineArticles = async (id) => {
    try {
      const _params = {
        lang: 'tw',
        article_versions: article.id
      }
      const _guidelineArticles = await S_GuidelineArticleVersion.indexByAct({ params: _params })
      setActVersionRelatedGuidelineArticles(_guidelineArticles.data)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // Functions
  const $_setStorage = async (articleId) => {
    const _defaultValue = {
      article_version: articleId,
      system_subclasses: system_subclasses ? system_subclasses : undefined
    }
    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
  }

  const $_createTask = () => {
    navigation.push('RoutesTask', {
      screen: 'TaskCreateFromAct',
      params: {
        articleId: articleId,
      }
    })
  }

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
      {article && (
        <>
          <WsPaddingContainer
            style={[
              {
                backgroundColor: $color.white
              },
              style
            ]}>
            {article.chapter != '' &&
              <WsTitle
                fontSize={18}
                fontWeight={'600'}
                style={{
                  marginBottom: 16,
                  // borderWidth:1,
                }}
              >
                {article.chapter}
              </WsTitle>
            }

            {article.no_text != '' && (
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  marginBottom: 16,
                }}
              >
                <WsText size={18} fontWeight={'600'}>
                  {article.no_text}
                </WsText>

                {actVersionId &&
                  article.act_version &&
                  actVersionId === article.act_version.id ? (
                  <WsFlex
                    justifyContent="space-between"
                    style={{
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    <WsTag
                      backgroundColor={$color.yellow11l}
                      textColor={$color.gray2d}
                    >
                      {t('更新')}
                    </WsTag>
                  </WsFlex>
                ) : (
                  <View></View>
                )}
                <WsFlex
                  style={{
                    marginLeft: 8,
                    // borderWidth: 2
                    flexDirection: 'column',
                  }}
                >
                  {!article.task &&
                    actVersionId &&
                    article.act_version &&
                    actVersionId === article.act_version.id && (
                      <TouchableOpacity
                        color={$color.primary}
                        textColor={$color.white}
                        isFullWidth={false}
                        borderRadius={28}
                        textSize={14}
                        style={{
                          padding: 10,
                          backgroundColor: $color.primary,
                          borderRadius: 28,
                          borderWidth: 0.3,
                          borderColor: $color.primary,
                          zIndex: 999,
                          marginRight: 8,
                          marginBottom: 4,
                        }}
                        onPress={() => {
                          $_setStorage(article.id)
                          $_createTask()
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                          <WsIcon
                            color={$color.white}
                            name={'ll-nav-assignment-filled'}
                            size={16}
                            style={{
                              marginRight: 4
                            }}
                          >
                          </WsIcon>
                          <WsText color={$color.white} size={12}>
                            {t('建立任務')}
                          </WsText>
                        </View>
                      </TouchableOpacity>
                    )}
                  {article.prev_version &&
                    article.prev_version.length > 0 &&
                    article.article &&
                    article.article.act_version &&
                    actVersionId === article.act_version.id && (
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
                          navigation.navigate({
                            name: 'ArticleHistory',
                            params: {
                              article: article,
                              actId: actId,
                              articleId: article.article.id,
                              prevId: article.prev_version[0].id
                            }
                          })
                        }}>
                        <WsText color={$color.gray} size={12}>{t('沿革')}</WsText>
                      </TouchableOpacity>
                    )}
                </WsFlex>
              </WsFlex>
            )}

            {$_isEffect(article.effect_at) && (
              <WsDes
                style={{
                  marginBottom: 16
                }}>
                {t('生效日')}
                {moment(article.effect_at).format('YYYY-MM-DD')}
              </WsDes>
            )}

            {article.rich_content ? (
              <WsHtmlRender content={article.rich_content} />
            ) : (
              <WsText style={{ paddingLeft: 8 }} size={14}>{article.content.replace(/&nbsp;/ig, "")}</WsText>
            )}

            {article.ll_comment != '' && (
              <>
                <LlBtnAct001
                  style={{
                    marginTop: 16,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: LLCommentIsCollapse ? 10 : 0,
                    borderBottomRightRadius: LLCommentIsCollapse ? 10 : 0,
                  }}
                  onPress={() => {
                    setLLCommentIsCollapsed(!LLCommentIsCollapse)
                    $_setStorage(article.id)
                  }}
                >
                  <WsText color={$color.primary3l}>{t('ESGoal評析')}</WsText>
                  <WsFlex>
                    <WsDes>{`${t('更新日期')} ${moment(article.updated_at).format('YYYY-MM-DD')}`}</WsDes>
                    <WsIcon
                      name={LLCommentIsCollapse ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </WsFlex>
                </LlBtnAct001>
                <WsCollapsible
                  isCollapsed={LLCommentIsCollapse}
                >
                  {!LLCommentIsCollapse && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        backgroundColor: $color.primary11l
                      }}>
                      <WsInfo
                        style={{ marginHorizontal: 16 }}
                        type="icon"
                        iconSize={70}
                        value={article.effects}
                      />
                      <WsFlex>
                        <WsText style={{ padding: 16 }}>
                          {article.ll_comment ? article.ll_comment : t('無')}
                        </WsText>
                      </WsFlex>
                      <WsFlex
                        justifyContent={'space-between'}
                        style={{
                          // borderWidth:1,
                          borderBottomWidth: 0.3,
                          padding: 16,
                        }}
                      >
                        <View
                          style={{
                            maxWidth: width * 0.5,
                          }}
                        >
                          <WsText style={{}} fontWeight={'600'}>
                            {t('有任何疑問嗎？')}
                          </WsText>
                          <WsText
                            style={{
                              marginRight: 16,
                            }}
                            size={14}>
                            {t('如果你對於ESGoal評析或法條內容有任何疑問請點擊諮詢按鈕')}
                          </WsText>
                        </View>
                        <TouchableOpacity
                          color={$color.white}
                          textColor={$color.primary}
                          isFullWidth={false}
                          borderRadius={28}
                          textSize={14}
                          style={{
                            backgroundColor: $color.white,
                            borderRadius: 28,
                            padding: 16,
                            borderWidth: 0.3,
                            borderColor: $color.primary,
                            width: '40%',
                          }}
                          onPress={() => {
                            navigation.navigate('LegalAdvice')
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                            <WsIcon
                              name={'ws-outline-advisory'}
                              size={16}
                              style={{
                                marginRight: 4
                              }}
                            >
                            </WsIcon>
                            <WsText color={$color.primary} size={14}>
                              {t('諮詢')}
                            </WsText>
                          </View>
                        </TouchableOpacity>
                      </WsFlex>

                      <WsFlex
                        justifyContent={'space-between'}
                        style={{
                          // borderWidth:1,
                          padding: 16,
                        }}
                      >
                        <View
                          style={{
                            maxWidth: width * 0.5,
                          }}
                        >
                          <WsText style={{}} fontWeight={'600'}>
                            {t('建立任務')}
                          </WsText>
                          <WsText
                            style={{
                              marginRight: 16,
                            }}
                            size={14}>
                            {t('你可以透過建立任務委派待辦事項給負責人員')}
                          </WsText>
                        </View>
                        {(!article.task) &&
                          actVersionId &&
                          article.act_version &&
                          actVersionId === article.act_version.id && (
                            <TouchableOpacity
                              color={$color.primary}
                              textColor={$color.white}
                              isFullWidth={false}
                              borderRadius={28}
                              textSize={14}
                              style={{
                                padding: 16,
                                backgroundColor: $color.primary,
                                borderRadius: 28,
                                borderWidth: 0.3,
                                borderColor: $color.primary,
                                width: '40%',
                                zIndex: 999,
                              }}
                              onPress={() => {
                                $_createTask()
                              }}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                  alignItems: 'center'
                                }}>
                                <WsIcon
                                  color={$color.white}
                                  name={'ll-nav-assignment-filled'}
                                  size={16}
                                  style={{
                                    marginRight: 4
                                  }}
                                >
                                </WsIcon>
                                <WsText color={$color.white} size={14}>
                                  {t('建立任務')}
                                </WsText>
                              </View>
                            </TouchableOpacity>
                          )}
                      </WsFlex>
                    </WsPaddingContainer>
                  )}
                </WsCollapsible>
              </>
            )}

            {article.task &&
              article.task.id && (
                <>
                  <LlBtnAct001
                    style={{
                      marginTop: 16,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: relatedTemplateCollapsed ? 10 : 0,
                      borderBottomRightRadius: relatedTemplateCollapsed ? 10 : 0,
                    }}
                    onPress={() => {
                      setRelatedTaskCollapsed(!relatedTaskCollapsed)
                    }}
                  >
                    <WsText color={$color.primary3l}>{t('相關任務')}</WsText>
                    <WsIcon
                      name={relatedTaskCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  <WsCollapsible isCollapsed={relatedTaskCollapsed}>
                    {!relatedTaskCollapsed && (
                      <WsPaddingContainer
                        padding={16}
                        style={{
                          backgroundColor: $color.primary11l
                        }}
                      >
                        <LlTaskCard002
                          item={article.task}
                          onPress={() => {
                            navigation.push('RoutesTask', {
                              screen: 'TaskShow',
                              params: {
                                id: article.task.id,
                              }
                            })
                          }}
                        />
                      </WsPaddingContainer>
                    )}
                  </WsCollapsible>
                </>
              )}

            {(
              (article.has_license_template ||
                article.has_contractor_license_template ||
                article.has_internal_training_template ||
                article.has_checklist_template ||
                article.has_audit_template) &&
              (article.act_version &&
                (article.act_version.id == pickValueId))
            ) && (
                <>
                  <LlBtnAct001
                    testID={`${article.id}-查看相關公版`}
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
                    <WsText color={$color.primary3l}>{t('相關公版')}</WsText>
                    <WsIcon
                      name={relatedTemplateCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  <WsCollapsible isCollapsed={relatedTemplateCollapsed}>
                    {!relatedTemplateCollapsed && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          paddingBottom: 16,
                          backgroundColor: $color.primary11l
                        }}>
                        {article.has_license_template && (
                          <LlRelatedLicenseTemplateCard001
                            articles={article.article?.id}
                          ></LlRelatedLicenseTemplateCard001>
                        )}
                        {article.has_checklist_template && (
                          <LlRelatedChecklistTemplateCard001
                            articles={article.article?.id}
                          ></LlRelatedChecklistTemplateCard001>
                        )}
                        {article.has_audit_template && (
                          <LlRelatedAuditTemplateCard001
                            articles={article.article?.id}
                          ></LlRelatedAuditTemplateCard001>
                        )}
                        {article.has_contractor_license_template && (
                          <LlRelatedContractorLicenseTemplateCard001
                            articles={article.article?.id}
                          ></LlRelatedContractorLicenseTemplateCard001>
                        )}
                        {article.has_internal_training_template && (
                          <LlRelatedTrainingTemplateCard001
                            articles={article.article?.id}
                          ></LlRelatedTrainingTemplateCard001>
                        )}
                      </WsPaddingContainer>
                    )}
                  </WsCollapsible>
                </>
              )}

            {(article.has_license ||
              article.has_contractor_license ||
              article.has_internal_training ||
              article.has_checklist ||
              article.has_audit) &&
              (actVersionId === pickValueId) && (
                <>
                  <LlBtnAct001
                    style={{
                      marginTop: 16,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: relatedDocsCollapsed ? 10 : 0,
                      borderBottomRightRadius: relatedDocsCollapsed ? 10 : 0,
                    }}
                    onPress={() => {
                      setRelatedDocsCollapsed(!relatedDocsCollapsed)
                    }}
                  >
                    <WsText color={$color.primary3l}>{t('相關文件')}</WsText>
                    <WsIcon
                      name={relatedDocsCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  <WsCollapsible isCollapsed={relatedDocsCollapsed}>
                    {!relatedDocsCollapsed && (
                      <WsPaddingContainer
                        padding={16}
                        style={{
                          backgroundColor: $color.primary11l
                        }}>
                        {article.has_license && (
                          <LlRelatedLicenseDocs001
                            articles={article.article?.id}
                          >
                          </LlRelatedLicenseDocs001>
                        )}

                        {article.has_checklist && (
                          <LlRelatedChecklistDocs001
                            articles={article.article?.id}
                          ></LlRelatedChecklistDocs001>
                        )}
                        {article.has_audit && (
                          <LlRelatedAuditDocs001
                            articles={article.article?.id}
                          ></LlRelatedAuditDocs001>
                        )}
                        {article.has_contractor_license && (
                          <LlRelatedContractorLicenseDocs001
                            articles={article.article?.id}
                          >
                          </LlRelatedContractorLicenseDocs001>
                        )}
                        {article.has_internal_training && (
                          <LlRelatedTrainingDocs001
                            articles={article.article?.id}
                          ></LlRelatedTrainingDocs001>
                        )}
                      </WsPaddingContainer>
                    )}
                  </WsCollapsible>
                </>
              )}

            {article.has_file &&
              (actVersionId === pickValueId) && (
                <>
                  <LlBtnAct001
                    style={{
                      marginTop: 16,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: articleRelatedFileStoreFilesCollapsed ? 10 : 0,
                      borderBottomRightRadius: articleRelatedFileStoreFilesCollapsed ? 10 : 0,
                    }}
                    onPress={() => {
                      setArticleRelatedFileStoreFilesCollapsed(!articleRelatedFileStoreFilesCollapsed)
                    }}
                  >
                    <WsText color={$color.primary3l}>{t('相關檔案庫文件')}</WsText>
                    <WsIcon
                      name={articleRelatedFileStoreFilesCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  <WsCollapsible isCollapsed={articleRelatedFileStoreFilesCollapsed}>
                    {!articleRelatedFileStoreFilesCollapsed && (
                      <WsPaddingContainer
                        padding={16}
                        style={{
                          backgroundColor: $color.primary11l
                        }}>
                        {article.has_file && (
                          <LlRelatedFileStoreFiles001
                            articles={article.article?.id}
                          ></LlRelatedFileStoreFiles001>
                        )}
                      </WsPaddingContainer>
                    )}
                  </WsCollapsible>
                </>
              )}

            {(article.has_guidelines ||
              article.has_guideline_articles) &&
              actVersionRelatedGuideline &&
              actVersionRelatedGuideline.length > 0 && (
                <>
                  <LlBtnAct001
                    style={{
                      marginTop: 16,
                      marginBottom: actVersionRelatedGuidelineCollapsed ? 16 : 0,
                      borderTopLeftRadius: 10,
                      borderTopRightRadius: 10,
                      borderBottomLeftRadius: actVersionRelatedGuidelineCollapsed ? 10 : 0,
                      borderBottomRightRadius: actVersionRelatedGuidelineCollapsed ? 10 : 0,
                    }}
                    onPress={() => {
                      $_fetchRelativeGuideline()
                      $_fetchRelativeGuidelineArticles()
                      setActVersionRelatedGuidelineCollapsed(!actVersionRelatedGuidelineCollapsed)
                    }}
                  >
                    <WsText color={$color.primary3l}>{t('相關內規')}</WsText>
                    <WsIcon
                      name={relatedTemplateCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                      size={24}
                      color={$color.primary3l}
                    ></WsIcon>
                  </LlBtnAct001>
                  {!actVersionRelatedGuidelineCollapsed && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        marginBottom: 16,
                        borderBottomRightRadius: actVersionRelatedGuidelineCollapsed ? 0 : 10,
                        borderBottomLeftRadius: actVersionRelatedGuidelineCollapsed ? 0 : 10,
                        backgroundColor: $color.primary11l
                      }}>
                      <>
                        {(actVersionRelatedGuideline &&
                          actVersionRelatedGuideline.length > 0) && (
                            <>
                              <WsText fontWeight={500}>{t('相關內規')}</WsText>
                              {actVersionRelatedGuideline.map(
                                (article, articleIndex) => {
                                  return (
                                    <>
                                      <LlRelatedGuidelineItem001
                                        key={articleIndex}
                                        item={article}
                                        modelName='act'
                                      />
                                    </>
                                  )
                                }
                              )}
                            </>
                          )}
                        {(actVersionRelatedGuidelineArticles &&
                          actVersionRelatedGuidelineArticles.length > 0) && (
                            <>
                              <WsText
                                fontWeight={500}
                                style={{
                                  marginTop: 8
                                }}
                              >{t('相關內規條文')}
                              </WsText>
                              {actVersionRelatedGuidelineArticles.map(
                                (article, articleIndex) => {
                                  return (
                                    <>
                                      <LlRelatedGuidelineItem001
                                        key={articleIndex}
                                        item={article}
                                        modelName={'act'}
                                      />
                                    </>
                                  )
                                }
                              )}
                            </>
                          )}
                      </>
                    </WsPaddingContainer>
                  )}
                  {/* </WsPaddingContainer> */}
                </>
              )}

          </WsPaddingContainer>
        </>
      )}
    </>
  )
}

export default LlArticleCard001
