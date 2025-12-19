import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
} from 'react'
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
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  PanResponder,
  findNodeHandle,
  FlatList
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
  WsCard,
  WsTabView,
  WsStateCheckBox002
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import S_ArticleVersion from '@/services/api/v1/article_version'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setFactoryTags,
  setRefreshCounter,
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
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useNavigation } from '@react-navigation/native'
import Clipboard from '@react-native-clipboard/clipboard';

// -------------------- 型別 --------------------

export type PDFProposalItem = {
  id: string
  name: string
  sequence: string
  parent_article_version_id: string | null
  type: 'title' | 'article'
}

type FileInfo = {
  id: string
  name: string
  fileType: string
  url: string
}

type Motion = {
  id: string
  name: string
  sequence: number
  proposerDept: string
  reporterName: string
  attendees: string
  content: string
  attaches: FileInfo[]
  proposalFile: FileInfo | null
  decisionSummary: string
  decisionDetail: string
  updatedAt: string
}

type Group = {
  id: string
  name: string
  sequence: number
  articles: Motion[]
}

// 匯出範圍用
type ExportItem = {
  id: string
  label: string
  subLabel?: string
  children?: ExportItem[]
}

// 匯出紀錄用
type ExportRecord = {
  id: string;
  title: string;
  exportedAt: string; // ISO 字串
  exporter: string;
  fileUrl?: string;
};

const MOCK_EXPORT_RECORDS: ExportRecord[] = [
  {
    id: 'r1',
    title: '第一題',
    exportedAt: '2025-11-20T09:12:00Z',
    exporter: '王小明',
  },
  {
    id: 'r2',
    title: '第一題-拷貝222',
    exportedAt: '2025-11-20T09:30:00Z',
    exporter: '王小明',
  },
  {
    id: 'r3',
    title: '第二題',
    exportedAt: '2025-11-19T14:05:00Z',
    exporter: '陳曉華',
  }
];

// -------------------- Demo 假資料 --------------------

const VARIABLE_ITEMS: EsGoalVariable[] = [
  {
    id: 'v1',
    customName: '使用者自定名稱 1',
    variableName: '變數1',
    esGoalField: 'ESGoal_Field_001',
  },
  {
    id: 'v2',
    customName: '使用者自定名稱 2',
    variableName: '變數2',
    esGoalField: 'ESGoal_Field_ABC',
  },
  {
    id: 'v3',
    customName: '使用者自定名稱 3',
    variableName: '變數3',
    esGoalField: 'ESGoal_Field_XYZ',
  },
]

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
]

// 匯出範圍樹狀資料
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

// -------------------- 共用 Checkbox Row --------------------

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  indent?: number; // 用來控制縮排（子層級）
};

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
        // 下面可依你畫面微調
        iconRightSize={22}
      />
    </View>
  );
};

// -------------------- Tabs 內用的小元件 --------------------

type MotionGroupTabProps = {
  mode: 'default' | 'dragSort'
  data: Group[]
  onEnterSort: () => void
  onCancelSort: () => void
  onConfirmSort: () => void
  onDragEnd: (data: Group[]) => void
  setAddMotionModalVisible: (v: boolean) => void
  setAddMotionGroupModalVisible: (v: boolean) => void
  setPopupDeleteMotionGroup: (v: boolean) => void
}

type EsGoalVariable = {
  id: string
  customName: string        // 使用者自定名稱
  variableName: string      // 變數名稱 (ex: 變數2)
  esGoalField: string       // 對應 ESGoal 欄位
}

type EsGoalVariableItemProps = {
  item: EsGoalVariable
}

const EsGoalVariableItem: React.FC<EsGoalVariableItemProps> = ({ item }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setOpen(prev => !prev)}
      style={{ marginHorizontal: 16, marginTop: 12 }}
    >
      <WsCard
        borderRadius={12}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: $color.gray,
        }}
      >
        {/* 第一行：使用者自定名稱 + 展開 icon */}
        <WsFlex
          alignItems="center"
          justifyContent="space-between"
        >
          <WsText size={14}>
            {item.customName || t('使用者自定名稱')}
          </WsText>

          {/* <WsIcon
            name={open ? 'md-arrow-drop-up' : 'md-arrow-drop-down'}
            size={28}
            color={$color.danger}
          /> */}
        </WsFlex>

        {/* 展開內容 */}
        {/* {open && ( */}
        <View style={{ marginTop: 8 }}>
          {/* 變數 */}
          <WsFlex
            style={{ marginBottom: 8 }}
            alignItems="center"
          >
            <WsText size={14} style={{ width: 160 }}>
              {t('變數')}
            </WsText>
            <WsText size={14}>
              {`{${item.variableName}}`}
            </WsText>

            <TouchableOpacity
              style={{
                marginLeft: 8
              }}
              onPress={async () => {
                const text = await Clipboard.getString(`{${item.variableName}}`);
                Alert.alert(t('已成功複製'))
                console.log(text, 'text')
              }}
            >
              <WsIcon
                name={'md-content-copy'}
                size={28}
                color={$color.primary}
              />
            </TouchableOpacity>

          </WsFlex>

          {/* 對應 ESGoal 欄位 */}
          <WsFlex alignItems="center">
            <WsText size={14} style={{ width: 160 }}>
              {t('對應ESGoal欄位')}
            </WsText>
            <WsText size={14} numberOfLines={1}>
              {item.esGoalField}
            </WsText>
          </WsFlex>
        </View>
        {/* )} */}
      </WsCard>
    </TouchableOpacity>
  )
}

/* --- FlatList 的 renderItem --- */
const renderVariableItem = ({ item }: { item: EsGoalVariable }) => (
  <EsGoalVariableItem item={item} />
)

// 新增：議事內容 Tab（原本的 renderHeader 內容搬進來）
const MeetingInfoTab: React.FC = () => {
  const { t } = useTranslation()

  // 變數設定列表（目前用假資料）
  const [variableList] = useState<EsGoalVariable[]>(VARIABLE_ITEMS)

  return (
    <ScrollView style={{ flex: 1, backgroundColor: $color.white }}>
      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 16,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >
        <WsText size={24}>{t('使用者​自訂​議事標題')}</WsText>
      </WsPaddingContainer>

      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('主席')}
            color={$color.black5l}
            value={t('陳曉琪')}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('時間')}
            color={$color.black5l}
            value={t('一一四年十一月二十日（星期四）上午9時30分')}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('地點')}
            color={$color.black5l}
            value={t('富邦大樓')}
          />
        </View>

        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('提案​單上​傳格式​範本​')}
            value={['123']}
          />
        </View>

        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('議程​範本​')}
            value={['123']}
          />
        </View>

        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('目錄​範本​')}
            value={['123']}
          />
        </View>


        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('封面​範本​')}
            value={['123']}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('項目符號')}
            color={$color.black5l}
            value={t('第1案')}
          />
        </View>

        <View
          style={{
            marginTop: 16,
            borderTopWidth: 1,
            paddingTop: 16,
          }}
        >
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('負責人')}
            value={t('王大明')}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('期限')}
            color={$color.black5l}
            value={moment().format('YYYY-MM-DD')}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('人員')}
            type={'users'}
            valueFontSize={14}
            value={['陳​小​其', '王小會​']}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('角色')}
            type={'belongstomany'}
            valueFontSize={14}
            value={['部​長​', '課長']}
          />
        </View>

        {/* 標籤 */}
        <View style={{ marginTop: 8 }}>
          <WsInfo
            type="tags"
            value={[1, 2, 3]}
            style={{
            }}
          />
        </View>

        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            labelWidth={100}
            value={
              '123'
            }
            label={t('備註')}
            style={{
              flexDirection: 'row',
            }}
          />
        </View>

        <View
          style={{
            marginTop: 8,
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('附件')}
            value={['321.docx']}
          />
        </View>

        <View
          style={{
            marginTop: 8,
          }}
        >
          <WsInfo
            type="filesAndImages"
            label={t('簽到表')}
            value={['簽到表.pdf']}
          />
        </View>

      </WsPaddingContainer>

      <WsPaddingContainer
        padding={0}
        style={{
          marginTop: 8,
          paddingBottom: 8,
          backgroundColor: $color.primary11l,
        }}
      >
        <FlatList
          data={variableList}
          keyExtractor={item => item.id}
          renderItem={renderVariableItem}
          ListHeaderComponent={() => (
            <>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                  backgroundColor: $color.primary11l,
                }}
              >
                {/* 範本檔案 */}
                <WsInfo
                  label={t('提案單範本')}
                  type="filesAndImages"
                  value={[
                    {
                      file: {
                        file_type: 'docx',
                        id: '2e4c7393-8690-4ac7-a277-004f1ffa1b21',
                        is_invalid: 0,
                        name: '提案單格式',
                        source_url:
                          'https://api.ll-esh-app.wasateam.com/api/factory/23/guideline/attach/1764827954buY8O/%E6%8F%90%E6%A1%88%E5%96%AE%E6%A0%BC%E5%BC%8F.docx?au=1&expires=1765209300&signature=b7b02b0bc017abdd9024a8a25d7ca9b71ee5c97094f0fb3af7435b3ad4d79d51',
                        version_number: 1,
                      },
                      file_version: null,
                    },
                  ]}
                />

                {/* 標籤 */}
                <View style={{ marginTop: 0 }}>
                  <WsInfo
                    type="tags"
                    value={[1, 2, 3]}
                    style={{
                    }}
                  />
                </View>
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                }}
              >
                <WsText size={14} fontWeight={500}>{t('範本變數')}</WsText>
              </WsPaddingContainer>
            </>
          )}
          ListFooterComponent={() => <View style={{ height: 50 }} />}
        />
      </WsPaddingContainer>

    </ScrollView>
  )
}

const MotionGroupTab: React.FC<MotionGroupTabProps> = ({
  mode,
  data,
  onEnterSort,
  onCancelSort,
  onConfirmSort,
  onDragEnd,
  setAddMotionModalVisible,
  setAddMotionGroupModalVisible,
  setPopupDeleteMotionGroup,
}) => {
  const { t } = useTranslation()

  // 排序 / 新增 操作列
  const renderListHeader = () => (
    <WsFlex
      style={{
        paddingTop: 8,
        marginVertical: 8,
        paddingHorizontal: 16,
      }}
      justifyContent="space-between"
    >
      <View />

      <WsFlex
        style={{
          marginRight: 4,
        }}
      >
        {/* 左邊：排序 / 取消 */}
        <TouchableOpacity
          style={{
            alignItems: 'flex-end',
            marginRight: 8,
          }}
          onPress={() => {
            if (mode === 'default') {
              onEnterSort()
            } else {
              onCancelSort()
            }
          }}
        >
          <WsTag>
            {mode === 'default' ? t('排序') : t('取消')}
          </WsTag>
        </TouchableOpacity>

        {/* 右邊：新增 / 確定 */}
        <TouchableOpacity
          style={{
            alignItems: 'flex-end',
            marginRight: 8,
          }}
          onPress={() => {
            if (mode === 'default') {
              setAddMotionGroupModalVisible(true)
            } else {
              onConfirmSort()
            }
          }}
        >
          <WsTag>
            {mode === 'default' ? t('新增') : t('確定')}
          </WsTag>
        </TouchableOpacity>
      </WsFlex>
    </WsFlex>
  )

  return (
    <DraggableFlatList
      style={{
      }}
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderListHeader}
      ListFooterComponent={() => <View style={{ height: 50 }} />}
      renderItem={({ item, drag, isActive, getIndex }) => {
        // 一般模式：顯示完整群組卡片
        if (mode === 'default') {
          return (
            <LlPDFMotionGroupCard001
              key={item.id}
              item={item}
              onPressAddGroup={() => {
                setAddMotionModalVisible(true)
              }}
              onPressEditGroup={() => {
                setAddMotionGroupModalVisible(true)
              }}
              onPressDeleteGroup={async () => {
                setPopupDeleteMotionGroup(true)
              }}
            />
          )
        }

        // 排序模式：簡易拖曳卡片
        const order = (getIndex?.() ?? 0) + 1

        return (
          <TouchableOpacity
            style={{
            }}
            onPressIn={drag}
            onLongPress={drag}
          >
            <WsCard
              borderRadius={10}
              style={{
                backgroundColor: $color.primary10l,
                marginTop: 8,
                marginHorizontal: 16,
              }}
            >
              <WsFlex justifyContent="space-between">
                <WsText>{`${order}  ${item.name}`}</WsText>
                <WsIcon
                  name="ws-outline-drag-horizontal"
                  size={24}
                  style={{ marginRight: 8 }}
                />
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        )
      }}
      onDragEnd={({ data }) => {
        if (mode === 'dragSort') {
          onDragEnd(data as Group[])
        }
      }}
    />
  )
}

// 匯出格式 Tab（上方有「匯出」按鈕，下方是預覽卡片）
type ExportFormatTabProps = {
  onPressExport: () => void
}

const ExportFormatTab: React.FC<ExportFormatTabProps> = ({ onPressExport }) => {
  const { t } = useTranslation()

  return (
    <View style={{ flex: 1 }}>
      {/* 標題 + 匯出按鈕（靠右） */}
      <TouchableOpacity
        style={{
          alignSelf: 'flex-end',
          marginRight: 16,
          marginTop: 8,
        }}
        onPress={onPressExport}
      >
        <WsTag>{t('匯出')}</WsTag>
      </TouchableOpacity>

      {/* 下面是匯出格式預覽卡片（靜態） */}
      <WsCard
        borderRadius={10}
        style={{
          marginTop: 16,
          marginHorizontal: 16,
          paddingVertical: 16,
          paddingHorizontal: 16,
        }}
      >
        <WsFlex style={{ marginBottom: 12 }}>
          <WsText>{t('封面範本')}</WsText>
          <WsText style={{ marginLeft: 32 }}>A {t('範本')}</WsText>
        </WsFlex>

        <WsFlex style={{ marginBottom: 12 }}>
          <WsText>{t('目錄範本')}</WsText>
          <WsText style={{ marginLeft: 32 }}>B {t('範本')}</WsText>
        </WsFlex>

        <WsFlex style={{ marginBottom: 12 }}>
          <WsText>{t('議程範本')}</WsText>
          <WsText style={{ marginLeft: 32 }}>C {t('範本')}</WsText>
        </WsFlex>
      </WsCard>
    </View>
  )
}



// 匯出紀錄 Tab（用 WsPageIndex）
const ExportRecordTab: React.FC = () => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')
  const navigation = useNavigation<any>()

  const __params = React.useMemo(() => {
    return {
      order_by: 'created_at',
      order_way: 'desc',
      time_field: 'created_at'
    }
  }, [])

  const filterFields = React.useMemo(() => ({
    area_sections: {
      type: 'checkbox',
      label: t('子地區'),
      storeKey: 'subAreas',
      selectAllVisible: false,
      cancelAllVisible: false
    },
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes',
      selectAllVisible: false,
      cancelAllVisible: false
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: 'actStatus',
      selectAllVisible: false,
      cancelAllVisible: false
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
      storeKey: 'factoryTags',
      searchVisible: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      defaultSelected: false
    },
  }), [t])

  /** 新增：控制「編輯匯出紀錄」的 WsPopup */
  const [editPopupVisible, setEditPopupVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  return (
    <View style={{ flex: 1 }}>
      <WsPageIndex
        mode={'pagination'}
        hasMeta={true}
        modelName={'internal_training'}
        serviceIndexKey={'index'}
        params={__params}
        searchVisible={true}
        filterVisible={false}
        filterFields={filterFields}
        renderItem={({ item, index }) => {
          return (
            <>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('RoutesPDFTool', {
                    screen: 'PDFToolAdminExportShow',
                    params: {
                      id: item?.id
                    }
                  })
                }}
              >
                <WsCard
                  padding={16}
                  style={{
                    marginHorizontal: 8,
                    marginVertical: 4,
                    backgroundColor: $color.white
                  }}
                >
                  <WsFlex
                    style={{
                      marginTop: 8,
                    }}
                    justifyContent={'space-between'}
                  >
                    <WsFlex>
                      <WsDes
                        color={$color.black}
                        style={{
                          marginRight: 8
                        }}
                      >
                        {t('標題')}
                      </WsDes>
                      <WsDes>{item?.name}</WsDes>
                    </WsFlex>

                    <WsFlex>
                      {/* 這裡完成 md-edit：打開 WsPopup */}
                      <WsIconBtn
                        padding={0}
                        name="md-edit"
                        size={24}
                        color={$color.primary} editingRecor
                        style={{
                          top: -2
                        }}
                        onPress={() => {
                          setEditingRecord(item)
                          setEditPopupVisible(true)
                        }}
                      />
                      <WsIconBtn
                        padding={0}
                        name="md-file-download"
                        size={24}
                        color={$color.primary}
                        style={{
                          marginLeft: 16
                        }}
                        onPress={() => {
                          // 下載處理之後再補
                        }}
                      />
                    </WsFlex>
                  </WsFlex>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsDes
                      color={$color.black}
                      style={{
                        marginRight: 8
                      }}
                    >
                      {t('匯出時間')}
                    </WsDes>
                    <WsDes>{moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                  </WsFlex>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsDes
                      color={$color.black}
                      style={{
                        marginRight: 8
                      }}
                    >
                      {t('匯出人')}
                    </WsDes>
                    <WsDes>{item?.principal?.name}</WsDes>
                  </WsFlex>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsDes
                      color={$color.black}
                      style={{
                        marginRight: 8
                      }}
                    >
                      {t('處理中')}
                    </WsDes>
                    <WsDes>{moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                  </WsFlex>
                </WsCard>
              </TouchableOpacity>
            </>
          )
        }}
      >
      </WsPageIndex>

      <View
        style={{
          height: 16
        }}
      />

      {/* ⭐ 新增的 WsPopup：點 md-edit 會出現 */}
      <WsPopup
        active={editPopupVisible}
        onClose={() => {
          setEditPopupVisible(false)
          setEditingRecord(null)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <WsText
            size={18}
            color={$color.black}
            style={{
            }}
          >
            {t('編輯匯出紀錄')}
          </WsText>

          <WsState
            style={{}}
            label={t('標題')}
            placeholder={t('輸入')}
            value={editingRecord?.name}
            onChange={() => { }}
          />

          <WsState
            multiline={true}
            style={{
              marginTop: 8
            }}
            label={t('備註')}
            placeholder={t('輸入')}
            value={editingRecord?.remark}
            onChange={() => { }}
          />

          <WsFlex
            justifyContent={'flex-end'}
            style={{
              marginTop: 16
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
                alignItems: 'center',
              }}
              onPress={() => {
                setEditPopupVisible(false)
                setEditingRecord(null)
              }}
            >
              <WsText
                style={{ padding: 1 }}
                size={14}
                color={$color.gray}
              >
                {t('取消')}
              </WsText>
            </TouchableOpacity>

            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                // 之後如果有「編輯匯出紀錄」頁面，可以在這裡 navigation.push
                // 目前先單純關閉 popup
                setEditPopupVisible(false)
                // navigation.push('RoutesPDFTool', { ... })
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </View>
  )
}


// -------------------- 主元件 --------------------

const PDFToolAdminShow = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    refreshKey,
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // Tabs
  const [index, setIndex] = useState(0)

  // STATES
  const [loading, setLoading] = useState(true)
  const [popupDelete, setPopupDelete] = useState(false)

  const [addMotionModalVisible, setAddMotionModalVisible] = useState(false)
  const [addMotionGroupModalVisible, setAddMotionGroupModalVisible] = useState(false)
  const [popupDeleteMotionGroup, setPopupDeleteMotionGroup] = useState(false)

  // 匯出 Modal
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportTitle, setExportTitle] = useState('')
  const [exportChecked, setExportChecked] = useState<{ [key: string]: boolean }>({})

  // 模式：預設 / 排序
  const [mode, setMode] = useState<'default' | 'dragSort'>('default')

  // 正式資料
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS)

  // 排序預覽資料
  const [tempGroups, setTempGroups] = useState<Group[] | null>(null)

  const [draggedValue, setDraggedVale] = useState<Group[] | undefined>()

  // filter（這段先保留你原本的設定）
  const [filterFields] = useState({
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes',
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: 'actStatus',
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at',
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域'),
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false,
    },
  })

  // Header options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsFlex>
            <WsIconBtn
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              onPress={() => {
                setIsBottomSheetActive(true)
              }}
            />
            <WsIconBtn
              name="ws-outline-logout"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4,
              }}
              onPress={() => {
                setExportModalVisible(true)
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

  // bottom-sheet
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false)
  const bottomSheetItems = useMemo(
    () => [
      {
        to: {
          name: 'PDFToolAdminUpdate',
          params: {
            id: id,
          },
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯議事'),
      },
      {
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除議事'),
      },
    ],
    [id, t],
  )

  // SERVICES
  const $_fetchGuideline = async (e?) => {
    console.log(id, 'guidelineId')
    setLoading(true)
    const res = await S_GuidelineAdmin.show({
      modelId: id,
    })
    setLoading(false)
  }

  useEffect(() => {
    $_setNavigationOption()
    // $_fetchGuideline()
  }, [id])

  // 進入排序模式：複製目前 groups
  const enterDragSortMode = () => {
    setTempGroups(
      groups.map(g => ({
        ...g,
        articles: [...g.articles],
      })),
    )
    setMode('dragSort')
  }

  // 取消排序：丟掉 temp，不改正式資料
  const cancelDragSort = () => {
    setTempGroups(null)
    setMode('default')
  }

  // 確認排序：把 temp 套用回正式資料
  const confirmDragSort = () => {
    if (tempGroups) {
      setGroups(tempGroups)
      setDraggedVale(tempGroups)
    }
    setTempGroups(null)
    setMode('default')
  }

  // 列表用的 data：依模式選 groups 或 tempGroups
  const listData: Group[] =
    mode === 'dragSort' && tempGroups ? tempGroups : groups

  // 匯出範圍勾選：遞迴切換（勾 parent 會連同 child）
  // 匯出範圍勾選：支援 parent <-> children 連動
  const toggleExportItem = (item: ExportItem) => {
    setExportChecked(prev => {
      const nextState: { [key: string]: boolean } = { ...prev }

      const current = !!nextState[item.id]
      const nextValue = !current

      // 1) 先處理「被點擊的項目 + 它的所有子孫」
      const setForItemAndDescendants = (node: ExportItem, value: boolean) => {
        nextState[node.id] = value
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => setForItemAndDescendants(child, value))
        }
      }

      setForItemAndDescendants(item, nextValue)

      // 2) 再由下往上重新計算父層狀態
      const syncParents = (nodes: ExportItem[]) => {
        nodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            // 先處理子層
            syncParents(node.children)

            // 只要有任一 child 被勾選，就讓 parent = true
            const anyChildChecked = node.children.some(child => !!nextState[child.id])

            // 規則：
            // - 子層全沒勾 -> parent 也取消勾選
            // - 有任一子層勾 -> parent 勾選
            nextState[node.id] = anyChildChecked
          }
        })
      }

      syncParents(EXPORT_ITEMS)

      return nextState
    })
  }


  // WsTabView 的 items：view 是「元件本身」，不是 JSX
  const tabItems = useMemo(
    () => [
      {
        value: 'meeting_info',
        label: t('議事內容'),
        view: MeetingInfoTab,
        props: {},
      },
      {
        value: 'motion_group',
        label: t('議案群組'),
        view: MotionGroupTab,
        props: {
          mode,
          data: listData,
          onEnterSort: enterDragSortMode,
          onCancelSort: cancelDragSort,
          onConfirmSort: confirmDragSort,
          onDragEnd: (data: Group[]) => {
            setTempGroups(data)
            setDraggedVale(data)
          },
          setAddMotionModalVisible,
          setAddMotionGroupModalVisible,
          setPopupDeleteMotionGroup,
        },
      },
      {
        value: 'export_record',
        label: t('匯出紀錄'),
        view: ExportRecordTab,
        props: {},
      },
    ],
    [t, mode, listData],
  )

  // 在 PDFToolAdminShow 裡
  const renderExportItem = (item: ExportItem, level = 0) => {
    const isChecked = !!exportChecked[item.id]

    // 有 subLabel 就一起顯示：例「封面範本  A 範本」
    const labelText = item.subLabel
      ? `${t(item.label)}  ${item.subLabel}`
      : t(item.label)

    return (
      <React.Fragment key={item.id}>
        <CheckboxRow
          label={labelText}
          checked={isChecked}
          onChange={() => toggleExportItem(item)}
          indent={level * 24}   // 每多一層就多縮排
        />

        {/* 有子節點就遞迴 */}
        {item.children?.map(child => renderExportItem(child, level + 1))}
      </React.Fragment>
    )
  }

  return (
    <>

      {/* 2️⃣ TabView：位置就在地點資訊後 */}
      <WsTabView
        scrollEnabled={true}
        items={tabItems}
        index={index}
        isAutoWidth={true}
        setIndex={setIndex}
        fixedContainerHeight={height - 220} // 可依實際 header 高度微調
      />

      {/* 3️⃣ 匯出 Modal（勾選多層 Checkbox） */}
      <WsModal
        title={t('匯出')}
        visible={exportModalVisible}
        headerLeftOnPress={() => setExportModalVisible(false)}
        onBackButtonPress={() => setExportModalVisible(false)}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => setExportModalVisible(false)}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={() => {
          const selectedIds = Object.keys(exportChecked).filter(
            id => exportChecked[id]
          )
          console.log('export title:', exportTitle)
          console.log('export selected ids:', selectedIds)
          // TODO: 把 selectedIds 丟給後端做匯出
          setExportModalVisible(false)
          Alert.alert(t('已​排定​匯出，​可​至​會出紀​錄查看。'))
        }}
        childrenScroll={false}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 100,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 標題輸入 */}
          <WsState
            type="text"
            label={t('標題')}
            style={{ marginTop: 16 }}
            value={exportTitle}
            onChange={val => setExportTitle(val)}
          />

          <WsState
            type="text"
            multiline={true}
            label={t('備注')}
            style={{ marginTop: 16 }}
            value={exportTitle}
            onChange={val => setExportTitle(val)}
          />

          {/* 匯出範圍標題 */}
          <View style={{ marginTop: 12 }}>
            <WsText size={16}>{t('匯出範圍')}</WsText>
          </View>

          {/* 匯出範圍樹狀 checkbox */}
          <View style={{}}>
            {EXPORT_ITEMS.map(item => renderExportItem(item, 0))}
          </View>
        </ScrollView>
      </WsModal>


      {/* 4️⃣ 以下原本 Modal / Popup */}

      <WsPopup
        active={popupDelete}
        onClose={() => {
          setPopupDelete(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
            }}
          >
            {t('確定要刪除嗎？')}
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
                alignItems: 'center',
              }}
              onPress={() => {
                setPopupDelete(false)
              }}
            >
              <WsText
                style={{
                  padding: 1,
                }}
                size={14}
                color={$color.gray}
              >
                {t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupDelete(false)
              }}
            >
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
        onItemPress={(item) => {
          if (item.to) {
            navigation.navigate(item.to)
          } else {
            item.onPress()
          }
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
            paddingHorizontal: 16,
          }}
        >
          <WsState
            label={t('提案​單上​傳格式​範本​')}
            testID={'WsCharts-picker002'}
            style={{
              marginTop: 16,
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
                  order_by: 'created_at',
                },
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at',
                },
              },
            ]}
          />
          <WsState
            style={{
              marginTop: 8,
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
            padding: 16,
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
            label={t('時序表格式​範本​')}
            style={{
              marginTop: 16,
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
                  order_by: 'created_at',
                },
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at',
                },
              },
            ]}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            preText={'Ver. '}
            label={t('此​議案​群​組​對應​的​目錄​範本​區塊​')}
            type="belongsto"
            modelName={'guideline_version'}
            serviceIndexKey={'indexAnnounce'}
            nameKey={'announce_at'}
            hasMeta={false}
            formatNameKey={'YYYY-MM-DD'}
            value={''}
            params={{
              guideline_id: id,
            }}
            onChange={async $event => {
            }}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            preText={'Ver. '}
            label={t('此​議案​群​組​對應​的​議程​範本​區塊​')}
            type="belongsto"
            modelName={'guideline_version'}
            serviceIndexKey={'indexAnnounce'}
            nameKey={'announce_at'}
            hasMeta={false}
            formatNameKey={'YYYY-MM-DD'}
            value={''}
            params={{
              guideline_id: id,
            }}
            onChange={async $event => {
            }}
          />
        </View>
      </WsModal>

      <WsPopup
        active={popupDeleteMotionGroup}
        onClose={() => {
          setPopupDeleteMotionGroup(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
            }}
          >
            {t('確定要刪除嗎？')}
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
                alignItems: 'center',
              }}
              onPress={() => {
                setPopupDeleteMotionGroup(false)
              }}
            >
              <WsText
                style={{
                  padding: 1,
                }}
                size={14}
                color={$color.gray}
              >
                {t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupDeleteMotionGroup(false)
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

    </>
  )
}

export default PDFToolAdminShow
