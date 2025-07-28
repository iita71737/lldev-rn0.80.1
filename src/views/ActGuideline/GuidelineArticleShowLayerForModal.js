import React, { useState, useRef, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Touchable,
  Dimensions,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Animated
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsCardPassage,
  WsText,
  WsDes,
  WsIconBtn,
  WsPaddingContainer,
  WsInfo,
  LlArticleCard001,
  WsInfiniteScroll,
  WsSnackBar,
  WsGradientButton,
  WsIcon,
  WsState,
  WsModal,
  WsPopup,
  WsDialog,
  WsBtnLeftIconCircle,
  LlBtnAct001,
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
  WsSkeleton,
  WsLoading,
  LlRelatedFileStoreFiles001,
  LlNavButton002,
  LlTaskCard002,
  LlGuidelineArticleCard001,
  LlInfoContainer001,
  LlRelatedGuidelineItem001,
  LlRelatedTaskCard001,
  LlGuidelineRelatedDocs001,
  LlGuidelineRelatedTask001,
  LlGuidelineRelatedActs001,
  LlGuidelineRelatedGuidelines001,
  WsBlinkBorder
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setFactoryTags,
  addToCollectGuidelineIds,
  deleteCollectGuidelineId,
  setRefreshCounter,
  setCollectGuidelineIds
} from '@/store/data'
import { useTranslation } from 'react-i18next'
import { setCurrentAct } from '@/store/data'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import AsyncStorage from '@react-native-community/async-storage'
import S_ActVersion from '@/services/api/v1/act_version'
import { WebView } from "react-native-webview";
import S_Guideline from '@/services/api/v1/guideline'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import guideline_admin from '@/services/api/v1/guideline_admin'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'

const GuidelineArticleShowLayerForModal = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    routeByGuidelineVersion, // 進來後選擇版本
    scrollToTargetIndex, // 進來後滾動至目標條文index
    hintId, // 進來後要顯示highlight的id
  } = props

  // Redux
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const collectGuidelineIds = useSelector(state => state.data.collectGuidelineIds)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // STATES
  const [pickValue, setPickValue] = React.useState()
  const [actVersionRelatedTask, setActVersionRelatedTask] = React.useState()

  const [actRelatedTaskCollapsed, setActRelatedTaskCollapsed] = React.useState(true)
  const [actRelatedDocsCollapsed, setActRelatedDocsCollapsed] = React.useState(true)

  const [tags, setTags] = React.useState(currentFactoryTags ? currentFactoryTags : [])
  const [tagsSearchValue, setTagsSearchValue] = React.useState('')
  const [tagAddName, setTagAddName] = React.useState('')
  const [tagEditId, setTagEditId] = React.useState()
  const [tagEditName, setTagEditName] = React.useState('')
  const [tagOrder, setTagOrder] = React.useState()
  const [tagCount, setTagCount] = React.useState()
  const [loading, setLoading] = React.useState(false)

  const [popupType, setPopupType] = React.useState('')
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupActiveForEdit, setPopupActiveForEdit] = React.useState(false)
  const [popupActiveForDelete, setPopupActiveForDelete] = React.useState(false)

  const [guideline, setGuideline] = React.useState(null)
  const [guidelineVersion, setGuidelineVersion] = React.useState(null)
  const [params, setParams] = React.useState()

  const [actTags, setActTags] = React.useState([])

  const [collectionIcon, setCollectionIcon] = React.useState()
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [guidelineRelatedDocsCollapsed, setGuidelineRelatedDocsCollapsed] = React.useState(true)
  const [guidelineRelatedTaskCollapsed, setGuidelineRelatedTaskCollapsed] = React.useState(true)
  const [guidelineRelatedGuidelineCollapsed, setGuidelineRelatedGuidelineCollapsed] = React.useState(true)
  const [guidelineRelatedActCollapsed, setGuidelineRelatedActCollapsed] = React.useState(true)
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  // SERVICES
  const $_fetchAct = async (e) => {
    // console.log(id, 'guidelineId');
    const res = await S_Guideline.show({
      modelId: id
    })
    if (res) {
      setGuideline(res)
      if (routeByGuidelineVersion) {
        setPickValue({
          announce_at: routeByGuidelineVersion.announce_at,
          id: routeByGuidelineVersion.id
        })
      } else {
        setPickValue({
          announce_at: res.last_version?.announce_at,
          id: res.last_version?.id
        })
      }
      const _versionId = e ? e.id : routeByGuidelineVersion?.id ? routeByGuidelineVersion.id : res.last_version?.id
      // console.log(_versionId, 'guidelineVersionId');
      $_fetchGuidelineVersion(_versionId)
      if (res.factory_tags && res.factory_tags.length > 0) {
        const _tags = res.factory_tags.map(_tag => _tag.id)
        setActTags(_tags)
      }
      if (e) {
        setParams({
          guideline_version_id: e.id ? e.id : _versionId ? _versionId : undefined,
          order_by: 'created_at',
          order_way: 'desc'
        })
      } else {
        setParams({
          guideline_version_id: _versionId ? _versionId : undefined,
          order_by: 'created_at',
          order_way: 'desc'
        })
      }
      store.dispatch(setCurrentAct(res))
    }
  }
  // 取得內規版本
  const $_fetchGuidelineVersion = async (id) => {
    try {
      const _guidelineVersion = await S_GuidelineVersion.show({ modelId: id })
      setGuidelineVersion(_guidelineVersion)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // HELPER
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
    $_fetchAct()
  }, [id])


  const sharedAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const loopAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(sharedAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false, // borderColor 不支援 native driver
        }),
        Animated.delay(200),
        Animated.timing(sharedAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.delay(200),
      ])
    );
    loopAnim.start();
    return () => loopAnim.stop();
  }, [sharedAnim]);

  return (
    <>
      {guidelineVersion && params ? (
        <>
          <WsSnackBar
            text={snackBarText}
            setVisible={setIsSnackBarVisible}
            visible={isSnackBarVisible}
            quickHidden={true}
          />
          <View
            style={{
              backgroundColor: $color.white,
            }}
          >
            <WsInfiniteScroll
              scrollToTargetIndex={scrollToTargetIndex}
              service={S_GuidelineArticleVersion}
              params={params}
              serviceIndexKey={'indexByGuidelineVersion'}
              ListHeaderComponent={(models) => {
                return (
                  <>
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.primary11l,
                      }}
                    >
                      <WsText size={24}>{guidelineVersion?.name}</WsText>
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          marginTop: 8,
                        }}>
                        {id && (
                          <WsState
                            preText={'Ver. '}
                            label={t('選擇版本')}
                            type="belongsto"
                            modelName={'guideline_version'}
                            serviceIndexKey={'indexAnnounce'}
                            nameKey={'announce_at'}
                            hasMeta={false}
                            formatNameKey={'YYYY-MM-DD'}
                            value={pickValue}
                            params={{
                              guideline_id: id
                            }}
                            onChange={async $event => {
                              await $_fetchAct($event)
                              setPickValue($event)
                            }}
                            style={{
                              zIndex: 999
                            }}
                          />
                        )}
                      </WsPaddingContainer>
                    </WsPaddingContainer>

                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                      }}
                    >
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
                          label={t('修正發布日')}
                          value={moment(guidelineVersion?.announce_at ? guidelineVersion.announce_at : null).format('YYYY-MM-DD')}
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
                          value={guidelineVersion?.effect_at ? moment(guidelineVersion?.effect_at ? guidelineVersion.effect_at : null).format('YYYY-MM-DD') : t('無')}
                        />
                      </View>

                      {guideline?.last_version?.id === pickValue?.id && (
                        <>
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
                              value={guideline.guideline_status && guideline.guideline_status.name ? (guideline.guideline_status.name) : null}
                            />
                          </View>

                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                            flexWrap={'wrap'}
                          >
                            {guideline.factory_tags.map(
                              (tag, index) => {
                                return (
                                  <WsTag
                                    style={{
                                      marginRight: 8,
                                      marginTop: 4
                                    }}
                                    key={index}
                                    backgroundColor={$color.white2d}
                                    textColor={$color.gray}
                                  >
                                    {`#${t(tag.name)}`}
                                  </WsTag>
                                )
                              }
                            )}
                          </WsFlex>
                        </>
                      )}

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsCardPassage
                          title={t('說明')}
                          padding={0}
                          passage={guidelineVersion?.remark ? guidelineVersion.remark : t('無')}
                          style={{
                            borderTopWidth: 0.3,
                            paddingTop: 8
                          }}
                        />
                      </View>

                      {guidelineVersion?.attaches &&
                        guidelineVersion?.attaches.length > 0 && (
                          <WsInfo
                            style={{
                              marginTop: 8,
                              borderTopWidth: 0.3,
                              paddingTop: 8
                            }}
                            type="filesAndImages"
                            label={t('附件')}
                            value={guidelineVersion.attaches}
                          />
                        )}
                    </WsPaddingContainer>

                    {guideline &&
                      guideline.last_version &&
                      ((guideline.last_version.has_license ||
                        guideline.last_version.has_checklist ||
                        guideline.last_version.has_audit ||
                        // guideline.last_version.has_contractor_license ||
                        guideline.last_version.has_internal_training) &&
                        (guideline.last_version.id === pickValue.id)) && (
                        <>
                          {/* 相關文件 */}
                          <LlGuidelineRelatedDocs001
                            guideline={guideline}
                          ></LlGuidelineRelatedDocs001>
                        </>
                      )}

                    {guidelineVersion.has_tasks && (
                      <>
                        {/* 相關任務 */}
                        <LlGuidelineRelatedTask001
                          guideline={guideline}
                          guidelineVersion={guidelineVersion}
                        ></LlGuidelineRelatedTask001>
                      </>
                    )}


                    {((guidelineVersion.act_version_alls &&
                      guidelineVersion.act_version_alls.length > 0) || (
                        guidelineVersion.article_versions &&
                        guidelineVersion.article_versions.length > 0
                      )) && (
                        // 相關法規
                        <LlGuidelineRelatedActs001
                          guideline={guideline}
                          guidelineVersion={guidelineVersion}
                        ></LlGuidelineRelatedActs001>
                      )}

                    {(guidelineVersion.related_guidelines &&
                      guidelineVersion.related_guidelines.length > 0) && (
                        // 相關內規
                        <LlGuidelineRelatedGuidelines001
                          guideline={guideline}
                          guidelineVersion={guidelineVersion}
                        ></LlGuidelineRelatedGuidelines001>
                      )}

                    {guideline.area &&
                      guideline.area.name &&
                      guideline.area.name != undefined && (
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            paddingHorizontal: 16,
                            backgroundColor: $color.white,
                            marginTop: 8
                          }}>
                          <WsInfo
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            type="text"
                            value={t(guideline.area.name)}
                            label={t('適用地區')}
                          />
                        </WsPaddingContainer>
                      )
                    }

                    {guideline.last_version &&
                      guideline.last_version.reference_link && (
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            padding: 16,
                            backgroundColor: $color.white,
                            marginTop: 8
                          }}>
                          <WsInfo
                            type="link"
                            value={guideline.last_version.reference_link}
                            label={t('來源連結')}
                            hasExternalLink={true}
                          />
                        </WsPaddingContainer>
                      )}

                    {guideline.factory_tags && guideline.factory_tags.length > 0 && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          backgroundColor: $color.white,
                          marginTop: 8
                        }}>

                      </WsPaddingContainer>
                    )}

                    {actVersionRelatedTask && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>
                          <WsText color={$color.black} size={18} fontWeight={'600'} style={{ paddingTop: 16, paddingLeft: 16 }}>{t('相關任務')}</WsText>
                          <LlBtnAct001
                            style={{
                              margin: 16,
                              marginBottom: actRelatedTaskCollapsed ? 16 : 0,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actRelatedTaskCollapsed ? 10 : 0,
                              borderBottomRightRadius: actRelatedTaskCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              setActRelatedTaskCollapsed(!actRelatedTaskCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關任務')}</WsText>
                            <WsIcon
                              name={actRelatedDocsCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>
                          <WsCollapsible isCollapsed={actRelatedTaskCollapsed}>
                            {!actRelatedTaskCollapsed && (
                              <WsPaddingContainer
                                padding={16}
                                style={{
                                  marginHorizontal: 16,
                                  marginBottom: 16,
                                  borderBottomRightRadius: actRelatedDocsCollapsed ? 0 : 10,
                                  backgroundColor: $color.primary11l
                                }}
                              >
                                <LlTaskCard002
                                  item={actVersionRelatedTask}
                                  onPress={() => {
                                    navigation.push('RoutesTask', {
                                      screen: 'TaskShow',
                                      params: {
                                        id: actVersionRelatedTask.task?.id,
                                      }
                                    })
                                  }}
                                />
                              </WsPaddingContainer>
                            )}
                          </WsCollapsible>
                        </WsPaddingContainer>
                      </>
                    )}
                  </>
                )
              }}
              ListFooterComponent={() => {
                return (
                  <>
                    <View
                      style={{
                        height: 50,
                      }}
                    >
                    </View>
                  </>

                )
              }}
              renderItem={({ item, index, items }) => {
                // return (
                //   <>
                //     <LlGuidelineArticleCard001
                //       key={index}
                //       item={item}
                //       guidelineVersionId={guideline.last_version && guideline.last_version.id ? guideline.last_version.id : undefined}
                //       index={index}
                //     />
                //   </>
                // )
                const isTarget = ((index === scrollToTargetIndex) && (hintId === item.id));
                const card = (
                  <LlGuidelineArticleCard001
                    key={index}
                    item={item}
                    guidelineVersionId={guideline.last_version?.id}
                    index={index}
                  />
                )
                return isTarget ? (
                  <WsBlinkBorder
                    guideline_id={guideline.id}
                    animatedValue={sharedAnim}
                    borderWidth={5}
                  >
                    {card}
                  </WsBlinkBorder>
                ) : (
                  card
                )
              }}
            />
          </View>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
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
export default GuidelineArticleShowLayerForModal