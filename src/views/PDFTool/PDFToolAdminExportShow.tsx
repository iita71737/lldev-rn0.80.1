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
  findNodeHandle,
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
  LlPDFMotionGroupCard001,
  WsEmpty,
  WsCard,
  LlEventCard001,
  WsStateCheckBox002,
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import S_ArticleVersion from '@/services/api/v1/article_version'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setFactoryTags, setRefreshCounter } from '@/store/data'
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
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import effects from '@/services/api/v1/effects'
import { DraggableList } from './DraggableList'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { decode } from 'html-entities'
import guideline_status from '@/services/api/v1/guideline_status'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'
import { pick, types } from '@react-native-documents/picker'
import * as XLSX from 'xlsx'
import { Table, Row, Rows, TableWrapper } from 'react-native-table-component'
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions'
import FileViewer from 'react-native-file-viewer'
import _ from 'lodash'

export type PDFProposalItem = {
  id: string
  name: string
  sequence: string
  parent_article_version_id: string | null
  type: 'title' | 'article'
}

// 下載紀錄型別（純 UI 用）
type DownloadRecord = {
  id: string
  title: string
  downloadedAt: string
  downloader: string
}

// 匯出範圍用
type ExportItem = {
  id: string
  label: string
  subLabel?: string
  children?: ExportItem[]
}

// 匯出範圍樹狀資料（純展示）
const EXPORT_ITEMS: ExportItem[] = [
  {
    id: 'cover_a',
    label: '封面範本',
    subLabel: 'A 範本',
  },
  {
    id: 'toc_b',
    label: '目錄範本',
    subLabel: 'B 範本',
  },
  {
    id: 'agenda_c',
    label: '議程範本',
    subLabel: 'C 範本',
  },
  {
    id: 'group_1',
    label: '議案群組一',
    children: [
      {
        id: 'group_1_motion_1',
        label: '議案一',
        children: [
          {
            id: 'group_1_motion_1_decision_summary',
            label: '決議-簡述',
          },
          {
            id: 'group_1_motion_1_decision_detail',
            label: '決議-詳述',
          },
        ],
      },
    ],
  },
  {
    id: 'group_2',
    label: '議案群組二',
    children: [
      {
        id: 'group_2_motion_1',
        label: '議案一',
        children: [
          {
            id: 'group_2_motion_1_decision_summary',
            label: '決議-簡述',
          },
          {
            id: 'group_2_motion_1_decision_detail',
            label: '決議-詳述',
          },
        ],
      },
      {
        id: 'group_2_motion_2',
        label: '議案二',
        children: [
          {
            id: 'group_2_motion_2_decision_summary',
            label: '決議-簡述',
          },
          {
            id: 'group_2_motion_2_decision_detail',
            label: '決議-詳述',
          },
        ],
      },
    ],
  },
]

const PDFToolAdminExportShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const { id, refreshKey } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentUser = useSelector(state => state.data.currentUser)

  // 匯出詳情收合用
  const [exportDetailOpen, setExportDetailOpen] = useState(false)

  const [loading, setLoading] = React.useState(true)
  const [filterValue, setFilterValue] = useState<any>({})
  const [filterFields] = React.useState<any>({
    created_user: {
      type: 'belongstomany',
      label: t('上傳者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
    },
    button: {
      type: 'date_range',
      label: t('上傳日期'),
      time_field: 'created_at',
    },
  })

  const params = React.useMemo(() => {
    return {
      order_by: 'occur_at',
      order_way: 'desc',
      time_field: 'occur_at',
      search: filterValue && filterValue.search ? filterValue.search : undefined,
      event_type:
        filterValue && filterValue.event_type ? filterValue.event_type.join(',') : undefined,
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
    }
  }, [])

  // Header option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsFlex>
            <WsIconBtn
              name="md-file-download"
              size={24}
              color={$color.white}
              onPress={() => {
                // TODO: 下載匯出檔
              }}
            />
          </WsFlex>
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
              marginRight: 4,
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      },
    })
    setLoading(false)
  }

  // SERVICES (暫留)
  const $_fetchGuideline = async e => {
    console.log(id, 'guidelineId')
    setLoading(true)
    const res = await S_GuidelineAdmin.show({
      modelId: id,
    })
    setLoading(false)
  }

  // CheckboxRow（展示用）
  type CheckboxRowProps = {
    label: string
    checked: boolean
    onChange: (next: boolean) => void
    indent?: number
  }

  const CheckboxRow: React.FC<CheckboxRowProps> = ({
    label,
    checked,
    onChange,
    indent = 0,
  }) => {
    return (
      <View
        style={{
          marginLeft: indent,
          marginTop: 8,
        }}
      >
        <WsStateCheckBox002
          checkboxText={label}
          value={checked}
          onChange={onChange}
          iconRightSize={22}
          disabled={true} // 匯出詳情頁面只展示，不可編輯
        />
      </View>
    )
  }

  // 匯出範圍樹狀展示
  const renderExportItem = (item: ExportItem, level = 0) => {
    const labelText = item.subLabel ? `${t(item.label)}  ${item.subLabel}` : t(item.label)

    return (
      <React.Fragment key={item.id}>
        <CheckboxRow
          label={labelText}
          checked={true} // 全部固定為勾選狀態（純展示）
          onChange={() => { }}
          indent={level * 24}
        />
        {item.children?.map(child => renderExportItem(child, level + 1))}
      </React.Fragment>
    )
  }

  useEffect(() => {
    $_setNavigationOption()
    // $_fetchGuideline()
  }, [id])

  return (
    <>
      <WsPageIndex
        mode={'pagination'}
        hasMeta={true}
        modelName={'event'}
        serviceIndexKey={'index'}
        params={params}
        searchLabel={t('搜尋')}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        ListHeaderComponent={() => {
          return (
            <>
              <WsPaddingContainer
                padding={0}
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  backgroundColor: $color.white,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={''}
                    label={t('標題')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={t('已完成')}
                    label={t('狀態')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('備註')}
                    value={t('ＸＸＸＸ')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={moment().format('YYYY-MM-DD HH:mm:ss')}
                    label={t('匯出時間')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    type={'user'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={{}}
                    label={t('匯出人')}
                  />
                </View>

                {/* 匯出詳情（可收合） */}
                <View
                  style={{
                    marginTop: 16,
                    borderTopWidth: 1,
                    borderColor: $color.gray,
                    paddingTop: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setExportDetailOpen(prev => !prev)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <WsText size={14} fontWeight={500}>{t('匯出詳情')}</WsText>
                    <WsIcon
                      name={
                        exportDetailOpen
                          ? 'md-unfold-less'
                          : 'md-unfold-more'
                      }
                      size={20}
                      color={$color.black5l}
                    />
                  </TouchableOpacity>

                  {exportDetailOpen && (
                    <>
                      <View
                        style={{
                          marginTop: 8,
                        }}
                      >
                        <WsInfo
                          labelWidth={100}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          value={''}
                          label={t('標題')}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8,
                        }}
                      >
                        <WsInfo
                          labelWidth={100}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          value={t('ＸＸＸＸ')}
                          label={t('備註')}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 12,
                        }}
                      >
                        <WsText size={16}>{t('匯出範圍')}</WsText>
                      </View>

                      <View>{EXPORT_ITEMS.map(item => renderExportItem(item, 0))}</View>
                    </>
                  )}
                </View>
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                }}
              >
                <WsText fontWeight={500}>{t('下載紀錄')}</WsText>
              </WsPaddingContainer>
            </>
          )
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                // 下載紀錄 item 點擊行為（目前留白）
              }}
            >
              <WsCard
                padding={16}
                style={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                  backgroundColor: $color.white,
                }}
              >
                <WsFlex
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsDes
                    color={$color.black}
                    style={{
                      marginRight: 8,
                    }}
                  >
                    {t('下載時間')}
                  </WsDes>
                  <WsDes>{moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                </WsFlex>

                <WsFlex
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsDes
                    color={$color.black}
                    style={{
                      marginRight: 8,
                    }}
                  >
                    {t('下載人')}
                  </WsDes>
                  <WsDes>{item?.principal?.name}</WsDes>
                </WsFlex>
              </WsCard>
            </TouchableOpacity>
          )
        }}
      />
    </>
  )
}

export default PDFToolAdminExportShow
