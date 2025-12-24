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
import MeetingInfoTab, { EsGoalVariable } from './Tabs/MeetingInfoTab'
import MotionGroupTab, { Group } from './Tabs/MotionGroupTab'
import ExportRecordTab from './Tabs/ExportRecordTab'


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
        </WsFlex>

        {/* 展開內容 */}
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
      </WsCard>
    </TouchableOpacity>
  )
}

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
  const [popupDeleteMeetingVisible, setPopupDeleteMeetingVisible] = useState(false)

  // 匯出 Modal
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportTitle, setExportTitle] = useState('')
  const [exportChecked, setExportChecked] = useState<{ [key: string]: boolean }>({})

  // 模式：預設 / 排序
  const [mode, setMode] = useState<'default' | 'dragSort'>('default')

  // 正式資料
  const [groups, setGroups] = useState<Group[]>(DEFAULT_GROUPS)
  const [motions, setMotions] = useState<Motion | null>(null);

  // 排序預覽資料
  const [tempGroups, setTempGroups] = useState<Group[] | null>(null)

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
      // ✅ 匯出：總匯出（打開你原本的 export modal）
      {
        icon: 'ws-outline-logout',
        label: t('匯出'),
        onPress: () => {
          setIsBottomSheetActive(false)
          setExportModalVisible(true)
        },
      },
      // ✅ 匯出封面
      {
        icon: 'md-file-download',
        label: t('匯出封面'),
        onPress: () => {
          setIsBottomSheetActive(false)
          // TODO: 你要串後端的話在這裡呼叫
          // 先用現有的 modal 也可以：預設只勾封面
          setExportChecked({ cover_a: true })
          setExportModalVisible(true)
        },
      },

      // ✅ 匯出目錄
      {
        icon: 'md-file-download',
        label: t('匯出目錄'),
        onPress: () => {
          setIsBottomSheetActive(false)
          setExportChecked({ toc_b: true })
          setExportModalVisible(true)
        },
      },

      // ✅ 匯出時序表
      {
        icon: 'md-file-download',
        label: t('匯出時序表'),
        onPress: () => {
          setIsBottomSheetActive(false)
          setExportChecked({ agenda_c: true })
          setExportModalVisible(true)
        },
      },
      {
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除議事'),
        onPress: () => {
          setPopupDeleteMeetingVisible(true)
         }
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


  const tabItems = useMemo(
    () => [
      {
        value: 'meeting_info',
        label: t('議事內容'),
        view: MeetingInfoTab,
        props: {
          variableList: VARIABLE_ITEMS,
        },
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
          onDragEnd: (data: Group[]) => setTempGroups(data),
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
        snapPoints={[150, 368]}
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
            style={{
              marginTop: 8,
            }}
            type="Ll_filesAndImages"
            label={t('提案單')}
            modelName="meeting"
            value={motions}
            onChange={setMotions}
            remindBtnDisabled={true}
            desVisible={false}
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

      <WsPopup
        active={popupDeleteMeetingVisible}
        onClose={() => {
          setPopupDeleteMeetingVisible(false)
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
                setPopupDeleteMeetingVisible(false)
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
                setPopupDeleteMeetingVisible(false)
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
