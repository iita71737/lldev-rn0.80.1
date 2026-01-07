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
  WsStateCheckBox002,
  WsUpdateBtn
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
import S_Meeting from '@/services/api/v1/meeting'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import effects from '@/services/api/v1/effects'
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
import { useNavigation } from '@react-navigation/native'
import Clipboard from '@react-native-clipboard/clipboard';
import MeetingInfoTab, { EsGoalVariable } from './Tabs/MeetingInfoTab'
import MotionGroupTab, { Group } from './Tabs/MotionGroupTab'
import ExportRecordTab from './Tabs/ExportRecordTab'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import S_MeetingTemplateType from '@/services/api/v1/meeting_template_type'
import DraggableFlatList from "react-native-draggable-flatlist";

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
        iconRightSize={22}
      />
    </View>
  );
};

const PDFToolAdminShow = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Tabs
  const [index, setIndex] = useState(0)

  // STATES
  const [loading, setLoading] = useState(true)
  const [popupDelete, setPopupDelete] = useState(false)

  // meeting_item_upload
  const [submitMeetingItemLoading, setSubmitMeetingItemLoading] = useState(false)
  const [fileDataList, setFileDataList] = useState<any[]>([]);
  const [fileLabelText, setFileLabelText] = useState<string>('')
  const [meetingItemGroupIdForUpload, setMeetingItemGroupIdForUpload] = useState<string | null>(null)
  const [meetingItemListIndex, setMeetingItemListIndex] = useState<number | null>(null)

  const [addMotionGroupModalVisible, setAddMotionGroupModalVisible] = useState(false)
  const [popupDeleteMotionGroup, setPopupDeleteMotionGroup] = useState(false)
  const [popupDeleteMeetingItemVisible, setPopupDeleteMeetingItemVisible] = useState(false)
  const [deleteMeetingItemTarget, setDeleteMeetingItemTarget] = useState<{ groupId?: string; meetingItemId?: string } | null>(null)
  const [deleteMeetingItemGroupId, setDeleteMeetingItemGroupId] = useState<string | null>(null)

  const [addMotionModalVisible, setAddMotionModalVisible] = useState(false)
  const [popupDeleteMeetingVisible, setPopupDeleteMeetingVisible] = useState(false)

  // 議事
  const [meeting, setMeeting] = useState<any>(null);
  const [meetingItemGroupRefreshKey, setMeetingItemGroupRefreshKey] = useState(0)

  // 議案群組
  const [meetingItemGroupName, setMeetingItemGroupName] = useState('');
  const [scheduleTemplate, setSchduleTemplate] = useState<null>(null);
  const [scheduleTemplateTypeId, setScheduleTemplateTypeId] = useState<string | null>(null);
  const [bindContentsTemplate, setBindContentsTemplate] = useState<null>(null);
  const [bindMeetingTemplate, setBindMeetingTemplate] = useState<null>(null);
  const [editingMeetingItemGroup, setEditingMeetingItemGroup] = useState<any>(null);

  // 匯出 Modal
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportTitle, setExportTitle] = useState('')
  const [exportChecked, setExportChecked] = useState<{ [key: string]: boolean }>({})

  // 模式：預設 / 排序
  const [mode, setMode] = useState<'default' | 'dragSort'>('default')

  // 正式資料
  const [groups, setGroups] = useState<Group[]>([])

  // 排序預覽資料
  const [tempGroups, setTempGroups] = useState<Group[] | null>(null)

  const $_setStorage = async () => {
    try {
      const _defaultValue = S_Meeting.formattedMeetingForEdit(meeting)
      const payload = JSON.stringify(_defaultValue)
      await AsyncStorage.setItem('PDFToolAdminUpdate', payload)
    } catch (e) {
      console.log('Error setting PDFToolAdminUpdate:', e)
    }
  }

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
              onPress={async () => {
                await $_setStorage()
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
          setExportChecked({})
          setExportModalVisible(true)
        },
      },
      // ✅ 匯出時序表
      {
        icon: 'ws-outline-logout',
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
  const $_fetchMeeting = async () => {
    console.log(id, '=id=')
    setLoading(true)
    const res = await S_Meeting.show({
      modelId: id,
    })
    setMeeting(res)
    setLoading(false)
  }

  useEffect(() => {
    $_fetchMeeting()
  }, [id])

  useEffect(() => {
    console.log('S_MeetingTemplateType')
    let mounted = true
    const isMounted = () => mounted
    const fetchTemplateTypes = async () => {
      try {
        const res = await S_MeetingTemplateType.index({ params: {} })
        if (!isMounted()) return
        const list = res?.data ?? res ?? []
        const scheduleType = Array.isArray(list)
          ? list.find((item: any) => item?.value === 'schedule')
          : null
        setScheduleTemplateTypeId(scheduleType?.id ?? null)
      } catch (err) {
        if (!isMounted()) return
        console.log('S_MeetingTemplateType.index error', err)
        setScheduleTemplateTypeId(null)
      }
    }
    fetchTemplateTypes()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    $_setNavigationOption()
  }, [meeting])

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
  const confirmDragSort = async (payload?: { meeting_item_groups: any[] }) => {
    if (payload && id) {
      console.log(id, 'id===')
      console.log(JSON.stringify(payload), 'payloadpayload')
      try {
        await S_Meeting.updateSequence({
          modelId: id,
          data: {
            meeting_item_groups: payload.meeting_item_groups ?? [],
          },
        })
        setMeetingItemGroupRefreshKey(prev => prev + 1)
      } catch (err) {
        console.log('S_Meeting.updateSequence error', err)
      }
    }
    if (tempGroups) {
      setGroups(tempGroups)
    }
    setTempGroups(null)
    setMode('default')
  }

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


  const $_resetMeetingItemGroupForm = () => {
    setMeetingItemGroupName('')
    setSchduleTemplate(null)
    setBindContentsTemplate(null)
    setBindMeetingTemplate(null)
  }

  const $_openAddMeetingItemGroupModal = () => {
    setEditingMeetingItemGroup(null)
    $_resetMeetingItemGroupForm()
    setAddMotionGroupModalVisible(true)
  }

  const $_openEditMeetingItemGroupModal = (group: any) => {
    setEditingMeetingItemGroup(group)
    setMeetingItemGroupName(group?.name ?? '')
    setSchduleTemplate(group?.schedule_template ?? group?.schedule_template_id ?? null)
    setBindContentsTemplate(
      group?.contents_template_variable ??
      group?.contents_template_item ??
      group?.contents_template ??
      null
    )
    setBindMeetingTemplate(
      group?.meeting_template_variable ??
      group?.meeting_template_item ??
      group?.meeting_template ??
      null
    )
    setAddMotionGroupModalVisible(true)
  }

  const $_submitMeetingItemGroup = async () => {
    try {
      if (!id) {
        Alert.alert(t('資料載入中，請稍後再試'))
        return
      }
      const $_getId = (value: any) => value?.id ?? value ?? null
      const _params = {
        meetingId: id,
        name: meetingItemGroupName,
        schedule_template: $_getId(scheduleTemplate),
        contents_template_variable: $_getId(bindContentsTemplate),
        meeting_template_variable: $_getId(bindMeetingTemplate)
      }
      const res = editingMeetingItemGroup?.id
        ? await S_MeetingItemGroup.update({
          data: _params,
          modelId: editingMeetingItemGroup.id
        })
        : await S_MeetingItemGroup.create({ data: _params });
      if (res) {
        console.log(res, 'resresres')
        setAddMotionGroupModalVisible(false)
        setEditingMeetingItemGroup(null)
        $_resetMeetingItemGroupForm()
        setMeetingItemGroupRefreshKey(prev => prev + 1)
      }
    } catch (e) {

    }
  }

  const $_openAddMotionModal = async (group: Group) => {
    setMeetingItemGroupIdForUpload(group?.id ?? null)
    setMeetingItemListIndex(null)
    setFileDataList([])
    setFileLabelText('')
    if (group?.id) {
      try {
        const res = await S_MeetingItem.index({
          params: {
            meeting_item_group_id: group.id,
            order_way: 'asc',
            order_by: 'sequence',
          }
        })
        const nextIndex = (res?.data?.length ?? 0) + 1
        setMeetingItemListIndex(nextIndex)
      } catch (err) {
        console.log('S_MeetingItem.index error', err)
      }
    }
    setAddMotionModalVisible(true)
  }

  const $_openDeleteMeetingItem = (group: Group, meetingItem: Motion) => {
    setDeleteMeetingItemTarget({
      groupId: group?.id,
      meetingItemId: meetingItem?.id,
    })
    setPopupDeleteMeetingItemVisible(true)
  }

  const $_openDeleteMeetingItemGroup = (group: Group) => {
    setDeleteMeetingItemGroupId(group?.id ?? null)
    setPopupDeleteMotionGroup(true)
  }

  const tabItems = useMemo(
    () => [
      {
        value: 'meeting_info',
        label: t('議事內容'),
        view: MeetingInfoTab,
        props: {
          meetingId: id,
        },
      },
      {
        value: 'motion_group',
        label: t('議案群組'),
        view: MotionGroupTab,
        props: {
          meeting: meeting,
          refreshKey: meetingItemGroupRefreshKey,
          mode,
          data: [],
          onEnterSort: enterDragSortMode,
          onCancelSort: cancelDragSort,
          onConfirmSort: confirmDragSort,
          onDragEnd: (data: Group[]) => setTempGroups(data),
          onOpenAddMotion: $_openAddMotionModal,
          onOpenAddGroup: $_openAddMeetingItemGroupModal,
          onOpenEditGroup: $_openEditMeetingItemGroupModal,
          onOpenDeleteMeetingItem: $_openDeleteMeetingItem,
          onOpenDeleteGroup: $_openDeleteMeetingItemGroup,
        },
      },
      {
        value: 'export_record',
        label: t('匯出紀錄'),
        view: ExportRecordTab,
        props: {},
      },
    ],
    [
      t,
      mode,
      meeting,
      id,
      meetingItemGroupRefreshKey,
      $_openAddMotionModal,
      $_openAddMeetingItemGroupModal,
      $_openEditMeetingItemGroupModal,
      $_openDeleteMeetingItem,
      $_openDeleteMeetingItemGroup,
    ],
  )

  const normalizeFileName = (name: string) => {
    if (!name) return 'file';
    return name
      .trim()
      .replace(/\s+/g, '_'); // ✅ 只處理空白 → _
  };

  const $_toChineseNumber = (value: number) => {
    const digits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    if (value <= 0) return ''
    if (value < 10) return digits[value]
    if (value < 100) {
      const tens = Math.floor(value / 10)
      const ones = value % 10
      const tensText = tens === 1 ? '十' : `${digits[tens]}十`
      return ones ? `${tensText}${digits[ones]}` : tensText
    }
    if (value < 1000) {
      const hundreds = Math.floor(value / 100)
      const rest = value % 100
      const restText = rest ? $_toChineseNumber(rest) : ''
      return `${digits[hundreds]}百${restText}`
    }
    return String(value)
  }

  const $_buildMeetingItemLabel = (pattern?: string, index?: number) => {
    if (!index) return ''
    if (!pattern) return String(index)
    if (pattern.includes('\\d')) {
      return `第${index}案`
    }
    if (pattern.includes('第') && pattern.includes('案')) {
      return `第${$_toChineseNumber(index)}案`
    }
    return String(index)
  }

  const $_setFileLabelText = (files: any[]) => {
    const baseIndex = meetingItemListIndex ?? 1
    const labelLines = files.map((file, idx) => {
      const fileName = file?.name ?? file?.file?.name ?? file?.file_version?.name ?? ''
      const displayIndex = baseIndex + idx
      const label = $_buildMeetingItemLabel(meeting?.item_label_type?.value, displayIndex)
      return `${label} - ${fileName}`
    })
    setFileLabelText(labelLines.join('\n'))
  }

  const pickWordFile = async () => {
    try {
      const res = await pick({
        mode: 'import',
        allowMultiSelection: true,
        type: [types.doc, types.docx]
      })

      if (!res || res.length === 0) return

      const safeFiles = res.map(file => {
        const rawName = file.name || ''
        const safeName = normalizeFileName(rawName)
        return {
          uri: file.uri,
          name: safeName,
          type:
            file.type ||
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      })

      const hasNonWord = safeFiles.some(file => {
        const lowerName = file.name.toLowerCase()
        return !lowerName.endsWith('.doc') && !lowerName.endsWith('.docx')
      })
      if (hasNonWord) {
        Alert.alert(t('請選擇 .doc 或 .docx 檔案'))
        return
      }

      setFileDataList(safeFiles)
      $_setFileLabelText(safeFiles)

      console.log('✅ 上傳檔名:', safeFiles.map(file => file.name).join(', '))
      Alert.alert(t('成功'), t('成功匯入'))
    } catch (err) {
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')

      if (!isCancel) console.error(err)
    }
  }


  const $_submitMeetingItem = async () => {
    try {
      if (!meetingItemGroupIdForUpload) {
        Alert.alert(t('請先選擇議案群組'))
        return
      }
      if (!fileDataList.length) {
        Alert.alert(t('請先上傳檔案'))
        return
      }
      setSubmitMeetingItemLoading(true)
      const baseIndex = meetingItemListIndex ?? 1
      for (let index = 0; index < fileDataList.length; index += 1) {
        const file = fileDataList[index]
        const formData = new FormData();
        formData.append('factory', currentFactory.id);
        formData.append('sequence', String(index + 1).padStart(4, '0'));
        formData.append('item_label', $_buildMeetingItemLabel(meeting?.item_label_type?.value, baseIndex + index));
        formData.append('meeting', id);
        formData.append('file', file);
        const _params = {
          formData: formData,
          meeting_item_group_id: meetingItemGroupIdForUpload
        }
        const _meetingItem = await S_MeetingItem.importMeetingItemWord({ params: _params })
        console.log(_meetingItem, '_meetingItem');
      }
      setAddMotionModalVisible(false)
      setMeetingItemGroupIdForUpload(null)
      setFileDataList([])
      setFileLabelText('')
      Alert.alert(t('建立​成功，​伺服器​正在​處理​中，​請到​匯出紀​錄確認​處理​狀態'))
      setMeetingItemGroupRefreshKey(prev => prev + 1)
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitMeetingItemLoading(false)
    }
  }

  const $_confirmDeleteMeetingItem = async () => {
    const meetingItemId = deleteMeetingItemTarget?.meetingItemId
    if (!meetingItemId) {
      Alert.alert(t('請先選擇議案'))
      return
    }
    try {
      await S_MeetingItem.delete({ modelId: meetingItemId })
      setPopupDeleteMeetingItemVisible(false)
      setDeleteMeetingItemTarget(null)
      setMeetingItemGroupRefreshKey(prev => prev + 1)
    } catch (e) {
      console.error(e)
    }
  }

  const $_confirmDeleteMeetingItemGroup = async () => {
    if (!deleteMeetingItemGroupId) {
      Alert.alert(t('請先選擇議案群組'))
      return
    }
    try {
      await S_MeetingItemGroup.delete({ modelId: deleteMeetingItemGroupId })
      setPopupDeleteMotionGroup(false)
      setDeleteMeetingItemGroupId(null)
      setMeetingItemGroupRefreshKey(prev => prev + 1)
    } catch (e) {
      console.error(e)
    }
  }

  const $_deteleMeeting = async () => {
    if (!id) return
    try {
      await S_Meeting.detele({ modelId: id })
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      navigation.goBack()
    } catch (e) {
      console.error(e)
    }
  }


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
            label={t('標題/檔名')}
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

          {exportChecked?.agenda_c ? null : (
            <>
              {/* 匯出範圍標題 */}
              <View style={{ marginTop: 12 }}>
                <WsText size={16}>{t('匯出範圍')}</WsText>
              </View>

              {/* 匯出範圍樹狀 checkbox */}
              <View style={{}}>
                {EXPORT_ITEMS.map(item => renderExportItem(item, 0))}
              </View>
            </>
          )}
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
        snapPoints={[150, 268]}
        onItemPress={(item) => {
          if (item.to) {
            navigation.navigate(item.to)
          } else {
            item.onPress()
          }
        }}
      />

      <WsModal
        title={t('新增議案')}
        visible={addMotionModalVisible}
        headerLeftOnPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
          setFileLabelText('')
        }}
        onBackButtonPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
          setFileLabelText('')
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
          setFileLabelText('')
        }}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={() => {
          $_submitMeetingItem()
        }}
      >
        {submitMeetingItemLoading && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 999,
              justifyContent: 'center',
              alignItems: 'center',
              // backgroundColor: 'rgba(0,0,0,0.2)',
            }}
          >
            <WsLoading />
          </View>
        )}

        
        <View
          style={{
            marginVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          {fileDataList.length > 0 && (
            <WsText>{t('已選擇提案單')}</WsText>
          )}
          {fileDataList.length > 0 && (
            <DraggableFlatList
              style={{
                marginVertical: 16
              }}
              data={fileDataList}
              keyExtractor={(item, idx) => `${item?.uri ?? item?.name ?? 'file'}-${idx}`}
              onDragEnd={({ data }) => {
                setFileDataList(data)
                $_setFileLabelText(data)
              }}
              renderItem={({ item, drag, isActive, getIndex }) => {
                const orderIndex = getIndex?.() ?? 0
                const displayIndex = (meetingItemListIndex ?? 1) + orderIndex
                const label = $_buildMeetingItemLabel(meeting?.item_label_type?.value, displayIndex)
                return (
                  <TouchableOpacity
                    onLongPress={drag}
                    onPressIn={drag}
                    style={{
                      marginTop: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: $color.gray,
                      backgroundColor: isActive ? $color.primary10l : $color.white,
                    }}
                  >
                    <WsFlex justifyContent="space-between" alignItems="center">
                      <WsText>{`${label} - ${item.name}`}</WsText>
                      <WsIcon name="ws-outline-drag-horizontal" size={20} />
                    </WsFlex>
                  </TouchableOpacity>
                )
              }}
            />
          )}
          <WsUpdateBtn
            onPress={() => {
              pickWordFile()
            }}
          >
            {t('上傳')}
          </WsUpdateBtn>
        </View>
       

        {/* <WsState
          style={{
            marginVertical: 16,
            paddingHorizontal: 16,
          }}
          type="Ll_filesAndImages"
          label={t('已選擇提案單')}
          modelName="meeting"
          limitFileExtension={['docx', 'doc']}
          uploadBtnText={t('上傳')}
          value={fileDataList}
          onChange={$event => {
            const nextFiles = Array.isArray($event) ? $event : []
            setFileDataList(nextFiles)
            $_setFileLabelText(nextFiles)
          }}
        /> */}

      </WsModal>

      <WsModal
        title={editingMeetingItemGroup ? t('編輯議案群組') : t('新增議案群組')}
        visible={addMotionGroupModalVisible}
        headerLeftOnPress={() => {
          setAddMotionGroupModalVisible(false)
          setEditingMeetingItemGroup(null)
          $_resetMeetingItemGroupForm()
        }}
        onBackButtonPress={() => {
          setAddMotionGroupModalVisible(false)
          setEditingMeetingItemGroup(null)
          $_resetMeetingItemGroupForm()
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setAddMotionGroupModalVisible(false)
          setEditingMeetingItemGroup(null)
          $_resetMeetingItemGroupForm()
        }}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={() => {
          $_submitMeetingItemGroup()
        }}
      >
        <View
          style={{
            padding: 16,
          }}
        >
          <WsState
            label={t('標題')}
            placeholder={t('輸入')}
            rules={'required'}
            errorMessage={!meetingItemGroupName && [t('此項目為必填')]}
            value={meetingItemGroupName}
            onChange={setMeetingItemGroupName}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            label={t('時序表範本')}
            type="belongsto"
            modelName={'meeting_template'}
            serviceIndexKey={'index'}
            nameKey={'name'}
            hasMeta={false}
            params={{
              meeting_template_type: scheduleTemplateTypeId,
            }}
            value={scheduleTemplate}
            onChange={setSchduleTemplate}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            label={t('此​議案​群​組​對應​的​目錄​範本​區塊​')}
            type="belongsto"
            modelName={'meeting_template_item'}
            serviceIndexKey={'index'}
            nameKey={'name'}
            hasMeta={false}
            params={{
              meeting_template: meeting?.contents_template?.id
            }}
            value={bindContentsTemplate}
            onChange={setBindContentsTemplate}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            label={t('此​議案​群​組​對應​的​議程​範本​區塊​')}
            type="belongsto"
            modelName={'meeting_template_item'}
            serviceIndexKey={'index'}
            nameKey={'name'}
            hasMeta={false}
            params={{
              meeting_template: meeting?.meeting_template?.id
            }}
            value={bindMeetingTemplate}
            onChange={setBindMeetingTemplate}
          />
        </View>
      </WsModal>

      <WsPopup
        active={popupDeleteMotionGroup}
        onClose={() => {
          setPopupDeleteMotionGroup(false)
          setDeleteMeetingItemGroupId(null)
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
                $_confirmDeleteMeetingItemGroup()
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={popupDeleteMeetingItemVisible}
        onClose={() => {
          setPopupDeleteMeetingItemVisible(false)
          setDeleteMeetingItemTarget(null)
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
                setPopupDeleteMeetingItemVisible(false)
                setDeleteMeetingItemTarget(null)
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
                $_confirmDeleteMeetingItem()
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
                $_deteleMeeting()
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
