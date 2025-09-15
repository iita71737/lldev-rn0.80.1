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
import { DraggableList } from './DraggableList'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { decode } from 'html-entities';
import guideline_status from '@/services/api/v1/guideline_status'

const LlGuidelineRelatedTask001 = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    guideline,
    guidelineVersion
  } = props

   const [guidelineRelatedTaskCollapsed, setGuidelineRelatedTaskCollapsed] = React.useState(true)

  return (
    <WsPaddingContainer
      padding={0}
      style={{
        paddingTop: 16,
        paddingHorizontal: 16,
        backgroundColor: $color.white,
        marginTop: 8,
      }}>
      <LlBtnAct001
        style={{
          marginBottom: guidelineRelatedTaskCollapsed ? 16 : 0,
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
            marginBottom: 16,
            borderBottomRightRadius: guidelineRelatedTaskCollapsed ? 0 : 10,
            borderBottomLeftRadius: guidelineRelatedTaskCollapsed ? 0 : 10,
            backgroundColor: $color.primary11l,
            paddingBottom: 16,
          }}
        >
          {guidelineVersion.has_task && (
            <LlRelatedTaskCard001
              guideline_version={guidelineVersion.id}
            ></LlRelatedTaskCard001>
          )}
        </WsPaddingContainer>
      )}
    </WsPaddingContainer>
  )
}

export default LlGuidelineRelatedTask001