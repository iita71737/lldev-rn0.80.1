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
  LlGuidelineRelatedDocs001,
  LlGuidelineRelatedTask001,
  LlGuidelineRelatedActs001,
  LlGuidelineRelatedGuidelines001,
  LlPDFMotionGroupCard001
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
import IonIcon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import effects from '@/services/api/v1/effects'
import { DraggableList } from './DraggableList'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { decode } from 'html-entities';
import guideline_status from '@/services/api/v1/guideline_status'
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { pick, types } from '@react-native-documents/picker'
import * as XLSX from "xlsx";
import { Table, Row, Rows, TableWrapper } from 'react-native-table-component';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import FileViewer from "react-native-file-viewer";
import _ from 'lodash';

export type PDFProposalItem = {
  id: string;
  name: string;
  sequence: string;
  parent_article_version_id: string | null;
  type: 'title' | 'article';
};

// -------------------- Demo 假資料 --------------------

const DEFAULT_GROUPS: Group[] = [
  {
    id: 'g-1',
    name: '自訂議案群組名稱 ex: 報告事項',
    sequence: 1,
    articles: [
      {
        id: 'a-101',
        name: '行銷活動執行報告',
        sequence: 1,
        proposerDept: '行銷部',
        reporterName: '陳xx資深副理',
        attendees:
          '投資部/李xx資深副理, 陳xx部長, 財務部/王xx組長',
        content: '這裡是議案內容…',
        attaches: [
          {
            id: 'f-9001',
            name: 'DOCX_TestPage ver.1',
            fileType: 'docx',
            url: 'https://example.com/files/DOCX_TestPage_v1.docx',
          },
          {
            id: 'f-9002',
            name: 'DOCX_TestPage ver.1',
            fileType: 'docx',
            url: 'https://example.com/files/DOCX_TestPage_v1.docx',
          },
        ],
        proposalFile: {
          id: 'pf-1',
          name: 'DOCX_TestPage ver.1',
          fileType: 'docx',
          url: 'https://example.com/files/DOCX_TestPage_v1.docx',
        },
        decisionSummary:
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        decisionDetail:
          'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        updatedAt: '2025-11-20T10:00:00Z',
      },
    ],
  },
  {
    id: 'g-2',
    name: '自訂議案群組名稱2 ex: 討論事項',
    sequence: 2,
    articles: [
      {
        id: 'a-102',
        name: '年度預算案',
        sequence: 1,
        proposerDept: '財務部',
        reporterName: '王xx協理',
        attendees: '財務部、人資部、業務部',
        content: '年度預算案內容 ...',
        attaches: [
          {
            id: 'f-9003',
            name: '預算說明.pdf',
            fileType: 'pdf',
            url: 'https://example.com/files/budget.pdf',
          },
        ],
        proposalFile: {
          id: 'pf-2',
          name: 'Budget_Proposal_2025.docx',
          fileType: 'docx',
          url: 'https://example.com/files/Budget_Proposal_2025.docx',
        },
        decisionSummary: '會議決議簡述 ...',
        decisionDetail: '會議決議詳細內容 ...',
        updatedAt: '2025-11-18T13:22:10Z',
      },
      {
        id: 'a-103',
        name: '廠務設備更新案',
        sequence: 2,
        proposerDept: '廠務部',
        reporterName: '林xx副理',
        attendees: '廠務部、採購部、財務部',
        content: '主旨：設備老舊，需汰換更新 ...',
        attaches: [],
        proposalFile: null,
        decisionSummary: '採購設備型號待確認',
        decisionDetail: '詳細決議內容 ...',
        updatedAt: '2025-11-19T09:12:44Z',
      },
    ],
  },
];



const PDFToolAdminTemplateShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    refreshKey
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // STATES
  const [loading, setLoading] = React.useState(true)
  const [modalActive003, setModalActive003] = React.useState(false)
  const [guideline, setGuideline] = React.useState('d3a1b6a0-6ca9-4e1a-b68c-2d6f46b141ac')
  const [guidelineVersion, setGuidelineVersion] = React.useState('b604a285-5625-4248-949e-b44f4fe6b54a')
  const [popupDelete, setPopupDelete] = React.useState(false)

  const [addMotionModalVisible, setAddMotionModalVisible] = React.useState(false)
  const [addMotionGroupModalVisible, setAddMotionGroupModalVisible] = React.useState(false)
  const [popupDeleteMotionGroup, setPopupDeleteMotionGroup] = React.useState(false)

  // filter
  const [filterFields] = React.useState({
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes'
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: "actStatus"
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })


  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsFlex>
              <WsIconBtn
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                }}
                onPress={() => {
                  setIsBottomSheetActive(true)
                }}
              />
            </WsFlex>
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
    setLoading(false)
  }

  // SERVICES
  const $_fetchGuideline = async (e) => {
    console.log(id, 'guidelineId');
    setLoading(true)
    const res = await S_GuidelineAdmin.show({
      modelId: id
    })
    setLoading(false)
  }

  // bottom-sheet
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const bottomSheetItems = React.useMemo(() => [
    ...(true
      ? [
        {
          to: {
            name: 'GuidelineAdminUpdate',
            params: {
              id: id
            }
          },
          icon: 'ws-outline-edit-pencil',
          label: t('編輯範本')
        },
        {
          color: $color.danger,
          labelColor: $color.danger,
          icon: 'ws-outline-delete',
          label: t('刪除範本')
        }] : []),
  ], [id])

  React.useEffect(() => {
    $_setNavigationOption()
    // $_fetchGuideline()
  }, [id])

  return (
    <>

      <FlatList
        data={DEFAULT_GROUPS}
        keyExtractor={(item, index) => index}
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
        ListHeaderComponent={() => {
          // setModels(models)
          return (
            <>
              <WsPaddingContainer
                style={{
                }}>
                <WsText size={24}>{t('使用者​自訂格式​範本​名​稱')}</WsText>
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                  backgroundColor: $color.white,
                }}
              >
                <WsInfo
                  label={t('範本')}
                  type="filesAndImages"
                  style={{
                  }}
                  value={[]}
                />

              </WsPaddingContainer>
            </>
          )
        }}
        renderItem={({ item, index, items }) => {
          return (
            <>
              <Text>{item?.name}</Text>
            </>
          )
        }}
      />

      <WsPopup
        active={popupDelete}
        onClose={() => {
          setPopupDelete(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定要刪除嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupDelete(false)
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupDelete(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[150, 308]}
        onItemPress={(e) => {

        }}
      />


      <WsModal
        title={t('批次新增')}
        visible={addMotionModalVisible}
        headerLeftOnPress={() => {
          setAddMotionModalVisible(false)
        }}
        onBackButtonPress={() => {
          setAddMotionModalVisible(false)
        }}
        footerBtnLeftText={t('取消')}
        footerBtnRightText={t('確定')}
      >
        <View
          style={{
            paddingHorizontal: 16
          }}
        >
          <WsState
            label={t('提案​單上​傳格式​範本​')}
            testID={'WsCharts-picker002'}
            style={{
              marginTop: 16
            }}
            borderRadius={10}
            borderWidth={0.3}
            placeholder={t('輸入')}
            type="picker"
            value={''}
            onChange={$event => {
            }}
            items={[
              {
                label: t('依建立日期由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'created_at'
                }
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at'
                }
              },
            ]}
          />
          <WsState
            style={{
              marginTop: 8
            }}
            type="filesAndImages"
            label={t('提案單')}
            labelIcon={'md-photo'}
            value={[]}
            onChange={$event => {
            }}
          />
        </View>
      </WsModal>

      <WsModal
        title={t('新增議案群組')}
        visible={addMotionGroupModalVisible}
        headerLeftOnPress={() => {
          setAddMotionGroupModalVisible(false)
        }}
        onBackButtonPress={() => {
          setAddMotionGroupModalVisible(false)
        }}
        footerBtnLeftText={t('取消')}
        footerBtnRightText={t('確定')}
      >
        <View
          style={{
            padding: 16
          }}
        >
          <WsState
            style={{}}
            label={t('名稱')}
            placeholder={t('輸入')}
            value={''}
            onChange={() => { }}
          />

          <WsState
            label={t('匯出​時序表格式​範本​')}
            testID={'WsCharts-picker002'}
            style={{
              marginTop: 16
            }}
            placeholder={t('輸入')}
            type="picker"
            value={''}
            onChange={$event => {
            }}
            items={[
              {
                label: t('依建立日期由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'created_at'
                }
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at'
                }
              },
            ]}
          />
        </View>
      </WsModal>

      <WsPopup
        active={popupDeleteMotionGroup}
        onClose={() => {
          setPopupDeleteMotionGroup(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定要刪除嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupDeleteMotionGroup(false)
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupDeleteMotionGroup(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

    </>
  )
}

export default PDFToolAdminTemplateShow
