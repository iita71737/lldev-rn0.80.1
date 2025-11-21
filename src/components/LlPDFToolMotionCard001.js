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
  LlGuidelineRelatedGuidelineArticleVersionsDocs001,
  LlPDFConvertingCard001
} from '@/components'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-community/async-storage'
import { useRoute } from '@react-navigation/native'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import GuidelineArticleHistory from '@/views/ActGuideline/GuidelineArticleHistory'
import { useNavigation } from '@react-navigation/native'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'

const LlPDFToolMotionCard001 = props => {
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
            <WsIconBtn
              padding={0}
              name="ws-outline-delete"
              size={24}
              color={$color.danger}
              onPress={onPressDelete}
            />
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

            <View
              style={{
                padding: 16
              }}
            >
              <WsInfo
                style={{
                }}
                label={t('附件')}
                labelColor={$color.gray}
                type='files'
                value={articleVersion.attaches ? articleVersion.attaches : null}
              />
            </View>

            <LlPDFConvertingCard001></LlPDFConvertingCard001>

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

export default LlPDFToolMotionCard001
