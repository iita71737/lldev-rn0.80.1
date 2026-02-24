import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import {
  ScrollView,
  View,
  Platform,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native'
import {
  WsFlex,
  WsText,
  WsDes,
  WsIconBtn,
  WsGradientButton,
  WsIcon,
  WsState,
  WsModal,
  WsPopup,
  WsBottomSheet,
  WsLoading,
  WsTabView,
  WsStateCheckBox002,
  WsUpdateBtn,
  WsSkeleton
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setRefreshCounter } from '@/store/data'
import { useTranslation } from 'react-i18next'
import AsyncStorage from '@react-native-community/async-storage'
import S_Meeting from '@/services/api/v1/meeting'
import { pick, types } from '@react-native-documents/picker'
import MeetingInfoTab from './Tabs/MeetingInfoTab'
import MotionGroupTab from './Tabs/MotionGroupTab'
import ExportRecordTab from './Tabs/ExportRecordTab'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import S_MeetingTemplateType from '@/services/api/v1/meeting_template_type'
import S_MeetingExport from '@/services/api/v1/meeting_export'
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

const normalizeMeetingItemsByGroup = (payload: any) => {
  const groupsMap: Record<string, any[]> = {}
  const data = payload?.data ?? payload
  if (!Array.isArray(data)) return groupsMap

  const looksLikeGroup = (item: any) =>
    item?.meeting_items || item?.meetingItems || item?.articles

  if (data.some(looksLikeGroup)) {
    data.forEach((group: any) => {
      const groupId = group?.id ?? group?.meeting_item_group_id ?? null
      if (!groupId) return
      const meetingItems =
        group?.meeting_items ??
        group?.meetingItems ??
        group?.articles ??
        []
      groupsMap[groupId] = Array.isArray(meetingItems) ? meetingItems : []
    })
    return groupsMap
  }

  data.forEach((item: any) => {
    const groupId =
      item?.meeting_item_group?.id ??
      item?.meeting_item_group_id ??
      item?.meetingItemGroupId ??
      null
    if (!groupId) return
    if (!groupsMap[groupId]) groupsMap[groupId] = []
    groupsMap[groupId].push(item)
  })

  return groupsMap
}

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  indent?: number; // 用來控制縮排（子層級）
  indeterminate?: boolean;
};

const CheckboxRow: React.FC<CheckboxRowProps> = ({
  label,
  checked,
  onChange,
  indent = 0,
  indeterminate = false,
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
        iconRightName={indeterminate ? 'md-indeterminate-check-box' : undefined}
        iconRightColorOverride={indeterminate ? $color.primary : undefined}
        textColorUnchecked={$color.black}
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
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentUser = useSelector(state => state.data.currentUser)

  // Tabs
  const [index, setIndex] = useState(0)

  // STATES
  // meeting_item_upload
  const [submitMeetingItemLoading, setSubmitMeetingItemLoading] = useState(false)
  const [fileDataList, setFileDataList] = useState<any[]>([]);
  const [meetingItemGroupIdForUpload, setMeetingItemGroupIdForUpload] = useState<string | null>(null)
  const [meetingItemListIndex, setMeetingItemListIndex] = useState<number | null>(null)

  const [addMotionGroupModalVisible, setAddMotionGroupModalVisible] = useState(false)
  const [popupDeleteMotionGroup, setPopupDeleteMotionGroup] = useState(false)
  const [popupDeleteMeetingItemVisible, setPopupDeleteMeetingItemVisible] = useState(false)
  const [deleteMeetingItemTarget, setDeleteMeetingItemTarget] = useState<{ groupId?: string; meetingItemId?: string } | null>(null)
  const [deleteMeetingItemGroupId, setDeleteMeetingItemGroupId] = useState<string | null>(null)

  const [addMotionModalVisible, setAddMotionModalVisible] = useState(false)
  const [popupDeleteMeetingVisible, setPopupDeleteMeetingVisible] = useState(false)
  const [popupScheduleExportVisible, setPopupScheduleExportVisible] = useState(false)
  const [popupExportWarningVisible, setPopupExportWarningVisible] = useState(false)
  const [popupExportWarningMessage, setPopupExportWarningMessage] = useState('')
  const [popupExportWarningItems, setPopupExportWarningItems] = useState<any[]>([])

  // 議事
  const [meeting, setMeeting] = useState<any>(null);
  const [meetingItemGroupRefreshKey, setMeetingItemGroupRefreshKey] = useState(0)
  const [meetingItemsAllRefreshKey, setMeetingItemsAllRefreshKey] = useState(0)

  // 議案群組
  const [meetingItemGroupName, setMeetingItemGroupName] = useState('');
  const [scheduleTemplate, setSchduleTemplate] = useState<null>(null);
  const [scheduleTemplateTypeId, setScheduleTemplateTypeId] = useState<string | null>(null);
  const [bindContentsTemplate, setBindContentsTemplate] = useState<null>(null);
  const [bindMeetingTemplate, setBindMeetingTemplate] = useState<null>(null);
  const [editingMeetingItemGroup, setEditingMeetingItemGroup] = useState<any>(null);

  // 匯出 Modal
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportSubmitting, setExportSubmitting] = useState(false)
  const [exportTitle, setExportTitle] = useState('')
  const [exportRemark, setExportRemark] = useState('')
  const [exportChecked, setExportChecked] = useState<{ [key: string]: boolean }>({})
  const [exportAttachmentPosition, setExportAttachmentPosition] = useState('item-attach-together')
  const [exportItems, setExportItems] = useState<ExportItem[]>([])
  const [isAgendaExportMode, setIsAgendaExportMode] = useState(false)
  const [exportRecordRefreshKey, setExportRecordRefreshKey] = useState(0)
  const [scheduleExportLoading, setScheduleExportLoading] = useState(false)
  const [exportRangeLoading, setExportRangeLoading] = useState(false)
  const exportRangeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const resetExportForm = () => {
    setExportTitle('')
    setExportRemark('')
    setExportAttachmentPosition('followingMeetingItem')
  }

  const openScheduleExportModal = () => {
    const agendaId = getTemplateExportId('agenda', meeting?.meeting_template)
    setIsAgendaExportMode(true)
    setExportChecked(agendaId ? { [agendaId]: true } : {})
    setExportModalVisible(true)
  }

  const handleScheduleExportPress = async () => {
    setIsBottomSheetActive(false)
    setScheduleExportLoading(true)
    const canExport = await ensureMeetingItemsReadyForExport()
    if (!canExport) {
      setScheduleExportLoading(false)
      return
    }
    try {
      const res = await S_MeetingExport.getLastSchedule({
        params: { meetingId: meeting?.id },
      })
      console.log(res, 'res--')
      const list = res?.data ?? res ?? []
      const hasExported = Array.isArray(list) && list.length > 0
      if (hasExported) {
        setPopupScheduleExportVisible(true)
        return
      }
      openScheduleExportModal()
    } catch (err) {
      console.log('S_MeetingExport.getLastSchedule error', err)
      openScheduleExportModal()
    } finally {
      setScheduleExportLoading(false)
    }
  }

  // 模式：預設 / 排序
  const [mode, setMode] = useState<'default' | 'dragSort'>('default')

  const getTemplateExportId = (type: 'cover' | 'contents' | 'agenda' | 'attach_cover', template: any) => {
    const id = template?.id ?? template
    if (!id) return null
    return `${type}_template:${id}`
  }

  const buildExportItems = useCallback(
    (meetingData: any, groupList: any[], itemsByGroup: Record<string, any[]>) => {
      const items: ExportItem[] = []

      const coverId = getTemplateExportId('cover', meetingData?.cover_template)
      if (coverId) {
        items.push({
          id: coverId,
          label: t('封面範本'),
          subLabel: meetingData?.cover_template?.name,
        })
      }

      const contentsId = getTemplateExportId('contents', meetingData?.contents_template)
      if (contentsId) {
        items.push({
          id: contentsId,
          label: t('目錄範本'),
          subLabel: meetingData?.contents_template?.name,
        })
      }

      const attachCoverId = getTemplateExportId('attach_cover', meetingData?.attach_cover_template)
      if (attachCoverId && exportAttachmentPosition === 'item-attach-seperate') {
        const attachCoverSubLabel =
          meetingData?.attach_cover_template?.name ??
          meetingData?.attach_cover_template?.attach?.file?.name ??
          meetingData?.attach_cover_template?.attach?.file_version?.name ??
          ''
        items.push({
          id: attachCoverId,
          label: t('附件封面範本'),
          subLabel: attachCoverSubLabel || undefined,
        })
      }

      const groups = Array.isArray(groupList) ? groupList : []
      groups.forEach((group: any) => {
        const groupId = group?.id ?? group?.meeting_item_group_id ?? null
        if (!groupId) return
        const groupItems = itemsByGroup[groupId] ?? []
        const children = groupItems.map((item: any, index: number) => {
          const itemLabel =
            item?.item_label?.name ?? item?.item_label ?? `第${index + 1}案`
          const itemName = item?.name ?? ''
          return {
            id: `meeting_item:${item?.id ?? `${groupId}:${index}`}`,
            label: itemName ? `${itemLabel} ${itemName}` : itemLabel,
          }
        })
        items.push({
          id: `meeting_item_group:${groupId}`,
          label: group?.name ?? t('議案群組'),
          children: children.length ? children : undefined,
        })
      })

      return items
    },
    [exportAttachmentPosition, t],
  )

  const ensureMeetingItemsReadyForExport = useCallback(async () => {
    if (!id) return true

    const getStatusValue = (value: any) =>
      String(value?.name ?? value ?? '').toUpperCase()

    const isCompleteStatus = (status: string) =>
      status === 'COMPLETE' || status === 'COMPLETED'

    const collectMeetingItems = (data: any) => {
      if (!data) return []
      const list = Array.isArray(data) ? data : [data]
      const items: any[] = []
      list.forEach(entry => {
        const groupItems =
          entry?.meeting_items ?? entry?.meetingItems ?? entry?.articles
        if (Array.isArray(groupItems)) {
          items.push(...groupItems)
        } else {
          items.push(entry)
        }
      })
      return items
    }

    try {
      const res = await S_MeetingItem.meetingIndexAll({
        params: {
          meetingId: id,
          order_way: 'asc',
          order_by: 'sequence',
        },
      })
      const data = res?.data ?? res
      const items = collectMeetingItems(data)

      const hasIncomplete = items.some(item => {
        const parseStatus = getStatusValue(item?.parse_status)
        const convertStatus = getStatusValue(item?.convert_status)
        return !(isCompleteStatus(parseStatus) && isCompleteStatus(convertStatus))
      })

      if (hasIncomplete) {
        setPopupExportWarningMessage(t('尚有未解析完或是轉檔完的議案，請稍候再試'))
        setPopupExportWarningItems([])
        setPopupExportWarningVisible(true)
        return false
      }

      const uncompressRes = await S_MeetingItem.getUncompress({
        params: {
          meeting_id: id,
        },
      })
      const uncompressData = uncompressRes?.data ?? uncompressRes
      const uncompressList = Array.isArray(uncompressData) ? uncompressData : []

      if (uncompressList.length > 0) {
        setPopupExportWarningMessage(t('以下議案的附件尚在處理中，請稍候再試'))
        setPopupExportWarningItems(uncompressList)
        setPopupExportWarningVisible(true)
        return false
      }

      return true
    } catch (err) {
      console.log('ensureMeetingItemsReadyForExport error', err)
      return true
    }
  }, [id, t])

  useEffect(() => {
    let mounted = true
    const isMounted = () => mounted
    const fetchExportItems = async () => {
      if (!exportModalVisible || !id) return
      try {
        const [groupRes, meetingItemsRes] = await Promise.all([
          S_MeetingItemGroup.index({ params: { meetingId: id } }),
          S_MeetingItem.meetingIndexAll({
            params: { meetingId: id, order_way: 'asc', order_by: 'sequence' }
          }),
        ])
        if (!isMounted()) return
        const groupList = groupRes?.data ?? groupRes ?? []
        const itemsByGroup = normalizeMeetingItemsByGroup(meetingItemsRes)
        setExportItems(buildExportItems(meeting, groupList, itemsByGroup))
      } catch (err) {
        if (!isMounted()) return
        console.log('fetch export items error', err)
        setExportItems(buildExportItems(meeting, [], {}))
      }
    }
    fetchExportItems()
    return () => {
      mounted = false
    }
  }, [buildExportItems, exportModalVisible, id, meeting, meetingItemGroupRefreshKey])

  useEffect(() => {
    if (!exportModalVisible || isAgendaExportMode) return
    if (exportRangeTimerRef.current) {
      clearTimeout(exportRangeTimerRef.current)
    }
    setExportRangeLoading(true)
    exportRangeTimerRef.current = setTimeout(() => {
      setExportRangeLoading(false)
    }, 150)
    return () => {
      if (exportRangeTimerRef.current) {
        clearTimeout(exportRangeTimerRef.current)
        exportRangeTimerRef.current = null
      }
    }
  }, [exportAttachmentPosition, exportModalVisible, isAgendaExportMode])

  // 正式資料
  const [groups, setGroups] = useState<Group[]>([])

  // 排序預覽資料
  const [tempGroups, setTempGroups] = useState<Group[] | null>(null)

  const $_setStorage = async () => {
    try {
      const _defaultValue = S_Meeting.formattedMeetingForEdit(meeting)
      if (_defaultValue?.meeting_date && moment(_defaultValue.meeting_date).isValid()) {
        _defaultValue.meeting_date = moment.utc(_defaultValue.meeting_date).format('YYYY-MM-DD HH:mm')
      }
      const payload = JSON.stringify(_defaultValue)
      await AsyncStorage.setItem('PDFToolAdminUpdate', payload)

      const _defaultValue002 = S_Meeting.formattedMeetingForCopyCreate(meeting)
      const payload002 = JSON.stringify(_defaultValue002)
      await AsyncStorage.setItem('PDFToolAdminCreate', payload002);
    } catch (e) {
      console.log('Error setting PDFToolAdminUpdate:', e)
    }
  }

  // Header options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        if (!canManageMeetingMenu) return null
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
  }

  // bottom-sheet
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false)
  const canDeleteMeeting = (() => {
    if (!Array.isArray(currentUserScope)) return false
    if (currentUserScope.includes('meeting-destroy')) return true
    if (!currentUserScope.includes('meeting-destroy-owner')) return false
    return !!meeting?.owner?.id && meeting?.owner?.id === currentUser?.id
  })()
  const canCreateMeetingExport =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-export-create')
  const canReadMeetingExport =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-export-read')
  const canUpdateMeeting = (() => {
    if (!Array.isArray(currentUserScope)) return false
    if (currentUserScope.includes('meeting-update')) return true
    if (!currentUserScope.includes('meeting-update-owner')) return false
    return !!meeting?.owner?.id && meeting?.owner?.id === currentUser?.id
  })()
  const canManageMeetingMenu =
    canUpdateMeeting || canDeleteMeeting || canCreateMeetingExport
  const bottomSheetItems = useMemo(
    () => [
      canUpdateMeeting && {
        to: {
          name: 'PDFToolAdminUpdate',
          params: {
            id: id,
          },
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯議事'),
      },
      canUpdateMeeting && {
        to: {
          name: 'PDFToolAdminCreate',
          params: {},
        },
        icon: 'ws-outline-copy',
        label: t('複製議事'),
      },
      canCreateMeetingExport && {
        icon: 'ws-outline-logout',
        label: t('匯出'),
        onPress: async () => {
          setIsBottomSheetActive(false)
          const canExport = await ensureMeetingItemsReadyForExport()
          if (!canExport) return
          setIsAgendaExportMode(false)
          setExportChecked({})
          setExportModalVisible(true)
        },
      },
      canCreateMeetingExport && {
        icon: 'ws-outline-logout',
        label: t('匯出時序表'),
        onPress: handleScheduleExportPress,
      },
      canDeleteMeeting && {
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除議事'),
        onPress: () => {
          setPopupDeleteMeetingVisible(true)
        }
      },
    ].filter(Boolean),
    [
      canCreateMeetingExport,
      canDeleteMeeting,
      canUpdateMeeting,
      ensureMeetingItemsReadyForExport,
      handleScheduleExportPress,
      id,
      meeting,
      t,
    ],
  )

  // SERVICES
  const $_fetchMeeting = async () => {
    console.log(id, '=id=')
    const res = await S_Meeting.show({
      modelId: id,
    })
    setMeeting(res)
  }

  useEffect(() => {
    $_fetchMeeting()
  }, [id])

  useEffect(() => {
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
      const pattern = meeting?.item_label_type?.value
      const nextPayload = {
        ...payload,
        meeting_item_groups: (payload.meeting_item_groups ?? []).map(group => ({
          ...group,
          meeting_items: (group.meeting_items ?? []).map((item: any, index: number) => ({
            ...item,
            item_label: $_buildMeetingItemLabel(pattern, index + 1),
          })),
        })),
      }
      console.log(JSON.stringify(nextPayload), 'payloadpayload')
      try {
        await S_Meeting.updateSequence({
          modelId: id,
          data: {
            meeting_item_groups: nextPayload.meeting_item_groups ?? [],
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

            // 子層全部勾選時 parent 才勾選
            const allChildrenChecked = node.children.every(child => !!nextState[child.id])

            // 規則：
            // - 子層未全勾 -> parent 取消勾選
            // - 子層全勾 -> parent 勾選
            nextState[node.id] = allChildrenChecked
          }
        })
      }
      syncParents(exportItems)
      return nextState
    })
  }

  const collectExportIds = (items: ExportItem[]) => {
    const ids: string[] = []
    const walk = (node: ExportItem) => {
      ids.push(node.id)
      if (node.children && node.children.length > 0) {
        node.children.forEach(child => walk(child))
      }
    }
    items.forEach(item => walk(item))
    return ids
  }

  const toggleAllExportItems = (checked: boolean) => {
    setExportChecked(prev => {
      const nextState: { [key: string]: boolean } = { ...prev }
      const ids = collectExportIds(exportItems)
      ids.forEach(id => {
        nextState[id] = checked
      })
      return nextState
    })
  }

  const getExportSelectAllState = () => {
    if (!exportItems.length) return { any: false, all: false }
    let any = false
    let all = true
    exportItems.forEach(item => {
      const state = getExportCheckState(item)
      any = any || state.any
      all = all && state.all
    })
    return { any, all }
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
      console.log(JSON.stringify(res), '$_submitMeetingItemGroup')
      setAddMotionGroupModalVisible(false)
      setEditingMeetingItemGroup(null)
      $_resetMeetingItemGroupForm()
      setMeetingItemGroupRefreshKey(prev => prev + 1)
    } catch (e) {
      console.error(e, 'error')
    }
  }

  const $_openAddMotionModal = async (group: Group) => {
    setMeetingItemGroupIdForUpload(group?.id ?? null)
    setMeetingItemListIndex(null)
    setFileDataList([])
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
        label: t('資訊'),
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
          meetingItemsAllRefreshKey: meetingItemsAllRefreshKey,
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
      canReadMeetingExport && {
        value: 'export_record',
        label: t('匯出紀錄'),
        view: ExportRecordTab,
        props: {
          meeting: meeting,
          refreshKey: exportRecordRefreshKey,
        },
      },
    ].filter(Boolean),
    [
      canReadMeetingExport,
      t,
      mode,
      meeting,
      id,
      meetingItemGroupRefreshKey,
      meetingItemsAllRefreshKey,
      $_openAddMotionModal,
      $_openAddMeetingItemGroupModal,
      $_openEditMeetingItemGroupModal,
      $_openDeleteMeetingItem,
      $_openDeleteMeetingItemGroup,
    ],
  )

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
    const basePattern = String(pattern)
      .replace(/^\^/, '')
      .replace(/\$$/, '')
    const hasChineseClass = /\[[^\]]*一二三四五六七八九十百[^\]]*\]/.test(basePattern)
    const hasDigitToken = /\\d|\[0-9\]/.test(basePattern)
    const chineseIndex = $_toChineseNumber(index)
    let nextLabel = basePattern
    let replaced = false

    if (hasChineseClass) {
      nextLabel = nextLabel.replace(
        /\[[^\]]*一二三四五六七八九十百[^\]]*\]\+?/,
        chineseIndex
      )
      replaced = true
    }
    if (hasDigitToken) {
      nextLabel = nextLabel.replace(/\\d\+?|\\d\?|\[0-9\]\+?|\[0-9\]\?/, String(index))
      replaced = true
    }
    nextLabel = nextLabel
      .replace(/\\s\?/g, '')
      .replace(/\\s\+/g, ' ')
      .replace(/\\s/g, ' ')
      .replace(/\\+/g, '')
      .replace(/[?]/g, '')
      .trim()

    if (replaced && nextLabel) return nextLabel
    if (basePattern.includes('\\d')) {
      return `第${index}案`
    }
    if (basePattern.includes('第') && basePattern.includes('案')) {
      return `第${chineseIndex}案`
    }
    return String(index)
  }

  const pickWordFile = async () => {
    try {
      const res = await pick({
        mode: 'import',
        allowMultiSelection: true,
        type: [types.doc, types.docx]
      })

      if (!res || res.length === 0) return

      const isWordFile = (name: string) => {
        const lower = (name || '').toLowerCase()
        return lower.endsWith('.doc') || lower.endsWith('.docx')
      }
      if (
        res.some(file => {
          const rawUri = file?.uri || ''
          const originalName = file?.name || rawUri.split('/').pop() || 'file.docx'
          return !isWordFile(originalName)
        })
      ) {
        Alert.alert(t('請選擇 .doc 或 .docx 檔案'))
        return
      }

      const safeFiles = res.map(file => {
        const rawUri = file?.uri || ''
        const originalName = file?.name || rawUri.split('/').pop() || 'file.docx'
        return {
          uri: decodeURIComponent(rawUri),
          name: originalName,
          displayName: originalName,
          type:
            file.type ||
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }
      })
      setFileDataList(safeFiles)

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
        formData.append('sequence', String(baseIndex + index).padStart(4, '0'));
        formData.append(
          'item_label',
          $_buildMeetingItemLabel(
            meeting?.item_label_type?.value ?? meeting?.item_label_type?.name,
            baseIndex + index
          )
        );
        formData.append('meeting', id);
        const rawUri = file?.uri ?? ''
        const normalizedUri =
          Platform.OS === 'ios' && rawUri && !rawUri.startsWith('file://')
            ? `file:/${rawUri}`
            : rawUri
        const rawName = file?.displayName ?? file?.name ?? ''
        const uploadFileData = {
          ...(file ?? {}),
          uri: normalizedUri,
          name: rawName,
        }
        formData.append('file', uploadFileData);
        const _params = {
          formData: formData,
          meeting_item_group_id: meetingItemGroupIdForUpload
        }
        const _meetingItem = await S_MeetingItem.importMeetingItemWord({ params: _params })
        console.log(JSON.stringify(_meetingItem), '_meetingItem')
      }
      setAddMotionModalVisible(false)
      setMeetingItemGroupIdForUpload(null)
      setFileDataList([])
      Alert.alert(t('建立成功，系統處理中，請到匯出紀錄確認進度。完成後將發送Email通知'))
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
      setMeetingItemsAllRefreshKey(prev => prev + 1)
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
  const getExportCheckState = (item: ExportItem) => {
    if (!item.children || item.children.length === 0) {
      const checked = !!exportChecked[item.id]
      return { any: checked, all: checked }
    }
    let any = false
    let all = true
    item.children.forEach(child => {
      const childState = getExportCheckState(child)
      any = any || childState.any
      all = all && childState.all
    })
    return { any, all }
  }

  const renderExportItem = (item: ExportItem, level = 0) => {
    const { any, all } = getExportCheckState(item)
    const isChecked = item.children && item.children.length > 0 ? all : any
    const isIndeterminate =
      item.children && item.children.length > 0 ? any && !all : false

    // 有 subLabel 就一起顯示：例「封面範本  A 範本」
    const labelText = item.subLabel
      ? `${item.label}  ${item.subLabel}`
      : item.label

    return (
      <React.Fragment key={item.id}>
        <CheckboxRow
          label={labelText}
          checked={isChecked}
          onChange={() => toggleExportItem(item)}
          indent={level * 24}   // 每多一層就多縮排
          indeterminate={isIndeterminate}
        />

        {/* 有子節點就遞迴 */}
        {item.children?.map(child => renderExportItem(child, level + 1))}
      </React.Fragment>
    )
  }

  const buildExportParams = () => {
    const nameById = new Map<string, string>()
    const collectNames = (items: ExportItem[]) => {
      items.forEach(item => {
        const displayName = item.subLabel ?? item.label
        nameById.set(item.id, displayName)
        if (item.children) collectNames(item.children)
      })
    }
    collectNames(exportItems)

    const selectedIds = Object.keys(exportChecked).filter(id => exportChecked[id])
    const meetingExportItems = selectedIds.reduce<any[]>((acc, exportId) => {
      const itemName = nameById.get(exportId)
      if (exportId.startsWith('meeting_item:')) {
        const meetingItemId = exportId.split(':')[1]
        if (meetingItemId) {
          acc.push({
            module: 'meeting_item',
            meeting_item: meetingItemId,
            factory: currentFactory?.id,
            name: itemName,
          })
        }
        return acc
      }
      if (exportId.startsWith('cover_template:')) {
        const coverTemplateId = exportId.split(':')[1]
        if (coverTemplateId) {
          acc.push({
            module: 'cover',
            cover_template: coverTemplateId,
            factory: currentFactory?.id,
            name: itemName,
          })
        }
        return acc
      }
      if (exportId.startsWith('contents_template:')) {
        const contentsTemplateId = exportId.split(':')[1]
        if (contentsTemplateId) {
          acc.push({
            module: 'contents',
            contents_template: contentsTemplateId,
            factory: currentFactory?.id,
            name: itemName,
          })
        }
      }
      if (
        exportAttachmentPosition === 'item-attach-seperate' &&
        exportId.startsWith('attach_cover_template:')
      ) {
        const itemName = nameById.get(exportId)
        acc.push({
          module: 'attach_cover',
          factory: currentFactory?.id,
          attach_cover_template: exportAttachmentPosition,
          name: itemName,
        })
      }
      return acc
    }, [])

    return {
      meetingId: id,
      type: 'meeting',
      name: exportTitle,
      remark: exportRemark,
      attach_location_type: exportAttachmentPosition,
      meeting_export_items: meetingExportItems,
    }
  }

  const hasExportTitle = !!exportTitle?.trim()
  const hasSelectedExportItems = Object.keys(exportChecked).some(key => {
    if (!exportChecked[key]) return false
    return (
      key.startsWith('meeting_item:') ||
      key.startsWith('cover_template:') ||
      key.startsWith('contents_template:') ||
      key.startsWith('attach_cover_template:')
    )
  })
  const canSubmitExport = isAgendaExportMode
    ? hasExportTitle
    : hasExportTitle && hasSelectedExportItems

  console.log(meeting?.contents_template?.id, ` meeting?.contents_template?.id`)

  const handleExportSubmit = async () => {
    if (exportSubmitting || !canSubmitExport) return
    try {
      setExportSubmitting(true)
      if (isAgendaExportMode) {
        await S_MeetingExport.createSchedule({
          data: {
            meetingId: meeting?.id,
            meeting_id: meeting?.id,
            name: exportTitle,
            remark: exportRemark,
            attach_location_type: exportAttachmentPosition,
          },
        })
      } else {
        const params = buildExportParams()
        console.log(params, 'params--')
        await S_MeetingExport.create({ data: params })
      }
      setExportModalVisible(false)
      setIsAgendaExportMode(false)
      resetExportForm()
      setExportRecordRefreshKey(prev => prev + 1)
      setIndex(2)
      Alert.alert(t('建立成功，系統處理中，請到匯出紀錄確認進度。完成後將發送Email通知'))
    } catch (err) {
      console.log('S_MeetingExport.create error', err)
      Alert.alert(t('匯出失敗，請稍後再試'))
    } finally {
      setExportSubmitting(false)
    }
  }

  return (
    <>
      {scheduleExportLoading && (
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
          }}
        >
          <WsLoading />
        </View>
      )}

      {meeting ? (
        <WsTabView
          scrollEnabled={true}
          items={tabItems}
          index={index}
          isAutoWidth={true}
          setIndex={setIndex}
          fixedContainerHeight={height - 220}
        />
      ):(
        <WsSkeleton></WsSkeleton>
      )}

      {/* 3️⃣ 匯出 Modal（勾選多層 Checkbox） */}
      <WsModal
        title={t('匯出')}
        visible={exportModalVisible}
        headerLeftOnPress={() => {
          setExportModalVisible(false)
          setIsAgendaExportMode(false)
          resetExportForm()
        }}
        onBackButtonPress={() => {
          setExportModalVisible(false)
          setIsAgendaExportMode(false)
          resetExportForm()
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setExportModalVisible(false)
          setIsAgendaExportMode(false)
          resetExportForm()
        }}
        footerBtnRightText={t('確定')}
        btnRightDisable={!canSubmitExport || exportSubmitting}
        footerBtnRightOnPress={handleExportSubmit}
        childrenScroll={false}
      >
        {exportSubmitting && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <WsLoading />
          </View>
        )}
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
            rules={"required"}
            errorMessage={!exportTitle && [t('此項目為必填')]}
          />

          <WsState
            type="text"
            multiline={true}
            label={t('備注')}
            style={{ marginTop: 16 }}
            value={exportRemark}
            onChange={val => setExportRemark(val)}
          />

          {isAgendaExportMode ? null : (
            <WsState
              type={"radio"}
              label={t('附件位置')}
              items={[
                { label: t('隨附於各議案後'), value: 'item-attach-together' },
                { label: t('集中於議程末尾'), value: 'item-attach-seperate' },
              ]}
              value={exportAttachmentPosition}
              onChange={val => {
                setExportAttachmentPosition(val)
                if (val !== 'item-attach-seperate') {
                  setExportChecked(prev => {
                    const next = { ...prev }
                    Object.keys(next).forEach(key => {
                      if (key.startsWith('attach_cover_template:')) {
                        delete next[key]
                      }
                    })
                    return next
                  })
                }
              }}
              style={{
                marginTop: 16,
              }}
            />
          )}

          {isAgendaExportMode ? null : (
            <>
              {exportRangeLoading ? (
                <View style={{ marginTop: 12 }}>
                  <WsLoading />
                </View>
              ) : (
                <>
                  {/* 匯出範圍標題 */}
                  <View style={{ marginTop: 12 }}>
                    <WsText size={14} fontWeight='600'>{t('匯出範圍')}</WsText>
                  </View>

                  {/* 匯出範圍樹狀 checkbox */}
                  <View style={{}}>
                    {(() => {
                      const { any, all } = getExportSelectAllState()
                      return (
                        <CheckboxRow
                          label={t('全選')}
                          checked={all}
                          onChange={() => toggleAllExportItems(!all)}
                          indeterminate={any && !all}
                        />
                      )
                    })()}
                    {exportItems.map(item => renderExportItem(item, 0))}
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </WsModal>

      {/* 4️⃣ 以下原本 Modal / Popup */}
      <WsPopup
        active={popupExportWarningVisible}
        onClose={() => {
          setPopupExportWarningVisible(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            minHeight: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <WsText size={16} color={$color.black} fontWeight="600">
            {popupExportWarningMessage}
          </WsText>

          {popupExportWarningItems.length > 0 && (
            <View style={{ marginTop: 12 }}>
              {(() => {
                const groupNameMap = new Map(
                  (groups ?? []).map(group => [
                    String(group?.id ?? ''),
                    group?.name ?? t('議案群組'),
                  ])
                )
                const grouped: Record<string, any[]> = {}
                popupExportWarningItems.forEach(item => {
                  const groupId =
                    item?.meeting_item_group?.id ??
                    item?.meeting_item_group_id ??
                    'unknown'
                  if (!grouped[groupId]) grouped[groupId] = []
                  grouped[groupId].push(item)
                })
                return Object.entries(grouped).map(([groupId, items]) => {
                  const sortedItems = [...items].sort((a: any, b: any) =>
                    String(a?.sequence ?? '').localeCompare(String(b?.sequence ?? ''))
                  )
                  const groupLabel = groupNameMap.get(String(groupId)) ?? t('議案群組')
                  return (
                    <View key={groupId} style={{ marginBottom: 8 }}>
                      <WsText size={14} fontWeight="600" style={{ marginBottom: 4 }}>
                        {groupLabel}
                      </WsText>
                      {sortedItems.map((item: any) => {
                        const label = item?.item_label ?? ''
                        const name = item?.name ?? ''
                        const text = `${label} ${name}`.trim() || t('議案')
                        return (
                          <WsText
                            key={item?.id ?? `${groupId}-${item?.sequence}`}
                            size={14}
                            color={$color.gray}
                          >
                            {text}
                          </WsText>
                        )
                      })}
                    </View>
                  )
                })
              })()}
            </View>
          )}

            <WsGradientButton
              style={{
                width: 110,
                alignSelf: 'flex-end',
                marginTop: 8,
              }}
              onPress={() => {
                setPopupExportWarningVisible(false)
              }}
            >
              {t('確定')}
            </WsGradientButton>
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
        title={t('新增議案')}
        visible={addMotionModalVisible}
        headerLeftOnPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
        }}
        onBackButtonPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setAddMotionModalVisible(false)
          setMeetingItemGroupIdForUpload(null)
          setMeetingItemListIndex(null)
          setFileDataList([])
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
            <>
              <WsText>{t('已選擇提案單')}</WsText>
              <TouchableOpacity
                disabled={true}
              >
                <WsFlex
                  style={[false ? null : { marginTop: 4 }]}
                >
                  <WsIcon
                    name="md-info-outline"
                    color={$color.primary}
                    style={{
                      marginRight: 6
                    }}
                    size={18}
                  />
                  <WsText
                    style={{
                      paddingRight: 16
                    }}
                    size={12}
                    color={$color.primary}>
                    {t('請核對檔名與檔案順序是否正確​')}
                  </WsText>
                </WsFlex>
              </TouchableOpacity>
            </>
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
              }}
              renderItem={({ item, drag, isActive, getIndex }) => {
                const orderIndex = getIndex?.() ?? 0
                const displayIndex = (meetingItemListIndex ?? 1) + orderIndex
                const label = $_buildMeetingItemLabel(
                  meeting?.item_label_type?.value ?? meeting?.item_label_type?.name,
                  displayIndex
                )
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
                      <WsText>{`${label} ${item.displayName ?? item.name}`}</WsText>
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
          <WsDes
            color={$color.gray}
            style={{
              paddingTop: 8
            }}>
            {`${t('檔案大小限制')} ≤ 30MB`}
          </WsDes>
        </View>

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
            hasMeta={true}
            params={{
              meeting_template_type: scheduleTemplateTypeId,
            }}
            value={scheduleTemplate}
            onChange={setSchduleTemplate}
            remind={t('若未選擇，則不會產生時序表')}
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
            rules={'required'}
            errorMessage={!meetingItemGroupName && [t('此項目為必填')]}
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
            rules={'required'}
            errorMessage={!meetingItemGroupName && [t('此項目為必填')]}
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

      <WsPopup
        active={popupScheduleExportVisible}
        onClose={() => {
          setPopupScheduleExportVisible(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            minHeight: height * 0.22,
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
            {t('時序表已匯出過，要重新匯出嗎？')}
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
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: $color.gray,
                borderRadius: 25,
                alignItems: 'center',
                width: 110,
                height: 48,
              }}
              onPress={() => {
                setPopupScheduleExportVisible(false)
              }}
            >
              <WsText size={14} color={$color.gray}>
                {t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupScheduleExportVisible(false)
                openScheduleExportModal()
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
