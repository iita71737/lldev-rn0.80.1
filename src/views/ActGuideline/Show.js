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

const ActShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    routeByGuidelineVersion, // 進來後選擇版本
    scrollToTargetIndex, // 進來後滾動至目標條文
    hintId,
  } = route.params

  // Redux
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const collectGuidelineIds = useSelector(state => state.data.collectGuidelineIds)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // STATES
  const [pickValue, setPickValue] = React.useState()

  const [guideline, setGuideline] = React.useState(null)
  const [guidelineVersion, setGuidelineVersion] = React.useState(null)
  const [params, setParams] = React.useState()

  const [collectionIcon, setCollectionIcon] = React.useState()
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // INIT setCollectGuidelineIds
  const $_fetchGuidelineAuthCollectIndex = async () => {
    try {
      const res = await S_Guideline.authCollectIndex({})
      if (res) {
        const _ids = res.data.map(_ => _.id)
        store.dispatch(setCollectGuidelineIds(_ids))
      }
    } catch (error) {
      console.log(error, '$_fetchGuidelineAuthCollectIndex')
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        if (guideline?.last_version?.id !== pickValue?.id) return null
        return (
          <>
            <WsIconBtn
              name={collectionIcon}
              size={24}
              color={$color.white}
              underlayColorPressIn="transparent"
              style={{
                marginRight: 4
              }}
              onPress={$_setCollection}
            />
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }
  // Functions
  const $_isCollection = () => {
    if (collectGuidelineIds) {
      return collectGuidelineIds.includes(id)
    } else {
      $_fetchGuidelineAuthCollectIndex()
    }
  }
  const $_setCollection = async () => {
    if ($_isCollection()) {
      setIsSnackBarVisible(false)
      setSnackBarText('已從我的收藏中移除')
      setCollectionIcon('md-turned-in-not')
      store.dispatch(deleteCollectGuidelineId(id))
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      setIsSnackBarVisible(true)
      await S_Guideline.removeMyCollect(id)
    } else {
      setIsSnackBarVisible(false)
      setSnackBarText('已儲存至「我的收藏」')
      setCollectionIcon('md-turned-in')
      store.dispatch(addToCollectGuidelineIds(id))
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      setIsSnackBarVisible(true)
      await S_Guideline.addMyCollect(id)
    }
  }

  // SERVICES
  const $_fetchAct = async (e) => {
    try {
      console.log(id, 'guidelineId');
      const res = await S_Guideline.show({ modelId: id });
      if (!res) {
        navigation.goBack();
        return;
      }
      setGuideline(res);
      if (routeByGuidelineVersion) {
        setPickValue({
          announce_at: routeByGuidelineVersion.announce_at,
          id: routeByGuidelineVersion.id,
        });
      } else {
        setPickValue({
          announce_at: res.last_version?.announce_at,
          id: res.last_version?.id,
        });
      }
      const _versionId = e
        ? e.id
        : routeByGuidelineVersion?.id
          ? routeByGuidelineVersion.id
          : res.last_version?.id;
      console.log(_versionId, 'guidelineVersionId');
      $_fetchGuidelineVersion(_versionId);
      if (e) {
        setParams({
          guideline_version_id: e.id ? e.id : _versionId ? _versionId : undefined,
          order_by: 'created_at',
          order_way: 'desc',
        });
      } else {
        setParams({
          guideline_version_id: _versionId ? _versionId : undefined,
          order_by: 'created_at',
          order_way: 'desc',
        });
      }
      store.dispatch(setCurrentAct(res));
    } catch (error) {
      console.error("API error in $_fetchAct:", error);
      navigation.goBack();
    }
  };

  // 取得內規版本
  const $_fetchGuidelineVersion = async (id) => {
    try {
      const _guidelineVersion = await S_GuidelineVersion.show({ modelId: id });
      setGuidelineVersion(_guidelineVersion);
    } catch (e) {
      console.log(e.message, 'error');
      navigation.goBack(); // 錯誤時返回上一頁
    }
  };


  React.useEffect(() => {
    $_fetchAct()
  }, [id])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [collectionIcon, guideline, pickValue])

  React.useEffect(() => {
    if ($_isCollection()) {
      setCollectionIcon('md-turned-in')
    } else {
      setCollectionIcon('md-turned-in-not')
    }
  }, [])

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
          <WsInfiniteScroll
            scrollToTargetIndex={scrollToTargetIndex}
            service={S_GuidelineArticleVersion}
            params={params}
            serviceIndexKey={'indexByGuidelineVersion'}
            shouldHandleScroll={false}
            ListHeaderComponent={() => {
              return (
                <>
                  <WsPaddingContainer
                    style={{
                    }}>
                    <WsText size={24} testID={'內規條文名稱'}>{guidelineVersion?.name}</WsText>
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

                    {guidelineVersion?.remark && (
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
                    )}

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

                  {/* 法規依據 */}
                  {((guidelineVersion.act_version_alls &&
                    guidelineVersion.act_version_alls.length > 0) || (
                      guidelineVersion.article_versions &&
                      guidelineVersion.article_versions.length > 0
                    )) && (
                      <LlGuidelineRelatedActs001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedActs001>
                    )}

                  {/* 內規相關文件/相關文件 */}
                  {guideline &&
                    guideline.last_version &&
                    ((guideline.last_version.has_guideline_version ||
                      guideline.last_version.has_guideline_article_version ||
                      guideline.last_version.has_license ||
                      guideline.last_version.has_checklist ||
                      guideline.last_version.has_audit ||
                      // guideline.last_version.has_contractor_license ||
                      guideline.last_version.has_internal_training) &&
                      (guideline.last_version.id === pickValue.id)) && (
                      <>
                        <LlGuidelineRelatedDocs001
                          guideline={guideline}
                        ></LlGuidelineRelatedDocs001>
                      </>
                    )}

                  {/* 相關任務 */}
                  {guidelineVersion.has_task && (
                    <>
                      <LlGuidelineRelatedTask001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedTask001>
                    </>
                  )}

                  {/* 相關內規 */}
                  {(guidelineVersion.related_guidelines &&
                    guidelineVersion.related_guidelines.length > 0) && (
                      <LlGuidelineRelatedGuidelines001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedGuidelines001>
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
              const isTarget = ((index === scrollToTargetIndex) && (hintId === item.id));
              const card = (
                <LlGuidelineArticleCard001
                  guideline_id={guideline.id}
                  guidelineVersionTitle={guidelineVersion?.name}
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
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}
export default ActShow