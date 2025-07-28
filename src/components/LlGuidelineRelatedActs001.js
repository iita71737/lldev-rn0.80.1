import React, { useRef, useState, useEffect } from 'react'
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
  Button,
  Modal,
  TextInput,
  PanResponder,
  findNodeHandle
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
  WsPageIndex,
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
  WsBottomSheet,
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
  LlGuidelineArticleEditCard001,
  WsDialogDelete,
  LlRelatedGuidelineItem001,
  WsErrorMessage,
  LlRelatedTaskCard001,
  LlRelatedGuidelineVersionsDocs001,
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import S_ArticleVersion from '@/services/api/v1/article_version'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setFactoryTags,
  setRefreshCounter
} from '@/store/data'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import { useTranslation } from 'react-i18next'
import { setCurrentAct } from '@/store/data'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import AsyncStorage from '@react-native-community/async-storage'
import S_ActVersion from '@/services/api/v1/act_version'
import { WebView } from "react-native-webview";
import S_Guideline from '@/services/api/v1/guideline'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineAdmin from '@/services/api/v1/guideline_admin'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import S_GuidelineArticleAdmin from '@/services/api/v1/guideline_article_admin'
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import effects from '@/services/api/v1/effects'
// import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DraggableList } from './DraggableList'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { decode } from 'html-entities';
import guideline_status from '@/services/api/v1/guideline_status'
import { useNavigation } from '@react-navigation/native'

const LlGuidelineRelatedActs001 = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  
  const {
    guideline,
    guidelineVersion
  } = props

  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  const [guidelineRelatedActCollapsed, setGuidelineRelatedActCollapsed] = React.useState(true)

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

  return (
    <>
      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 16,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
          marginTop: 8
        }}>
        {/* <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <WsText size={14} fontWeight={'600'} style={{ marginBottom: 8 }}>
            {t('相關法規')}
          </WsText>
        </View> */}
        <LlBtnAct001
          style={{
            marginBottom: guidelineRelatedActCollapsed ? 16 : 0,
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
                marginBottom: 16,
                borderBottomRightRadius: guidelineRelatedActCollapsed ? 0 : 10,
                borderBottomLeftRadius: guidelineRelatedActCollapsed ? 0 : 10,
                backgroundColor: $color.primary11l
              }}
            >
              {guidelineVersion.act_version_alls &&
                guidelineVersion.act_version_alls.length > 0 && (
                  <>
                    <FlatList
                      style={{
                      }}
                      data={guidelineVersion.act_version_alls}
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
              {guidelineVersion.article_versions &&
                guidelineVersion.article_versions.length > 0 && (
                  <>
                    <FlatList
                      style={{
                      }}
                      data={guidelineVersion.article_versions}
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
            </WsPaddingContainer>
          </>
        )}
      </WsPaddingContainer>

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

export default LlGuidelineRelatedActs001